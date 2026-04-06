import { NextRequest } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { requireAdminRole } from "@/lib/auth/admin-middleware"
import { createAuditEntry } from "@/lib/auth/audit"
import { handleApiError, NotFoundError } from "@/lib/utils/errors"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await requireAdminRole(request, "admin")

    const { id } = await params

    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) {
      throw new NotFoundError("User not found")
    }

    await prisma.user.update({
      where: { id },
      data: {
        isSystemSuspended: true,
        suspendedAt: new Date(),
      },
    })

    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown"

    await createAuditEntry({
      adminUserId: admin.adminId,
      action: "user.suspend",
      targetType: "user",
      targetId: id,
      ipAddress: ip,
    })

    return Response.json({ success: true })
  } catch (error) {
    return handleApiError(error)
  }
}
