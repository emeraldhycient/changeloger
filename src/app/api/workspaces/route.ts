import { z } from "zod"
import { requireAuth } from "@/lib/auth/middleware"
import { findWorkspacesByUserId, createWorkspace } from "@/lib/db/queries/workspaces"
import { handleApiError, ValidationError } from "@/lib/utils/errors"

export async function GET() {
  try {
    const session = await requireAuth()
    const workspaces = await findWorkspacesByUserId(session.userId)
    return Response.json(workspaces)
  } catch (error) {
    return handleApiError(error)
  }
}

const createSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z
    .string()
    .min(1)
    .max(50)
    .regex(/^[a-z0-9-]+$/),
})

export async function POST(request: Request) {
  try {
    const session = await requireAuth()
    const body = await request.json()

    const parsed = createSchema.safeParse(body)
    if (!parsed.success) {
      throw new ValidationError("Invalid input", parsed.error.format())
    }

    const workspace = await createWorkspace({
      ...parsed.data,
      ownerId: session.userId,
    })

    return Response.json(workspace, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
