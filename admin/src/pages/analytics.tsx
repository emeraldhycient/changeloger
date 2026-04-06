import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { cn } from "@/lib/utils"
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts"
import { Users, Building2, Eye, Sparkles } from "lucide-react"

const RANGE_OPTIONS = [
  { label: "7d", value: 7 },
  { label: "30d", value: 30 },
  { label: "90d", value: 90 },
]

const chartTickFormatter = (d: string) => {
  const date = new Date(d)
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" })
}

export function AnalyticsPage() {
  const [days, setDays] = useState(30)

  const { data: growth } = useQuery({
    queryKey: ["admin-growth", days],
    queryFn: async () => {
      const { data } = await api.get(`/api/admin/analytics/growth?days=${days}`)
      return data
    },
  })

  const { data: usage } = useQuery({
    queryKey: ["admin-usage"],
    queryFn: async () => {
      const { data } = await api.get("/api/admin/analytics/usage")
      return data
    },
  })

  const { data: overview } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: async () => {
      const { data } = await api.get("/api/admin/analytics/overview")
      return data
    },
  })

  const { data: billing } = useQuery({
    queryKey: ["admin-billing-overview"],
    queryFn: async () => {
      const { data } = await api.get("/api/admin/billing/overview")
      return data
    },
  })

  const userGrowth: any[] = growth?.userGrowth ?? growth?.users ?? []
  const workspaceGrowth: any[] = growth?.workspaceGrowth ?? growth?.workspaces ?? []
  const releaseActivity: any[] = growth?.releaseActivity ?? growth?.releases ?? []

  const adoptionStats = [
    {
      label: "Workspaces with Widgets",
      value: usage?.widgetAdoption ?? 0,
      icon: Eye,
    },
    {
      label: "Workspaces with Repos",
      value: usage?.repoAdoption ?? 0,
      icon: Building2,
    },
    {
      label: "Workspaces with Teams",
      value: usage?.teamAdoption ?? 0,
      icon: Users,
    },
    {
      label: "Total AI Generations",
      value: usage?.totalAIGenerations ?? 0,
      icon: Sparkles,
    },
  ]

  // Funnel data from overview + billing APIs
  const totalSignups = overview?.totalUsers ?? 0
  const activeTrials = overview?.activeTrials ?? billing?.activeTrials ?? 0
  const paidConversions = billing?.paidWorkspaces ?? billing?.totalPaid ?? overview?.paidWorkspaces ?? 0
  const activePaid = billing?.activePaid ?? paidConversions

  const funnelSteps = [
    { label: "Total Signups", value: totalSignups, color: "#3b82f6" },
    { label: "Active Trials", value: activeTrials, color: "#8b5cf6" },
    { label: "Paid Conversions", value: paidConversions, color: "#10b981" },
    { label: "Active Paid", value: activePaid, color: "#f59e0b" },
  ]
  const maxFunnel = Math.max(...funnelSteps.map((s) => s.value), 1)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-sm text-muted-foreground">Platform growth and usage metrics</p>
        </div>
        {/* Date range selector */}
        <div className="flex rounded-md border border-border">
          {RANGE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setDays(opt.value)}
              className={cn(
                "px-3 py-1.5 text-sm font-medium transition-colors",
                days === opt.value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* User Growth */}
        <div className="rounded-lg border border-border p-5">
          <h3 className="mb-4 text-sm font-semibold">User Growth</h3>
          {userGrowth.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={userGrowth}>
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={chartTickFormatter} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">No data</div>
          )}
        </div>

        {/* Workspace Growth */}
        <div className="rounded-lg border border-border p-5">
          <h3 className="mb-4 text-sm font-semibold">Workspace Growth</h3>
          {workspaceGrowth.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={workspaceGrowth}>
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={chartTickFormatter} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">No data</div>
          )}
        </div>
      </div>

      {/* Release Activity */}
      <div className="rounded-lg border border-border p-5">
        <h3 className="mb-4 text-sm font-semibold">Release Activity</h3>
        {releaseActivity.length > 0 ? (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={releaseActivity}>
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={chartTickFormatter} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">No release data</div>
        )}
      </div>

      {/* Conversion Funnel */}
      <div className="rounded-lg border border-border p-5">
        <h3 className="mb-4 text-sm font-semibold">Conversion Funnel</h3>
        <div className="space-y-3">
          {funnelSteps.map((step) => {
            const pct = maxFunnel > 0 ? Math.round((step.value / maxFunnel) * 100) : 0
            return (
              <div key={step.label} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>{step.label}</span>
                  <span className="font-medium">{step.value} ({pct}%)</span>
                </div>
                <div className="h-6 w-full overflow-hidden rounded bg-muted">
                  <div
                    className="flex h-full items-center rounded px-2 text-xs font-medium text-white transition-all"
                    style={{ width: `${Math.max(pct, 2)}%`, backgroundColor: step.color }}
                  >
                    {pct > 10 ? `${pct}%` : ""}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Feature Adoption */}
      <div>
        <h3 className="mb-4 text-sm font-semibold">Feature Adoption</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {adoptionStats.map((stat) => (
            <div key={stat.label} className="rounded-lg border border-border p-5">
              <div className="flex items-center gap-2">
                <stat.icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{stat.label}</span>
              </div>
              <p className="mt-2 text-2xl font-bold">{typeof stat.value === "number" ? `${stat.value}%` : stat.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
