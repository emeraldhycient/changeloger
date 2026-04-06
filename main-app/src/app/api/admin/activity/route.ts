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

    const logs = [
      ...auditLogs.map((log) => ({
        id: log.id,
        type: log.action,
        description: `${log.admin?.name || log.admin?.email || "System"} performed ${log.action}`,
        date: log.createdAt,
        admin: log.admin,
        metadata: log.metadata,
      })),
      ...recentSignups.map((user) => ({
        id: `signup-${user.id}`,
        type: "user.signup",
        description: `${user.name || user.email} signed up`,
        date: user.createdAt,
        admin: null,
        metadata: { userId: user.id, email: user.email },
      })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return Response.json({
      logs,
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
