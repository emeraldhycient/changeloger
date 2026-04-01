import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import dotenv from "dotenv"

dotenv.config()

const adapter = new PrismaPg(process.env.DATABASE_URL!)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("Seeding database...")

  // ── Demo User ────────────────────────────────────────────
  const demoUser = await prisma.user.upsert({
    where: { email: "demo@changeloger.dev" },
    update: {},
    create: {
      email: "demo@changeloger.dev",
      name: "Demo User",
      avatarUrl: null,
    },
  })
  console.log(`  User: ${demoUser.email} (${demoUser.id})`)

  // ── Free Workspace ───────────────────────────────────────
  const freeWorkspace = await prisma.workspace.upsert({
    where: { slug: "demo-free" },
    update: {},
    create: {
      name: "Free Workspace",
      slug: "demo-free",
      ownerId: demoUser.id,
      plan: "free",
      trialEndsAt: null,
      aiGenerationsUsed: 12,
    },
  })
  await prisma.workspaceMember.upsert({
    where: { workspaceId_userId: { workspaceId: freeWorkspace.id, userId: demoUser.id } },
    update: {},
    create: { workspaceId: freeWorkspace.id, userId: demoUser.id, role: "owner" },
  })
  console.log(`  Workspace: ${freeWorkspace.name} (${freeWorkspace.plan})`)

  // ── Pro Workspace ────────────────────────────────────────
  const proWorkspace = await prisma.workspace.upsert({
    where: { slug: "demo-pro" },
    update: {},
    create: {
      name: "Pro Workspace",
      slug: "demo-pro",
      ownerId: demoUser.id,
      plan: "pro",
      trialEndsAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      aiGenerationsUsed: 87,
    },
  })
  await prisma.workspaceMember.upsert({
    where: { workspaceId_userId: { workspaceId: proWorkspace.id, userId: demoUser.id } },
    update: {},
    create: { workspaceId: proWorkspace.id, userId: demoUser.id, role: "owner" },
  })
  console.log(`  Workspace: ${proWorkspace.name} (${proWorkspace.plan})`)

  // ── Team Workspace ───────────────────────────────────────
  const teamWorkspace = await prisma.workspace.upsert({
    where: { slug: "demo-team" },
    update: {},
    create: {
      name: "Acme Engineering",
      slug: "demo-team",
      ownerId: demoUser.id,
      plan: "team",
      trialEndsAt: null,
      aiGenerationsUsed: 342,
    },
  })
  await prisma.workspaceMember.upsert({
    where: { workspaceId_userId: { workspaceId: teamWorkspace.id, userId: demoUser.id } },
    update: {},
    create: { workspaceId: teamWorkspace.id, userId: demoUser.id, role: "owner" },
  })
  console.log(`  Workspace: ${teamWorkspace.name} (${teamWorkspace.plan})`)

  // ── Extra team members for the Team workspace ────────────
  const teamMembers = [
    { email: "alice@acme.dev", name: "Alice Chen", role: "admin" as const },
    { email: "bob@acme.dev", name: "Bob Rivera", role: "editor" as const },
    { email: "carol@acme.dev", name: "Carol Park", role: "viewer" as const },
  ]

  for (const member of teamMembers) {
    const user = await prisma.user.upsert({
      where: { email: member.email },
      update: {},
      create: { email: member.email, name: member.name },
    })
    await prisma.workspaceMember.upsert({
      where: { workspaceId_userId: { workspaceId: teamWorkspace.id, userId: user.id } },
      update: {},
      create: { workspaceId: teamWorkspace.id, userId: user.id, role: member.role },
    })
    console.log(`  Member: ${member.name} (${member.role}) in ${teamWorkspace.name}`)
  }

  // ── Sample Repository (Team workspace) ───────────────────
  const sampleRepo = await prisma.repository.upsert({
    where: { workspaceId_githubRepoId: { workspaceId: teamWorkspace.id, githubRepoId: 999001 } },
    update: {},
    create: {
      workspaceId: teamWorkspace.id,
      githubInstallationId: (await getOrCreateInstallation(teamWorkspace.id)).id,
      githubRepoId: 999001,
      name: "acme-web",
      fullName: "acme-corp/acme-web",
      defaultBranch: "main",
      language: "TypeScript",
      isActive: true,
    },
  })
  console.log(`  Repository: ${sampleRepo.fullName}`)

  // ── Sample Release with entries ──────────────────────────
  const release = await prisma.release.upsert({
    where: { workspaceId_version: { workspaceId: teamWorkspace.id, version: "1.2.0" } },
    update: {},
    create: {
      workspaceId: teamWorkspace.id,
      repositoryId: sampleRepo.id,
      version: "1.2.0",
      status: "published",
      publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      publishedBy: demoUser.id,
      summary: "OAuth support, API fixes, and dashboard improvements.",
    },
  })

  const entries = [
    { category: "added" as const, title: "OAuth 2.0 sign-in with Google and GitHub", impact: "high" as const, position: 0 },
    { category: "added" as const, title: "Webhook notifications for changelog publish events", impact: "medium" as const, position: 1 },
    { category: "fixed" as const, title: "API rate limiting now respects per-org quotas", impact: "high" as const, position: 2 },
    { category: "fixed" as const, title: "Dashboard graphs no longer flicker on time range change", impact: "low" as const, position: 3 },
    { category: "changed" as const, title: "Dashboard layout updated to responsive two-column grid", impact: "medium" as const, position: 4 },
    { category: "security" as const, title: "Patched XSS vulnerability in widget embed renderer", impact: "critical" as const, breaking: true, position: 5 },
  ]

  for (const entry of entries) {
    await prisma.changelogEntry.upsert({
      where: { id: `seed-entry-${release.id}-${entry.position}` },
      update: {},
      create: {
        releaseId: release.id,
        category: entry.category,
        title: entry.title,
        impact: entry.impact,
        breaking: entry.breaking ?? false,
        position: entry.position,
        reviewed: true,
        authors: [{ name: "Demo User", email: "demo@changeloger.dev" }],
      },
    }).catch(() => {
      // Ignore duplicate — upsert by generated id won't work, just skip
    })
  }
  // Create entries without upsert for simplicity
  const existingEntries = await prisma.changelogEntry.count({ where: { releaseId: release.id } })
  if (existingEntries === 0) {
    for (const entry of entries) {
      await prisma.changelogEntry.create({
        data: {
          releaseId: release.id,
          category: entry.category,
          title: entry.title,
          impact: entry.impact,
          breaking: entry.breaking ?? false,
          position: entry.position,
          reviewed: true,
          authors: [{ name: "Demo User", email: "demo@changeloger.dev" }],
        },
      })
    }
  }
  console.log(`  Release: v${release.version} with ${entries.length} entries`)

  // ── Draft release ────────────────────────────────────────
  await prisma.release.upsert({
    where: { workspaceId_version: { workspaceId: teamWorkspace.id, version: "1.3.0" } },
    update: {},
    create: {
      workspaceId: teamWorkspace.id,
      repositoryId: sampleRepo.id,
      version: "1.3.0",
      status: "draft",
      summary: null,
    },
  })
  console.log(`  Draft: v1.3.0`)

  // ── Widget ───────────────────────────────────────────────
  const existingWidget = await prisma.widget.findFirst({ where: { repositoryId: sampleRepo.id } })
  if (!existingWidget) {
    await prisma.widget.create({
      data: {
        workspaceId: teamWorkspace.id,
        repositoryId: sampleRepo.id,
        type: "page",
        config: { primaryColor: "#6C63FF", darkMode: true },
      },
    })
    console.log(`  Widget: page widget created`)
  }

  console.log("\nSeed complete!")
}

async function getOrCreateInstallation(workspaceId: string) {
  const existing = await prisma.githubInstallation.findFirst({ where: { workspaceId } })
  if (existing) return existing

  return prisma.githubInstallation.create({
    data: {
      workspaceId,
      installationId: 999999,
      accountLogin: "acme-corp",
      accountType: "Organization",
    },
  })
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error("Seed error:", e)
    prisma.$disconnect()
    process.exit(1)
  })
