import { NextRequest } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { requireAdminAuth } from "@/lib/auth/admin-middleware"
import { handleApiError } from "@/lib/utils/errors"

export async function GET(request: NextRequest) {
  try {
    await requireAdminAuth(request)

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const [
      totalUsers,
      totalWorkspaces,
      totalPublished,
      widgetViews30d,
      planDistribution,
      aiUsageResult,
      activeTrials,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.workspace.count(),
      prisma.release.count({ where: { status: "published" } }),
      prisma.analyticsDaily.aggregate({
        _sum: { pageViews: true },
        where: { date: { gte: thirtyDaysAgo } },
      }),
      prisma.workspace.groupBy({
        by: ["plan"],
        _count: { plan: true },
      }),
      prisma.workspace.aggregate({
        _sum: { aiGenerationsUsed: true },
      }),
      prisma.workspace.count({
        where: {
          trialEndsAt: { gte: new Date() },
        },
      }),
    ])

    const planDist: Record<string, number> = {}
    for (const row of planDistribution) {
      planDist[row.plan] = row._count.plan
    }

    return Response.json({
      totalUsers,
      totalWorkspaces,
      totalPublished,
      totalWidgetViews: widgetViews30d._sum.pageViews || 0,
      planDistribution: planDist,
      aiUsageTotal: aiUsageResult._sum.aiGenerationsUsed || 0,
      activeTrials,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
