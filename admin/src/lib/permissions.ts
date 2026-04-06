type AdminRole = "superadmin" | "admin" | "readonly"

const ROLE_LEVELS: Record<AdminRole, number> = {
  superadmin: 3,
  admin: 2,
  readonly: 1,
}

export function canPerform(userRole: string, requiredRole: AdminRole): boolean {
  return (ROLE_LEVELS[userRole as AdminRole] || 0) >= ROLE_LEVELS[requiredRole]
}
