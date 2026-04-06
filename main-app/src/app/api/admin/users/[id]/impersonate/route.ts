import { NextRequest } from "next/server"
import { randomUUID } from "crypto"
import { prisma } from "@/lib/db/prisma"
import { requireAdminRole } from "@/lib/auth/admin-middleware"
import { createAccessToken } from "@/lib/auth/jwt"
import { createAuditEntry } from "@/lib/auth/audit"
import { handleApiError, NotFoundError } from "@/lib/utils/errors"

/**
 * POST — Generate a short-lived impersonation token for "view as user" capability.
 * Only superadmins can impersonate users.
 * The token expires in 15 minutes and is marked as an impersonation session.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await requireAdminRole(request, "superadmin")
    const { id } = await params

    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true },
    })
    if (!user) {
      throw new NotFoundError("User not found")
    }

    // Create a temporary session in the database
    const sessionId = randomUUID()
    const tokenHash = `impersonation_${randomUUID()}`
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 min

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown"

    await prisma.session.create({
      data: {
        id: sessionId,
        userId: id,
        tokenHash,
        expiresAt,
        ipAddress: ip,
        userAgent: `Admin Impersonation (${admin.email})`,
      },
    })

    // Create a short-lived JWT token for the impersonation session
    const accessToken = createAccessToken({
      userId: user.id,
      email: user.email!,
      sessionId,
    })

    await createAuditEntry({
      adminUserId: admin.adminId,
      action: "user.impersonate",
      targetType: "user",
      targetId: id,
      metadata: {
        userName: user.name,
        userEmail: user.email,
        impersonationSessionId: sessionId,
      },
      ipAddress: ip,
    })

    return Response.json({
      success: true,
      accessToken,
      expiresAt: expiresAt.toISOString(),
      user: { id: user.id, name: user.name, email: user.email },
    })
  } catch (error) {
    return handleApiError(error)
  }
}
