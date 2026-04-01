import { NextRequest } from "next/server"
import { requireAuth } from "@/lib/auth/middleware"
import { prisma } from "@/lib/db/prisma"
import { handleApiError, NotFoundError } from "@/lib/utils/errors"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; version: string }> },
) {
  try {
    await requireAuth()
    const { id, version } = await params
    const release = await prisma.release.findFirst({
      where: { repositoryId: id, version: decodeURIComponent(version) },
      include: {
        entries: { orderBy: { position: "asc" } },
        publisher: { select: { id: true, name: true, avatarUrl: true } },
        repository: { select: { id: true, name: true, fullName: true } },
      },
    })
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
    const release = await prisma.release.findFirst({
      where: { repositoryId: id, version: decodeURIComponent(version) },
    })
    if (!release) throw new NotFoundError("Release not found")
    const updated = await prisma.release.update({
      where: { id: release.id },
      data: { summary: body.summary, version: body.newVersion || undefined },
    })
    return Response.json(updated)
  } catch (error) {
    return handleApiError(error)
  }
}
