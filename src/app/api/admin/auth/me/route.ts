import { NextRequest } from "next/server"
import { requireAdminAuth } from "@/lib/auth/admin-middleware"
import { prisma } from "@/lib/db/prisma"
import { handleApiError, NotFoundError } from "@/lib/utils/errors"

export async function GET(request: NextRequest) {
  try {
    const session = await requireAdminAuth(request)
    const admin = await prisma.adminUser.findUnique({
      where: { id: session.adminId },
      select: { id: true, email: true, name: true, role: true, lastLoginAt: true, createdAt: true },
    })
    if (!admin) throw new NotFoundError("Admin not found")
    return Response.json(admin)
  } catch (error) {
    return handleApiError(error)
  }
}
