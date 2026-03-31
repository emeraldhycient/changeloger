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
      case "installation_repositories":
        // Handled via callback flow, not webhook
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
