import { prisma } from "@/lib/db/prisma"
import { findUnprocessedByRepo, findUnprocessedByWorkspace, markAsProcessed } from "@/lib/db/queries/change-records"
import { parseConventionalCommit } from "@/lib/engines/commit-analyzer"
import { COMMIT_TYPE_TO_CATEGORY } from "@/lib/engines/types"
import type { RawCommit } from "@/lib/engines/types"
import type { ChangeCategory, ImpactLevel } from "@prisma/client"
import type { GenerateResult } from "@/types/models"

interface GenerateOptions {
  releaseId: string
  workspaceId: string
  repositoryId?: string
  useAI?: boolean
  limit?: number
}

interface PendingEntry {
  category: string
  title: string
  description: string | null
  impact: string
  breaking: boolean
  authors: unknown
  sourceRecordId: string
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

  // 2. Create ONE entry per commit (no grouping — each commit is its own entry)
  const pendingEntries: PendingEntry[] = records.map((r) => {
    const fullMessage = r.body ? `${r.subject}\n\n${r.body}` : r.subject
    const parsed = parseConventionalCommit(fullMessage)
    const type = parsed.type || "changed"
    const category = COMMIT_TYPE_TO_CATEGORY[type] || "changed"
    const authors = r.authors as Array<{ name: string; email: string }> | null

    // Use the commit body as the entry description
    const description = r.body?.trim() || parsed.body?.trim() || null

    return {
      category,
      title: parsed.subject,
      description,
      impact: parsed.breaking ? "critical" : "medium",
      breaking: parsed.breaking,
      authors: authors ?? [],
      sourceRecordId: r.id,
    }
  })

  console.log("[Generate] Parsed", pendingEntries.length, "entries from commits")

  // 3. Try AI summarization to improve titles/descriptions (optional)
  let finalEntries = pendingEntries
  let method: "ai" | "rule-based" = "rule-based"

  if (useAI && process.env.OPENAI_API_KEY && records.length >= 3) {
    try {
      const { enforceAIGenerationLimit, incrementAIUsage } = await import("@/lib/middleware/plan-enforcement")
      await enforceAIGenerationLimit(workspaceId, pendingEntries.length)

      const { createOpenAIProvider } = await import("@/lib/ai/openai")
      const ai = createOpenAIProvider(process.env.OPENAI_API_KEY)

      const parsedCommits = records.map((r) => {
        const parsed = parseConventionalCommit(r.subject + (r.body ? "\n\n" + r.body : ""))
        const authors = r.authors as Array<{ name: string; email: string; username?: string }> | null
        return {
          sha: r.commitSha || r.id,
          type: parsed.type,
          scope: parsed.scope,
          subject: parsed.subject,
          body: parsed.body,
          breaking: parsed.breaking,
          breakingDescription: null,
          footers: parsed.footers,
          authors: authors || [{ name: "Unknown", email: "" }],
          timestamp: r.timestamp.toISOString(),
          filesChanged: [] as string[],
          isMerge: false,
          prNumber: null,
          sourceBranch: null,
        }
      })

      const aiEntries = await ai.summarizeCommits(parsedCommits)
      console.log("[Generate] AI produced", aiEntries.length, "entries")

      // AI may return fewer entries (grouped) — we keep our 1-per-commit approach
      // but use AI titles if the count matches
      if (aiEntries.length === pendingEntries.length) {
        finalEntries = pendingEntries.map((pe, i) => ({
          ...pe,
          title: aiEntries[i].title || pe.title,
          description: aiEntries[i].description || pe.description,
          category: VALID_CATEGORIES.has(aiEntries[i].category) ? aiEntries[i].category : pe.category,
        }))
        method = "ai"
      }

      await incrementAIUsage(workspaceId, aiEntries.length)
    } catch (err) {
      console.warn("[Generate] AI failed, using rule-based:", (err as Error).message)
    }
  }

  // 4. Get current max position for the release
  const existingEntries = await prisma.changelogEntry.findMany({
    where: { releaseId },
    select: { position: true },
    orderBy: { position: "desc" },
    take: 1,
  })
  let nextPosition = (existingEntries[0]?.position ?? -1) + 1

  // 5. Create ChangelogEntry rows — one per commit
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
          sourceRecordIds: [entry.sourceRecordId],
          position: nextPosition++,
          reviewed: false,
        },
      })
      createdEntries.push({ id: created.id, category: created.category, title: created.title })
      console.log("[Generate] ✓", created.category, "-", created.title)
    } catch (err) {
      console.error("[Generate] ✗ Failed:", entry.title, "-", (err as Error).message)
    }
  }

  // 6. Mark all processed records
  await markAsProcessed(records.map((r) => r.id))

  console.log("[Generate] Complete:", createdEntries.length, "entries from", records.length, "commits, method:", method)

  return {
    entries: createdEntries,
    processedCount: records.length,
    method,
  }
}
