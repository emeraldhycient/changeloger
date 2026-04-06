import { NextRequest } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { requireAdminAuth } from "@/lib/auth/admin-middleware"
import { handleApiError } from "@/lib/utils/errors"
import { Prisma } from "@prisma/client"

export async function GET(request: NextRequest) {
  try {
    await requireAdminAuth(request)

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const [
      totalAIGenerationsResult,
      workspacesWithWidgets,
      workspacesWithRepos,
      workspacesWithTeams,
      totalWidgetViews30dResult,
      totalChangeRecords,
    ] = await Promise.all([
      prisma.$queryRaw<[{ total: bigint }]>(
        Prisma.sql`SELECT COALESCE(SUM(ai_generations_used), 0)::bigint as total FROM workspaces`,
      ),
      prisma.workspace.count({
        where: { widgets: { some: {} } },
      }),
      prisma.workspace.count({
        where: { repositories: { some: {} } },
      }),
      prisma.workspace.count({
        where: { members: { some: {} } },
      }),
      prisma.$queryRaw<[{ total: bigint }]>(
        Prisma.sql`SELECT COUNT(*)::bigint as total
          FROM analytics_events
          WHERE event_type = 'widget_view' AND timestamp >= ${thirtyDaysAgo}`,
      ),
      prisma.changeRecord.count(),
    ])

    return Response.json({
      totalAIGenerations: Number(totalAIGenerationsResult[0].total),
      workspacesWithWidgets,
      workspacesWithRepos,
      workspacesWithTeams,
      totalWidgetViews30d: Number(totalWidgetViews30dResult[0].total),
      totalChangeRecords,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
