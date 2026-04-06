import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth/middleware"
import { prisma } from "@/lib/db/prisma"
import { handleApiError } from "@/lib/utils/errors"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const installationId = searchParams.get("installation_id")
    const setupAction = searchParams.get("setup_action")
    const stateWorkspaceId = searchParams.get("state")

    console.log("[GitHub Install] Callback received:", { installationId, setupAction, stateWorkspaceId })

    if (!installationId) {
      console.error("[GitHub Install] Missing installation_id")
      return NextResponse.redirect(new URL("/dashboard/repositories?error=invalid_callback", request.url))
    }

    // Accept any setup_action or none (GitHub doesn't always send it)
    if (setupAction && setupAction !== "install" && setupAction !== "update") {
      console.error("[GitHub Install] Unexpected setup_action:", setupAction)
      return NextResponse.redirect(new URL("/dashboard/repositories?error=invalid_callback", request.url))
    }

    let session
    try {
      session = await requireAuth()
    } catch {
      console.error("[GitHub Install] User not authenticated — session may have expired during GitHub redirect")
      return NextResponse.redirect(new URL("/sign-in?redirect=/dashboard/repositories&error=session_expired", request.url))
    }

    let workspaceId: string | null = null

    // 1. Try workspace from state param
    if (stateWorkspaceId) {
      const membership = await prisma.workspaceMember.findUnique({
        where: {
          workspaceId_userId: { workspaceId: stateWorkspaceId, userId: session.userId },
        },
      })
      if (membership && (membership.role === "owner" || membership.role === "admin")) {
        workspaceId = stateWorkspaceId
      }
    }

    // 2. Fall back to first admin/owner workspace
    if (!workspaceId) {
      const membership = await prisma.workspaceMember.findFirst({
        where: { userId: session.userId, role: { in: ["owner", "admin"] } },
      })
      workspaceId = membership?.workspaceId || null
    }

    if (!workspaceId) {
      return NextResponse.redirect(new URL("/dashboard/repositories?error=no_workspace", request.url))
    }

    const numericId = parseInt(installationId, 10)

    // Get the user's GitHub OAuth token for fallback repo fetching
    const oauthAccount = await prisma.oAuthAccount.findFirst({
      where: { userId: session.userId, provider: "github" },
    })

    // Create or update installation record
    console.log("[GitHub Install] Upserting installation:", { installationId: numericId, workspaceId })
    await prisma.githubInstallation.upsert({
      where: { installationId: numericId },
      update: { workspaceId },
      create: {
        installationId: numericId,
        workspaceId,
        accountLogin: oauthAccount ? "syncing" : "pending-sync",
        accountType: "User",
      },
    })
    console.log("[GitHub Install] Installation record created/updated")

    // Try syncing repos
    let syncSuccess = false

    // Method 1: Use GitHub App installation token (requires APP_ID + PRIVATE_KEY)
    if (process.env.GITHUB_APP_ID && process.env.GITHUB_APP_PRIVATE_KEY) {
      try {
        const { syncInstallationRepos } = await import("@/lib/github/installation")
        await syncInstallationRepos(numericId, workspaceId)
        syncSuccess = true
      } catch (err) {
        console.error("App-based sync failed:", err)
      }
    }

    // Method 2: Use user's OAuth token to fetch repos (fallback)
    if (!syncSuccess && oauthAccount?.accessToken) {
      try {
        const { createGitHubClient } = await import("@/lib/github/client")
        const client = createGitHubClient(oauthAccount.accessToken)
        const repos = await client.getRepos()

        const installation = await prisma.githubInstallation.findUnique({
          where: { installationId: numericId },
        })

        if (installation) {
          // Update account login from the GitHub user
          const userLogin = repos[0]?.owner?.login
          if (userLogin) {
            await prisma.githubInstallation.update({
              where: { installationId: numericId },
              data: { accountLogin: userLogin },
            })
          }

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
          }
          syncSuccess = true
        }
      } catch (err) {
        console.error("OAuth-based sync failed:", err)
      }
    }

    if (syncSuccess) {
      return NextResponse.redirect(new URL("/dashboard/repositories?setup=complete", request.url))
    }

    return NextResponse.redirect(
      new URL("/dashboard/repositories?setup=complete&sync_warning=true", request.url),
    )
  } catch (error) {
    console.error("Installation callback error:", error)
    return NextResponse.redirect(
      new URL("/dashboard/repositories?error=installation_failed", request.url),
    )
  }
}
