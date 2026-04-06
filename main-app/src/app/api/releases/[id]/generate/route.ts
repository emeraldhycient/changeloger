import { NextRequest } from "next/server"
import { z } from "zod"
import { requireReleaseAccess } from "@/lib/auth/middleware"
import { prisma } from "@/lib/db/prisma"
import { countUnprocessed } from "@/lib/db/queries/change-records"
import { generateEntriesFromChanges } from "@/lib/services/generate-entries"
import { handleApiError, ValidationError } from "@/lib/utils/errors"

const generateSchema = z.object({
  repositoryId: z.string().uuid().optional(),
  useAI: z.boolean().default(true),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    await requireReleaseAccess(id, "editor")

    // Validate release exists and is draft
    const release = await prisma.release.findUnique({
      where: { id },
      select: { id: true, workspaceId: true, repositoryId: true, status: true },
    })
    if (!release) throw new ValidationError("Release not found")
    if (release.status !== "draft") throw new ValidationError("Can only generate entries for draft releases")

    const body = await request.json().catch(() => ({}))
    const parsed = generateSchema.safeParse(body)
    if (!parsed.success) throw new ValidationError("Invalid input", parsed.error.format())

    const repositoryId = parsed.data.repositoryId || release.repositoryId || undefined

    const result = await generateEntriesFromChanges({
      releaseId: release.id,
      workspaceId: release.workspaceId,
      repositoryId,
      useAI: parsed.data.useAI,
    })

    return Response.json(result)
  } catch (error) {
    return handleApiError(error)
  }
}

// GET — return count of unprocessed changes
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    await requireReleaseAccess(id)

    const release = await prisma.release.findUnique({
      where: { id },
      select: { workspaceId: true, repositoryId: true },
    })
    if (!release) throw new ValidationError("Release not found")

    const count = await countUnprocessed(
      release.repositoryId || undefined,
      release.repositoryId ? undefined : release.workspaceId,
    )

    return Response.json({ unprocessedCount: count })
  } catch (error) {
    return handleApiError(error)
  }
}
