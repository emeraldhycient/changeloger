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
      include: {
        oauthAccounts: {
          select: { id: true, provider: true, providerUserId: true, createdAt: true },
        },
        memberships: {
          include: {
            workspace: {
              select: { id: true, name: true, slug: true, plan: true },
            },
          },
        },
        _count: {
          select: { memberships: true, publishedReleases: true },
        },
      },
    })

    if (!user) {
      throw new NotFoundError("User not found")
    }

    return Response.json({ user })
  } catch (error) {
    return handleApiError(error)
  }
}
