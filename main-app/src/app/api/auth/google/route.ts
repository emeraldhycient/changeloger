import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { randomBytes } from "crypto"

export async function GET(request: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const redirectUri = process.env.GOOGLE_CALLBACK_URL

  if (!clientId || !redirectUri) {
    return NextResponse.redirect(
      new URL("/sign-in?error=google_not_configured", request.url),
    )
  }

  // Generate CSRF state token
  const state = randomBytes(32).toString("hex")
  const cookieStore = await cookies()
  cookieStore.set("oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 10 * 60, // 10 minutes
  })

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "consent",
    state,
  })

  return NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params}`,
  )
}
