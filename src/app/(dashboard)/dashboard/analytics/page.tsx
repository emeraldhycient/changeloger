"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart3, Eye, Users, TrendingUp, MousePointerClick } from "lucide-react"

export default function AnalyticsPage() {
  const stats = [
    { label: "Total Views", value: "0", icon: Eye },
    { label: "Unique Visitors", value: "0", icon: Users },
    { label: "Entry Clicks", value: "0", icon: MousePointerClick },
    { label: "Avg. Read Depth", value: "0%", icon: TrendingUp },
  ]

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="mt-1 text-muted-foreground">
          Track how your changelogs are being consumed
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Views Over Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-64 items-center justify-center rounded-lg border border-dashed text-muted-foreground">
            <div className="text-center">
              <BarChart3 className="mx-auto h-12 w-12 opacity-50" />
              <p className="mt-4 text-sm">
                Analytics data will appear here once your changelog widgets receive traffic.
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Embed a widget to start collecting data.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
