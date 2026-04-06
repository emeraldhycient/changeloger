import { NextRequest } from "next/server"
import { verifyAdminToken, type AdminSessionPayload } from "./admin-jwt"
import { AuthError, ForbiddenError } from "@/lib/utils/errors"

const ADMIN_ROLE_HIERARCHY: Record<string, number> = {
  superadmin: 3,
  admin: 2,
  readonly: 1,
}

export async function requireAdminAuth(request: NextRequest): Promise<AdminSessionPayload> {
  const authHeader = request.headers.get("authorization")
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AuthError("Admin authentication required")
  }

  const token = authHeader.slice(7)
  try {
    return verifyAdminToken(token)
  } catch {
    throw new AuthError("Invalid or expired admin token")
  }
}

export async function requireAdminRole(
  request: NextRequest,
  minimumRole: "superadmin" | "admin" | "readonly",
): Promise<AdminSessionPayload> {
  const session = await requireAdminAuth(request)
  const userLevel = ADMIN_ROLE_HIERARCHY[session.role] || 0
  const requiredLevel = ADMIN_ROLE_HIERARCHY[minimumRole] || 0

  if (userLevel < requiredLevel) {
    throw new ForbiddenError(`Requires ${minimumRole} role or higher`)
  }

  return session
}
