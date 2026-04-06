import { NextRequest } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { requireAdminRole } from "@/lib/auth/admin-middleware"
import { createAuditEntry } from "@/lib/auth/audit"
import { handleApiError, NotFoundError } from "@/lib/utils/errors"

/** GET — list active sessions for a user */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdminRole(request, "readonly")
    const { id } = await params

    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true },
    })
    if (!user) {
      throw new NotFoundError("User not found")
    }

    const sessions = await prisma.session.findMany({
      where: { userId: id, expiresAt: { gt: new Date() } },
      select: {
        id: true,
        ipAddress: true,
        userAgent: true,
        createdAt: true,
        expiresAt: true,
      },
      orderBy: { createdAt: "desc" },
    })

    return Response.json({ sessions })
  } catch (error) {
    return handleApiError(error)
  }
}

/** DELETE — revoke all sessions for a user (force-logout) */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await requireAdminRole(request, "admin")
    const { id } = await params

    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true },
    })
    if (!user) {
      throw new NotFoundError("User not found")
    }

    const result = await prisma.session.deleteMany({
      where: { userId: id },
    })

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown"

    await createAuditEntry({
      adminUserId: admin.adminId,
      action: "user.sessions_revoked",
      targetType: "user",
      targetId: id,
      metadata: {
        userName: user.name,
        userEmail: user.email,
        sessionsRevoked: result.count,
      },
      ipAddress: ip,
    })

    return Response.json({ success: true, sessionsRevoked: result.count })
  } catch (error) {
    return handleApiError(error)
  }
}
