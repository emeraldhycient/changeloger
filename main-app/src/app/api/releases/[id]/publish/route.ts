import { NextRequest } from "next/server"
import { requireReleaseAccess } from "@/lib/auth/middleware"
import { findReleaseById } from "@/lib/db/queries/releases"
import { publishRelease } from "@/lib/releases/publish"
import { handleApiError, NotFoundError } from "@/lib/utils/errors"

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const { session } = await requireReleaseAccess(id, "editor")
    const release = await findReleaseById(id)
    if (!release) throw new NotFoundError("Release not found")
    const result = await publishRelease(release.id, session.userId)
    return Response.json(result)
  } catch (error) {
    return handleApiError(error)
  }
}
