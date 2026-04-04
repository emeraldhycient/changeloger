import { z } from "zod"
import { requireWorkspaceRole } from "@/lib/auth/middleware"
import { enforceRepoLimit } from "@/lib/middleware/plan-enforcement"
import { handleApiError, ValidationError } from "@/lib/utils/errors"
import { prisma } from "@/lib/db/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const workspaceId = searchParams.get("workspaceId")
    if (!workspaceId) throw new ValidationError("workspaceId is required")
    await requireWorkspaceRole(workspaceId, "viewer")

    // Pagination
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)))
    const skip = (page - 1) * limit

    // Search
    const search = searchParams.get("search")?.trim()

    // Filter
    const language = searchParams.get("language")
    const active = searchParams.get("active") // "true" | "false" | null (all)

    // Sort
    const sortBy = searchParams.get("sortBy") || "createdAt"
    const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc"

    // Build where clause
    const where: Record<string, unknown> = { workspaceId }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { fullName: { contains: search, mode: "insensitive" } },
      ]
    }
    if (language) {
      where.language = language
    }
    if (active === "true") {
      where.isActive = true
    } else if (active === "false") {
      where.isActive = false
    }

    // Build orderBy
    const validSortFields = ["createdAt", "name", "fullName", "language", "updatedAt"]
    const orderByField = validSortFields.includes(sortBy) ? sortBy : "createdAt"

    const [repos, total] = await Promise.all([
      prisma.repository.findMany({
        where,
        include: {
          githubInstallation: { select: { accountLogin: true, accountType: true } },
          _count: { select: { releases: true, changeRecords: true } },
        },
        orderBy: { [orderByField]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.repository.count({ where }),
    ])

    // Get unique languages for filter dropdown
    const languages = await prisma.repository.findMany({
      where: { workspaceId },
      select: { language: true },
      distinct: ["language"],
    })

    return Response.json({
      repositories: repos,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      filters: {
        languages: languages
          .map((l) => l.language)
          .filter(Boolean)
          .sort(),
      },
    })
  } catch (error) {
    return handleApiError(error)
  }
}

const connectSchema = z.object({
  workspaceId: z.string().uuid(),
  githubInstallationId: z.string().uuid(),
  githubRepoId: z.number(),
  name: z.string(),
  fullName: z.string(),
  defaultBranch: z.string().default("main"),
  language: z.string().nullable().optional(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = connectSchema.safeParse(body)
    if (!parsed.success) throw new ValidationError("Invalid input", parsed.error.format())

    await requireWorkspaceRole(parsed.data.workspaceId, "admin")
    await enforceRepoLimit(parsed.data.workspaceId)

    const repo = await prisma.repository.create({ data: parsed.data })
    return Response.json(repo, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
