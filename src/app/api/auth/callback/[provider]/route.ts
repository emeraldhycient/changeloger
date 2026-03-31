import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import {
  exchangeGoogleCode,
  exchangeGitHubCode,
  handleOAuthCallback,
} from "@/lib/auth/oauth"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> },
) {
  try {
    const { provider } = await params
    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")
    const state = searchParams.get("state")
    const error = searchParams.get("error")

    // Handle provider errors (user denied access, etc.)
    if (error) {
      return NextResponse.redirect(
        new URL(`/sign-in?error=${error}`, request.url),
      )
    }

    if (!code) {
      return NextResponse.redirect(
        new URL("/sign-in?error=missing_code", request.url),
      )
    }

    // Verify CSRF state
    const cookieStore = await cookies()
    const savedState = cookieStore.get("oauth_state")?.value
    cookieStore.delete("oauth_state")

    if (!state || !savedState || state !== savedState) {
      return NextResponse.redirect(
        new URL("/sign-in?error=invalid_state", request.url),
      )
    }

    let userInfo
    if (provider === "google") {
      userInfo = await exchangeGoogleCode(code)
    } else if (provider === "github") {
      userInfo = await exchangeGitHubCode(code)
    } else {
      return NextResponse.redirect(
        new URL("/sign-in?error=invalid_provider", request.url),
      )
    }

    await handleOAuthCallback(userInfo)

    return NextResponse.redirect(new URL("/dashboard", request.url))
  } catch (error) {
    console.error("OAuth callback error:", error)
    return NextResponse.redirect(
      new URL("/sign-in?error=auth_failed", request.url),
    )
  }
}
