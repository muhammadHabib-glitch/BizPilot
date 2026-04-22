"use client";

import { trpc } from "@/lib/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  Users,
  FileText,
} from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "#9ca3af",
  SENT: "#3b82f6",
  VIEWED: "#8b5cf6",
  PAID: "#10b981",
  OVERDUE: "#ef4444",
  CANCELED: "#d1d5db",
};

interface StatusEntry {
  status: string;
  count: number;
  amount: number;
}

interface TopClient {
  name: string;
  company: string | null;
  revenue: number;
  invoiceCount: number;
}

export default function ReportsPage() {
  const { data, isLoading } = trpc.dashboard.reports.useQuery();

  const statusBreakdown = (data?.statusBreakdown ?? []) as StatusEntry[];
  const topClients = (data?.topClients ?? []) as TopClient[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-sm text-gray-500 mt-1">
          Revenue trends, outstanding receivables, and business analytics
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Avg Invoice Value"
          value={isLoading ? undefined : formatCurrency(data?.avgInvoiceValue ?? 0)}
          sub={isLoading ? undefined : `${data?.totalPaidInvoices ?? 0} paid invoices`}
          icon={DollarSign}
          loading={isLoading}
        />
        <KpiCard
          title="Collection Rate"
          value={isLoading ? undefined : `${data?.collectionRate ?? 0}%`}
          sub="Paid vs sent"
          icon={CheckCircle2}
          loading={isLoading}
        />
        <KpiCard
          title="Avg Days to Pay"
          value={isLoading ? undefined : `${data?.avgDaysToPay ?? 0} days`}
          sub="From sent to paid"
          icon={Clock}
          loading={isLoading}
        />
        <KpiCard
          title="Top Clients"
          value={isLoading ? undefined : String(data?.topClients?.length ?? 0)}
          sub="Revenue generating"
          icon={Users}
          loading={isLoading}
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* 12-Month Revenue */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              Revenue (12 Months)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : data?.monthlyRevenue?.some((m) => m.revenue > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={data.monthlyRevenue.map((m) => ({
                    ...m,
                    revenue: m.revenue / 100,
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#6b7280" }} />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#6b7280" }}
                    tickFormatter={(v) => `$${Number(v).toLocaleString()}`}
                  />
                  <Tooltip
                    formatter={(value) => [
                      `$${Number(value ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
                      "Revenue",
                    ]}
                    contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb" }}
                  />
                  <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState text="No revenue data yet" sub="Mark invoices as paid to see revenue trends" />
            )}
          </CardContent>
        </Card>

        {/* Invoice Status Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4 text-blue-500" />
              Invoice Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : statusBreakdown.length > 0 ? (
              <div>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={statusBreakdown}
                      dataKey="count"
                      nameKey="status"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      innerRadius={45}
                      paddingAngle={2}
                    >
                      {statusBreakdown.map((entry) => (
                        <Cell
                          key={entry.status}
                          fill={STATUS_COLORS[entry.status] ?? "#9ca3af"}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name) => [
                        `${value} invoice${Number(value) !== 1 ? "s" : ""}`,
                        String(name),
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-3 justify-center mt-2">
                  {statusBreakdown.map((s) => (
                    <div key={s.status} className="flex items-center gap-1.5 text-xs">
                      <div
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: STATUS_COLORS[s.status] ?? "#9ca3af" }}
                      />
                      <span className="text-gray-600">
                        {s.status} ({s.count})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <EmptyState text="No invoices yet" sub="Create invoices to see the breakdown" />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Clients Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4 text-indigo-500" />
            Top Clients by Revenue
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : data?.topClients && topClients.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="pb-2 font-medium">#</th>
                    <th className="pb-2 font-medium">Client</th>
                    <th className="pb-2 font-medium text-right">Revenue</th>
                    <th className="pb-2 font-medium text-right">Invoices</th>
                    <th className="pb-2 font-medium text-right">Avg Value</th>
                  </tr>
                </thead>
                <tbody>
                  {topClients.map((client, i) => (
                    <tr key={client.name} className="border-b last:border-0">
                      <td className="py-3 text-gray-400">{i + 1}</td>
                      <td className="py-3">
                        <p className="font-medium text-gray-900">{client.name}</p>
                        {client.company && (
                          <p className="text-xs text-gray-500">{client.company}</p>
                        )}
                      </td>
                      <td className="py-3 text-right font-semibold text-gray-900">
                        {formatCurrency(client.revenue)}
                      </td>
                      <td className="py-3 text-right text-gray-600">
                        {client.invoiceCount}
                      </td>
                      <td className="py-3 text-right text-gray-600">
                        {formatCurrency(
                          client.invoiceCount > 0
                            ? Math.round(client.revenue / client.invoiceCount)
                            : 0
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState text="No client revenue data" sub="Paid invoices linked to clients will appear here" />
          )}
        </CardContent>
      </Card>

      {/* Status Amount Breakdown */}
      {!isLoading && statusBreakdown.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {statusBreakdown.map((s) => (
            <Card key={s.status}>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: STATUS_COLORS[s.status] ?? "#9ca3af" }}
                  />
                  <span className="text-xs font-medium text-gray-500 uppercase">
                    {s.status}
                  </span>
                </div>
                <p className="text-lg font-bold text-gray-900">
                  {formatCurrency(s.amount)}
                </p>
                <p className="text-xs text-gray-400">
                  {s.count} invoice{s.count !== 1 ? "s" : ""}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function KpiCard({
  title,
  value,
  sub,
  icon: Icon,
  loading,
}: {
  title: string;
  value: string | undefined;
  sub: string | undefined;
  icon: typeof DollarSign;
  loading: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
        <Icon className="h-4 w-4 text-gray-400" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <>
            <Skeleton className="h-7 w-20 mb-1" />
            <Skeleton className="h-4 w-28" />
          </>
        ) : (
          <>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function EmptyState({ text, sub }: { text: string; sub: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <p className="text-sm text-gray-500 font-medium">{text}</p>
      <p className="text-xs text-gray-400 mt-1">{sub}</p>
    </div>
  );
}
