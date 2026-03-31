import { requireAuth } from "@/lib/auth/middleware"
import { prisma } from "@/lib/db/prisma"
import { getCustomerPortalUrl } from "@/lib/billing/polar"
import { handleApiError, ValidationError } from "@/lib/utils/errors"

export async function POST(request: Request) {
  try {
    await requireAuth()
    const { workspaceId } = await request.json()
    if (!workspaceId) throw new ValidationError("workspaceId is required")

    const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } })
    if (!workspace?.polarCustomerId) {
      throw new ValidationError("No billing account found. Subscribe to a plan first.")
    }

    const url = await getCustomerPortalUrl(workspace.polarCustomerId)
    return Response.json({ url })
  } catch (error) {
    return handleApiError(error)
  }
}
