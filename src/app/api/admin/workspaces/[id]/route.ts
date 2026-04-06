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

    const workspace = await prisma.workspace.findUnique({
      where: { id },
      include: {
        owner: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatarUrl: true },
            },
          },
        },
        _count: {
          select: { repositories: true, releases: true, widgets: true },
        },
      },
    })

    if (!workspace) {
      throw new NotFoundError("Workspace not found")
    }

    return Response.json({ workspace })
  } catch (error) {
    return handleApiError(error)
  }
}
