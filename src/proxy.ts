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

  // CORS for admin API (admin SPA runs on different origin)
  if (pathname.startsWith("/api/admin")) {
    const adminOrigin = process.env.ADMIN_CORS_ORIGIN || "http://localhost:5174"
    if (request.method === "OPTIONS") {
      return new NextResponse(null, {
        headers: {
          "Access-Control-Allow-Origin": adminOrigin,
          "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Max-Age": "86400",
        },
      })
    }
    const response = NextResponse.next()
    response.headers.set("Access-Control-Allow-Origin", adminOrigin)
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")
    // Also set security headers
    response.headers.set("X-Content-Type-Options", "nosniff")
    response.headers.set("X-Frame-Options", "SAMEORIGIN")
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
    return response
  }

  const response = NextResponse.next()
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("X-Frame-Options", "SAMEORIGIN")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  return response
}

export const config = {
  matcher: ["/dashboard/:path*", "/sign-in", "/sign-up"],
}
