import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { Users, Building2, FileText, Eye } from "lucide-react"

export function DashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: async () => {
      const { data } = await api.get("/api/admin/analytics/overview")
      return data
    },
  })

  const cards = [
    { label: "Total Users", value: stats?.totalUsers ?? "—", icon: Users },
    { label: "Workspaces", value: stats?.totalWorkspaces ?? "—", icon: Building2 },
    { label: "Published Releases", value: stats?.totalPublished ?? "—", icon: FileText },
    { label: "Widget Views (30d)", value: stats?.totalWidgetViews ?? "—", icon: Eye },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Platform Dashboard</h1>
        <p className="text-sm text-muted-foreground">Overview of Changeloger platform metrics</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{card.label}</p>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-2 text-2xl font-bold">
              {isLoading ? <span className="animate-pulse">···</span> : card.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
