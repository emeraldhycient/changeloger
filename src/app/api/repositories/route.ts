import { z } from "zod"
import { requireWorkspaceRole } from "@/lib/auth/middleware"
import { findRepositoriesByWorkspace } from "@/lib/db/queries/repositories"
import { enforceRepoLimit } from "@/lib/middleware/plan-enforcement"
import { handleApiError, ValidationError } from "@/lib/utils/errors"
import { prisma } from "@/lib/db/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const workspaceId = searchParams.get("workspaceId")
    if (!workspaceId) throw new ValidationError("workspaceId is required")
    await requireWorkspaceRole(workspaceId, "viewer")

    const repos = await findRepositoriesByWorkspace(workspaceId)
    return Response.json(repos)
  } catch (error) {
    return handleApiError(error)
  }
}

const connectSchema = z.object({
  workspaceId: z.string().uuid(),
  githubInstallationId: z.string().uuid(),
  githubRepoId: z.number(),
  name: z.string(),
  fullName: z.string(),
  defaultBranch: z.string().default("main"),
  language: z.string().nullable().optional(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = connectSchema.safeParse(body)
    if (!parsed.success) throw new ValidationError("Invalid input", parsed.error.format())

    await requireWorkspaceRole(parsed.data.workspaceId, "admin")
    await enforceRepoLimit(parsed.data.workspaceId)

    const repo = await prisma.repository.create({ data: parsed.data })
    return Response.json(repo, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
