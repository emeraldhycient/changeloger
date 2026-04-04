import { NextRequest } from "next/server"
import { verifyWebhookSignature, parseEventType } from "@/lib/github/webhooks"
import { prisma } from "@/lib/db/prisma"
import type { PushEventPayload, CreateEventPayload, ReleaseEventPayload } from "@/lib/github/types"

export async function POST(request: NextRequest) {
  const secret = process.env.GITHUB_APP_WEBHOOK_SECRET
  if (!secret) {
    return Response.json({ error: "Webhook secret not configured" }, { status: 500 })
  }

  const body = await request.text()
  const signature = request.headers.get("x-hub-signature-256")

  if (!verifyWebhookSignature(body, signature, secret)) {
    return Response.json({ error: "Invalid signature" }, { status: 401 })
  }

  const eventType = parseEventType(request.headers)
  const payload = JSON.parse(body)

  try {
    switch (eventType) {
      case "push":
        await handlePushEvent(payload as PushEventPayload)
        break
      case "create":
        await handleCreateEvent(payload as CreateEventPayload)
        break
      case "release":
        await handleReleaseEvent(payload as ReleaseEventPayload)
        break
      case "installation":
        await handleInstallationEvent(payload)
        break
      case "installation_repositories":
        await handleInstallationRepositoriesEvent(payload)
        break
      default:
        // Ignore unhandled events
        break
    }

    return Response.json({ received: true })
  } catch (error) {
    console.error(`Webhook processing error (${eventType}):`, error)
    return Response.json({ error: "Processing failed" }, { status: 500 })
  }
}

async function handlePushEvent(payload: PushEventPayload) {
  if (!payload.installation?.id || payload.commits.length === 0) return

  const repo = await prisma.repository.findFirst({
    where: { githubRepoId: payload.repository.id, isActive: true },
  })
  if (!repo) return

  // Check if this is a monitored branch
  const ref = payload.ref.replace("refs/heads/", "")
  const config = (repo.config as Record<string, unknown>) || {}
  const monitoredBranches = (config.monitoredBranches as string[]) || [repo.defaultBranch]
  if (monitoredBranches.length > 0 && !monitoredBranches.includes(ref)) return

  // Create change records for each commit
  for (const commit of payload.commits) {
    const existing = await prisma.changeRecord.findFirst({
      where: { repositoryId: repo.id, commitSha: commit.id },
    })
    if (existing) continue

    await prisma.changeRecord.create({
      data: {
        repositoryId: repo.id,
        source: "commit",
        commitSha: commit.id,
        subject: commit.message.split("\n")[0],
        body: commit.message.split("\n").slice(2).join("\n") || null,
        filesChanged: {
          added: commit.added,
          removed: commit.removed,
          modified: commit.modified,
        },
        authors: [
          { name: commit.author.name, email: commit.author.email, username: commit.author.username },
        ],
        timestamp: new Date(commit.timestamp),
        breaking: commit.message.includes("BREAKING CHANGE") || /^[a-z]+(\(.+\))?!:/.test(commit.message),
      },
    })
  }
}

async function handleCreateEvent(payload: CreateEventPayload) {
  if (payload.ref_type !== "tag") return
  if (!payload.installation?.id) return

  const repo = await prisma.repository.findFirst({
    where: { githubRepoId: payload.repository.id, isActive: true },
  })
  if (!repo) return

  await prisma.changeRecord.create({
    data: {
      repositoryId: repo.id,
      source: "version",
      subject: `Tag created: ${payload.ref}`,
      authors: [{ name: payload.sender.login }],
      timestamp: new Date(),
      metadata: { tag: payload.ref, refType: payload.ref_type },
    },
  })
}

async function handleReleaseEvent(payload: ReleaseEventPayload) {
  if (payload.action !== "published") return

  const repo = await prisma.repository.findFirst({
    where: { githubRepoId: payload.repository.id, isActive: true },
  })
  if (!repo) return

  await prisma.changeRecord.create({
    data: {
      repositoryId: repo.id,
      source: "version",
      subject: `Release ${payload.release.tag_name}: ${payload.release.name || ""}`,
      body: payload.release.body,
      authors: [{ name: payload.release.author.login }],
      timestamp: new Date(payload.release.published_at || payload.release.created_at),
      metadata: {
        tag: payload.release.tag_name,
        releaseUrl: payload.release.html_url,
        prerelease: payload.release.prerelease,
      },
    },
  })
}

// ─── Installation events ──────────────────────────────────────────────────

interface InstallationPayload {
  action: string
  installation: {
    id: number
    account: { login: string; type?: string }
    target_type?: string
  }
  repositories?: Array<{
    id: number
    name: string
    full_name: string
    private: boolean
  }>
  sender: { login: string }
}

async function handleInstallationEvent(payload: InstallationPayload) {
  const { action, installation } = payload

  if (action === "created") {
    // New installation — create record if it doesn't exist
    // The workspace linking happens via the OAuth callback, but we can
    // update the account info here
    const existing = await prisma.githubInstallation.findUnique({
      where: { installationId: installation.id },
    })

    if (existing) {
      await prisma.githubInstallation.update({
        where: { installationId: installation.id },
        data: {
          accountLogin: installation.account.login,
          accountType: installation.target_type || "User",
        },
      })
      console.log("[Webhook] Updated installation:", installation.id, installation.account.login)

      // Sync initial repos if provided
      if (payload.repositories && payload.repositories.length > 0) {
        await syncReposFromPayload(existing.id, existing.workspaceId, payload.repositories)
      }
    }
  } else if (action === "deleted" || action === "suspend") {
    // Installation removed or suspended — deactivate repos
    const inst = await prisma.githubInstallation.findUnique({
      where: { installationId: installation.id },
    })
    if (inst) {
      await prisma.repository.updateMany({
        where: { githubInstallationId: inst.id },
        data: { isActive: false },
      })
      console.log("[Webhook] Deactivated repos for installation:", installation.id)
    }
  }
}

interface InstallationReposPayload {
  action: string
  installation: {
    id: number
    account: { login: string }
  }
  repository_selection: string
  repositories_added: Array<{
    id: number
    name: string
    full_name: string
    private: boolean
    default_branch?: string
    language?: string | null
  }>
  repositories_removed: Array<{
    id: number
    name: string
    full_name: string
  }>
}

async function handleInstallationRepositoriesEvent(payload: InstallationReposPayload) {
  const inst = await prisma.githubInstallation.findUnique({
    where: { installationId: payload.installation.id },
  })

  if (!inst) {
    console.log("[Webhook] No installation record for:", payload.installation.id, "— skipping repo sync")
    return
  }

  // Update account login
  if (inst.accountLogin === "pending-sync" || inst.accountLogin === "syncing") {
    await prisma.githubInstallation.update({
      where: { id: inst.id },
      data: { accountLogin: payload.installation.account.login },
    })
  }

  // Handle added repos
  if (payload.repositories_added && payload.repositories_added.length > 0) {
    await syncReposFromPayload(inst.id, inst.workspaceId, payload.repositories_added)
    console.log("[Webhook] Synced", payload.repositories_added.length, "added repos for installation:", payload.installation.id)
  }

  // Handle removed repos — deactivate them
  if (payload.repositories_removed && payload.repositories_removed.length > 0) {
    for (const repo of payload.repositories_removed) {
      await prisma.repository.updateMany({
        where: {
          workspaceId: inst.workspaceId,
          githubRepoId: repo.id,
        },
        data: { isActive: false },
      })
    }
    console.log("[Webhook] Deactivated", payload.repositories_removed.length, "removed repos")
  }
}

async function syncReposFromPayload(
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
