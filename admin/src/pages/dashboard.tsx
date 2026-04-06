import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { StatCard } from "@/components/stat-card"
import {
  Users, Building2, FileText, Eye, DollarSign, Clock,
  Sparkles, AlertTriangle, Activity,
} from "lucide-react"
import { Link } from "react-router-dom"
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts"

const PIE_COLORS = ["#6b7280", "#3b82f6", "#8b5cf6", "#f59e0b"]

export function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: async () => {
      const { data } = await api.get("/api/admin/analytics/overview")
      return data
    },
  })

  const { data: growth } = useQuery({
    queryKey: ["admin-growth", 90],
    queryFn: async () => {
      const { data } = await api.get("/api/admin/analytics/growth?days=90")
      return data
    },
  })

  const { data: revenue } = useQuery({
    queryKey: ["admin-revenue"],
    queryFn: async () => {
      const { data } = await api.get("/api/admin/billing/revenue")
      return data
    },
  })

  const { data: activityData } = useQuery({
    queryKey: ["admin-activity-recent"],
    queryFn: async () => {
      const { data } = await api.get("/api/admin/activity?limit=10")
      return data
    },
  })

  const loading = statsLoading

  const kpiRow1 = [
    {
      label: "Total Users",
      value: loading ? "..." : (stats?.totalUsers ?? 0),
      icon: Users,
      trend: stats?.userGrowth ? { value: stats.userGrowth, positive: stats.userGrowth >= 0 } : undefined,
    },
    {
      label: "Total Workspaces",
      value: loading ? "..." : (stats?.totalWorkspaces ?? 0),
      icon: Building2,
    },
    {
      label: "MRR Estimate",
      value: loading ? "..." : `$${revenue?.mrr ?? 0}`,
      icon: DollarSign,
      subtext: revenue?.arr ? `$${revenue.arr} ARR` : undefined,
    },
    {
      label: "Active Trials",
      value: loading ? "..." : (stats?.activeTrials ?? revenue?.activeTrials ?? 0),
      icon: Clock,
    },
  ]

  const kpiRow2 = [
    {
      label: "Published Releases (30d)",
      value: loading ? "..." : (stats?.totalPublished ?? stats?.recentReleases ?? 0),
      icon: FileText,
    },
    {
      label: "Widget Views (30d)",
      value: loading ? "..." : (stats?.totalWidgetViews ?? 0),
      icon: Eye,
    },
    {
      label: "AI Generations",
      value: loading ? "..." : (stats?.aiUsageTotal ?? stats?.totalAiGenerations ?? 0),
      icon: Sparkles,
    },
    {
      label: "Churn Risk",
      value: loading ? "..." : (stats?.churnRisk ?? revenue?.churnRiskCount ?? 0),
      icon: AlertTriangle,
      subtext: "workspaces",
    },
  ]

  const growthData: any[] = growth?.userGrowth ?? growth?.data ?? growth ?? []

  const planDist: any[] = revenue?.planDistribution ?? []
  const pieData = planDist.length > 0
    ? planDist
    : [
        { name: "free", value: stats?.planCounts?.free ?? 0 },
        { name: "pro", value: stats?.planCounts?.pro ?? 0 },
        { name: "team", value: stats?.planCounts?.team ?? 0 },
        { name: "enterprise", value: stats?.planCounts?.enterprise ?? 0 },
      ].filter((p) => p.value > 0)

  const recentActivity: any[] = activityData?.logs ?? activityData ?? []
  const topWorkspaces: any[] = stats?.topWorkspaces ?? []

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Platform Dashboard</h1>
        <p className="text-sm text-muted-foreground">Overview of Changeloger platform metrics</p>
      </div>

      {/* KPI Row 1 */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiRow1.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      {/* KPI Row 2 */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiRow2.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      {/* Charts row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* User Growth Chart */}
        <div className="rounded-lg border border-border p-5">
          <h3 className="mb-4 text-sm font-semibold">User Growth (90 days)</h3>
          {growthData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={growthData}>
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(d: string) => d.slice(5)} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Area type="monotone" dataKey="count" stroke="#3b82f6" fill="#3b82f680" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-60 items-center justify-center text-sm text-muted-foreground">No growth data available</div>
          )}
        </div>

        {/* Plan Distribution */}
        <div className="rounded-lg border border-border p-5">
          <h3 className="mb-4 text-sm font-semibold">Plan Distribution</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }: { name: string; percent: number }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((_: any, i: number) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-60 items-center justify-center text-sm text-muted-foreground">No plan data available</div>
          )}
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <div className="rounded-lg border border-border p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Recent Activity</h3>
            <Link to="/activity" className="text-xs text-primary hover:underline">View all</Link>
          </div>
          {recentActivity.length > 0 ? (
            <div className="space-y-2">
              {recentActivity.slice(0, 10).map((log: any, i: number) => (
                <div key={log.id || i} className="flex items-center justify-between py-1.5">
                  <div className="flex items-center gap-2">
                    <Activity className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-sm">{log.action}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {log.createdAt ? new Date(log.createdAt).toLocaleString() : ""}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-4 text-center text-sm text-muted-foreground">No recent activity</p>
          )}
        </div>

        {/* Top Workspaces */}
        <div className="rounded-lg border border-border p-5">
          <h3 className="mb-4 text-sm font-semibold">Top Workspaces</h3>
          {topWorkspaces.length > 0 ? (
            <div className="rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">Workspace</th>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">Members</th>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">Plan</th>
                  </tr>
                </thead>
                <tbody>
                  {topWorkspaces.slice(0, 5).map((ws: any) => (
                    <tr key={ws.id} className="border-b border-border last:border-0">
                      <td className="px-3 py-2">
                        <Link to={`/workspaces/${ws.id}`} className="font-medium hover:text-primary">
                          {ws.name}
                        </Link>
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">{ws._count?.members ?? ws.memberCount ?? 0}</td>
                      <td className="px-3 py-2 capitalize text-muted-foreground">{ws.plan}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="py-4 text-center text-sm text-muted-foreground">No workspace data</p>
          )}
        </div>
      </div>
    </div>
  )
}
