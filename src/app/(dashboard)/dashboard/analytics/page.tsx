"use client"

import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip as ChartTooltip,
  Legend,
  Filler,
} from "chart.js"
import { Bar } from "react-chartjs-2"
import {
  BarChart3,
  Eye,
  Users,
  TrendingUp,
  MousePointerClick,
  Activity,
  Globe,
  Layers,
  ArrowUpRight,
  Code,
  Bell,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { apiClient } from "@/lib/api/client"
import { useWorkspaceStore } from "@/stores/workspace-store"
import type { AnalyticsSummary } from "@/types/models"

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ChartTooltip,
  Legend,
  Filler,
)
import { cn } from "@/lib/utils"

const CATEGORY_COLORS: Record<string, string> = {
  added: "bg-emerald-500",
  fixed: "bg-blue-500",
  changed: "bg-amber-500",
  removed: "bg-red-500",
  deprecated: "bg-gray-400",
  security: "bg-purple-500",
  performance: "bg-cyan-500",
  breaking: "bg-red-600",
}

const WIDGET_ICONS: Record<string, typeof Globe> = {
  page: Globe,
  modal: Code,
  badge: Bell,
}

// ─── Chart.js Views Chart ──────────────────────────────────────────────────

function ViewsChart({
  dailyData,
}: {
  dailyData: Array<{ date: string; pageViews: number; uniqueVisitors: number; clicks: number }>
}) {
  const chartData = useMemo(() => {
    const labels = dailyData.map((d) =>
      new Date(d.date + "T00:00:00").toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      }),
    )

    return {
      labels,
      datasets: [
        {
          label: "Page Views",
          data: dailyData.map((d) => d.pageViews),
          backgroundColor: "hsl(262.1 83.3% 57.8% / 0.8)",
          hoverBackgroundColor: "hsl(262.1 83.3% 57.8%)",
          borderRadius: 4,
          borderSkipped: false as const,
        },
        {
          label: "Unique Visitors",
          data: dailyData.map((d) => d.uniqueVisitors),
          backgroundColor: "hsl(262.1 83.3% 57.8% / 0.25)",
          hoverBackgroundColor: "hsl(262.1 83.3% 57.8% / 0.4)",
          borderRadius: 4,
          borderSkipped: false as const,
        },
      ],
    }
  }, [dailyData])

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: "index" as const,
        intersect: false,
      },
      plugins: {
        legend: {
          position: "bottom" as const,
          labels: {
            usePointStyle: true,
            pointStyle: "rectRounded" as const,
            padding: 20,
            color: "hsl(215 20.2% 65.1%)",
            font: { size: 12 },
          },
        },
        tooltip: {
          backgroundColor: "hsl(222.2 84% 4.9%)",
          titleColor: "hsl(210 40% 98%)",
          bodyColor: "hsl(215 20.2% 65.1%)",
          borderColor: "hsl(217.2 32.6% 17.5%)",
          borderWidth: 1,
          cornerRadius: 6,
          padding: 10,
          bodySpacing: 4,
          usePointStyle: true,
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            color: "hsl(215 20.2% 65.1%)",
            font: { size: 11 },
            maxRotation: 0,
          },
          border: { display: false },
        },
        y: {
          beginAtZero: true,
          grid: {
            color: "hsl(217.2 32.6% 17.5% / 0.4)",
          },
          ticks: {
            color: "hsl(215 20.2% 65.1%)",
            font: { size: 11 },
            precision: 0,
          },
          border: { display: false },
        },
      },
    }),
    [],
  )

  return (
    <div style={{ height: 280 }}>
      <Bar data={chartData} options={options} />
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="h-4 w-24 animate-pulse rounded bg-muted" />
        <div className="h-4 w-4 animate-pulse rounded bg-muted" />
      </CardHeader>
      <CardContent>
        <div className="h-8 w-16 animate-pulse rounded bg-muted" />
      </CardContent>
    </Card>
  )
}

