import { prisma } from "@/lib/db/prisma"
import { findUnprocessedByRepo, findUnprocessedByWorkspace, markAsProcessed } from "@/lib/db/queries/change-records"
import { createEntry } from "@/lib/db/queries/changelog-entries"
import { analyzeCommits } from "@/lib/engines/commit-analyzer"
import type { RawCommit } from "@/lib/engines/types"

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

export async function generateEntriesFromChanges(options: GenerateOptions): Promise<GenerateResult> {
  const { releaseId, workspaceId, repositoryId, useAI = true, limit = 200 } = options

  // 1. Fetch unprocessed change records
  const records = repositoryId
    ? await findUnprocessedByRepo(repositoryId, limit)
    : await findUnprocessedByWorkspace(workspaceId, limit)

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

  // 3. Run commit analyzer (rule-based — always works)
  const analyzed = analyzeCommits(rawCommits)

  // 4. Try AI summarization if requested
  let finalEntries = analyzed
  let method: "ai" | "rule-based" = "rule-based"

  if (useAI && process.env.OPENAI_API_KEY) {
    try {
      // Check AI limits
      const { enforceAIGenerationLimit, incrementAIUsage } = await import("@/lib/middleware/plan-enforcement")
      await enforceAIGenerationLimit(workspaceId, analyzed.length)

      // Run AI summarization
      const { createOpenAIProvider } = await import("@/lib/ai/openai")
      const ai = createOpenAIProvider(process.env.OPENAI_API_KEY)

      // Convert analyzed entries back to ParsedCommit format for AI
      const parsedCommits = rawCommits.map((rc) => {
        const lines = rc.message.split("\n")
        const firstLine = lines[0]
        // Simple parse for AI input
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
      if (aiEntries.length > 0) {
        finalEntries = aiEntries
        method = "ai"
      }

      // Track AI usage
      await incrementAIUsage(workspaceId, aiEntries.length)
    } catch (err) {
      // AI failed (limit exceeded, API error, etc.) — fall back to rule-based
      console.warn("[Generate] AI summarization failed, using rule-based:", (err as Error).message)
    }
  }

  // 5. Get current max position for the release
  const existingEntries = await prisma.changelogEntry.findMany({
    where: { releaseId },
    select: { position: true },
    orderBy: { position: "desc" },
    take: 1,
  })
  let nextPosition = (existingEntries[0]?.position ?? -1) + 1

  // 6. Create ChangelogEntry rows
  const createdEntries = []
  for (const entry of finalEntries) {
    const created = await createEntry({
      releaseId,
      category: entry.category,
      title: entry.title,
      description: entry.description || undefined,
      impact: entry.impact || undefined,
      breaking: entry.breaking,
      authors: entry.authors as unknown,
      sourceRecordIds: entry.sourceCommitShas
        ? records.filter((r) => entry.sourceCommitShas!.includes(r.commitSha || r.id)).map((r) => r.id)
        : records.map((r) => r.id).slice(0, Math.ceil(records.length / finalEntries.length)),
      position: nextPosition++,
    })
    createdEntries.push({ id: created.id, category: created.category, title: created.title })
  }

  // 7. Mark all processed records
  await markAsProcessed(records.map((r) => r.id))

  return {
    entries: createdEntries,
    processedCount: records.length,
    method,
  }
}
