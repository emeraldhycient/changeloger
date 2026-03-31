import { NextRequest } from "next/server"
import { z } from "zod"
import { requireAuth } from "@/lib/auth/middleware"
import { findReleasesByRepository, createDraftRelease } from "@/lib/db/queries/releases"
import { handleApiError, ValidationError } from "@/lib/utils/errors"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAuth()
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") as "draft" | "published" | "archived" | undefined
    const releases = await findReleasesByRepository(id, status || undefined)
    return Response.json(releases)
  } catch (error) {
    return handleApiError(error)
  }
}

const createSchema = z.object({ version: z.string().min(1), summary: z.string().optional() })

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAuth()
    const { id } = await params
    const body = await request.json()
    const parsed = createSchema.safeParse(body)
    if (!parsed.success) throw new ValidationError("Invalid input", parsed.error.format())
    const release = await createDraftRelease({ repositoryId: id, ...parsed.data })
    return Response.json(release, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
