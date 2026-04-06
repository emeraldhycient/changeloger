import { prisma } from "@/lib/db/prisma"

export async function createAuditEntry(params: {
  adminUserId: string
  action: string
  targetType: string
  targetId: string
  metadata?: Record<string, unknown>
  ipAddress?: string
}) {
  return prisma.auditLog.create({
    data: {
      adminUserId: params.adminUserId,
      action: params.action,
      targetType: params.targetType,
      targetId: params.targetId,
      metadata: (params.metadata || {}) as object,
      ipAddress: params.ipAddress || null,
    },
  })
}
