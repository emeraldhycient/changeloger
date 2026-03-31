import { NextRequest } from "next/server"
import { requireAuth } from "@/lib/auth/middleware"
import { findReleaseByVersion } from "@/lib/db/queries/releases"
import { prisma } from "@/lib/db/prisma"
import { handleApiError, NotFoundError } from "@/lib/utils/errors"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; version: string }> },
) {
  try {
    await requireAuth()
    const { id, version } = await params
    const release = await findReleaseByVersion(id, decodeURIComponent(version))
    if (!release) throw new NotFoundError("Release not found")
    return Response.json(release)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; version: string }> },
) {
  try {
    await requireAuth()
    const { id, version } = await params
    const body = await request.json()
    const release = await prisma.release.update({
      where: { repositoryId_version: { repositoryId: id, version: decodeURIComponent(version) } },
      data: { summary: body.summary, version: body.newVersion || undefined },
    })
    return Response.json(release)
  } catch (error) {
    return handleApiError(error)
  }
}
