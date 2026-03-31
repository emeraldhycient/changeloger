import OpenAI from "openai"
import type { AIProvider } from "./types"
import type { ParsedCommit, StructuralChange, GeneratedEntry } from "@/lib/engines/types"

export function createOpenAIProvider(apiKey: string, model = "gpt-4o-mini"): AIProvider {
  const client = new OpenAI({ apiKey })

  return {
    name: "openai",

    async summarizeCommits(commits: ParsedCommit[]): Promise<GeneratedEntry[]> {
      const commitList = commits
        .map((c) => `- [${c.type || "unknown"}] ${c.subject}${c.scope ? ` (${c.scope})` : ""}${c.breaking ? " [BREAKING]" : ""}`)
        .join("\n")

      const response = await client.chat.completions.create({
        model,
        messages: [
          {
            role: "system",
            content: `You are a changelog writer. Given a list of git commits, produce grouped changelog entries. Each entry should start with a past-tense verb (Added, Fixed, Improved, Removed, Updated). Return JSON array of objects with fields: category (added|fixed|changed|removed|deprecated|security|performance), title (string), description (string|null), breaking (boolean).`,
          },
          {
            role: "user",
            content: `Summarize these commits into changelog entries:\n\n${commitList}`,
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
        max_tokens: 2000,
      })

      const content = response.choices[0].message.content
      if (!content) return []

      try {
        const parsed = JSON.parse(content)
        const entries = parsed.entries || parsed
        return (Array.isArray(entries) ? entries : []).map((e: Record<string, unknown>) => ({
          category: ((e.category as string) || "changed") as GeneratedEntry["category"],
          title: (e.title as string) || "Untitled change",
          description: (e.description as string) || null,
          impact: e.breaking ? "critical" as const : "medium" as const,
          breaking: !!e.breaking,
          confidence: 0.85,
          authors: [],
          sourceCommitShas: [],
        }))
      } catch {
        return []
      }
    },

    async describeChanges(changes: StructuralChange[]): Promise<string[]> {
      const changeList = changes
        .map((c) => `- ${c.changeType} ${c.entityType}: ${c.entityName || c.file}`)
        .join("\n")

      const response = await client.chat.completions.create({
        model,
        messages: [
          {
            role: "system",
            content: "You are a technical writer. Given structural code changes, produce brief plain-English descriptions suitable for a changelog. Return a JSON array of strings.",
          },
          {
            role: "user",
            content: `Describe these code changes:\n\n${changeList}`,
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
        max_tokens: 1000,
      })

      const content = response.choices[0].message.content
      if (!content) return []

      try {
        const parsed = JSON.parse(content)
        return Array.isArray(parsed.descriptions) ? parsed.descriptions : []
      } catch {
        return changes.map((c) => c.description)
      }
    },

    async classifyCommit(message: string, files?: string[]): Promise<{ type: string; confidence: number }> {
      const response = await client.chat.completions.create({
        model,
        messages: [
          {
            role: "system",
            content: "Classify this git commit into one of: feat, fix, chore, docs, style, refactor, perf, test, build, ci, revert. Return JSON with fields: type (string), confidence (number 0-1).",
          },
          {
            role: "user",
            content: `Commit: ${message}${files ? `\nFiles: ${files.join(", ")}` : ""}`,
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0.1,
        max_tokens: 100,
      })

      const content = response.choices[0].message.content
      if (!content) return { type: "chore", confidence: 0.5 }

      try {
        return JSON.parse(content) as { type: string; confidence: number }
      } catch {
        return { type: "chore", confidence: 0.5 }
      }
    },

    async generateReleaseNotes(entries: GeneratedEntry[], version: string): Promise<string> {
      const entryList = entries
        .map((e) => `- [${e.category}] ${e.title}${e.breaking ? " (BREAKING)" : ""}`)
        .join("\n")

      const response = await client.chat.completions.create({
        model,
        messages: [
          {
            role: "system",
            content: "You are a release notes writer. Given changelog entries, produce a cohesive, professional release notes narrative in Markdown. Include a brief summary paragraph followed by categorized details.",
          },
          {
            role: "user",
            content: `Write release notes for version ${version}:\n\n${entryList}`,
          },
        ],
        temperature: 0.4,
        max_tokens: 2000,
      })

      return response.choices[0].message.content || `# ${version}\n\nNo release notes generated.`
    },
  }
}
