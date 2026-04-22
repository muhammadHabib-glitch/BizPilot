import { router, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { prisma } from "@/lib/prisma";

type PrismaType = typeof prisma;

// Reusable types for Prisma query result callbacks
type InvoiceTotal = { total: number; paidAt: Date | null };
type InvoiceStatusGroup = { status: string; _count: number; _sum: { total: number | null } };
type ClientGroupByResult = { clientId: string | null; _sum: { total: number | null }; _count: number };
type ClientInfo = { id: string; name: string; company: string | null };
type InvoiceDates = { sentAt: Date | null; paidAt: Date | null };

async function getBusinessId(ctx: { prisma: PrismaType; user: { id: string } }) {
  const membership = await ctx.prisma.businessMember.findFirst({
    where: { user: { supabaseId: ctx.user.id } },
    select: { businessId: true },
  });
  if (!membership)
    throw new TRPCError({ code: "NOT_FOUND", message: "No business found" });
  return membership.businessId;
}

export const dashboardRouter = router({
  stats: protectedProcedure.query(async ({ ctx }) => {
    const businessId = await getBusinessId(ctx);
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [
      revenueMTD,
      revenueLastMonth,
      activeClients,
      pendingInvoices,
      overdueInvoices,
      totalPaid,
      recentInvoices,
      recentClients,
    ] = await Promise.all([
      // Revenue this month (paid invoices)
      ctx.prisma.invoice.aggregate({
        where: {
          businessId,
          status: "PAID",
          paidAt: { gte: startOfMonth },
        },
        _sum: { total: true },
      }),
      // Revenue last month
      ctx.prisma.invoice.aggregate({
        where: {
          businessId,
          status: "PAID",
          paidAt: { gte: startOfLastMonth, lt: startOfMonth },
        },
        _sum: { total: true },
      }),
      // Active clients count
      ctx.prisma.client.count({
        where: { businessId, isArchived: false },
      }),
      // Pending invoices (sent + viewed)
      ctx.prisma.invoice.aggregate({
        where: { businessId, status: { in: ["SENT", "VIEWED"] } },
        _sum: { total: true },
        _count: true,
      }),
      // Overdue invoices
      ctx.prisma.invoice.aggregate({
        where: { businessId, status: "OVERDUE" },
        _sum: { total: true },
        _count: true,
      }),
      // Total collected (all time)
      ctx.prisma.invoice.aggregate({
        where: { businessId, status: "PAID" },
        _sum: { total: true },
        _count: true,
      }),
      // Recent invoices for activity feed
      ctx.prisma.invoice.findMany({
        where: { businessId },
        orderBy: { createdAt: "desc" },
        take: 8,
        include: { client: { select: { name: true } } },
      }),
      // Recent clients
      ctx.prisma.client.findMany({
        where: { businessId },
        orderBy: { createdAt: "desc" },
        take: 3,
        select: { id: true, name: true, company: true, createdAt: true },
      }),
    ]);

    // Calculate month-over-month change
    const currentRevenue = revenueMTD._sum.total ?? 0;
    const lastRevenue = revenueLastMonth._sum.total ?? 0;
    const revenueChange =
      lastRevenue > 0
        ? Math.round(((currentRevenue - lastRevenue) / lastRevenue) * 100)
        : currentRevenue > 0
          ? 100
          : 0;

    return {
      revenue: {
        mtd: currentRevenue,
        lastMonth: lastRevenue,
        change: revenueChange,
      },
      clients: {
        active: activeClients,
      },
      invoices: {
        pending: { count: pendingInvoices._count, amount: pendingInvoices._sum.total ?? 0 },
        overdue: { count: overdueInvoices._count, amount: overdueInvoices._sum.total ?? 0 },
        totalPaid: { count: totalPaid._count, amount: totalPaid._sum.total ?? 0 },
      },
      recentInvoices,
      recentClients,
    };
  }),

  monthlyRevenue: protectedProcedure.query(async ({ ctx }) => {
    const businessId = await getBusinessId(ctx);
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    // Get all paid invoices in the last 6 months
    const invoices = await ctx.prisma.invoice.findMany({
      where: {
        businessId,
        status: "PAID",
        paidAt: { gte: sixMonthsAgo },
      },
      select: { total: true, paidAt: true },
    });

    // Group by month
    const months: { month: string; revenue: number; label: string }[] = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
      const monthLabel = date.toLocaleDateString("en-US", {
        month: "short",
        year: now.getMonth() - i < 0 ? "2-digit" : undefined,
      });
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const monthRevenue = invoices
        .filter((inv: InvoiceTotal) => {
          if (!inv.paidAt) return false;
          const paidDate = new Date(inv.paidAt);
          return paidDate >= date && paidDate <= monthEnd;
        })
        .reduce((sum: number, inv: InvoiceTotal) => sum + inv.total, 0);

      months.push({ month: monthKey, revenue: monthRevenue, label: monthLabel });
    }

    return months;
  }),

  aiInsights: protectedProcedure.query(async ({ ctx }) => {
    const businessId = await getBusinessId(ctx);

    // Gather key metrics for AI analysis
    const [invoiceStats, clientCount, recentActivity] = await Promise.all([
      ctx.prisma.invoice.groupBy({
        by: ["status"],
        where: { businessId },
        _count: true,
        _sum: { total: true },
      }),
      ctx.prisma.client.count({
        where: { businessId, isArchived: false },
      }),
      ctx.prisma.invoice.findMany({
        where: { businessId },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          status: true,
          total: true,
          createdAt: true,
          dueDate: true,
          paidAt: true,
          client: { select: { name: true } },
        },
      }),
    ]);

    // Build insights from data (no AI call needed for basic insights)
    const insights: string[] = [];
    const overdueCount =
      invoiceStats.find((s: InvoiceStatusGroup) => s.status === "OVERDUE")?._count ?? 0;
    const overdueAmount =
      invoiceStats.find((s: InvoiceStatusGroup) => s.status === "OVERDUE")?._sum.total ?? 0;
    const pendingCount =
      (invoiceStats.find((s: InvoiceStatusGroup) => s.status === "SENT")?._count ?? 0) +
      (invoiceStats.find((s: InvoiceStatusGroup) => s.status === "VIEWED")?._count ?? 0);
    const pendingAmount =
      (invoiceStats.find((s: InvoiceStatusGroup) => s.status === "SENT")?._sum.total ?? 0) +
      (invoiceStats.find((s: InvoiceStatusGroup) => s.status === "VIEWED")?._sum.total ?? 0);
    const paidCount =
      invoiceStats.find((s: InvoiceStatusGroup) => s.status === "PAID")?._count ?? 0;
    const totalAmount =
      invoiceStats.find((s: InvoiceStatusGroup) => s.status === "PAID")?._sum.total ?? 0;

    if (overdueCount > 0) {
      insights.push(
        `⚠️ You have ${overdueCount} overdue invoice${overdueCount > 1 ? "s" : ""} totaling $${(overdueAmount / 100).toFixed(2)}. Follow up to collect payment.`
      );
    }

    if (pendingCount > 0) {
      insights.push(
        `📨 ${pendingCount} invoice${pendingCount > 1 ? "s" : ""} worth $${(pendingAmount / 100).toFixed(2)} ${pendingCount > 1 ? "are" : "is"} awaiting payment.`
      );
    }

    if (paidCount > 0) {
      insights.push(
        `✅ You've collected $${(totalAmount / 100).toFixed(2)} across ${paidCount} paid invoice${paidCount > 1 ? "s" : ""}. Great work!`
      );
    }

    if (clientCount === 0) {
      insights.push(
        "👤 Add your first client to get started with invoicing."
      );
    } else if (clientCount <= 3) {
      insights.push(
        `📈 You have ${clientCount} active client${clientCount > 1 ? "s" : ""}. Keep growing your client base!`
      );
    } else {
      insights.push(
        `🏆 ${clientCount} active clients. Your business is growing well.`
      );
    }

    // Check for invoices nearing due date
    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const upcomingDue = recentActivity.filter(
      (inv: { status: string; dueDate: Date }) =>
        (inv.status === "SENT" || inv.status === "VIEWED") &&
        new Date(inv.dueDate) <= threeDaysFromNow &&
        new Date(inv.dueDate) >= now
    );
    if (upcomingDue.length > 0) {
      insights.push(
        `🔔 ${upcomingDue.length} invoice${upcomingDue.length > 1 ? "s" : ""} due within 3 days. Consider sending a reminder.`
      );
    }

    return { insights };
  }),

  reports: protectedProcedure.query(async ({ ctx }) => {
    const businessId = await getBusinessId(ctx);
    const now = new Date();

    // Revenue by month (last 12 months)
    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    const paidInvoices = await ctx.prisma.invoice.findMany({
      where: {
        businessId,
        status: "PAID",
        paidAt: { gte: twelveMonthsAgo },
      },
      select: { total: true, paidAt: true },
    });

    const monthlyRevenue: { month: string; label: string; revenue: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
      const label = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const rev = paidInvoices
        .filter((inv: InvoiceTotal) => inv.paidAt && new Date(inv.paidAt) >= d && new Date(inv.paidAt) <= end)
        .reduce((s: number, inv: InvoiceTotal) => s + inv.total, 0);
      monthlyRevenue.push({ month: key, label, revenue: rev });
    }

    // Invoice status breakdown
    const statusBreakdown = await ctx.prisma.invoice.groupBy({
      by: ["status"],
      where: { businessId },
      _count: true,
      _sum: { total: true },
    });

    // Top clients by revenue
    const topClients = await ctx.prisma.invoice.groupBy({
      by: ["clientId"],
      where: { businessId, status: "PAID", clientId: { not: null } },
      _sum: { total: true },
      _count: true,
      orderBy: { _sum: { total: "desc" } },
      take: 5,
    });

    // Fetch client names for top clients
    const clientIds = topClients
      .map((c: ClientGroupByResult) => c.clientId)
      .filter((id: string | null): id is string => id !== null);
    const clients = await ctx.prisma.client.findMany({
      where: { id: { in: clientIds } },
      select: { id: true, name: true, company: true },
    });
    const clientMap = new Map<string, ClientInfo>(clients.map((c: ClientInfo) => [c.id, c] as [string, ClientInfo]));

    const topClientsData = topClients.map((tc: ClientGroupByResult) => {
      const client = tc.clientId ? clientMap.get(tc.clientId) : null;
      return {
        name: client?.name ?? "Unknown",
        company: client?.company ?? null,
        revenue: tc._sum.total ?? 0,
        invoiceCount: tc._count,
      };
    });

    // Average invoice value
    const avgInvoice = await ctx.prisma.invoice.aggregate({
      where: { businessId, status: "PAID" },
      _avg: { total: true },
      _count: true,
    });

    // Collection rate (paid vs total non-draft)
    const totalNonDraft = await ctx.prisma.invoice.count({
      where: { businessId, status: { not: "DRAFT" } },
    });
    const totalPaid = await ctx.prisma.invoice.count({
      where: { businessId, status: "PAID" },
    });
    const collectionRate = totalNonDraft > 0 ? Math.round((totalPaid / totalNonDraft) * 100) : 0;

    // Average days to pay
    const paidWithDates = await ctx.prisma.invoice.findMany({
      where: { businessId, status: "PAID", sentAt: { not: null }, paidAt: { not: null } },
      select: { sentAt: true, paidAt: true },
    });
    const avgDaysToPay = paidWithDates.length > 0
      ? Math.round(
          paidWithDates.reduce((sum: number, inv: InvoiceDates) => {
            const sent = new Date(inv.sentAt!).getTime();
            const paid = new Date(inv.paidAt!).getTime();
            return sum + (paid - sent) / (1000 * 60 * 60 * 24);
          }, 0) / paidWithDates.length
        )
      : 0;

    return {
      monthlyRevenue,
      statusBreakdown: statusBreakdown.map((s: InvoiceStatusGroup) => ({
        status: s.status,
        count: s._count,
        amount: s._sum.total ?? 0,
      })),
      topClients: topClientsData,
      avgInvoiceValue: avgInvoice._avg.total ?? 0,
      totalPaidInvoices: avgInvoice._count,
      collectionRate,
      avgDaysToPay,
    };
  }),
});
