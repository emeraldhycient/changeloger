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

    const workspace = await prisma.workspace.findUnique({ where: { id } })
    if (!workspace) {
      throw new NotFoundError("Workspace not found")
    }

    await prisma.workspace.update({
      where: { id },
      data: {
        isSystemSuspended: false,
        suspendedAt: null,
        suspendedReason: null,
      },
    })

    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown"

    await createAuditEntry({
      adminUserId: admin.adminId,
      action: "workspace.unsuspend",
      targetType: "workspace",
      targetId: id,
      ipAddress: ip,
    })

    return Response.json({ success: true })
  } catch (error) {
    return handleApiError(error)
  }
}
