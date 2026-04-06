import { NextRequest } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { requireAdminAuth } from "@/lib/auth/admin-middleware"
import { handleApiError } from "@/lib/utils/errors"

const startTime = Date.now()

export async function GET(request: NextRequest) {
  try {
    await requireAdminAuth(request)

    let dbStatus = "healthy"
    let latency = 0
    try {
      const start = Date.now()
      await prisma.$queryRaw`SELECT 1`
      latency = Date.now() - start
    } catch {
      dbStatus = "unhealthy"
    }

    const uptimeMs = Date.now() - startTime
    const uptimeSeconds = Math.floor(uptimeMs / 1000)

    return Response.json({
      status: dbStatus === "healthy" ? "healthy" : "degraded",
      database: dbStatus,
      latency,
      uptime: uptimeSeconds,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return handleApiError(error)
  }
}
