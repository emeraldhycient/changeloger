import { NextRequest } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { requireAdminAuth } from "@/lib/auth/admin-middleware"
import { handleApiError } from "@/lib/utils/errors"
import { Prisma } from "@prisma/client"

export async function GET(request: NextRequest) {
  try {
    await requireAdminAuth(request)

    const now = new Date()
    const sevenDaysFromNow = new Date()
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const fourteenDaysAgo = new Date()
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)

    const [trialsExpiringSoon, noRecentReleases, noRecentLogins] =
      await Promise.all([
        // Trials expiring in next 7 days
        prisma.workspace.findMany({
          where: {
            trialEndsAt: {
              gt: now,
              lte: sevenDaysFromNow,
            },
          },
          select: {
            id: true,
            name: true,
            slug: true,
            plan: true,
            trialEndsAt: true,
            owner: {
              select: { id: true, email: true, name: true },
            },
          },
          orderBy: { trialEndsAt: "asc" },
        }),

        // Paid workspaces with no releases in 30 days
        prisma.$queryRaw<
          Array<{
            id: string
            name: string
            slug: string
            plan: string
            last_release: Date | null
          }>
        >(
          Prisma.sql`SELECT w.id, w.name, w.slug, w.plan,
              (SELECT MAX(r.published_at) FROM releases r WHERE r.workspace_id = w.id) as last_release
            FROM workspaces w
            WHERE w.plan != 'free'
              AND NOT EXISTS (
                SELECT 1 FROM releases r
                WHERE r.workspace_id = w.id
                  AND r.published_at >= ${thirtyDaysAgo}
              )
            ORDER BY last_release ASC NULLS FIRST
            LIMIT 50`,
        ),

        // Paid workspaces with no logins in 14 days
        prisma.$queryRaw<
          Array<{
            id: string
            name: string
            slug: string
            plan: string
            last_login: Date | null
          }>
        >(
          Prisma.sql`SELECT w.id, w.name, w.slug, w.plan,
              (SELECT MAX(s.created_at) FROM sessions s
               INNER JOIN workspace_members wm ON wm.user_id = s.user_id
               WHERE wm.workspace_id = w.id) as last_login
            FROM workspaces w
            WHERE w.plan != 'free'
              AND NOT EXISTS (
                SELECT 1 FROM sessions s
                INNER JOIN workspace_members wm ON wm.user_id = s.user_id
                WHERE wm.workspace_id = w.id
                  AND s.created_at >= ${fourteenDaysAgo}
              )
            ORDER BY last_login ASC NULLS FIRST
            LIMIT 50`,
        ),
      ])

    return Response.json({
      trialsExpiringSoon,
      noRecentReleases,
      noRecentLogins,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
