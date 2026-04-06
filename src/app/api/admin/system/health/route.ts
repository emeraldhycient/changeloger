import { NextRequest } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { requireAdminAuth } from "@/lib/auth/admin-middleware"
import { handleApiError } from "@/lib/utils/errors"

const startTime = Date.now()

export async function GET(request: NextRequest) {
  try {
    await requireAdminAuth(request)

    let dbStatus = "healthy"
    try {
      await prisma.$queryRaw`SELECT 1`
    } catch {
      dbStatus = "unhealthy"
    }

    const uptimeMs = Date.now() - startTime
    const uptimeSeconds = Math.floor(uptimeMs / 1000)

    return Response.json({
      status: dbStatus === "healthy" ? "healthy" : "degraded",
      database: dbStatus,
      uptime: uptimeSeconds,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return handleApiError(error)
  }
}
