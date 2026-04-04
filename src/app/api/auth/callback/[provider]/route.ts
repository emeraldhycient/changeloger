import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import {
  exchangeGoogleCode,
  exchangeGitHubCode,
  handleOAuthCallback,
} from "@/lib/auth/oauth"
import { prisma } from "@/lib/db/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> },
) {
  try {
    const { provider } = await params
    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")
    const state = searchParams.get("state")
    const error = searchParams.get("error")

    // GitHub App installation params (sent alongside OAuth when
    // "Request user authorization during installation" is enabled)
    const installationId = searchParams.get("installation_id")
    const setupAction = searchParams.get("setup_action")

    // Handle provider errors (user denied access, etc.)
    if (error) {
      return NextResponse.redirect(
        new URL(`/sign-in?error=${error}`, request.url),
      )
    }

    if (!code) {
      return NextResponse.redirect(
        new URL("/sign-in?error=missing_code", request.url),
      )
    }

    // Verify CSRF state
    const cookieStore = await cookies()
    const savedState = cookieStore.get("oauth_state")?.value
    cookieStore.delete("oauth_state")

    if (!state || !savedState || state !== savedState) {
      return NextResponse.redirect(
        new URL("/sign-in?error=invalid_state", request.url),
      )
    }

    let userInfo
    if (provider === "google") {
      userInfo = await exchangeGoogleCode(code)
    } else if (provider === "github") {
      userInfo = await exchangeGitHubCode(code)
    } else {
      return NextResponse.redirect(
        new URL("/sign-in?error=invalid_provider", request.url),
      )
    }

    const userId = await handleOAuthCallback(userInfo)

    // ── Handle GitHub App installation if present ──────────────────
    // When "Request user authorization (OAuth) during installation" is
    // enabled on the GitHub App, the installation callback comes here
    // instead of the Setup URL. We process it after the OAuth login.
    if (provider === "github" && installationId && setupAction) {
      try {
        const numericId = parseInt(installationId, 10)

        // Find a workspace where this user is owner or admin
        const membership = await prisma.workspaceMember.findFirst({
          where: { userId, role: { in: ["owner", "admin"] } },
        })

        if (membership) {
          const workspaceId = membership.workspaceId

          // Create or update installation record
          await prisma.githubInstallation.upsert({
            where: { installationId: numericId },
            update: { workspaceId },
            create: {
              installationId: numericId,
              workspaceId,
              accountLogin: "syncing",
              accountType: "User",
            },
          })

          console.log("[OAuth+Install] Created installation record:", numericId, "for workspace:", workspaceId)

          // Try to sync repos
          try {
            if (process.env.GITHUB_APP_ID && process.env.GITHUB_APP_PRIVATE_KEY) {
              const { syncInstallationRepos } = await import("@/lib/github/installation")
              await syncInstallationRepos(numericId, workspaceId)
              console.log("[OAuth+Install] Repos synced via app token")
            } else if (userInfo.accessToken) {
              // Fallback: use the OAuth token we just got
              const { createGitHubClient } = await import("@/lib/github/client")
              const client = createGitHubClient(userInfo.accessToken)
              const repos = await client.getRepos()

              const installation = await prisma.githubInstallation.findUnique({
                where: { installationId: numericId },
              })

              if (installation) {
                const login = repos[0]?.owner?.login
                if (login) {
                  await prisma.githubInstallation.update({
                    where: { installationId: numericId },
                    data: { accountLogin: login },
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
                console.log("[OAuth+Install] Repos synced via OAuth token:", repos.length)
              }
            }
          } catch (syncErr) {
            console.error("[OAuth+Install] Repo sync failed:", syncErr)
            // Continue — user is logged in, they can sync manually
          }

          // Redirect to repositories page with success
          return NextResponse.redirect(
            new URL("/dashboard/repositories?setup=complete", request.url),
          )
        }
      } catch (installErr) {
        console.error("[OAuth+Install] Installation handling failed:", installErr)
        // Continue to normal redirect — at least the user is logged in
      }
    }

    return NextResponse.redirect(new URL("/dashboard", request.url))
  } catch (error) {
    console.error("OAuth callback error:", error)
    return NextResponse.redirect(
      new URL("/sign-in?error=auth_failed", request.url),
    )
  }
}
