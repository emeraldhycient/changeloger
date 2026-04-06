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
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(d: string) => d.slice(5)} />
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
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(d: string) => d.slice(5)} />
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
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(d: string) => d.slice(5)} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">No release data</div>
        )}
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
