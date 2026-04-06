import { NextRequest } from "next/server"
import { z } from "zod"
import { requireReleaseAccess } from "@/lib/auth/middleware"
import { findReleaseById } from "@/lib/db/queries/releases"
import { findEntriesByRelease, createEntry, reorderEntries } from "@/lib/db/queries/changelog-entries"
import { handleApiError, NotFoundError, ValidationError } from "@/lib/utils/errors"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    await requireReleaseAccess(id)
    const release = await findReleaseById(id)
    if (!release) throw new NotFoundError("Release not found")
    const entries = await findEntriesByRelease(release.id)
    return Response.json(entries)
  } catch (error) {
    return handleApiError(error)
  }
}

const createSchema = z.object({
  category: z.enum(["added", "fixed", "changed", "removed", "deprecated", "security", "performance", "documentation", "maintenance", "breaking"]),
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  impact: z.enum(["critical", "high", "medium", "low", "negligible"]).optional(),
  breaking: z.boolean().optional(),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    await requireReleaseAccess(id, "editor")
    const release = await findReleaseById(id)
    if (!release) throw new NotFoundError("Release not found")

    const body = await request.json()
    const parsed = createSchema.safeParse(body)
    if (!parsed.success) throw new ValidationError("Invalid input", parsed.error.format())

    const { description, ...rest } = parsed.data
    const entry = await createEntry({ releaseId: release.id, ...rest, description: description ?? undefined })
    return Response.json(entry, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}

const reorderSchema = z.object({ orderedIds: z.array(z.string().uuid()) })

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    await requireReleaseAccess(id, "editor")
    const release = await findReleaseById(id)
    if (!release) throw new NotFoundError("Release not found")

    const body = await request.json()
    const parsed = reorderSchema.safeParse(body)
    if (!parsed.success) throw new ValidationError("Invalid input", parsed.error.format())

    await reorderEntries(release.id, parsed.data.orderedIds)
    const entries = await findEntriesByRelease(release.id)
    return Response.json(entries)
  } catch (error) {
    return handleApiError(error)
  }
}
