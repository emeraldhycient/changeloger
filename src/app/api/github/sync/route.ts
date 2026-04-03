import { NextRequest } from "next/server"
import { requireWorkspaceRole } from "@/lib/auth/middleware"
import { prisma } from "@/lib/db/prisma"
import { handleApiError, ValidationError } from "@/lib/utils/errors"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const workspaceId = body.workspaceId

    if (!workspaceId) throw new ValidationError("workspaceId is required")
    const { session } = await requireWorkspaceRole(workspaceId, "admin")

    // Get the installation for this workspace
    let installation = await prisma.githubInstallation.findFirst({
      where: { workspaceId },
    })

    // If no installation record exists, check if the user has a GitHub OAuth token
    // and try to discover installations via the GitHub API
    if (!installation) {
      const oauthAccount = await prisma.oAuthAccount.findFirst({
        where: { userId: session.userId, provider: "github" },
      })

      if (oauthAccount?.accessToken) {
        // Try to find installations via GitHub user API
        try {
          const res = await fetch("https://api.github.com/user/installations", {
            headers: {
              Authorization: `Bearer ${oauthAccount.accessToken}`,
              Accept: "application/vnd.github+json",
            },
          })
          if (res.ok) {
            const data = await res.json()
            const installations = data.installations || []
            // Find the changeloger app installation
            const appId = process.env.GITHUB_APP_ID
            const found = appId
              ? installations.find((i: { app_id: number }) => String(i.app_id) === appId)
              : installations[0] // fallback to first installation

            if (found) {
              installation = await prisma.githubInstallation.upsert({
                where: { installationId: found.id },
                update: { workspaceId },
                create: {
                  installationId: found.id,
                  workspaceId,
                  accountLogin: found.account?.login || "unknown",
                  accountType: found.target_type || "User",
                },
              })
              console.log("[Sync] Created installation record from GitHub API:", found.id)
            }
          }
        } catch (err) {
          console.error("[Sync] Failed to discover installations:", err)
        }
      }

      if (!installation) {
        throw new ValidationError(
          "No GitHub App installation found. Click 'Connect GitHub Repository' to install the GitHub App first."
        )
      }
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
        console.error("[Sync] App-based sync failed:", err)
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
        "Ensure GITHUB_APP_ID and GITHUB_APP_PRIVATE_KEY are set, " +
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
