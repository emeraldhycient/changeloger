import jwt, { type SignOptions } from "jsonwebtoken"
import type { SessionPayload } from "@/types"

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) throw new Error("JWT_SECRET environment variable is required")
const JWT_SECRET_VALUE: string = JWT_SECRET
const JWT_EXPIRY = process.env.JWT_EXPIRY || "15m"

export function createAccessToken(payload: SessionPayload): string {
  const options: SignOptions = { expiresIn: JWT_EXPIRY as unknown as number }
  return jwt.sign(payload as object, JWT_SECRET_VALUE, options)
}

export function createRefreshToken(payload: { userId: string; sessionId: string }): string {
  const expiry = process.env.REFRESH_TOKEN_EXPIRY || "7d"
  const options: SignOptions = { expiresIn: expiry as unknown as number }
  return jwt.sign(payload as object, JWT_SECRET_VALUE, options)
}

export function verifyToken(token: string): SessionPayload {
  return jwt.verify(token, JWT_SECRET_VALUE) as SessionPayload
}

export function decodeToken(token: string): SessionPayload | null {
  try {
    return jwt.decode(token) as SessionPayload | null
  } catch {
    return null
  }
}
