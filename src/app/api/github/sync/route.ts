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

    // ── Find the GitHub App installation ────────────────────────
    let installation = await prisma.githubInstallation.findFirst({
      where: { workspaceId },
    })

    // Check other workspaces the user owns — re-link if found
    if (!installation) {
      const userWorkspaces = await prisma.workspaceMember.findMany({
        where: { userId: session.userId, role: { in: ["owner", "admin"] } },
        select: { workspaceId: true },
      })
      const otherInstallation = await prisma.githubInstallation.findFirst({
        where: { workspaceId: { in: userWorkspaces.map((w) => w.workspaceId) } },
      })
      if (otherInstallation) {
        installation = await prisma.githubInstallation.update({
          where: { id: otherInstallation.id },
          data: { workspaceId },
        })
        // Also re-link any repos from the old workspace
        await prisma.repository.updateMany({
          where: { githubInstallationId: installation.id },
          data: { workspaceId },
        })
        console.log("[Sync] Re-linked installation", otherInstallation.installationId, "to workspace", workspaceId)
      }
    }

    // Try discovering installation via GitHub user API (for OAuth users)
    if (!installation) {
      const oauthAccount = await prisma.oAuthAccount.findFirst({
        where: { userId: session.userId, provider: "github" },
      })

      if (oauthAccount?.accessToken) {
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
            const appId = process.env.GITHUB_APP_ID
            const found = appId
              ? installations.find((i: { app_id: number }) => String(i.app_id) === appId)
              : installations[0]

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
              console.log("[Sync] Discovered installation from GitHub API:", found.id)
            }
          }
        } catch (err) {
          console.error("[Sync] Failed to discover installations:", err)
        }
      }

      if (!installation) {
        throw new ValidationError(
          "No GitHub App installation found. Click 'Connect GitHub Repository' to install the GitHub App on your account first."
        )
      }
    }

    // ── Sync repos using the App installation token ─────────────
    // This correctly scopes to ONLY repos the app has access to,
    // NOT all user repos. Works for ALL users (Gmail or GitHub OAuth).
    if (!process.env.GITHUB_APP_ID || !process.env.GITHUB_APP_PRIVATE_KEY) {
      throw new ValidationError(
        "GitHub App credentials (GITHUB_APP_ID, GITHUB_APP_PRIVATE_KEY) are not configured on the server."
      )
    }

    const { syncInstallationRepos } = await import("@/lib/github/installation")
    await syncInstallationRepos(installation.installationId, workspaceId)

    // Update account login if pending
    if (installation.accountLogin === "pending-sync" || installation.accountLogin === "syncing" || installation.accountLogin === "unknown") {
      const repo = await prisma.repository.findFirst({ where: { workspaceId } })
      if (repo) {
        await prisma.githubInstallation.update({
          where: { id: installation.id },
          data: { accountLogin: repo.fullName.split("/")[0] },
        })
      }
    }

    const repos = await prisma.repository.findMany({ where: { workspaceId } })
    return Response.json({ synced: repos.length, method: "app" })
  } catch (error) {
    return handleApiError(error)
  }
}
