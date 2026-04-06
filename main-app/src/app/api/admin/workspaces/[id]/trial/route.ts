import { NextRequest } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/db/prisma"
import { requireAdminRole } from "@/lib/auth/admin-middleware"
import { createAuditEntry } from "@/lib/auth/audit"
import { handleApiError, NotFoundError, ValidationError } from "@/lib/utils/errors"

const trialSchema = z
  .object({
    days: z.number().int().min(1).max(365).optional(),
    trialEndsAt: z.string().datetime().optional(),
  })
  .refine((data) => data.days || data.trialEndsAt, {
    message: "Either days or trialEndsAt must be provided",
  })

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await requireAdminRole(request, "admin")

    const { id } = await params
    const body = await request.json()
    const parsed = trialSchema.safeParse(body)
    if (!parsed.success) {
      throw new ValidationError("Invalid trial data", parsed.error.format())
    }

    const workspace = await prisma.workspace.findUnique({ where: { id } })
    if (!workspace) {
      throw new NotFoundError("Workspace not found")
    }

    let newTrialEnd: Date
    if (parsed.data.trialEndsAt) {
      newTrialEnd = new Date(parsed.data.trialEndsAt)
    } else {
      // Extend from current trial end or from now if no trial
      const base = workspace.trialEndsAt && new Date(workspace.trialEndsAt) > new Date()
        ? new Date(workspace.trialEndsAt)
        : new Date()
      newTrialEnd = new Date(base.getTime() + parsed.data.days! * 24 * 60 * 60 * 1000)
    }

    await prisma.workspace.update({
      where: { id },
      data: { trialEndsAt: newTrialEnd },
    })

    await createAuditEntry({
      adminUserId: admin.adminId,
      action: "workspace.trial_extend",
      targetType: "workspace",
      targetId: id,
      metadata: {
        previousTrialEnd: workspace.trialEndsAt?.toISOString() ?? null,
        newTrialEnd: newTrialEnd.toISOString(),
        days: parsed.data.days ?? null,
      },
    })

    return Response.json({ success: true, trialEndsAt: newTrialEnd.toISOString() })
  } catch (error) {
    return handleApiError(error)
  }
}
