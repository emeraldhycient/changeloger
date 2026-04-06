import { NextRequest } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/db/prisma"
import { requireAdminAuth, requireAdminRole } from "@/lib/auth/admin-middleware"
import { createAuditEntry } from "@/lib/auth/audit"
import { handleApiError, NotFoundError, ValidationError } from "@/lib/utils/errors"

const patchSchema = z.object({
  adminNotes: z.string().max(5000).optional(),
})

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
      ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown",
    })

    return Response.json({ success: true })
  } catch (error) {
    return handleApiError(error)
  }
}

/** PATCH — update admin-only fields (e.g. adminNotes) */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await requireAdminRole(request, "admin")
    const { id } = await params

    const body = await request.json()
    const parsed = patchSchema.safeParse(body)
    if (!parsed.success) {
      throw new ValidationError("Invalid payload", parsed.error.format())
    }

    const workspace = await prisma.workspace.findUnique({
      where: { id },
      select: { id: true, widgetTheme: true },
    })
    if (!workspace) {
      throw new NotFoundError("Workspace not found")
    }

    const currentConfig = (workspace.widgetTheme as Record<string, unknown>) || {}

    if (parsed.data.adminNotes !== undefined) {
      await prisma.workspace.update({
        where: { id },
        data: {
          widgetTheme: {
            ...currentConfig,
            _adminNotes: parsed.data.adminNotes,
          },
        },
      })

      const ip =
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        request.headers.get("x-real-ip") ||
        "unknown"

      await createAuditEntry({
        adminUserId: admin.adminId,
        action: "workspace.notes_update",
        targetType: "workspace",
        targetId: id,
        metadata: { notesLength: parsed.data.adminNotes.length },
        ipAddress: ip,
      })
    }

    return Response.json({ success: true })
  } catch (error) {
    return handleApiError(error)
  }
}
