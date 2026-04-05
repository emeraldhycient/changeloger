import { NextRequest } from "next/server"
import { requireWorkspaceRole } from "@/lib/auth/middleware"
import { prisma } from "@/lib/db/prisma"
import { handleApiError, ValidationError } from "@/lib/utils/errors"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const workspaceId = searchParams.get("workspaceId")
    if (!workspaceId) throw new ValidationError("workspaceId is required")
    await requireWorkspaceRole(workspaceId, "viewer")

    const limit = Math.min(100, parseInt(searchParams.get("limit") || "50", 10))

    const changes = await prisma.changeRecord.findMany({
      where: { repository: { workspaceId } },
      orderBy: { timestamp: "desc" },
      take: limit,
      select: {
        id: true,
        source: true,
        type: true,
        subject: true,
        commitSha: true,
        timestamp: true,
        breaking: true,
        processedAt: true,
        repositoryId: true,
      },
    })

    return Response.json(changes)
  } catch (error) {
    return handleApiError(error)
  }
}
