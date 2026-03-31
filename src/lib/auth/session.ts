import { cookies } from "next/headers"
import { createAccessToken, createRefreshToken, verifyToken } from "./jwt"
import type { SessionPayload } from "@/types"

const ACCESS_TOKEN_COOKIE = "changeloger_token"
const REFRESH_TOKEN_COOKIE = "changeloger_refresh"

export async function setSessionCookies(payload: SessionPayload): Promise<void> {
  const accessToken = createAccessToken(payload)
  const refreshToken = createRefreshToken({
    userId: payload.userId,
    sessionId: payload.sessionId,
  })

  const cookieStore = await cookies()
  const isProduction = process.env.NODE_ENV === "production"

  cookieStore.set(ACCESS_TOKEN_COOKIE, accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
    path: "/",
    maxAge: 15 * 60, // 15 minutes
  })

  cookieStore.set(REFRESH_TOKEN_COOKIE, refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  })
}

export async function clearSessionCookies(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(ACCESS_TOKEN_COOKIE)
  cookieStore.delete(REFRESH_TOKEN_COOKIE)
}

export async function getSessionFromCookies(): Promise<SessionPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value

  if (!token) return null

  try {
    return verifyToken(token)
  } catch {
    return null
  }
}

export async function getRefreshTokenFromCookies(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(REFRESH_TOKEN_COOKIE)?.value ?? null
}
