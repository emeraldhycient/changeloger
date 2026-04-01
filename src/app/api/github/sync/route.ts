import { NextRequest } from "next/server"
import { requireAuth } from "@/lib/auth/middleware"
import { prisma } from "@/lib/db/prisma"
import { handleApiError, ValidationError } from "@/lib/utils/errors"

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth()
    const body = await request.json()
    const workspaceId = body.workspaceId

    if (!workspaceId) throw new ValidationError("workspaceId is required")

    // Get the installation for this workspace
    const installation = await prisma.githubInstallation.findFirst({
      where: { workspaceId },
    })

    if (!installation) {
      throw new ValidationError("No GitHub App installation found. Click 'Connect GitHub Repository' to install the GitHub App first.")
    }

    // Method 1: Use GitHub App installation token (primary — works for all users)
    if (process.env.GITHUB_APP_ID && process.env.GITHUB_APP_PRIVATE_KEY) {
      try {
        const { syncInstallationRepos } = await import("@/lib/github/installation")
        await syncInstallationRepos(installation.installationId, workspaceId)

        // Update account login if still pending
        if (installation.accountLogin === "pending-sync" || installation.accountLogin === "syncing") {
          const repo = await prisma.repository.findFirst({ where: { workspaceId } })
          if (repo) {
            const login = repo.fullName.split("/")[0]
            await prisma.githubInstallation.update({
              where: { id: installation.id },
              data: { accountLogin: login },
            })
          }
        }

        const repos = await prisma.repository.findMany({ where: { workspaceId } })
        return Response.json({ synced: repos.length, method: "app" })
      } catch (err) {
        console.error("App-based sync failed:", err)
        // Fall through to OAuth method
      }
    }

    // Method 2: Use user's GitHub OAuth token (fallback)
    const oauthAccount = await prisma.oAuthAccount.findFirst({
      where: { userId: session.userId, provider: "github" },
    })

    if (!oauthAccount?.accessToken) {
      throw new ValidationError(
        "GitHub App sync failed and no GitHub OAuth token available. " +
        "Ensure GITHUB_APP_ID and GITHUB_APP_PRIVATE_KEY are set in your environment, " +
        "or sign in with GitHub to use OAuth-based sync."
      )
    }

    const { createGitHubClient } = await import("@/lib/github/client")
    const client = createGitHubClient(oauthAccount.accessToken)
    const repos = await client.getRepos()

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
