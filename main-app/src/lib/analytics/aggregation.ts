import { prisma } from "@/lib/db/prisma"

export async function rollupDailyAnalytics(date: Date) {
  const startOfDay = new Date(date)
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date(date)
  endOfDay.setHours(23, 59, 59, 999)

  // Get all widgets that had events today
  const widgetIds = await prisma.analyticsEvent.findMany({
    where: { timestamp: { gte: startOfDay, lte: endOfDay } },
    select: { widgetId: true },
    distinct: ["widgetId"],
  })

  for (const { widgetId } of widgetIds) {
    const events = await prisma.analyticsEvent.findMany({
      where: { widgetId, timestamp: { gte: startOfDay, lte: endOfDay } },
    })

    const pageViews = events.filter((e) => e.eventType === "page_view").length
    const uniqueVisitors = new Set(events.map((e) => e.visitorHash)).size
    const entryClicks: Record<string, number> = {}
    for (const e of events.filter((ev) => ev.eventType === "entry_click" && ev.entryId)) {
      entryClicks[e.entryId!] = (entryClicks[e.entryId!] || 0) + 1
    }

    const scrollEvents = events.filter((e) => e.eventType === "scroll_depth")
    const avgReadDepth = scrollEvents.length > 0
      ? scrollEvents.reduce((sum, e) => sum + ((e.metadata as Record<string, number>)?.depth || 0), 0) / scrollEvents.length
      : null

    await prisma.analyticsDaily.upsert({
      where: { widgetId_date: { widgetId, date: startOfDay } },
      update: { pageViews, uniqueVisitors, entryClicks, avgReadDepth },
      create: { widgetId, date: startOfDay, pageViews, uniqueVisitors, entryClicks, avgReadDepth },
    })
  }
}

export async function getAnalyticsSummary(widgetId: string, days = 30) {
  const since = new Date()
  since.setDate(since.getDate() - days)

  const dailyData = await prisma.analyticsDaily.findMany({
    where: { widgetId, date: { gte: since } },
    orderBy: { date: "asc" },
  })

  const totalViews = dailyData.reduce((s, d) => s + d.pageViews, 0)
  const totalVisitors = dailyData.reduce((s, d) => s + d.uniqueVisitors, 0)

  return {
    totalViews,
    totalVisitors,
    dailyData: dailyData.map((d) => ({
      date: d.date,
      pageViews: d.pageViews,
      uniqueVisitors: d.uniqueVisitors,
    })),
  }
}
