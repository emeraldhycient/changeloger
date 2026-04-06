import { prisma } from "@/lib/db/prisma"
import { checkLimit, getPlanLimits } from "@/lib/billing/limits"
import { BillingError } from "@/lib/utils/errors"
import type { WorkspacePlan } from "@prisma/client"

export async function enforceRepoLimit(workspaceId: string) {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: { _count: { select: { repositories: true } } },
  })
  if (!workspace) throw new Error("Workspace not found")

  const result = checkLimit(workspace.plan, "maxRepositories", workspace._count.repositories)
  if (!result.allowed) {
    throw new BillingError(
      `Repository limit reached (${result.current}/${result.limit}). Upgrade your plan to connect more repositories.`,
    )
  }
}

export async function enforceMemberLimit(workspaceId: string) {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: { _count: { select: { members: true } } },
  })
  if (!workspace) throw new Error("Workspace not found")

  const result = checkLimit(workspace.plan, "maxMembers", workspace._count.members)
  if (!result.allowed) {
    throw new BillingError(
      `Team member limit reached (${result.current}/${result.limit}). Upgrade your plan to invite more members.`,
    )
  }
}

export async function enforceAIGenerationLimit(workspaceId: string, count = 1) {
  const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } })
  if (!workspace) throw new Error("Workspace not found")

  const result = checkLimit(workspace.plan, "maxAIGenerations", workspace.aiGenerationsUsed + count)
  if (!result.allowed) {
    throw new BillingError(
      `AI generation limit reached (${workspace.aiGenerationsUsed}/${result.limit} this billing cycle). Upgrade your plan for more generations.`,
    )
  }
}

export async function incrementAIUsage(workspaceId: string, count = 1) {
  await prisma.workspace.update({
    where: { id: workspaceId },
    data: { aiGenerationsUsed: { increment: count } },
  })
}

export function requireFeature(plan: WorkspacePlan, feature: keyof ReturnType<typeof getPlanLimits>) {
  const limits = getPlanLimits(plan)
  if (!limits[feature]) {
    throw new BillingError(`This feature requires a higher plan. Please upgrade.`)
  }
}
