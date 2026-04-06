import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import { api } from "@/lib/api"
import { StatCard } from "@/components/stat-card"
import { Link } from "react-router-dom"
import { cn } from "@/lib/utils"
import { exportToCSV } from "@/lib/export"
import { DollarSign, TrendingUp, CreditCard, Clock, AlertTriangle, Download } from "lucide-react"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"

const PIE_COLORS = ["#6b7280", "#3b82f6", "#8b5cf6", "#f59e0b"]

const planColors: Record<string, string> = {
  free: "bg-gray-500/10 text-gray-400",
  pro: "bg-blue-500/10 text-blue-400",
  team: "bg-violet-500/10 text-violet-400",
  enterprise: "bg-amber-500/10 text-amber-400",
}

export function BillingPage() {
  const { data: revenue, isLoading } = useQuery({
    queryKey: ["admin-revenue"],
    queryFn: async () => {
      const { data } = await api.get("/api/admin/billing/revenue")
      return data
    },
  })

  const { data: churnData } = useQuery({
    queryKey: ["admin-churn-risk"],
    queryFn: async () => {
      const { data } = await api.get("/api/admin/billing/churn-risk")
      return data
    },
  })

  const revenueCards = [
    {
      label: "MRR",
      value: isLoading ? "..." : `$${revenue?.mrr ?? 0}`,
      icon: DollarSign,
    },
    {
      label: "ARR",
      value: isLoading ? "..." : `$${revenue?.arr ?? 0}`,
      icon: TrendingUp,
    },
    {
      label: "Paid Workspaces",
      value: isLoading ? "..." : (revenue?.paidWorkspaces ?? 0),
      icon: CreditCard,
    },
    {
      label: "Active Trials",
      value: isLoading ? "..." : (revenue?.activeTrials ?? 0),
      icon: Clock,
    },
  ]

  // Transform plan distribution object { free: 2, pro: 0 } into array for PieChart
  const planDistObj = revenue?.planDistribution ?? {}
  const planDist: any[] = Object.entries(planDistObj)
    .filter(([, count]) => (count as number) > 0)
    .map(([name, value]) => ({ name, value }))

  // Merge all churn risk categories into a flat array
  const churnRisk: any[] = [
    ...(churnData?.trialsExpiringSoon ?? []).map((ws: any) => ({ ...ws, riskReason: "Trial expiring soon" })),
    ...(churnData?.noRecentReleases ?? []).map((ws: any) => ({ ...ws, riskReason: "No releases in 30 days" })),
    ...(churnData?.noRecentLogins ?? []).map((ws: any) => ({ ...ws, riskReason: "No logins in 14 days" })),
  ]

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Billing</h1>
          <p className="text-sm text-muted-foreground">Revenue metrics and subscription management</p>
        </div>
        <button
          onClick={() => {
            const exportData = churnRisk.map((ws: any) => ({
              id: ws.id,
              name: ws.name,
              plan: ws.plan,
              riskReason: ws.riskReason || ws.reason || "Inactivity",
              lastActiveAt: ws.lastActiveAt || "",
            }))
            exportToCSV(exportData, "billing-churn-risk-export")
            toast.success("Billing data exported to CSV")
          }}
          className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted"
        >
          <Download className="h-3.5 w-3.5" />
          Export CSV
        </button>
      </div>

      {/* Revenue Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {revenueCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Plan Distribution */}
        <div className="rounded-lg border border-border p-5">
          <h3 className="mb-4 text-sm font-semibold">Plan Distribution</h3>
          {planDist.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={planDist}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }: { name: string; percent: number }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {planDist.map((_: any, i: number) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">No plan data</div>
          )}
        </div>

        {/* Trial Status */}
        <div className="rounded-lg border border-border p-5">
          <h3 className="mb-4 text-sm font-semibold">Trial Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-md bg-muted/50 px-4 py-3">
              <span className="text-sm">Active Trials</span>
              <span className="text-lg font-bold">{revenue?.activeTrials ?? 0}</span>
            </div>
            <div className="flex items-center justify-between rounded-md bg-muted/50 px-4 py-3">
              <span className="text-sm">Expired Trials</span>
              <span className="text-lg font-bold">{revenue?.expiredTrials ?? 0}</span>
            </div>
            <div className="flex items-center justify-between rounded-md bg-muted/50 px-4 py-3">
              <span className="text-sm">Conversion Estimate</span>
              <span className="text-lg font-bold">{revenue?.trialConversionRate ?? 0}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Churn Risk Table */}
      <div className="rounded-lg border border-border p-5">
        <div className="mb-4 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <h3 className="text-sm font-semibold">Churn Risk</h3>
        </div>
        {churnRisk.length > 0 ? (
          <div className="rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Workspace</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Plan</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Risk Reason</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Last Active</th>
                </tr>
              </thead>
              <tbody>
                {churnRisk.map((ws: any) => (
                  <tr key={ws.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <Link to={`/workspaces/${ws.id}`} className="font-medium hover:text-primary">
                        {ws.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize", planColors[ws.plan] || "")}>
                        {ws.plan}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{ws.riskReason || ws.reason || "Inactivity"}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {ws.lastActiveAt ? new Date(ws.lastActiveAt).toLocaleDateString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="py-4 text-center text-sm text-muted-foreground">No churn risk data available</p>
        )}
      </div>
    </div>
  )
}
