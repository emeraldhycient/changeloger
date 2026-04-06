import { NextRequest } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { requireAdminAuth } from "@/lib/auth/admin-middleware"
import { handleApiError } from "@/lib/utils/errors"

const PLAN_PRICES: Record<string, number> = {
  pro: 15,
  team: 40,
}

export async function GET(request: NextRequest) {
  try {
    await requireAdminAuth(request)

    const now = new Date()

    const [planCounts, activeTrials, expiredTrials] = await Promise.all([
      prisma.workspace.groupBy({
        by: ["plan"],
        _count: { id: true },
      }),
      prisma.workspace.count({
        where: {
          trialEndsAt: { gt: now },
        },
      }),
      prisma.workspace.count({
        where: {
          trialEndsAt: { lte: now },
          plan: "free",
        },
      }),
    ])

    const planDistribution: Record<string, number> = {
      free: 0,
      pro: 0,
      team: 0,
      enterprise: 0,
    }
    for (const row of planCounts) {
      planDistribution[row.plan] = row._count.id
    }

    const mrr =
      (planDistribution.pro || 0) * PLAN_PRICES.pro +
      (planDistribution.team || 0) * PLAN_PRICES.team
    const arr = mrr * 12

    const paidWorkspaces =
      (planDistribution.pro || 0) +
      (planDistribution.team || 0) +
      (planDistribution.enterprise || 0)

    return Response.json({
      planDistribution,
      mrr,
      arr,
      activeTrials,
      expiredTrials,
      paidWorkspaces,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
