import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { randomBytes } from "crypto"

export async function GET(request: NextRequest) {
  const clientId = process.env.GITHUB_CLIENT_ID
  const redirectUri = process.env.GITHUB_CALLBACK_URL

  if (!clientId || !redirectUri) {
    return NextResponse.redirect(
      new URL("/sign-in?error=github_not_configured", request.url),
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
    maxAge: 10 * 60,
  })

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: "user:email read:user",
    state,
  })

  return NextResponse.redirect(
    `https://github.com/login/oauth/authorize?${params}`,
  )
}
