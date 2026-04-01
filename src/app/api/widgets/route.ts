import { z } from "zod"
import { requireAuth, requireWorkspaceRole } from "@/lib/auth/middleware"
import { prisma } from "@/lib/db/prisma"
import { getPlanLimits } from "@/lib/billing/limits"
import { handleApiError, ValidationError, BillingError } from "@/lib/utils/errors"
import type { WorkspacePlan } from "@prisma/client"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const workspaceId = searchParams.get("workspaceId")
    const repositoryId = searchParams.get("repositoryId")

    if (!workspaceId && !repositoryId) {
      throw new ValidationError("workspaceId or repositoryId is required")
    }

    if (workspaceId) {
      await requireWorkspaceRole(workspaceId, "viewer")
    } else {
      await requireAuth()
    }

    const widgets = await prisma.widget.findMany({
      where: {
        ...(workspaceId ? { workspaceId } : {}),
        ...(repositoryId ? { repositoryId } : {}),
      },
      orderBy: { createdAt: "desc" },
    })
    return Response.json(widgets)
  } catch (error) {
    console.error("Widget GET error:", error)
    return handleApiError(error)
  }
}

const createSchema = z.object({
  workspaceId: z.string().uuid(),
  repositoryId: z.string().uuid().optional(),
  type: z.enum(["page", "modal", "badge"]),
  config: z.record(z.string(), z.unknown()).optional(),
  domains: z.array(z.string()).optional(),
})

export async function POST(request: Request) {
  try {
    await requireAuth()
    const body = await request.json()
    const parsed = createSchema.safeParse(body)
    if (!parsed.success) throw new ValidationError("Invalid input", parsed.error.format())

    // Get workspace plan for enforcement
    const workspace = await prisma.workspace.findUnique({
      where: { id: parsed.data.workspaceId },
      select: { plan: true },
    })
    if (!workspace) throw new ValidationError("Workspace not found")

    const limits = getPlanLimits(workspace.plan as WorkspacePlan)
    if (!limits.widgetTypes.includes(parsed.data.type)) {
      throw new BillingError(
        `The "${parsed.data.type}" widget type requires a higher plan. Your current plan (${workspace.plan}) supports: ${limits.widgetTypes.join(", ")}.`,
      )
    }

    const { config, ...rest } = parsed.data
    const widget = await prisma.widget.create({
      data: { ...rest, config: (config ?? {}) as object },
    })
    return Response.json(widget, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
