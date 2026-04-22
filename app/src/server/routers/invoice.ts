import { z } from "zod/v4";
import { router, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { prisma } from "@/lib/prisma";

type PrismaType = typeof prisma;
type TransactionClient = Parameters<Parameters<PrismaType["$transaction"]>[0]>[0];

async function getBusinessId(ctx: { prisma: PrismaType; user: { id: string } }) {
  const membership = await ctx.prisma.businessMember.findFirst({
    where: { user: { supabaseId: ctx.user.id } },
    select: { businessId: true },
  });
  if (!membership) throw new TRPCError({ code: "NOT_FOUND", message: "No business found" });
  return membership.businessId;
}

const invoiceItemSchema = z.object({
  description: z.string().min(1),
  quantity: z.number().positive(),
  unitPrice: z.number().int().min(0),
});

export const invoiceRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        status: z.enum(["DRAFT", "SENT", "VIEWED", "PAID", "OVERDUE", "CANCELED"]).optional(),
        clientId: z.string().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const businessId = await getBusinessId(ctx);
      return ctx.prisma.invoice.findMany({
        where: {
          businessId,
          ...(input?.status ? { status: input.status } : {}),
          ...(input?.clientId ? { clientId: input.clientId } : {}),
        },
        include: { client: true },
        orderBy: { createdAt: "desc" },
      });
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const businessId = await getBusinessId(ctx);
      const invoice = await ctx.prisma.invoice.findFirst({
        where: { id: input.id, businessId },
        include: { client: true, items: { orderBy: { sortOrder: "asc" } } },
      });
      if (!invoice) throw new TRPCError({ code: "NOT_FOUND" });
      return invoice;
    }),

  create: protectedProcedure
    .input(
      z.object({
        clientId: z.string().optional(),
        items: z.array(invoiceItemSchema).min(1),
        dueDate: z.coerce.date(),
        notes: z.string().optional(),
        terms: z.string().optional(),
        taxRate: z.number().min(0).max(100).optional(),
        isRecurring: z.boolean().optional(),
        recurringInterval: z.enum(["weekly", "biweekly", "monthly", "quarterly", "yearly"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const businessId = await getBusinessId(ctx);

      // Get business for invoice numbering
      const business = await ctx.prisma.business.findUnique({
        where: { id: businessId },
      });
      if (!business) throw new TRPCError({ code: "NOT_FOUND" });

      const invoiceNumber = `${business.invoicePrefix}-${business.nextInvoiceNo}`;

      // Calculate totals
      const subtotal = input.items.reduce(
        (sum, item) => sum + Math.round(item.quantity * item.unitPrice),
        0
      );
      const taxRate = input.taxRate ?? Number(business.taxRate ?? 0);
      const taxAmount = Math.round(subtotal * (taxRate / 100));
      const total = subtotal + taxAmount;

      const invoice = await ctx.prisma.$transaction(async (tx: TransactionClient) => {
        // Increment invoice number
        await tx.business.update({
          where: { id: businessId },
          data: { nextInvoiceNo: { increment: 1 } },
        });

        return tx.invoice.create({
          data: {
            businessId,
            clientId: input.clientId || null,
            number: invoiceNumber,
            status: "DRAFT",
            dueDate: input.dueDate,
            subtotal,
            taxRate,
            taxAmount,
            total,
            notes: input.notes,
            terms: input.terms,
            isRecurring: input.isRecurring ?? false,
            recurringInterval: input.isRecurring ? (input.recurringInterval ?? "monthly") : null,
            items: {
              create: input.items.map((item, index) => ({
                description: item.description,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                total: Math.round(item.quantity * item.unitPrice),
                sortOrder: index,
              })),
            },
          },
          include: { client: true, items: true },
        });
      });

      return invoice;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        clientId: z.string().optional(),
        items: z.array(invoiceItemSchema).min(1).optional(),
        dueDate: z.coerce.date().optional(),
        notes: z.string().optional(),
        terms: z.string().optional(),
        taxRate: z.number().min(0).max(100).optional(),
        isRecurring: z.boolean().optional(),
        recurringInterval: z.enum(["weekly", "biweekly", "monthly", "quarterly", "yearly"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const businessId = await getBusinessId(ctx);
      const existing = await ctx.prisma.invoice.findFirst({
        where: { id: input.id, businessId, status: "DRAFT" },
      });
      if (!existing) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Only draft invoices can be edited",
        });
      }

      const { id, items, recurringInterval: ri, ...data } = input;

      // Handle recurring fields
      if (data.isRecurring !== undefined) {
        (data as Record<string, unknown>).recurringInterval = data.isRecurring ? (ri ?? "monthly") : null;
      }

      // Recalculate totals if items changed
      let totals = {};
      if (items) {
        const subtotal = items.reduce(
          (sum, item) => sum + Math.round(item.quantity * item.unitPrice),
          0
        );
        const taxRate = data.taxRate ?? Number(existing.taxRate);
        const taxAmount = Math.round(subtotal * (taxRate / 100));
        totals = { subtotal, taxRate, taxAmount, total: subtotal + taxAmount };
      }

      return ctx.prisma.$transaction(async (tx: TransactionClient) => {
        if (items) {
          await tx.invoiceItem.deleteMany({ where: { invoiceId: id } });
          await tx.invoiceItem.createMany({
            data: items.map((item, index) => ({
              invoiceId: id,
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              total: Math.round(item.quantity * item.unitPrice),
              sortOrder: index,
            })),
          });
        }

        return tx.invoice.update({
          where: { id },
          data: { ...data, ...totals },
          include: { client: true, items: { orderBy: { sortOrder: "asc" } } },
        });
      });
    }),

  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(["DRAFT", "SENT", "VIEWED", "PAID", "OVERDUE", "CANCELED"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const businessId = await getBusinessId(ctx);
      const invoice = await ctx.prisma.invoice.findFirst({
        where: { id: input.id, businessId },
      });
      if (!invoice) throw new TRPCError({ code: "NOT_FOUND" });

      const updateData: { status: typeof input.status; sentAt?: Date; paidAt?: Date } = { status: input.status };
      if (input.status === "SENT") updateData.sentAt = new Date();
      if (input.status === "PAID") updateData.paidAt = new Date();

      const wasPaid = invoice.status === "PAID";
      const nowPaid = input.status === "PAID";

      return ctx.prisma.$transaction(async (tx: TransactionClient) => {
        const updated = await tx.invoice.update({
          where: { id: input.id },
          data: updateData,
          include: { client: true },
        });

        // Update client revenue aggregates
        if (invoice.clientId) {
          if (!wasPaid && nowPaid) {
            // Becoming PAID → increment aggregates
            await tx.client.update({
              where: { id: invoice.clientId },
              data: {
                totalInvoices: { increment: 1 },
                totalRevenue: { increment: invoice.total },
                lastInvoiceDate: new Date(),
              },
            });
          } else if (wasPaid && !nowPaid) {
            // Leaving PAID (e.g. canceled) → decrement aggregates
            await tx.client.update({
              where: { id: invoice.clientId },
              data: {
                totalInvoices: { decrement: 1 },
                totalRevenue: { decrement: invoice.total },
              },
            });
          }
        }

        return updated;
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const businessId = await getBusinessId(ctx);
      const invoice = await ctx.prisma.invoice.findFirst({
        where: { id: input.id, businessId, status: "DRAFT" },
      });
      if (!invoice) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Only draft invoices can be deleted",
        });
      }
      await ctx.prisma.invoice.delete({ where: { id: input.id } });
      return { success: true };
    }),

  duplicate: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const businessId = await getBusinessId(ctx);
      const original = await ctx.prisma.invoice.findFirst({
        where: { id: input.id, businessId },
        include: { items: true },
      });
      if (!original) throw new TRPCError({ code: "NOT_FOUND" });

      const business = await ctx.prisma.business.findUnique({
        where: { id: businessId },
      });
      if (!business) throw new TRPCError({ code: "NOT_FOUND" });

      const invoiceNumber = `${business.invoicePrefix}-${business.nextInvoiceNo}`;

      return ctx.prisma.$transaction(async (tx: TransactionClient) => {
        await tx.business.update({
          where: { id: businessId },
          data: { nextInvoiceNo: { increment: 1 } },
        });

        return tx.invoice.create({
          data: {
            businessId,
            clientId: original.clientId,
            number: invoiceNumber,
            status: "DRAFT",
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            subtotal: original.subtotal,
            taxRate: original.taxRate,
            taxAmount: original.taxAmount,
            total: original.total,
            notes: original.notes,
            terms: original.terms,
            items: {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              create: original.items.map((item: any, index: number) => ({
                description: item.description,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                total: item.total,
                sortOrder: index,
              })),
            },
          },
          include: { client: true, items: true },
        });
      });
    }),

  stats: protectedProcedure.query(async ({ ctx }) => {
    const businessId = await getBusinessId(ctx);
    const [total, paid, pending, overdue] = await Promise.all([
      ctx.prisma.invoice.aggregate({
        where: { businessId },
        _sum: { total: true },
        _count: true,
      }),
      ctx.prisma.invoice.aggregate({
        where: { businessId, status: "PAID" },
        _sum: { total: true },
        _count: true,
      }),
      ctx.prisma.invoice.aggregate({
        where: { businessId, status: { in: ["SENT", "VIEWED"] } },
        _sum: { total: true },
        _count: true,
      }),
      ctx.prisma.invoice.aggregate({
        where: { businessId, status: "OVERDUE" },
        _sum: { total: true },
        _count: true,
      }),
    ]);

    return {
      total: { amount: total._sum.total ?? 0, count: total._count },
      paid: { amount: paid._sum.total ?? 0, count: paid._count },
      pending: { amount: pending._sum.total ?? 0, count: pending._count },
      overdue: { amount: overdue._sum.total ?? 0, count: overdue._count },
    };
  }),
});
