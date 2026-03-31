import type { ChangeCategory, ChangeSource, ImpactLevel } from "@prisma/client"

export interface RawCommit {
  sha: string
  message: string
  author: { name: string; email: string; username?: string }
  timestamp: string
  filesChanged?: { added: string[]; removed: string[]; modified: string[] }
}

export interface ParsedCommit {
  sha: string
  type: string | null
  scope: string | null
  subject: string
  body: string | null
  breaking: boolean
  breakingDescription: string | null
  footers: Record<string, string>
  authors: { name: string; email: string; username?: string }[]
  timestamp: string
  filesChanged: string[]
  isMerge: boolean
  prNumber: number | null
  sourceBranch: string | null
}

export interface ConventionalCommitResult {
  isConventional: boolean
  type: string | null
  scope: string | null
  breaking: boolean
  subject: string
  body: string | null
  footers: Record<string, string>
}

export interface StructuralChange {
  file: string
  changeType: "added" | "modified" | "deleted" | "renamed"
  entityType: "file" | "function" | "class" | "endpoint" | "migration" | "config" | "dependency"
  entityName: string | null
  language: string | null
  description: string
  impact: ImpactLevel
}

export interface DiffFile {
  filename: string
  status: "added" | "removed" | "modified" | "renamed"
  additions: number
  deletions: number
  patch?: string
}

export interface EngineResult {
  source: ChangeSource
  entries: GeneratedEntry[]
  warnings: string[]
}

export interface GeneratedEntry {
  category: ChangeCategory
  title: string
  description: string | null
  impact: ImpactLevel
  breaking: boolean
  confidence: number
  authors: { name: string; email: string; username?: string }[]
  sourceCommitShas: string[]
}

export interface CommitGroup {
  commits: ParsedCommit[]
  reason: string
  scope: string | null
}

export const COMMIT_TYPE_TO_CATEGORY: Record<string, ChangeCategory> = {
  feat: "added",
  fix: "fixed",
  perf: "performance",
  refactor: "changed",
  docs: "documentation",
  chore: "maintenance",
  build: "maintenance",
  ci: "maintenance",
  style: "maintenance",
  test: "maintenance",
  revert: "changed",
}

export const CATEGORY_SEMVER_IMPACT: Record<string, "major" | "minor" | "patch" | "none"> = {
  feat: "minor",
  fix: "patch",
  perf: "patch",
  refactor: "none",
  docs: "none",
  chore: "none",
  build: "none",
  ci: "none",
  style: "none",
  test: "none",
  revert: "patch",
}
