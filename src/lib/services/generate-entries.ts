import { prisma } from "@/lib/db/prisma"
import { findUnprocessedByRepo, findUnprocessedByWorkspace, markAsProcessed } from "@/lib/db/queries/change-records"
import { analyzeCommits } from "@/lib/engines/commit-analyzer"
import type { RawCommit, GeneratedEntry } from "@/lib/engines/types"
import type { ChangeCategory, ImpactLevel } from "@prisma/client"

interface GenerateOptions {
  releaseId: string
  workspaceId: string
  repositoryId?: string
  useAI?: boolean
  limit?: number
}

interface GenerateResult {
  entries: Array<{ id: string; category: string; title: string }>
  processedCount: number
  method: "ai" | "rule-based"
}

const VALID_CATEGORIES: Set<string> = new Set([
  "added", "fixed", "changed", "removed", "deprecated",
  "security", "performance", "documentation", "maintenance", "breaking",
])
const VALID_IMPACTS: Set<string> = new Set([
  "critical", "high", "medium", "low", "negligible",
])

export async function generateEntriesFromChanges(options: GenerateOptions): Promise<GenerateResult> {
  const { releaseId, workspaceId, repositoryId, useAI = true, limit = 200 } = options

  // 1. Fetch unprocessed change records
  const records = repositoryId
    ? await findUnprocessedByRepo(repositoryId, limit)
    : await findUnprocessedByWorkspace(workspaceId, limit)

  console.log("[Generate] Found", records.length, "unprocessed records for release", releaseId)

  if (records.length === 0) {
    return { entries: [], processedCount: 0, method: "rule-based" }
  }

  // 2. Convert ChangeRecords to RawCommit format
  const rawCommits: RawCommit[] = records.map((r) => {
    const authors = r.authors as Array<{ name: string; email: string; username?: string }> | null
    const files = r.filesChanged as { added?: string[]; removed?: string[]; modified?: string[] } | null
    return {
      sha: r.commitSha || r.id,
      message: r.body ? `${r.subject}\n\n${r.body}` : r.subject,
      author: authors?.[0] || { name: "Unknown", email: "" },
      timestamp: r.timestamp.toISOString(),
      filesChanged: files ? {
        added: files.added || [],
        removed: files.removed || [],
        modified: files.modified || [],
      } : undefined,
    }
  })

  // 3. Run commit analyzer (rule-based — always works, always produces entries)
  const ruleBasedEntries: GeneratedEntry[] = analyzeCommits(rawCommits)
  console.log("[Generate] Rule-based analyzer produced", ruleBasedEntries.length, "entries from", rawCommits.length, "commits")

  // 4. Try AI summarization if requested AND we have enough commits to justify it
  let finalEntries = ruleBasedEntries
  let method: "ai" | "rule-based" = "rule-based"

  if (useAI && process.env.OPENAI_API_KEY && rawCommits.length >= 3) {
    try {
      const { enforceAIGenerationLimit, incrementAIUsage } = await import("@/lib/middleware/plan-enforcement")
      await enforceAIGenerationLimit(workspaceId, ruleBasedEntries.length)

      const { createOpenAIProvider } = await import("@/lib/ai/openai")
      const ai = createOpenAIProvider(process.env.OPENAI_API_KEY)

      const parsedCommits = rawCommits.map((rc) => {
        const lines = rc.message.split("\n")
        const firstLine = lines[0]
        const typeMatch = firstLine.match(/^(\w+)(?:\([^)]*\))?!?:\s*(.+)/)
        return {
          sha: rc.sha,
          type: typeMatch?.[1] || null,
          scope: null,
          subject: typeMatch?.[2] || firstLine,
          body: lines.length > 2 ? lines.slice(2).join("\n") : null,
          breaking: firstLine.includes("!:") || rc.message.includes("BREAKING CHANGE"),
          breakingDescription: null,
          footers: {},
          authors: [rc.author],
          timestamp: rc.timestamp,
          filesChanged: rc.filesChanged ? [
            ...rc.filesChanged.added,
            ...rc.filesChanged.modified,
            ...rc.filesChanged.removed,
          ] : [],
          isMerge: false,
          prNumber: null,
          sourceBranch: null,
        }
      })

      const aiEntries = await ai.summarizeCommits(parsedCommits)
      console.log("[Generate] AI produced", aiEntries.length, "entries")
      if (aiEntries.length > 0) {
        finalEntries = aiEntries
        method = "ai"
      }

      await incrementAIUsage(workspaceId, aiEntries.length)
    } catch (err) {
      console.warn("[Generate] AI failed, using rule-based:", (err as Error).message)
    }
  }

  // 5. Ensure we always have at least one entry per commit (fallback)
  if (finalEntries.length === 0 && rawCommits.length > 0) {
    console.log("[Generate] No entries from analyzer, creating direct entries from commits")
    finalEntries = rawCommits.map((rc) => {
      const firstLine = rc.message.split("\n")[0]
      const typeMatch = firstLine.match(/^(\w+)(?:\([^)]*\))?!?:\s*(.+)/)
      const type = typeMatch?.[1] || "changed"
      const subject = typeMatch?.[2] || firstLine
      const categoryMap: Record<string, string> = {
        feat: "added", fix: "fixed", perf: "performance", refactor: "changed",
        docs: "documentation", chore: "maintenance", build: "maintenance",
        ci: "maintenance", test: "maintenance", style: "maintenance",
        revert: "removed",
      }
      return {
        category: (categoryMap[type] || "changed") as GeneratedEntry["category"],
        title: subject,
        description: null,
        impact: "medium" as const,
        breaking: firstLine.includes("!:") || rc.message.includes("BREAKING CHANGE"),
        confidence: 0.9,
        authors: [rc.author],
        sourceCommitShas: [rc.sha],
      }
    })
  }

  // 6. Get current max position for the release
  const existingEntries = await prisma.changelogEntry.findMany({
    where: { releaseId },
    select: { position: true },
    orderBy: { position: "desc" },
    take: 1,
  })
  let nextPosition = (existingEntries[0]?.position ?? -1) + 1

  // 7. Create ChangelogEntry rows
  const createdEntries = []
  for (const entry of finalEntries) {
    try {
      const category = VALID_CATEGORIES.has(entry.category) ? entry.category : "changed"
      const impact = VALID_IMPACTS.has(entry.impact) ? entry.impact : "medium"

      const created = await prisma.changelogEntry.create({
        data: {
          releaseId,
          category: category as ChangeCategory,
          title: entry.title || "Untitled change",
          description: entry.description || null,
          impact: impact as ImpactLevel,
          breaking: entry.breaking || false,
          authors: (entry.authors as object) ?? [],
          sourceRecordIds: [],
          position: nextPosition++,
          reviewed: false,
        },
      })
      createdEntries.push({ id: created.id, category: created.category, title: created.title })
      console.log("[Generate] ✓ Created entry:", created.category, "-", created.title)
    } catch (err) {
      console.error("[Generate] ✗ Failed to create entry:", entry.title, "-", (err as Error).message)
    }
  }

  // 8. Mark all processed records
  await markAsProcessed(records.map((r) => r.id))

  console.log("[Generate] Complete:", createdEntries.length, "entries created,", records.length, "records processed, method:", method)

  return {
    entries: createdEntries,
    processedCount: records.length,
    method,
  }
}
