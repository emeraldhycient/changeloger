import { NextRequest } from "next/server"
import { requireAuth } from "@/lib/auth/middleware"
import { prisma } from "@/lib/db/prisma"
import { handleApiError, ValidationError } from "@/lib/utils/errors"

export async function GET(request: NextRequest) {
  try {
    await requireAuth()
    const { searchParams } = new URL(request.url)
    const workspaceId = searchParams.get("workspaceId")
    if (!workspaceId) throw new ValidationError("workspaceId is required")
    const days = parseInt(searchParams.get("days") || "30", 10)

    const since = new Date()
    since.setDate(since.getDate() - days)
    since.setHours(0, 0, 0, 0)

    // Get all widgets for this workspace
    const widgets = await prisma.widget.findMany({
      where: { workspaceId },
      select: { id: true },
    })
    const widgetIds = widgets.map((w) => w.id)

    if (widgetIds.length === 0) {
      return Response.json({
        totalViews: 0,
        totalVisitors: 0,
        totalClicks: 0,
        avgReadDepth: 0,
        dailyData: [],
        topEntries: [],
        recentEvents24h: 0,
      })
    }

    // Get daily aggregated data
    const dailyData = await prisma.analyticsDaily.findMany({
      where: { widgetId: { in: widgetIds }, date: { gte: since } },
      orderBy: { date: "asc" },
    })

    // Aggregate totals
    const totalViews = dailyData.reduce((s, d) => s + d.pageViews, 0)
    const totalVisitors = dailyData.reduce((s, d) => s + d.uniqueVisitors, 0)

    // Aggregate entry clicks across all days
    const clickMap: Record<string, number> = {}
    for (const d of dailyData) {
      const clicks = d.entryClicks as Record<string, number> | null
      if (clicks) {
        for (const [entryId, count] of Object.entries(clicks)) {
          clickMap[entryId] = (clickMap[entryId] || 0) + count
        }
      }
    }
    const totalClicks = Object.values(clickMap).reduce((s, c) => s + c, 0)

    // Top entries by clicks
    const topEntries = Object.entries(clickMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([entryId, clicks]) => ({ entryId, clicks }))

    // Average read depth
    const depthDays = dailyData.filter((d) => d.avgReadDepth != null)
    const avgReadDepth =
      depthDays.length > 0
        ? Math.round(
            depthDays.reduce((s, d) => s + (d.avgReadDepth || 0), 0) /
              depthDays.length,
          )
        : 0

    // Format daily data for chart
    const formattedDaily = dailyData.reduce(
      (acc, d) => {
        const dateStr = new Date(d.date).toISOString().split("T")[0]
        const existing = acc.find((a) => a.date === dateStr)
        if (existing) {
          existing.pageViews += d.pageViews
          existing.uniqueVisitors += d.uniqueVisitors
        } else {
          acc.push({
            date: dateStr,
            pageViews: d.pageViews,
            uniqueVisitors: d.uniqueVisitors,
          })
        }
        return acc
      },
      [] as Array<{
        date: string
        pageViews: number
        uniqueVisitors: number
      }>,
    )

    // Also get raw event counts from analytics_events for real-time data (last 24h)
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const recentEvents = await prisma.analyticsEvent.count({
      where: { widgetId: { in: widgetIds }, timestamp: { gte: last24h } },
    })

    return Response.json({
      totalViews,
      totalVisitors,
      totalClicks,
      avgReadDepth,
      dailyData: formattedDaily,
      topEntries,
      recentEvents24h: recentEvents,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
