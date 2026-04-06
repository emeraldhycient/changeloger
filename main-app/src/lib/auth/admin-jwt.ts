import jwt, { type SignOptions } from "jsonwebtoken"

const ADMIN_JWT_SECRET: string = process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET || ""
if (!ADMIN_JWT_SECRET) throw new Error("ADMIN_JWT_SECRET or JWT_SECRET environment variable is required")

const ADMIN_JWT_EXPIRY = (process.env.ADMIN_JWT_EXPIRY || "8h") as SignOptions["expiresIn"]

export interface AdminSessionPayload {
  adminId: string
  email: string
  role: string
}

export function createAdminToken(payload: AdminSessionPayload): string {
  return jwt.sign(payload, ADMIN_JWT_SECRET!, { expiresIn: ADMIN_JWT_EXPIRY })
}

export function verifyAdminToken(token: string): AdminSessionPayload {
  return jwt.verify(token, ADMIN_JWT_SECRET!) as unknown as AdminSessionPayload
}
