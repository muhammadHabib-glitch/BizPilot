"use client";

import { trpc } from "@/lib/trpc/client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DollarSign,
  Users,
  FileText,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Plus,
  Sparkles,
  Clock,
  CheckCircle2,
  Send,
  Eye,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Link from "next/link";

// -- Status color map --
const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-700",
  SENT: "bg-blue-100 text-blue-700",
  VIEWED: "bg-purple-100 text-purple-700",
  PAID: "bg-green-100 text-green-700",
  OVERDUE: "bg-red-100 text-red-700",
  CANCELED: "bg-gray-100 text-gray-500",
};
const statusIcons: Record<string, typeof Clock> = {
  DRAFT: Clock,
  SENT: Send,
  VIEWED: Eye,
  PAID: CheckCircle2,
  OVERDUE: AlertTriangle,
};

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } =
    trpc.dashboard.stats.useQuery();
  const { data: monthlyRevenue, isLoading: chartLoading } =
    trpc.dashboard.monthlyRevenue.useQuery();
  const { data: aiData, isLoading: aiLoading } =
    trpc.dashboard.aiInsights.useQuery();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Your business at a glance —{" "}
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Revenue (MTD)"
          value={
            statsLoading
              ? undefined
              : formatCurrency(stats?.revenue.mtd ?? 0)
          }
          change={
            stats?.revenue.change !== undefined
              ? `${stats.revenue.change >= 0 ? "+" : ""}${stats.revenue.change}% vs last month`
              : undefined
          }
          trend={
            stats?.revenue.change !== undefined
              ? stats.revenue.change >= 0
                ? "up"
                : "down"
              : undefined
          }
          icon={DollarSign}
          loading={statsLoading}
        />
        <StatsCard
          title="Active Clients"
          value={statsLoading ? undefined : String(stats?.clients.active ?? 0)}
          change="Total active"
          icon={Users}
          loading={statsLoading}
        />
        <StatsCard
          title="Pending Invoices"
          value={
            statsLoading
              ? undefined
              : String(stats?.invoices.pending.count ?? 0)
          }
          change={
            statsLoading
              ? undefined
              : `${formatCurrency(stats?.invoices.pending.amount ?? 0)} outstanding`
          }
          icon={FileText}
          loading={statsLoading}
        />
        <StatsCard
          title="Overdue"
          value={
            statsLoading
              ? undefined
              : String(stats?.invoices.overdue.count ?? 0)
          }
          change={
            statsLoading
              ? undefined
              : stats?.invoices.overdue.count
                ? `${formatCurrency(stats.invoices.overdue.amount)} needs attention`
                : "All clear!"
          }
          trend={
            stats?.invoices.overdue.count
              ? "down"
              : stats !== undefined
                ? "up"
                : undefined
          }
          icon={AlertTriangle}
          loading={statsLoading}
        />
      </div>

      {/* Revenue Chart + Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              Revenue Trend (6 Months)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {chartLoading ? (
              <div className="h-[280px] flex items-center justify-center">
                <Skeleton className="h-full w-full" />
              </div>
            ) : monthlyRevenue && monthlyRevenue.some((m) => m.revenue > 0) ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={monthlyRevenue.map((m) => ({
                    ...m,
                    revenue: m.revenue / 100,
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                    tickFormatter={(v: number) => `$${v.toLocaleString()}`}
                  />
                  <Tooltip
                    formatter={(value) => [
                      `$${Number(value ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
                      "Revenue",
                    ]}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid #e5e7eb",
                    }}
                  />
                  <Bar
                    dataKey="revenue"
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[280px] flex flex-col items-center justify-center text-center">
                <TrendingUp className="h-10 w-10 text-gray-300 mb-3" />
                <p className="text-sm text-gray-500 font-medium">
                  No revenue data yet
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Send invoices and mark them paid to see your revenue trend
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <QuickAction
              label="Create Invoice"
              href="/dashboard/invoices?view=new"
              icon={Plus}
              color="bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
            />
            <QuickAction
              label="Add Client"
              href="/dashboard/clients?view=new"
              icon={Users}
              color="bg-blue-50 text-blue-700 hover:bg-blue-100"
            />
            <QuickAction
              label="View Reports"
              href="/dashboard/reports"
              icon={TrendingUp}
              color="bg-purple-50 text-purple-700 hover:bg-purple-100"
            />
            <QuickAction
              label="AI Assistant"
              href="/dashboard/ai"
              icon={Sparkles}
              color="bg-amber-50 text-amber-700 hover:bg-amber-100"
            />
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity + AI Insights */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-400" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : stats?.recentInvoices && stats.recentInvoices.length > 0 ? (
              <div className="space-y-1">
                {stats.recentInvoices.map(
                  (inv: {
                    id: string;
                    number: string;
                    status: string;
                    total: number;
                    createdAt: string | Date;
                    client: { name: string } | null;
                  }) => {
                    const StatusIcon = statusIcons[inv.status] ?? Clock;
                    return (
                      <Link
                        key={inv.id}
                        href={`/dashboard/invoices?id=${inv.id}`}
                        className="flex items-center gap-3 rounded-lg p-2 hover:bg-gray-50 transition-colors"
                      >
                        <div
                          className={`rounded-full p-1.5 ${statusColors[inv.status] ?? "bg-gray-100"}`}
                        >
                          <StatusIcon className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {inv.number}
                            {inv.client ? ` — ${inv.client.name}` : ""}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(inv.createdAt)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-900">
                            {formatCurrency(inv.total)}
                          </p>
                          <span
                            className={`inline-block text-[10px] font-medium px-1.5 py-0.5 rounded ${statusColors[inv.status] ?? "bg-gray-100"}`}
                          >
                            {inv.status}
                          </span>
                        </div>
                      </Link>
                    );
                  }
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <FileText className="h-10 w-10 text-gray-300 mb-3" />
                <p className="text-sm text-gray-500">No activity yet</p>
                <p className="text-xs text-gray-400 mt-1">
                  Create your first invoice to get started
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Insights */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Badge variant="default" className="gap-1 bg-gradient-to-r from-violet-500 to-purple-600">
              <Sparkles className="h-3 w-3" />
              <span>AI</span>
            </Badge>
            <CardTitle>Smart Insights</CardTitle>
          </CardHeader>
          <CardContent>
            {aiLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : aiData?.insights && aiData.insights.length > 0 ? (
              <div className="space-y-3">
                {aiData.insights.map((insight: string, i: number) => (
                  <div
                    key={i}
                    className="rounded-lg bg-gray-50 border border-gray-100 p-3 text-sm text-gray-700 leading-relaxed"
                  >
                    {insight}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Sparkles className="h-10 w-10 text-gray-300 mb-3" />
                <p className="text-sm text-gray-500 font-medium">
                  Insights will appear here
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Add clients and invoices to unlock AI-powered recommendations
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Stats */}
      {!statsLoading && stats && (
        <div className="grid gap-4 sm:grid-cols-3">
          <MiniStat
            label="Total Collected (All Time)"
            value={formatCurrency(stats.invoices.totalPaid.amount)}
            sub={`${stats.invoices.totalPaid.count} invoice${stats.invoices.totalPaid.count !== 1 ? "s" : ""}`}
          />
          <MiniStat
            label="Outstanding Amount"
            value={formatCurrency(
              stats.invoices.pending.amount + stats.invoices.overdue.amount
            )}
            sub={`${stats.invoices.pending.count + stats.invoices.overdue.count} invoice${stats.invoices.pending.count + stats.invoices.overdue.count !== 1 ? "s" : ""}`}
          />
          <MiniStat
            label="Last Month Revenue"
            value={formatCurrency(stats.revenue.lastMonth)}
            sub="Completed"
          />
        </div>
      )}
    </div>
  );
}

// -- Sub-components --

function StatsCard({
  title,
  value,
  change,
  trend,
  icon: Icon,
  loading,
}: {
  title: string;
  value: string | undefined;
  change?: string;
  trend?: "up" | "down";
  icon: typeof DollarSign;
  loading: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-gray-400" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <>
            <Skeleton className="h-7 w-24 mb-1" />
            <Skeleton className="h-4 w-32" />
          </>
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            {change && (
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                {trend === "up" && (
                  <TrendingUp className="h-3 w-3 text-emerald-500" />
                )}
                {trend === "down" && (
                  <TrendingDown className="h-3 w-3 text-red-500" />
                )}
                {change}
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function QuickAction({
  label,
  href,
  icon: Icon,
  color,
}: {
  label: string;
  href: string;
  icon: typeof Plus;
  color: string;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-lg p-3 text-sm font-medium transition-colors ${color}`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}

function MiniStat({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <Card>
      <CardContent className="pt-4">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          {label}
        </p>
        <p className="text-xl font-bold text-gray-900 mt-1">{value}</p>
        <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
      </CardContent>
    </Card>
  );
}
