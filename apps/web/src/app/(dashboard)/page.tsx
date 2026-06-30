"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import {
  DollarSign,
  TrendingUp,
  Package,
  Warehouse,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import type { DashboardStats, DashboardMetric } from "@eldorado/shared";

// Fallback chart data for when the API returns empty
const FALLBACK_CHART_DATA = [
  { date: "Mon", revenue: 1200, profit: 400, sales: 5 },
  { date: "Tue", revenue: 2100, profit: 780, sales: 8 },
  { date: "Wed", revenue: 800, profit: 250, sales: 3 },
  { date: "Thu", revenue: 1600, profit: 580, sales: 6 },
  { date: "Fri", revenue: 2400, profit: 920, sales: 10 },
  { date: "Sat", revenue: 1800, profit: 650, sales: 7 },
  { date: "Sun", revenue: 3200, profit: 1100, sales: 12 },
];

function TrendIcon({ trend }: { trend?: string }) {
  if (trend === "up")
    return <ArrowUpRight className="w-4 h-4 text-emerald-400" />;
  if (trend === "down")
    return <ArrowDownRight className="w-4 h-4 text-red-400" />;
  return <Minus className="w-4 h-4 text-muted-foreground" />;
}

function StatCard({
  title,
  metric,
  icon: Icon,
  format = "number",
}: {
  title: string;
  metric: DashboardMetric;
  icon: React.ElementType;
  format?: "currency" | "number";
}) {
  const displayValue =
    format === "currency"
      ? `$${metric.value.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
      : metric.value.toLocaleString();

  return (
    <div className="stat-card animate-fade-in">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold text-foreground">{displayValue}</p>
        </div>
        <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary" />
        </div>
      </div>
      <div className="flex items-center gap-1 mt-3">
        <TrendIcon trend={metric.trend} />
        {metric.changePercent !== undefined && (
          <span
            className={`text-xs font-medium ${
              metric.trend === "up"
                ? "text-emerald-400"
                : metric.trend === "down"
                  ? "text-red-400"
                  : "text-muted-foreground"
            }`}
          >
            {metric.changePercent > 0 ? "+" : ""}
            {metric.changePercent}%
          </span>
        )}
        <span className="text-xs text-muted-foreground ml-1">
          vs last period
        </span>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="glass-card p-6 animate-pulse">
      <div className="flex justify-between items-start">
        <div className="space-y-3">
          <div className="h-4 w-20 bg-white/[0.06] rounded" />
          <div className="h-8 w-32 bg-white/[0.06] rounded" />
        </div>
        <div className="w-10 h-10 bg-white/[0.06] rounded-lg" />
      </div>
      <div className="h-3 w-24 bg-white/[0.06] rounded mt-4" />
    </div>
  );
}

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const { data } = await apiClient.get("/dashboard/stats");
      return data;
    },
  });

  const chartData =
    stats?.revenueChart && stats.revenueChart.length > 0
      ? stats.revenueChart
      : FALLBACK_CHART_DATA;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Overview of your digital goods business
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : stats ? (
          <>
            <StatCard
              title="Total Revenue"
              metric={stats.revenue}
              icon={DollarSign}
              format="currency"
            />
            <StatCard
              title="Total Profit"
              metric={stats.profit}
              icon={TrendingUp}
              format="currency"
            />
            <StatCard
              title="Inventory Value"
              metric={stats.inventoryValue}
              icon={Warehouse}
              format="currency"
            />
            <StatCard
              title="Accounts in Stock"
              metric={stats.accountsInStock}
              icon={Package}
            />
          </>
        ) : null}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 glass-card p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Revenue &amp; Profit
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient
                    id="revenueGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="hsl(217, 91%, 60%)"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="hsl(217, 91%, 60%)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                  <linearGradient
                    id="profitGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="hsl(172, 66%, 50%)"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="hsl(172, 66%, 50%)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(217, 33%, 18%)"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  stroke="hsl(215, 20%, 55%)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="hsl(215, 20%, 55%)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `$${v}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(222, 47%, 8%)",
                    border: "1px solid hsl(217, 33%, 18%)",
                    borderRadius: "8px",
                    color: "hsl(210, 40%, 96%)",
                  }}
                  formatter={(value: number) => [
                    `$${value.toLocaleString()}`,
                    "",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(217, 91%, 60%)"
                  fill="url(#revenueGradient)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="profit"
                  stroke="hsl(172, 66%, 50%)"
                  fill="url(#profitGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Platform Distribution */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Top Platforms
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={
                  stats?.topPlatforms?.slice(0, 5) || [
                    { platform: "Steam", totalAccounts: 12 },
                    { platform: "Epic", totalAccounts: 8 },
                    { platform: "Netflix", totalAccounts: 5 },
                    { platform: "Spotify", totalAccounts: 3 },
                  ]
                }
                layout="vertical"
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(217, 33%, 18%)"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  stroke="hsl(215, 20%, 55%)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="platform"
                  stroke="hsl(215, 20%, 55%)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  width={80}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(222, 47%, 8%)",
                    border: "1px solid hsl(217, 33%, 18%)",
                    borderRadius: "8px",
                    color: "hsl(210, 40%, 96%)",
                  }}
                />
                <Bar
                  dataKey="totalAccounts"
                  fill="hsl(217, 91%, 60%)"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity & Status Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Activity */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Recent Activity
          </h2>
          <div className="space-y-3">
            {stats?.recentActivity && stats.recentActivity.length > 0 ? (
              stats.recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/[0.02] transition-colors"
                >
                  <div className="w-2 h-2 mt-2 rounded-full bg-primary shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-foreground truncate">
                      {activity.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {activity.userEmail || "System"} •{" "}
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No recent activity
              </p>
            )}
          </div>
        </div>

        {/* Account Status Breakdown */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Account Status
          </h2>
          <div className="space-y-3">
            {stats?.accountsByStatus && stats.accountsByStatus.length > 0 ? (
              stats.accountsByStatus.map((s) => (
                <div key={s.status} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground capitalize">
                      {s.status.toLowerCase().replace(/_/g, " ")}
                    </span>
                    <span className="text-foreground font-medium">
                      {s.count}{" "}
                      <span className="text-muted-foreground text-xs">
                        ({s.percentage}%)
                      </span>
                    </span>
                  </div>
                  <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-700"
                      style={{ width: `${s.percentage}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No accounts yet
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
