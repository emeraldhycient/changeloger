import { NextRequest, NextResponse } from "next/server"

const PROTECTED_PATHS = ["/dashboard"]
const AUTH_PAGES = ["/sign-in", "/sign-up"]
const ACCESS_TOKEN_COOKIE = "changeloger_token"
const REFRESH_TOKEN_COOKIE = "changeloger_refresh"

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hasAccessToken = request.cookies.has(ACCESS_TOKEN_COOKIE)
  const hasRefreshToken = request.cookies.has(REFRESH_TOKEN_COOKIE)
  const isAuthenticated = hasAccessToken || hasRefreshToken

  // Protect dashboard routes — redirect to sign-in if not authenticated
  if (PROTECTED_PATHS.some((p) => pathname.startsWith(p))) {
    if (!isAuthenticated) {
      const signInUrl = new URL("/sign-in", request.url)
      signInUrl.searchParams.set("redirect", pathname)
      return NextResponse.redirect(signInUrl)
    }
  }

  // Redirect authenticated users away from auth pages to dashboard
  if (AUTH_PAGES.some((p) => pathname === p)) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/sign-in", "/sign-up"],
}
