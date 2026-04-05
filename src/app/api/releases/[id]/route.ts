import { NextRequest } from "next/server"
import { requireReleaseAccess } from "@/lib/auth/middleware"
import { prisma } from "@/lib/db/prisma"
import { findReleaseById, updateRelease } from "@/lib/db/queries/releases"
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
    return Response.json(release)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    await requireReleaseAccess(id, "editor")
    const body = await request.json()
    const release = await updateRelease(id, {
      version: body.newVersion || undefined,
      summary: body.summary,
      repositoryId: body.repositoryId,
    })
    return Response.json(release)
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
    await requireReleaseAccess(id, "admin")

    const release = await prisma.release.findUnique({
      where: { id },
      select: { status: true },
    })
    if (!release) throw new NotFoundError("Release not found")
    if (release.status === "published") {
      throw new ValidationError("Cannot delete a published release. Archive it instead.")
    }

    await prisma.release.delete({ where: { id } })
    return Response.json({ deleted: true })
  } catch (error) {
    return handleApiError(error)
  }
}
