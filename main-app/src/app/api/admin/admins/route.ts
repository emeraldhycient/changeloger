import { NextRequest } from "next/server"
import { z } from "zod"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/db/prisma"
import { requireAdminRole } from "@/lib/auth/admin-middleware"
import { createAuditEntry } from "@/lib/auth/audit"
import { handleApiError, ValidationError } from "@/lib/utils/errors"

export async function GET(request: NextRequest) {
  try {
    await requireAdminRole(request, "admin")

    const admins = await prisma.adminUser.findMany({
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
      orderBy: { createdAt: "asc" },
    })

    return Response.json({ admins })
  } catch (error) {
    return handleApiError(error)
  }
}

const createAdminSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  name: z.string().min(1).max(200),
  role: z.enum(["superadmin", "admin", "readonly"]),
})

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdminRole(request, "superadmin")

    const body = await request.json()
    const parsed = createAdminSchema.safeParse(body)
    if (!parsed.success) {
      throw new ValidationError("Invalid input", parsed.error.format())
    }

    const existing = await prisma.adminUser.findUnique({
      where: { email: parsed.data.email },
    })
    if (existing) {
      throw new ValidationError("An admin with this email already exists")
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 12)

    const admin = await prisma.adminUser.create({
      data: {
        email: parsed.data.email,
        passwordHash,
        name: parsed.data.name,
        role: parsed.data.role,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    })

    await createAuditEntry({
      adminUserId: session.adminId,
      action: "admin.create",
      targetType: "admin",
      targetId: admin.id,
      metadata: {
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
      ipAddress: request.headers.get("x-forwarded-for") || undefined,
    })

    return Response.json({ admin }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
