import { NextRequest } from "next/server"
import { z } from "zod"
import { requireRepoAccess } from "@/lib/auth/middleware"
import { findRepositoryById, updateRepositoryConfig, toggleRepositoryActive, deleteRepository } from "@/lib/db/queries/repositories"
import { handleApiError, NotFoundError, ValidationError } from "@/lib/utils/errors"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    await requireRepoAccess(id)
    const repo = await findRepositoryById(id)
    if (!repo) throw new NotFoundError("Repository not found")
    return Response.json(repo)
  } catch (error) {
    return handleApiError(error)
  }
}

const updateSchema = z.object({
  config: z.record(z.string(), z.unknown()).optional(),
  isActive: z.boolean().optional(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    await requireRepoAccess(id, "editor")
    const body = await request.json()
    const parsed = updateSchema.safeParse(body)
    if (!parsed.success) throw new ValidationError("Invalid input", parsed.error.format())

    if (parsed.data.config) {
      await updateRepositoryConfig(id, parsed.data.config as Record<string, unknown>)
    }
    if (parsed.data.isActive !== undefined) {
      await toggleRepositoryActive(id, parsed.data.isActive)
    }

    const updated = await findRepositoryById(id)
    return Response.json(updated)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    await requireRepoAccess(id, "admin")
    await deleteRepository(id)
    return Response.json({ deleted: true })
  } catch (error) {
    return handleApiError(error)
  }
}
