import type { WorkspacePlan } from "@prisma/client"

interface PlanLimits {
  maxRepositories: number
  maxMembers: number
  maxAIGenerations: number
  maxVersionHistory: number
  widgetTypes: string[]
  hasAnalytics: boolean
  hasAuditLog: boolean
  hasApiAccess: boolean
  hasPerRepoAccess: boolean
}

export const PLAN_LIMITS: Record<WorkspacePlan, PlanLimits> = {
  free: {
    maxRepositories: 1,
    maxMembers: 1,
    maxAIGenerations: 50,
    maxVersionHistory: 5,
    widgetTypes: ["page"],
    hasAnalytics: false,
    hasAuditLog: false,
    hasApiAccess: false,
    hasPerRepoAccess: false,
  },
  pro: {
    maxRepositories: 5,
    maxMembers: 3,
    maxAIGenerations: 500,
    maxVersionHistory: 50,
    widgetTypes: ["page", "modal", "badge"],
    hasAnalytics: true,
    hasAuditLog: false,
    hasApiAccess: true,
    hasPerRepoAccess: false,
  },
  team: {
    maxRepositories: Infinity,
    maxMembers: Infinity,
    maxAIGenerations: 2000,
    maxVersionHistory: Infinity,
    widgetTypes: ["page", "modal", "badge"],
    hasAnalytics: true,
    hasAuditLog: true,
    hasApiAccess: true,
    hasPerRepoAccess: true,
  },
  enterprise: {
    maxRepositories: Infinity,
    maxMembers: Infinity,
    maxAIGenerations: Infinity,
    maxVersionHistory: Infinity,
    widgetTypes: ["page", "modal", "badge"],
    hasAnalytics: true,
    hasAuditLog: true,
    hasApiAccess: true,
    hasPerRepoAccess: true,
  },
}

export function getPlanLimits(plan: WorkspacePlan): PlanLimits {
  return PLAN_LIMITS[plan]
}

export function checkLimit(
  plan: WorkspacePlan,
  resource: keyof Pick<PlanLimits, "maxRepositories" | "maxMembers" | "maxAIGenerations">,
  currentCount: number,
): { allowed: boolean; limit: number; current: number } {
  const limits = PLAN_LIMITS[plan]
  const limit = limits[resource]
  return { allowed: currentCount < limit, limit, current: currentCount }
}
