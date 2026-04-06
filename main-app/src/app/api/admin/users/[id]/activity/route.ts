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

    return Response.json({
      recentReleases,
      recentEntries,
      workspaceMemberships,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
