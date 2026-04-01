import { NextRequest } from "next/server"
import { requireAuth } from "@/lib/auth/middleware"
import { prisma } from "@/lib/db/prisma"
import { handleApiError } from "@/lib/utils/errors"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAuth()
    const { id } = await params
    const changes = await prisma.changeRecord.findMany({
      where: { repositoryId: id },
      orderBy: { timestamp: "desc" },
      take: 50,
    })
    return Response.json(changes)
  } catch (error) {
    return handleApiError(error)
  }
}
