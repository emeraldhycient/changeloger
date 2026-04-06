import { NextRequest } from "next/server"
import { z } from "zod"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/db/prisma"
import { createAdminToken } from "@/lib/auth/admin-jwt"
import { handleApiError, ValidationError, AuthError } from "@/lib/utils/errors"

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = loginSchema.safeParse(body)
    if (!parsed.success) throw new ValidationError("Invalid input", parsed.error.format())

    const admin = await prisma.adminUser.findUnique({
      where: { email: parsed.data.email },
    })

    if (!admin || !admin.isActive) {
      throw new AuthError("Invalid credentials")
    }

    const validPassword = await bcrypt.compare(parsed.data.password, admin.passwordHash)
    if (!validPassword) {
      throw new AuthError("Invalid credentials")
    }

    // Update last login
    await prisma.adminUser.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() },
    })

    const token = createAdminToken({
      adminId: admin.id,
      email: admin.email,
      role: admin.role,
    })

    return Response.json({
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    })
  } catch (error) {
    return handleApiError(error)
  }
}
