import { NextRequest } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/db/prisma"
import { requireAdminRole } from "@/lib/auth/admin-middleware"
import { createAuditEntry } from "@/lib/auth/audit"
import { handleApiError, NotFoundError, ValidationError } from "@/lib/utils/errors"

const featuresSchema = z.object({
  features: z.object({
    aiEnabled: z.boolean().optional(),
    widgetsEnabled: z.boolean().optional(),
    teamEnabled: z.boolean().optional(),
  }),
})

/** GET — read current feature flags from workspace widgetTheme JSON */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdminRole(request, "admin")
    const { id } = await params

    const workspace = await prisma.workspace.findUnique({
      where: { id },
      select: { id: true, widgetTheme: true },
    })
    if (!workspace) {
      throw new NotFoundError("Workspace not found")
    }

    const config = (workspace.widgetTheme as Record<string, unknown>) || {}
    const features = (config._adminFeatures as Record<string, boolean>) || {
      aiEnabled: true,
      widgetsEnabled: true,
      teamEnabled: true,
    }

    return Response.json({ features })
  } catch (error) {
    return handleApiError(error)
  }
}

/** PATCH — update workspace feature flags */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await requireAdminRole(request, "admin")
    const { id } = await params

    const body = await request.json()
    const parsed = featuresSchema.safeParse(body)
    if (!parsed.success) {
      throw new ValidationError("Invalid features payload", parsed.error.format())
    }

    const workspace = await prisma.workspace.findUnique({
      where: { id },
      select: { id: true, widgetTheme: true },
    })
    if (!workspace) {
      throw new NotFoundError("Workspace not found")
    }

    const currentConfig = (workspace.widgetTheme as Record<string, unknown>) || {}
    const currentFeatures = (currentConfig._adminFeatures as Record<string, boolean>) || {
      aiEnabled: true,
      widgetsEnabled: true,
      teamEnabled: true,
    }

    const updatedFeatures = { ...currentFeatures, ...parsed.data.features }

    await prisma.workspace.update({
      where: { id },
      data: {
        widgetTheme: {
          ...currentConfig,
          _adminFeatures: updatedFeatures,
        },
      },
    })

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown"

    await createAuditEntry({
      adminUserId: admin.adminId,
      action: "workspace.features_update",
      targetType: "workspace",
      targetId: id,
      metadata: { previousFeatures: currentFeatures, newFeatures: updatedFeatures },
      ipAddress: ip,
    })

    return Response.json({ success: true, features: updatedFeatures })
  } catch (error) {
    return handleApiError(error)
  }
}
