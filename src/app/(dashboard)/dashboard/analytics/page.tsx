"use client"

import { useQuery } from "@tanstack/react-query"
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
import { cn } from "@/lib/utils"

interface AnalyticsSummary {
  totalViews: number
  totalVisitors: number
  totalClicks: number
  avgReadDepth: number
  totalEvents: number
  recentEvents24h: number
  dailyData: Array<{
    date: string
    pageViews: number
    uniqueVisitors: number
    clicks: number
  }>
  topEntries: Array<{ entryId: string; clicks: number; title: string; category: string }>
  trafficSources: Array<{ source: string; count: number; percentage: number }>
  scrollDepthDistribution: { 25: number; 50: number; 75: number; 100: number }
  widgetBreakdown: Array<{ widgetId: string; type: string; views: number }>
}

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
  const maxViews = Math.max(...last14Days.map((d) => d.pageViews), 1)

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
          <CardDescription>Daily page views and visitors for the last 14 days</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-48 w-full animate-pulse rounded bg-muted" />
            </div>
          ) : !hasData ? (
            <div className="flex h-64 items-center justify-center rounded-lg border border-dashed text-muted-foreground">
              <div className="text-center">
                <BarChart3 className="mx-auto h-12 w-12 opacity-50" />
                <p className="mt-4 text-sm">
                  Embed a widget to start collecting data.
                </p>
              </div>
            </div>
          ) : (
            <div className="relative">
              {/* Y-axis labels + gridlines */}
              <div className="flex">
                <div className="flex w-8 shrink-0 flex-col justify-between pr-2 text-right text-[10px] text-muted-foreground" style={{ height: 200 }}>
                  <span>{maxViews}</span>
                  <span>{Math.round(maxViews * 0.75)}</span>
                  <span>{Math.round(maxViews * 0.5)}</span>
                  <span>{Math.round(maxViews * 0.25)}</span>
                  <span>0</span>
                </div>
                <div className="relative flex-1">
                  {/* Gridlines */}
                  {[0, 25, 50, 75, 100].map((pct) => (
                    <div
                      key={pct}
                      className="absolute left-0 right-0 border-t border-border/40"
                      style={{ bottom: `${pct}%`, height: 0 }}
                    />
                  ))}
                  {/* Bars */}
                  <div className="relative flex items-end gap-1" style={{ height: 200 }}>
                    {last14Days.map((day) => {
                      const viewHeight = maxViews > 0 ? (day.pageViews / maxViews) * 100 : 0
                      const visitorHeight = maxViews > 0 ? (day.uniqueVisitors / maxViews) * 100 : 0
                      return (
                        <div
                          key={day.date}
                          className="group relative flex flex-1 items-end justify-center gap-px"
                          style={{ height: "100%" }}
                        >
                          {/* Tooltip */}
                          <div className="pointer-events-none absolute -top-16 left-1/2 z-10 -translate-x-1/2 rounded border border-border bg-popover px-2.5 py-1.5 text-[11px] text-popover-foreground shadow-md opacity-0 transition-opacity group-hover:opacity-100">
                            <div className="font-medium">{new Date(day.date + "T00:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</div>
                            <div className="mt-0.5 flex items-center gap-1.5">
                              <span className="inline-block h-2 w-2 rounded-sm bg-primary" />
                              {day.pageViews} views
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="inline-block h-2 w-2 rounded-sm bg-primary/40" />
                              {day.uniqueVisitors} visitors
                            </div>
                          </div>
                          {/* Visitor bar (behind) */}
                          <div
                            className="w-1/2 rounded-t bg-primary/30 transition-all"
                            style={{ height: `${Math.max(visitorHeight, viewHeight > 0 ? 2 : 0)}%` }}
                          />
                          {/* Views bar (front) */}
                          <div
                            className="w-1/2 rounded-t bg-primary transition-all group-hover:bg-primary/90"
                            style={{ height: `${Math.max(viewHeight, day.pageViews > 0 ? 2 : 0)}%` }}
                          />
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
              {/* X-axis labels */}
              <div className="mt-2 flex pl-8">
                {last14Days.map((day) => (
                  <span key={day.date} className="flex-1 text-center text-[10px] text-muted-foreground">
                    {new Date(day.date + "T00:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </span>
                ))}
              </div>
              {/* Legend */}
              <div className="mt-3 flex items-center justify-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-2.5 w-2.5 rounded-sm bg-primary" />
                  Views
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-2.5 w-2.5 rounded-sm bg-primary/30" />
                  Unique Visitors
                </span>
              </div>
            </div>
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
