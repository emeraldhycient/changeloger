import { NextRequest } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { requireAdminAuth } from "@/lib/auth/admin-middleware"
import { handleApiError } from "@/lib/utils/errors"

export async function GET(request: NextRequest) {
  try {
    await requireAdminAuth(request)

    const [planDistribution, activeTrials, aiUsageResult] = await Promise.all([
      prisma.workspace.groupBy({
        by: ["plan"],
        _count: { plan: true },
      }),
      prisma.workspace.count({
        where: {
          trialEndsAt: { gte: new Date() },
        },
      }),
      prisma.workspace.aggregate({
        _sum: { aiGenerationsUsed: true },
      }),
    ])

    const planDist: Record<string, number> = {}
    for (const row of planDistribution) {
      planDist[row.plan] = row._count.plan
    }

    return Response.json({
      planDistribution: planDist,
      activeTrials,
      totalAiUsage: aiUsageResult._sum.aiGenerationsUsed || 0,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
