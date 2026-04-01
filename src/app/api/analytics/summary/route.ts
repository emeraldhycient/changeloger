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
      select: { id: true, type: true, embedToken: true, createdAt: true },
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
        trafficSources: [],
        scrollDepthDistribution: { 25: 0, 50: 0, 75: 0, 100: 0 },
        widgetBreakdown: [],
        recentEvents24h: 0,
        totalEvents: 0,
      })
    }

    // Query ALL raw events in the time range
    const events = await prisma.analyticsEvent.findMany({
      where: {
        widgetId: { in: widgetIds },
        timestamp: { gte: since }
      },
      orderBy: { timestamp: "asc" },
    })

    // ── Totals ──────────────────────────────────────────────
    const pageViews = events.filter((e) => e.eventType === "page_view")
    const entryClicks = events.filter((e) => e.eventType === "entry_click")
    const scrollDepths = events.filter((e) => e.eventType === "scroll_depth")
    const uniqueVisitors = new Set(events.map((e) => e.visitorHash)).size

    const totalViews = pageViews.length
    const totalClicks = entryClicks.length
    const totalEvents = events.length

    // ── Average Read Depth ──────────────────────────────────
    const avgReadDepth = scrollDepths.length > 0
      ? Math.round(
          scrollDepths.reduce((sum, e) => {
            const meta = e.metadata as Record<string, number> | null
            return sum + (meta?.depth || 0)
          }, 0) / scrollDepths.length
        )
      : 0

    // ── Scroll Depth Distribution ───────────────────────────
    const scrollDepthDistribution = { 25: 0, 50: 0, 75: 0, 100: 0 }
    for (const e of scrollDepths) {
      const meta = e.metadata as Record<string, number> | null
      const depth = meta?.depth
      if (depth && depth in scrollDepthDistribution) {
        scrollDepthDistribution[depth as keyof typeof scrollDepthDistribution]++
      }
    }

    // ── Daily Data for Chart ────────────────────────────────
    const dailyMap = new Map<string, { pageViews: number; uniqueVisitors: Set<string>; clicks: number }>()

    // Helper to get YYYY-MM-DD in local timezone
    function toLocalDateStr(date: Date) {
      const y = date.getFullYear()
      const m = String(date.getMonth() + 1).padStart(2, "0")
      const d = String(date.getDate()).padStart(2, "0")
      return `${y}-${m}-${d}`
    }

    // Fill in all days in range including today
    const now = new Date()
    for (let d = new Date(since); d <= now; d.setDate(d.getDate() + 1)) {
      const key = toLocalDateStr(d)
      dailyMap.set(key, { pageViews: 0, uniqueVisitors: new Set(), clicks: 0 })
    }
    // Ensure today is always included
    const todayKey = toLocalDateStr(now)
    if (!dailyMap.has(todayKey)) {
      dailyMap.set(todayKey, { pageViews: 0, uniqueVisitors: new Set(), clicks: 0 })
    }

    for (const e of events) {
      const key = toLocalDateStr(new Date(e.timestamp))
      const day = dailyMap.get(key)
      if (!day) continue
      if (e.eventType === "page_view") day.pageViews++
      if (e.eventType === "entry_click") day.clicks++
      day.uniqueVisitors.add(e.visitorHash)
    }

    const dailyData = Array.from(dailyMap.entries()).map(([date, data]) => ({
      date,
      pageViews: data.pageViews,
      uniqueVisitors: data.uniqueVisitors.size,
      clicks: data.clicks,
    }))

    // ── Top Entries by Clicks ───────────────────────────────
    const clickMap: Record<string, number> = {}
    for (const e of entryClicks) {
      if (e.entryId) {
        clickMap[e.entryId] = (clickMap[e.entryId] || 0) + 1
      }
    }

    // Look up entry titles for the top entries
    const topEntryIds = Object.entries(clickMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([id]) => id)

    const entryDetails = topEntryIds.length > 0
      ? await prisma.changelogEntry.findMany({
          where: { id: { in: topEntryIds } },
          select: { id: true, title: true, category: true },
        })
      : []

    const entryDetailMap = new Map(entryDetails.map((e) => [e.id, e]))
    const topEntries = topEntryIds.map((id) => ({
      entryId: id,
      clicks: clickMap[id],
      title: entryDetailMap.get(id)?.title || "Unknown entry",
      category: entryDetailMap.get(id)?.category || "changed",
    }))

    // ── Traffic Sources ─────────────────────────────────────
    const referrerMap: Record<string, number> = {}
    for (const e of pageViews) {
      const source = e.referrer
        ? (function() {
            try { return new URL(e.referrer).hostname } catch { return e.referrer }
          })()
        : "Direct"
      referrerMap[source] = (referrerMap[source] || 0) + 1
    }
    const trafficSources = Object.entries(referrerMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([source, count]) => ({ source, count, percentage: totalViews > 0 ? Math.round((count / totalViews) * 100) : 0 }))

    // ── Widget Breakdown ────────────────────────────────────
    const widgetViewMap: Record<string, number> = {}
    for (const e of pageViews) {
      widgetViewMap[e.widgetId] = (widgetViewMap[e.widgetId] || 0) + 1
    }
    const widgetBreakdown = widgets.map((w) => ({
      widgetId: w.id,
      type: w.type,
      views: widgetViewMap[w.id] || 0,
    }))

    // ── Recent 24h ──────────────────────────────────────────
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const recentEvents24h = events.filter((e) => new Date(e.timestamp) >= last24h).length

    return Response.json({
      totalViews,
      totalVisitors: uniqueVisitors,
      totalClicks,
      avgReadDepth,
      dailyData,
      topEntries,
      trafficSources,
      scrollDepthDistribution,
      widgetBreakdown,
      recentEvents24h,
      totalEvents,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
