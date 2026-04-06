import { NextRequest } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/db/prisma"
import { requireAdminRole } from "@/lib/auth/admin-middleware"
import { createAuditEntry } from "@/lib/auth/audit"
import { handleApiError, NotFoundError, ValidationError } from "@/lib/utils/errors"

const planSchema = z.object({
  plan: z.enum(["free", "pro", "team", "enterprise"]),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await requireAdminRole(request, "admin")

    const { id } = await params
    const body = await request.json()
    const parsed = planSchema.safeParse(body)
    if (!parsed.success) {
      throw new ValidationError("Invalid plan", parsed.error.format())
    }

    const workspace = await prisma.workspace.findUnique({ where: { id } })
    if (!workspace) {
      throw new NotFoundError("Workspace not found")
    }

    const previousPlan = workspace.plan

    await prisma.workspace.update({
      where: { id },
      data: { plan: parsed.data.plan },
    })

    await createAuditEntry({
      adminUserId: admin.adminId,
      action: "workspace.plan_change",
      targetType: "workspace",
      targetId: id,
      metadata: { previousPlan, newPlan: parsed.data.plan },
    })

    return Response.json({ success: true })
  } catch (error) {
    return handleApiError(error)
  }
}
