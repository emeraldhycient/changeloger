import { NextRequest } from "next/server"
import { z } from "zod"
import { requireRepoAccess } from "@/lib/auth/middleware"
import { updateEntry, deleteEntry } from "@/lib/db/queries/changelog-entries"
import { handleApiError, ValidationError } from "@/lib/utils/errors"

const updateSchema = z.object({
  category: z.enum(["added", "fixed", "changed", "removed", "deprecated", "security", "performance", "documentation", "maintenance", "breaking"]).optional(),
  title: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  impact: z.enum(["critical", "high", "medium", "low", "negligible"]).optional(),
  breaking: z.boolean().optional(),
  reviewed: z.boolean().optional(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; version: string; entryId: string }> },
) {
  try {
    const { id, entryId } = await params
    await requireRepoAccess(id, "editor")
    const body = await request.json()
    const parsed = updateSchema.safeParse(body)
    if (!parsed.success) throw new ValidationError("Invalid input", parsed.error.format())
    const entry = await updateEntry(entryId, parsed.data)
    return Response.json(entry)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; version: string; entryId: string }> },
) {
  try {
    const { id, entryId } = await params
    await requireRepoAccess(id, "admin")
    await deleteEntry(entryId)
    return Response.json({ deleted: true })
  } catch (error) {
    return handleApiError(error)
  }
}
