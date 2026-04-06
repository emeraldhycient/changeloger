import { NextRequest } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { requireAdminAuth } from "@/lib/auth/admin-middleware"
import { handleApiError } from "@/lib/utils/errors"
import { Prisma } from "@prisma/client"

interface DailyCount {
  date: Date
  count: bigint
}

export async function GET(request: NextRequest) {
  try {
    await requireAdminAuth(request)

    const { searchParams } = new URL(request.url)
    const days = Math.min(
      Math.max(parseInt(searchParams.get("days") || "90", 10) || 90, 1),
      365,
    )

    const since = new Date()
    since.setDate(since.getDate() - days)

    const [newUsers, newWorkspaces, publishedReleases] = await Promise.all([
      prisma.$queryRaw<DailyCount[]>(
        Prisma.sql`SELECT DATE(created_at) as date, COUNT(*)::bigint as count
          FROM users
          WHERE created_at >= ${since}
          GROUP BY DATE(created_at)
          ORDER BY date ASC`,
      ),
      prisma.$queryRaw<DailyCount[]>(
        Prisma.sql`SELECT DATE(created_at) as date, COUNT(*)::bigint as count
          FROM workspaces
          WHERE created_at >= ${since}
          GROUP BY DATE(created_at)
          ORDER BY date ASC`,
      ),
      prisma.$queryRaw<DailyCount[]>(
        Prisma.sql`SELECT DATE(published_at) as date, COUNT(*)::bigint as count
          FROM releases
          WHERE published_at IS NOT NULL AND published_at >= ${since}
          GROUP BY DATE(published_at)
          ORDER BY date ASC`,
      ),
    ])

    const serialize = (rows: DailyCount[]) =>
      rows.map((r) => ({ date: r.date, count: Number(r.count) }))

    return Response.json({
      days,
      newUsers: serialize(newUsers),
      newWorkspaces: serialize(newWorkspaces),
      publishedReleases: serialize(publishedReleases),
    })
  } catch (error) {
    return handleApiError(error)
  }
}
