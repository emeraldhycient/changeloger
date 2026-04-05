import { NextRequest } from "next/server"
import { requireWorkspaceRole } from "@/lib/auth/middleware"
import { prisma } from "@/lib/db/prisma"
import { handleApiError, ValidationError } from "@/lib/utils/errors"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const workspaceId = searchParams.get("workspaceId")
    if (!workspaceId) throw new ValidationError("workspaceId is required")
    await requireWorkspaceRole(workspaceId, "viewer")

    const [
      repoCount,
      activeRepoCount,
      draftCount,
      publishedCount,
      archivedCount,
      memberCount,
      widgetCount,
      unprocessedChanges,
      totalChanges,
      unreviewedEntries,
      totalEntries,
      breakingEntries,
      recentEvents24h,
    ] = await Promise.all([
      prisma.repository.count({ where: { workspaceId } }),
      prisma.repository.count({ where: { workspaceId, isActive: true } }),
      prisma.release.count({ where: { workspaceId, status: "draft" } }),
      prisma.release.count({ where: { workspaceId, status: "published" } }),
      prisma.release.count({ where: { workspaceId, status: "archived" } }),
      prisma.workspaceMember.count({ where: { workspaceId } }),
      prisma.widget.count({ where: { workspaceId } }),
      prisma.changeRecord.count({
        where: { repository: { workspaceId }, processedAt: null },
      }),
      prisma.changeRecord.count({
        where: { repository: { workspaceId } },
      }),
      prisma.changelogEntry.count({
        where: { release: { workspaceId }, reviewed: false },
      }),
      prisma.changelogEntry.count({
        where: { release: { workspaceId } },
      }),
      prisma.changelogEntry.count({
        where: { release: { workspaceId }, breaking: true },
      }),
      prisma.analyticsEvent.count({
        where: {
          widget: { workspaceId },
          timestamp: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
      }),
    ])

    // Recent drafts with unreviewed count
    const recentDrafts = await prisma.release.findMany({
      where: { workspaceId, status: "draft" },
      include: {
        _count: { select: { entries: true } },
        repository: { select: { name: true, fullName: true } },
        entries: { where: { reviewed: false }, select: { id: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: 5,
    })

    const draftsWithReviewStatus = recentDrafts.map((d) => ({
      id: d.id,
      version: d.version,
      repository: d.repository,
      totalEntries: d._count.entries,
      unreviewedEntries: d.entries.length,
      updatedAt: d.updatedAt,
    }))

    return Response.json({
      // Repos
      repos: repoCount,
      activeRepos: activeRepoCount,
      // Releases
      drafts: draftCount,
      published: publishedCount,
      archived: archivedCount,
      // Team
      members: memberCount,
      // Widgets
      widgets: widgetCount,
      // Changes
      unprocessedChanges,
      totalChanges,
      processedChanges: totalChanges - unprocessedChanges,
      // Entries
      totalEntries,
      unreviewedEntries,
      reviewedEntries: totalEntries - unreviewedEntries,
      breakingEntries,
      // Analytics
      recentEvents24h,
      // Recent drafts with review status
      recentDrafts: draftsWithReviewStatus,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