export default function AnalyticsPage() {
  const workspaceId = useWorkspaceStore((s) => s.currentWorkspaceId)

  const { data, isLoading } = useQuery<AnalyticsSummary>({
    queryKey: ["analytics-summary", workspaceId],
    queryFn: async () => {
      const { data } = await apiClient.get(
        `/api/analytics/summary?workspaceId=${workspaceId}`,
      )
      return data
    },
    enabled: !!workspaceId,
    refetchInterval: 30000, // Refresh every 30 seconds for near-realtime
  })

  if (!workspaceId) {
    return (
      <div className="mx-auto max-w-6xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="mt-1 text-muted-foreground">
            Track how your changelogs are being consumed
          </p>
        </div>
        <Card>
          <CardContent className="flex h-64 items-center justify-center">
            <p className="text-muted-foreground">
              Select a workspace to view analytics
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const hasData = data && data.totalEvents > 0

  const stats = [
    { label: "Total Views", value: data?.totalViews.toLocaleString() ?? "0", icon: Eye, subtext: `${data?.recentEvents24h ?? 0} in last 24h` },
    { label: "Unique Visitors", value: data?.totalVisitors.toLocaleString() ?? "0", icon: Users, subtext: data?.totalViews ? `${Math.round(((data?.totalVisitors ?? 0) / data.totalViews) * 100)}% unique` : "" },
    { label: "Entry Clicks", value: data?.totalClicks.toLocaleString() ?? "0", icon: MousePointerClick, subtext: data?.totalViews ? `${Math.round(((data?.totalClicks ?? 0) / data.totalViews) * 100)}% CTR` : "" },
    { label: "Avg. Read Depth", value: `${data?.avgReadDepth ?? 0}%`, icon: TrendingUp, subtext: `${data?.totalEvents ?? 0} total events` },
  ]

  // Chart data — last 14 days
  const last14Days = (data?.dailyData ?? []).slice(-14)

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="mt-1 text-muted-foreground">
            Track how your changelogs are being consumed
          </p>
        </div>
        {data && data.recentEvents24h > 0 && (
          <Badge variant="secondary" className="flex items-center gap-1.5 px-3 py-1">
            <Activity className="h-3 w-3 animate-pulse text-green-500" />
            {data.recentEvents24h} events in last 24h
          </Badge>
        )}
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          : stats.map((stat) => (
              <Card key={stat.label}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </CardTitle>
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  {stat.subtext && (
                    <p className="mt-1 text-xs text-muted-foreground">{stat.subtext}</p>
                  )}
                </CardContent>
              </Card>
            ))}
      </div>

      {/* Views Over Time chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Views Over Time
          </CardTitle>
          <CardDescription>Daily page views and unique visitors for the last 14 days</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex h-72 items-center justify-center">
              <div className="h-56 w-full animate-pulse rounded bg-muted" />
            </div>
          ) : !hasData ? (
            <div className="flex h-72 items-center justify-center rounded-lg border border-dashed text-muted-foreground">
              <div className="text-center">
                <BarChart3 className="mx-auto h-12 w-12 opacity-50" />
                <p className="mt-4 text-sm">
                  Embed a widget to start collecting data.
                </p>
              </div>
            </div>
          ) : (
            <ViewsChart dailyData={last14Days} />
          )}
        </CardContent>
      </Card>

      {/* Bottom grid: Traffic Sources + Top Entries + Scroll Depth + Widget Breakdown */}
      {hasData && (
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Traffic Sources */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Globe className="h-4 w-4" />
                Traffic Sources
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(data?.trafficSources ?? []).length > 0 ? (
                <div className="space-y-3">
                  {data!.trafficSources.map((source) => (
                    <div key={source.source} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 truncate">
                          {source.source === "Direct" ? (
                            <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
                          ) : (
                            <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                          )}
                          {source.source}
                        </span>
                        <span className="shrink-0 text-muted-foreground">
                          {source.count} ({source.percentage}%)
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary/70"
                          style={{ width: `${source.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No traffic source data yet
                </p>
              )}
            </CardContent>
          </Card>

          {/* Top Entries */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MousePointerClick className="h-4 w-4" />
                Most Clicked Entries
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(data?.topEntries ?? []).length > 0 ? (
                <div className="space-y-2">
                  {data!.topEntries.map((entry, i) => (
                    <div
                      key={entry.entryId}
                      className="flex items-center justify-between gap-3 rounded border border-border px-3 py-2"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="shrink-0 text-xs font-bold text-muted-foreground">
                          #{i + 1}
                        </span>
                        <div
                          className={cn(
                            "h-2 w-2 shrink-0 rounded-full",
                            CATEGORY_COLORS[entry.category] || "bg-gray-400",
                          )}
                        />
                        <span className="truncate text-sm">{entry.title}</span>
                      </div>
                      <Badge variant="secondary" className="shrink-0 text-xs">
                        {entry.clicks} clicks
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No entry clicks yet
                </p>
              )}
            </CardContent>
          </Card>

          {/* Scroll Depth Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-4 w-4" />
                Scroll Depth Distribution
              </CardTitle>
              <CardDescription>How far visitors scroll through your changelogs</CardDescription>
            </CardHeader>
            <CardContent>
              {data?.scrollDepthDistribution ? (
                <div className="space-y-4">
                  {([25, 50, 75, 100] as const).map((milestone) => {
                    const count = data.scrollDepthDistribution[milestone]
                    const total = Object.values(data.scrollDepthDistribution).reduce((s, c) => s + c, 0)
                    const pct = total > 0 ? Math.round((count / total) * 100) : 0
                    return (
                      <div key={milestone} className="space-y-1.5">
                        <div className="flex items-center justify-between text-sm">
                          <span>{milestone}% scrolled</span>
                          <span className="text-muted-foreground">
                            {count} ({pct}%)
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-muted">
                          <div
                            className={cn(
                              "h-full rounded-full",
                              milestone === 100 ? "bg-emerald-500" :
                              milestone >= 75 ? "bg-blue-500" :
                              milestone >= 50 ? "bg-amber-500" :
                              "bg-muted-foreground/40"
                            )}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No scroll depth data yet
                </p>
              )}
            </CardContent>
          </Card>

          {/* Widget Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Layers className="h-4 w-4" />
                Views by Widget
              </CardTitle>
              <CardDescription>How each widget type is performing</CardDescription>
            </CardHeader>
            <CardContent>
              {(data?.widgetBreakdown ?? []).length > 0 ? (
                <div className="space-y-3">
                  {data!.widgetBreakdown.map((w) => {
                    const Icon = WIDGET_ICONS[w.type] || Globe
                    const pct = data!.totalViews > 0 ? Math.round((w.views / data!.totalViews) * 100) : 0
                    return (
                      <div key={w.widgetId} className="space-y-1.5">
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2 capitalize">
                            <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                            {w.type} widget
                          </span>
                          <span className="text-muted-foreground">
                            {w.views} views ({pct}%)
                          </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary/70"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No widget data yet
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
