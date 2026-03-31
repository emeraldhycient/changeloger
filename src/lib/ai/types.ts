import type { ParsedCommit, StructuralChange, GeneratedEntry } from "@/lib/engines/types"

export interface AIProvider {
  name: string
  summarizeCommits(commits: ParsedCommit[]): Promise<GeneratedEntry[]>
  describeChanges(changes: StructuralChange[]): Promise<string[]>
  classifyCommit(message: string, files?: string[]): Promise<{ type: string; confidence: number }>
  generateReleaseNotes(entries: GeneratedEntry[], version: string): Promise<string>
}

export interface AIProviderConfig {
  provider: "openai" | "anthropic" | "ollama"
  model: string
  apiKey?: string
  baseUrl?: string
}
