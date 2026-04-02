import { NextRequest } from "next/server"
import { z } from "zod"
import { requireWorkspaceRole } from "@/lib/auth/middleware"
import { findReleasesByWorkspace, createDraftRelease } from "@/lib/db/queries/releases"
import { handleApiError, ValidationError } from "@/lib/utils/errors"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const workspaceId = searchParams.get("workspaceId")
    if (!workspaceId) throw new ValidationError("workspaceId is required")
    await requireWorkspaceRole(workspaceId, "viewer")
    const status = searchParams.get("status") as "draft" | "published" | "archived" | undefined
    const releases = await findReleasesByWorkspace(workspaceId, status || undefined)
    return Response.json(releases)
  } catch (error) {
    return handleApiError(error)
  }
}

const createSchema = z.object({
  workspaceId: z.string().uuid(),
  version: z.string().min(1),
  summary: z.string().optional(),
  repositoryId: z.string().uuid().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = createSchema.safeParse(body)
    if (!parsed.success) throw new ValidationError("Invalid input", parsed.error.format())
    await requireWorkspaceRole(parsed.data.workspaceId, "editor")
    const release = await createDraftRelease(parsed.data)
    return Response.json(release, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
