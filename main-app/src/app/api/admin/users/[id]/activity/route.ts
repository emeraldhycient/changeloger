import { NextRequest } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { requireAdminAuth } from "@/lib/auth/admin-middleware"
import { handleApiError, NotFoundError } from "@/lib/utils/errors"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdminAuth(request)
    const { id } = await params

    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true },
    })
    if (!user) {
      throw new NotFoundError("User not found")
    }

    const [recentReleases, recentEntries, workspaceMemberships] =
      await Promise.all([
        prisma.release.findMany({
          where: { publishedBy: id },
          orderBy: { publishedAt: "desc" },
          take: 50,
          select: {
            id: true,
            version: true,
            status: true,
            publishedAt: true,
            workspace: {
              select: { id: true, name: true, slug: true },
            },
          },
        }),
        prisma.changelogEntry.findMany({
          where: {
            release: {
              workspace: {
                members: { some: { userId: id } },
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 50,
          select: {
            id: true,
            title: true,
            category: true,
            createdAt: true,
            release: {
              select: {
                id: true,
                version: true,
                workspace: {
                  select: { id: true, name: true },
                },
              },
            },
          },
        }),
        prisma.workspaceMember.findMany({
          where: { userId: id },
          orderBy: { joinedAt: "desc" },
          take: 50,
          select: {
            id: true,
            role: true,
            joinedAt: true,
            workspace: {
              select: { id: true, name: true, slug: true, plan: true },
            },
          },
        }),
      ])

    const activities = [
      ...recentReleases.map((r) => ({
        type: "release" as const,
        description: `Published release ${r.version} in ${r.workspace?.name || "unknown workspace"}`,
        date: r.publishedAt,
        metadata: { releaseId: r.id, version: r.version, status: r.status, workspace: r.workspace },
      })),
      ...recentEntries.map((e) => ({
        type: "entry" as const,
        description: `Created ${e.category} entry "${e.title}" in ${e.release?.workspace?.name || "unknown workspace"}`,
        date: e.createdAt,
        metadata: { entryId: e.id, title: e.title, category: e.category, release: e.release },
      })),
      ...workspaceMemberships.map((m) => ({
        type: "membership" as const,
        description: `Joined ${m.workspace?.name || "unknown workspace"} as ${m.role}`,
        date: m.joinedAt,
        metadata: { membershipId: m.id, role: m.role, workspace: m.workspace },
      })),
    ].sort((a, b) => new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime())

    return Response.json({
      activities,
      recentReleases,
      recentEntries,
      workspaceMemberships,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
