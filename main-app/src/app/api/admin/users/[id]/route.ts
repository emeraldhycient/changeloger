import { NextRequest } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/db/prisma"
import { requireAdminAuth, requireAdminRole } from "@/lib/auth/admin-middleware"
import { createAuditEntry } from "@/lib/auth/audit"
import { handleApiError, NotFoundError, ValidationError } from "@/lib/utils/errors"

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

const patchUserSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  email: z.string().email().optional(),
}).refine((data) => data.name !== undefined || data.email !== undefined, {
  message: "At least one field (name or email) must be provided",
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireAdminRole(request, "admin")
    const { id } = await params

    const body = await request.json()
    const parsed = patchUserSchema.safeParse(body)
    if (!parsed.success) {
      throw new ValidationError("Invalid input", parsed.error.format())
    }

    const existing = await prisma.user.findUnique({ where: { id } })
    if (!existing) {
      throw new NotFoundError("User not found")
    }

    const user = await prisma.user.update({
      where: { id },
      data: parsed.data,
    })

    await createAuditEntry({
      adminUserId: session.adminId,
      action: "user.update",
      targetType: "user",
      targetId: id,
      metadata: {
        changes: parsed.data,
        previousEmail: existing.email,
        previousName: existing.name,
      },
      ipAddress: request.headers.get("x-forwarded-for") || undefined,
    })

    return Response.json({ user })
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

    const existing = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, name: true },
    })
    if (!existing) {
      throw new NotFoundError("User not found")
    }

    await prisma.user.delete({ where: { id } })

    await createAuditEntry({
      adminUserId: session.adminId,
      action: "user.delete",
      targetType: "user",
      targetId: id,
      metadata: {
        deletedEmail: existing.email,
        deletedName: existing.name,
      },
      ipAddress: request.headers.get("x-forwarded-for") || undefined,
    })

    return Response.json({ success: true })
  } catch (error) {
    return handleApiError(error)
  }
}
