import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth/jwt"
import { prisma } from "@/lib/db/prisma"
import { cookies } from "next/headers"

const ACCESS_TOKEN_COOKIE = "changeloger_token"

/**
 * POST — Activate an impersonation session by setting the access token cookie.
 * Validates the token is a legitimate impersonation session before setting it.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token } = body

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 })
    }

    // Verify the JWT is valid
    let payload
    try {
      payload = verifyToken(token)
    } catch {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 })
    }

    // Verify the session exists and is an impersonation session
    const session = await prisma.session.findUnique({
      where: { id: payload.sessionId },
    })

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 401 })
    }

    if (!session.userAgent?.startsWith("Admin Impersonation")) {
      return NextResponse.json({ error: "Not an impersonation session" }, { status: 403 })
    }

    if (new Date(session.expiresAt) < new Date()) {
      return NextResponse.json({ error: "Impersonation session has expired" }, { status: 401 })
    }

    // Set the access token cookie
    const cookieStore = await cookies()
    const isProduction = process.env.NODE_ENV === "production"

    cookieStore.set(ACCESS_TOKEN_COOKIE, token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: 15 * 60, // 15 minutes — matches impersonation session TTL
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
