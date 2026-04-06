import { NextRequest } from "next/server"
import { z } from "zod"
import { requireRepoAccess } from "@/lib/auth/middleware"
import { findReleasesByRepository } from "@/lib/db/queries/releases"
import { prisma } from "@/lib/db/prisma"
import { handleApiError, ValidationError } from "@/lib/utils/errors"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    await requireRepoAccess(id)
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") as "draft" | "published" | "archived" | undefined
    const releases = await findReleasesByRepository(id, status || undefined)
    return Response.json(releases)
  } catch (error) {
    return handleApiError(error)
  }
}

const createSchema = z.object({
  version: z.string().min(1),
  summary: z.string().optional(),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    await requireRepoAccess(id, "editor")
    const body = await request.json()
    const parsed = createSchema.safeParse(body)
    if (!parsed.success) throw new ValidationError("Invalid input", parsed.error.format())

    // Look up the repository to get its workspaceId
    const repo = await prisma.repository.findUnique({ where: { id }, select: { workspaceId: true } })
    if (!repo) throw new ValidationError("Repository not found")

    const release = await prisma.release.create({
      data: {
        workspaceId: repo.workspaceId,
        repositoryId: id,
        version: parsed.data.version,
        summary: parsed.data.summary,
        status: "draft",
      },
    })
    return Response.json(release, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
