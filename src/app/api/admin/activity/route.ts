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

    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const [auditLogs, total, recentSignups] = await Promise.all([
      prisma.auditLog.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          admin: { select: { id: true, name: true, email: true } },
        },
      }),
      prisma.auditLog.count(),
      prisma.user.findMany({
        where: { createdAt: { gte: sevenDaysAgo } },
        select: { id: true, name: true, email: true, createdAt: true },
        orderBy: { createdAt: "desc" },
      }),
    ])

    return Response.json({
      auditLogs,
      recentSignups,
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
