import { NextRequest } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { requireAdminRole } from "@/lib/auth/admin-middleware"
import { createAuditEntry } from "@/lib/auth/audit"
import { handleApiError, NotFoundError, ValidationError } from "@/lib/utils/errors"

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; memberId: string }> },
) {
  try {
    const admin = await requireAdminRole(request, "admin")

    const { id, memberId } = await params

    const workspace = await prisma.workspace.findUnique({ where: { id } })
    if (!workspace) {
      throw new NotFoundError("Workspace not found")
    }

    const member = await prisma.workspaceMember.findUnique({
      where: { id: memberId },
      include: { user: { select: { id: true, name: true, email: true } } },
    })
    if (!member || member.workspaceId !== id) {
      throw new NotFoundError("Member not found in this workspace")
    }

    if (member.role === "owner") {
      throw new ValidationError("Cannot remove the workspace owner")
    }

    await prisma.workspaceMember.delete({ where: { id: memberId } })

    await createAuditEntry({
      adminUserId: admin.adminId,
      action: "workspace.member_remove",
      targetType: "workspace",
      targetId: id,
      metadata: {
        memberId,
        userId: member.userId,
        userName: member.user?.name ?? member.user?.email ?? null,
        role: member.role,
      },
    })

    return Response.json({ success: true })
  } catch (error) {
    return handleApiError(error)
  }
}
