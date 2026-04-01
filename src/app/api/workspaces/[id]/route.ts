import { NextRequest } from "next/server"
import { z } from "zod"
import { requireWorkspaceRole } from "@/lib/auth/middleware"
import { findWorkspaceById } from "@/lib/db/queries/workspaces"
import { prisma } from "@/lib/db/prisma"
import { handleApiError, NotFoundError, ValidationError } from "@/lib/utils/errors"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    await requireWorkspaceRole(id, "viewer")
    const workspace = await findWorkspaceById(id)
    if (!workspace) throw new NotFoundError("Workspace not found")
    return Response.json(workspace)
  } catch (error) {
    return handleApiError(error)
  }
}

const updateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/).optional(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    await requireWorkspaceRole(id, "admin")

    const body = await request.json()
    const parsed = updateSchema.safeParse(body)
    if (!parsed.success) throw new ValidationError("Invalid input", parsed.error.format())

    const workspace = await prisma.workspace.update({
      where: { id },
      data: parsed.data,
    })
    return Response.json(workspace)
  } catch (error) {
    return handleApiError(error)
  }
}
