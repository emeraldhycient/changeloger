import { NextRequest } from "next/server"
import { requireRepoAccess } from "@/lib/auth/middleware"
import { prisma } from "@/lib/db/prisma"
import { publishRelease } from "@/lib/releases/publish"
import { handleApiError, NotFoundError } from "@/lib/utils/errors"

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; version: string }> },
) {
  try {
    const { id, version } = await params
    const { session } = await requireRepoAccess(id, "editor")

    const release = await prisma.release.findFirst({
      where: { repositoryId: id, version: decodeURIComponent(version) },
    })
    if (!release) throw new NotFoundError("Release not found")

    const result = await publishRelease(release.id, session.userId)
    return Response.json(result)
  } catch (error) {
    return handleApiError(error)
  }
}
