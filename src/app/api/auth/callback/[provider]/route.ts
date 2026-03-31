import { NextRequest, NextResponse } from "next/server"
import {
  exchangeGoogleCode,
  exchangeGitHubCode,
  handleOAuthCallback,
} from "@/lib/auth/oauth"
import { handleApiError } from "@/lib/utils/errors"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> },
) {
  try {
    const { provider } = await params
    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")

    if (!code) {
      return NextResponse.redirect(
        new URL("/sign-in?error=missing_code", request.url),
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

    // Redirect to dashboard after successful auth
    return NextResponse.redirect(new URL("/dashboard", request.url))
  } catch (error) {
    console.error("OAuth callback error:", error)
    return handleApiError(error)
  }
}
