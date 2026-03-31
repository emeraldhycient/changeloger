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

    if (!installationId || setupAction !== "install") {
      return NextResponse.redirect(new URL("/dashboard/repositories?error=invalid_callback", request.url))
    }

    // Find workspace for this user
    const membership = await prisma.workspaceMember.findFirst({
      where: { userId: session.userId, role: { in: ["owner", "admin"] } },
      include: { workspace: true },
    })

    if (!membership) {
      return NextResponse.redirect(new URL("/dashboard/repositories?error=no_workspace", request.url))
    }

    // Create or update installation record
    const numericId = parseInt(installationId, 10)
    await prisma.githubInstallation.upsert({
      where: { installationId: numericId },
      update: { workspaceId: membership.workspaceId },
      create: {
        installationId: numericId,
        workspaceId: membership.workspaceId,
        accountLogin: "pending-sync",
        accountType: "User",
      },
    })

    // Sync repos from GitHub
    await syncInstallationRepos(numericId, membership.workspaceId)

    return NextResponse.redirect(new URL("/dashboard/repositories?setup=complete", request.url))
  } catch (error) {
    console.error("Installation callback error:", error)
    return handleApiError(error)
  }
}
