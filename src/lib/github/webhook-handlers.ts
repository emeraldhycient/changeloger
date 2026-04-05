import { prisma } from "@/lib/db/prisma"

/** Extract commit body from full message. Handles multi-line commit messages. */
export function extractCommitBody(message: string): string | null {
  const lines = message.split("\n")
  if (lines.length <= 1) return null

  // Find the first blank line (separator between subject and body)
  const blankIndex = lines.findIndex((line, i) => i > 0 && line.trim() === "")
  if (blankIndex === -1) {
    // No blank separator — everything after first line is body
    const rest = lines.slice(1).join("\n").trim()
    return rest || null
  }

  // Body starts after the blank line
  const body = lines.slice(blankIndex + 1).join("\n").trim()
  return body || null
}

/**
 * Find a workspace to link an installation to.
 * Tries: GitHub OAuth user match -> any workspace owner (fallback).
 */
export async function findWorkspaceForSender(senderId?: number, senderLogin?: string): Promise<string | null> {
  // Method 1: Match by GitHub OAuth providerUserId
  if (senderId) {
    const oauth = await prisma.oAuthAccount.findFirst({
      where: { provider: "github", providerUserId: String(senderId) },
      select: { userId: true },
    })
    if (oauth) {
      const membership = await prisma.workspaceMember.findFirst({
        where: { userId: oauth.userId, role: { in: ["owner", "admin"] } },
      })
      if (membership) return membership.workspaceId
    }
  }

  // Method 2: Match by noreply email pattern (for users with private GitHub emails)
  if (senderId && senderLogin) {
    const user = await prisma.user.findFirst({
      where: { email: { contains: `${senderId}+${senderLogin}` } },
      select: { id: true },
    })
    if (user) {
      const membership = await prisma.workspaceMember.findFirst({
        where: { userId: user.id, role: { in: ["owner", "admin"] } },
      })
      if (membership) return membership.workspaceId
    }
  }

  // Method 3: Any user with a GitHub OAuth account
  const anyGithubOauth = await prisma.oAuthAccount.findFirst({
    where: { provider: "github" },
    select: { userId: true },
  })
  if (anyGithubOauth) {
    const membership = await prisma.workspaceMember.findFirst({
      where: { userId: anyGithubOauth.userId, role: { in: ["owner", "admin"] } },
    })
    if (membership) return membership.workspaceId
  }

  // Method 4: Any workspace owner at all (absolute last resort)
  const anyOwner = await prisma.workspaceMember.findFirst({
    where: { role: "owner" },
    select: { workspaceId: true },
  })
  return anyOwner?.workspaceId || null
}

/** Sync repos from a webhook payload into the database. */
export async function syncReposFromPayload(
  installationDbId: string,
  workspaceId: string,
  repos: Array<{
    id: number
    name: string
    full_name: string
    private?: boolean
    default_branch?: string
    language?: string | null
  }>,
) {
  for (const repo of repos) {
    await prisma.repository.upsert({
      where: {
        workspaceId_githubRepoId: {
          workspaceId,
          githubRepoId: repo.id,
        },
      },
      update: {
        name: repo.name,
        fullName: repo.full_name,
        defaultBranch: repo.default_branch || "main",
        language: repo.language || null,
        isActive: true,
      },
      create: {
        workspaceId,
        githubInstallationId: installationDbId,
        githubRepoId: repo.id,
        name: repo.name,
        fullName: repo.full_name,
        defaultBranch: repo.default_branch || "main",
        language: repo.language || null,
      },
    })
  }
}
