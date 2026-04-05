import { NextRequest } from "next/server"
import { requireWorkspaceRole } from "@/lib/auth/middleware"
import { prisma } from "@/lib/db/prisma"
import { handleApiError, ValidationError } from "@/lib/utils/errors"
import { Prisma } from "@prisma/client"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const workspaceId = searchParams.get("workspaceId")
    if (!workspaceId) throw new ValidationError("workspaceId is required")
    await requireWorkspaceRole(workspaceId, "viewer")

    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)))
    const search = searchParams.get("search") || ""
    const source = searchParams.get("source") || ""

    const where: Prisma.ChangeRecordWhereInput = {
      repository: { workspaceId },
      ...(search
        ? { subject: { contains: search, mode: "insensitive" as Prisma.QueryMode } }
        : {}),
      ...(source && source !== "all" ? { source: source as Prisma.EnumChangeSourceFilter } : {}),
    }

    const [changes, total] = await Promise.all([
      prisma.changeRecord.findMany({
        where,
        orderBy: { timestamp: "desc" },
        skip: (page - 1) * limit,
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
      }),
      prisma.changeRecord.count({ where }),
    ])

    return Response.json({
      changes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    return handleApiError(error)
  }
}
