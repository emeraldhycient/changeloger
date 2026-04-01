"use client"

import { useQuery } from "@tanstack/react-query"
import {
  BarChart3,
  Eye,
  Users,
  TrendingUp,
  MousePointerClick,
  Activity,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { apiClient } from "@/lib/api/client"
import { useWorkspaceStore } from "@/stores/workspace-store"

interface AnalyticsSummary {
  totalViews: number
  totalVisitors: number
  totalClicks: number
  avgReadDepth: number
  dailyData: Array<{
    date: string
    pageViews: number
    uniqueVisitors: number
  }>
  topEntries: Array<{ entryId: string; clicks: number }>
  recentEvents24h: number
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

  const hasData =
    data &&
    (data.totalViews > 0 ||
      data.totalVisitors > 0 ||
      data.dailyData.length > 0)

  const stats = [
    {
      label: "Total Views",
      value: data?.totalViews.toLocaleString() ?? "0",
      icon: Eye,
    },
    {
      label: "Unique Visitors",
      value: data?.totalVisitors.toLocaleString() ?? "0",
      icon: Users,
    },
    {
      label: "Entry Clicks",
      value: data?.totalClicks.toLocaleString() ?? "0",
      icon: MousePointerClick,
    },
    {
      label: "Avg. Read Depth",
      value: `${data?.avgReadDepth ?? 0}%`,
      icon: TrendingUp,
    },
  ]

  // Get the last 14 days of data for the chart
  const last14Days = (data?.dailyData ?? []).slice(-14)
  const maxViews = Math.max(...last14Days.map((d) => d.pageViews), 1)

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="mt-1 text-muted-foreground">
            Track how your changelogs are being consumed
          </p>
        </div>
        {data && data.recentEvents24h > 0 && (
          <Badge variant="secondary" className="flex items-center gap-1.5">
            <Activity className="h-3 w-3" />
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
            <div className="flex h-64 items-end gap-1.5">
              {last14Days.map((day) => {
                const height = (day.pageViews / maxViews) * 100
                return (
                  <div
                    key={day.date}
                    className="group flex flex-1 flex-col items-center gap-1"
                  >
                    <span className="text-xs font-medium text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
                      {day.pageViews}
                    </span>
                    <div className="w-full flex-1 flex items-end">
                      <div
                        className="w-full rounded-t bg-primary/80 transition-colors hover:bg-primary"
                        style={{
                          height: `${Math.max(height, 2)}%`,
                        }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(day.date + "T00:00:00").toLocaleDateString(
                        undefined,
                        { month: "short", day: "numeric" },
                      )}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
