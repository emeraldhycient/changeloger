import { NextRequest } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/db/prisma"
import { requireAdminRole } from "@/lib/auth/admin-middleware"
import { createAuditEntry } from "@/lib/auth/audit"
import {
  handleApiError,
  NotFoundError,
  ValidationError,
  ForbiddenError,
} from "@/lib/utils/errors"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdminRole(request, "admin")
    const { id } = await params

    const admin = await prisma.adminUser.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!admin) {
      throw new NotFoundError("Admin user not found")
    }

    const recentAuditLogs = await prisma.auditLog.findMany({
      where: { adminUserId: id },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        action: true,
        targetType: true,
        targetId: true,
        metadata: true,
        ipAddress: true,
        createdAt: true,
      },
    })

    return Response.json({ admin, recentAuditLogs })
  } catch (error) {
    return handleApiError(error)
  }
}

const patchAdminSchema = z
  .object({
    name: z.string().min(1).max(200).optional(),
    role: z.enum(["superadmin", "admin", "readonly"]).optional(),
    isActive: z.boolean().optional(),
  })
  .refine(
    (data) =>
      data.name !== undefined ||
      data.role !== undefined ||
      data.isActive !== undefined,
    { message: "At least one field must be provided" },
  )

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireAdminRole(request, "superadmin")
    const { id } = await params

    const body = await request.json()
    const parsed = patchAdminSchema.safeParse(body)
    if (!parsed.success) {
      throw new ValidationError("Invalid input", parsed.error.format())
    }

    const existing = await prisma.adminUser.findUnique({ where: { id } })
    if (!existing) {
      throw new NotFoundError("Admin user not found")
    }

    const admin = await prisma.adminUser.update({
      where: { id },
      data: parsed.data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    await createAuditEntry({
      adminUserId: session.adminId,
      action: "admin.update",
      targetType: "admin",
      targetId: id,
      metadata: {
        changes: parsed.data,
        previousRole: existing.role,
        previousIsActive: existing.isActive,
      },
      ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown",
    })

    return Response.json({ admin })
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

    if (session.adminId === id) {
      throw new ForbiddenError("Cannot deactivate your own account")
    }

    const existing = await prisma.adminUser.findUnique({
      where: { id },
      select: { id: true, email: true, name: true },
    })
    if (!existing) {
      throw new NotFoundError("Admin user not found")
    }

    const admin = await prisma.adminUser.update({
      where: { id },
      data: { isActive: false },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
      },
    })

    await createAuditEntry({
      adminUserId: session.adminId,
      action: "admin.deactivate",
      targetType: "admin",
      targetId: id,
      metadata: {
        deactivatedEmail: existing.email,
        deactivatedName: existing.name,
      },
      ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown",
    })

    return Response.json({ admin })
  } catch (error) {
    return handleApiError(error)
  }
}
