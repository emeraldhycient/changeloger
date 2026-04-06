import { NextRequest } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { requireAdminAuth, requireAdminRole } from "@/lib/auth/admin-middleware"
import { createAuditEntry } from "@/lib/auth/audit"
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireAdminRole(request, "superadmin")
    const { id } = await params

    const existing = await prisma.workspace.findUnique({
      where: { id },
      select: { id: true, name: true, slug: true, plan: true },
    })
    if (!existing) {
      throw new NotFoundError("Workspace not found")
    }

    await prisma.workspace.delete({ where: { id } })

    await createAuditEntry({
      adminUserId: session.adminId,
      action: "workspace.delete",
      targetType: "workspace",
      targetId: id,
      metadata: {
        deletedName: existing.name,
        deletedSlug: existing.slug,
        deletedPlan: existing.plan,
      },
      ipAddress: request.headers.get("x-forwarded-for") || undefined,
    })

    return Response.json({ success: true })
  } catch (error) {
    return handleApiError(error)
  }
}
