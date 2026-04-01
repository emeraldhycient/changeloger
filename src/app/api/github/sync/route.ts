import { NextRequest } from "next/server"
import { requireAuth } from "@/lib/auth/middleware"
import { prisma } from "@/lib/db/prisma"
import { createGitHubClient } from "@/lib/github/client"
import { handleApiError, ValidationError } from "@/lib/utils/errors"

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth()
    const body = await request.json()
    const workspaceId = body.workspaceId

    if (!workspaceId) throw new ValidationError("workspaceId is required")

    // Get user's GitHub OAuth token
    const oauthAccount = await prisma.oAuthAccount.findFirst({
      where: { userId: session.userId, provider: "github" },
    })

    if (!oauthAccount?.accessToken) {
      throw new ValidationError("No GitHub account connected. Sign in with GitHub first.")
    }

    // Get the installation for this workspace
    const installation = await prisma.githubInstallation.findFirst({
      where: { workspaceId },
    })

    if (!installation) {
      throw new ValidationError("No GitHub App installation found. Click 'Connect GitHub Repository' first.")
    }

    // Method 1: Try app-based sync
    if (process.env.GITHUB_APP_ID && process.env.GITHUB_APP_PRIVATE_KEY) {
      try {
        const { syncInstallationRepos } = await import("@/lib/github/installation")
        await syncInstallationRepos(installation.installationId, workspaceId)

        const repos = await prisma.repository.findMany({ where: { workspaceId } })
        return Response.json({ synced: repos.length, method: "app" })
      } catch (err) {
        console.error("App sync failed, falling back to OAuth:", err)
      }
    }

    // Method 2: OAuth-based sync
    const client = createGitHubClient(oauthAccount.accessToken)
    const repos = await client.getRepos()

    // Update installation account login
    const userLogin = repos[0]?.owner?.login
    if (userLogin && installation.accountLogin !== userLogin) {
      await prisma.githubInstallation.update({
        where: { id: installation.id },
        data: { accountLogin: userLogin },
      })
    }

    let syncedCount = 0
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
          defaultBranch: repo.default_branch,
          language: repo.language,
        },
        create: {
          workspaceId,
          githubInstallationId: installation.id,
          githubRepoId: repo.id,
          name: repo.name,
          fullName: repo.full_name,
          defaultBranch: repo.default_branch,
          language: repo.language,
        },
      })
      syncedCount++
    }

    return Response.json({ synced: syncedCount, method: "oauth" })
  } catch (error) {
    return handleApiError(error)
  }
}
