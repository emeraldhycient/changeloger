import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth/middleware"
import { prisma } from "@/lib/db/prisma"
import { syncInstallationRepos } from "@/lib/github/installation"
import { handleApiError } from "@/lib/utils/errors"

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth()
    const { searchParams } = new URL(request.url)
    const installationId = searchParams.get("installation_id")
    const setupAction = searchParams.get("setup_action")
    const stateWorkspaceId = searchParams.get("state") // workspace ID from the connect button

    if (!installationId || setupAction !== "install") {
      return NextResponse.redirect(new URL("/dashboard/repositories?error=invalid_callback", request.url))
    }

    let workspaceId: string | null = null

    // 1. Try workspace from state param (passed via connect button)
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

    // Create or update installation record
    const numericId = parseInt(installationId, 10)
    await prisma.githubInstallation.upsert({
      where: { installationId: numericId },
      update: { workspaceId },
      create: {
        installationId: numericId,
        workspaceId,
        accountLogin: "pending-sync",
        accountType: "User",
      },
    })

    // Sync repos from GitHub
    try {
      await syncInstallationRepos(numericId, workspaceId)
    } catch (syncError) {
      console.error("Repo sync error:", syncError)
      // Still redirect — repos can be synced later
      return NextResponse.redirect(
        new URL("/dashboard/repositories?setup=complete&sync_warning=true", request.url),
      )
    }

    return NextResponse.redirect(new URL("/dashboard/repositories?setup=complete", request.url))
  } catch (error) {
    console.error("Installation callback error:", error)
    return NextResponse.redirect(
      new URL("/dashboard/repositories?error=installation_failed", request.url),
    )
  }
}
