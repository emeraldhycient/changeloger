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
      totalWorkspaces,
      workspacesWithWidgets,
      workspacesWithRepos,
      workspacesWithTeams,
      totalChangeRecords,
      totalWidgetViews30d,
      totalAIGenerations,
    ] = await Promise.all([
      prisma.workspace.count(),
      prisma.widget.groupBy({
        by: ["workspaceId"],
      }).then((r) => r.length),
      prisma.repository.groupBy({
        by: ["workspaceId"],
      }).then((r) => r.length),
      // Workspaces with more than 1 member = actual team
      prisma.workspaceMember.groupBy({
        by: ["workspaceId"],
        _count: true,
        having: { workspaceId: { _count: { gt: 1 } } },
      }).then((r) => r.length),
      prisma.changeRecord.count(),
      prisma.analyticsEvent.count({
        where: { eventType: "page_view", timestamp: { gte: thirtyDaysAgo } },
      }),
      prisma.workspace.aggregate({ _sum: { aiGenerationsUsed: true } }).then((r) => r._sum.aiGenerationsUsed || 0),
    ])

    return Response.json({
      totalWorkspaces,
      workspacesWithWidgets,
      workspacesWithRepos,
      workspacesWithTeams,
      widgetAdoption: totalWorkspaces > 0 ? Math.round((workspacesWithWidgets / totalWorkspaces) * 100) : 0,
      repoAdoption: totalWorkspaces > 0 ? Math.round((workspacesWithRepos / totalWorkspaces) * 100) : 0,
      teamAdoption: totalWorkspaces > 0 ? Math.round((workspacesWithTeams / totalWorkspaces) * 100) : 0,
      totalChangeRecords,
      totalWidgetViews30d,
      totalAIGenerations,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
