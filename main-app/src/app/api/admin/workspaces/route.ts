import { NextRequest } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { requireAdminAuth } from "@/lib/auth/admin-middleware"
import { handleApiError } from "@/lib/utils/errors"

export async function GET(request: NextRequest) {
  try {
    await requireAdminAuth(request)

    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)))
    const search = searchParams.get("search") || ""
    const plan = searchParams.get("plan")
    const suspended = searchParams.get("suspended")
    const sortBy = searchParams.get("sortBy") || "createdAt"
    const sortDir = searchParams.get("sortDir") === "asc" ? "asc" as const : "desc" as const

    const where: Record<string, unknown> = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
      ]
    }

    if (plan) {
      where.plan = plan
    }

    if (suspended === "true") {
      where.isSystemSuspended = true
    } else if (suspended === "false") {
      where.isSystemSuspended = false
    }

    const allowedSortFields: Record<string, Record<string, string>> = {
      createdAt: { createdAt: sortDir },
      name: { name: sortDir },
      plan: { plan: sortDir },
    }
    const orderBy = allowedSortFields[sortBy] || { createdAt: sortDir }

    const [workspaces, total] = await Promise.all([
      prisma.workspace.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy,
        include: {
          owner: { select: { id: true, name: true, email: true } },
          _count: { select: { members: true, repositories: true, releases: true } },
        },
      }),
      prisma.workspace.count({ where }),
    ])

    return Response.json({
      workspaces,
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
