import type {
  RawCommit,
  ParsedCommit,
  ConventionalCommitResult,
  CommitGroup,
  GeneratedEntry,
} from "./types"
import { COMMIT_TYPE_TO_CATEGORY } from "./types"

const CONVENTIONAL_REGEX = /^(?<type>[a-z]+)(?:\((?<scope>[^)]+)\))?(?<breaking>!)?:\s*(?<subject>.+)$/

const VALID_TYPES = new Set([
  "feat", "fix", "chore", "docs", "style", "refactor",
  "perf", "test", "build", "ci", "revert",
])

export function parseConventionalCommit(message: string): ConventionalCommitResult {
  const lines = message.split("\n")
  const firstLine = lines[0].trim()
  const match = firstLine.match(CONVENTIONAL_REGEX)

  if (!match?.groups || !VALID_TYPES.has(match.groups.type)) {
    return {
      isConventional: false,
      type: null,
      scope: null,
      breaking: false,
      subject: firstLine,
      body: lines.length > 2 ? lines.slice(2).join("\n").trim() || null : null,
      footers: parseFooters(lines),
    }
  }

  const footers = parseFooters(lines)
  const breakingFromFooter = !!footers["BREAKING CHANGE"] || !!footers["BREAKING-CHANGE"]

  return {
    isConventional: true,
    type: match.groups.type,
    scope: match.groups.scope || null,
    breaking: !!match.groups.breaking || breakingFromFooter,
    subject: match.groups.subject.trim(),
    body: lines.length > 2 ? lines.slice(2).join("\n").trim() || null : null,
    footers,
  }
}

function parseFooters(lines: string[]): Record<string, string> {
  const footers: Record<string, string> = {}
  const bodyStart = lines.findIndex((l, i) => i > 0 && l.trim() === "")
  if (bodyStart === -1) return footers

  for (let i = bodyStart + 1; i < lines.length; i++) {
    const line = lines[i].trim()
    const footerMatch = line.match(/^(?<key>[A-Za-z-]+(?:\s[A-Z]+)?):\s*(?<value>.+)$/)
    if (footerMatch?.groups) {
      footers[footerMatch.groups.key] = footerMatch.groups.value
    }
  }
  return footers
}

export function parseCoAuthors(message: string): { name: string; email: string }[] {
  const matches = message.matchAll(/Co-authored-by:\s*(.+?)\s*<(.+?)>/gi)
  return [...matches].map((m) => ({ name: m[1].trim(), email: m[2].trim() }))
}

export function detectMergeCommit(message: string): {
  isMerge: boolean
  prNumber: number | null
  sourceBranch: string | null
} {
  // "Merge pull request #123 from owner/branch"
  const prMatch = message.match(/^Merge pull request #(\d+) from .+\/(.+)/)
  if (prMatch) {
    return { isMerge: true, prNumber: parseInt(prMatch[1], 10), sourceBranch: prMatch[2] }
  }

  // "Merge branch 'feature/xyz'"
  const branchMatch = message.match(/^Merge branch '(.+?)'/)
  if (branchMatch) {
    return { isMerge: true, prNumber: null, sourceBranch: branchMatch[1] }
  }

  return { isMerge: false, prNumber: null, sourceBranch: null }
}

export function parseCommit(raw: RawCommit): ParsedCommit {
  const conventional = parseConventionalCommit(raw.message)
  const coAuthors = parseCoAuthors(raw.message)
  const merge = detectMergeCommit(raw.message)

  const authors = [
    { name: raw.author.name, email: raw.author.email, username: raw.author.username },
    ...coAuthors.map((a) => ({ ...a, username: undefined })),
  ]

  const filesChanged = raw.filesChanged
    ? [...(raw.filesChanged.added || []), ...(raw.filesChanged.modified || []), ...(raw.filesChanged.removed || [])]
    : []

  return {
    sha: raw.sha,
    type: conventional.type,
    scope: conventional.scope,
    subject: conventional.subject,
    body: conventional.body,
    breaking: conventional.breaking,
    breakingDescription: conventional.footers["BREAKING CHANGE"] || conventional.footers["BREAKING-CHANGE"] || null,
    footers: conventional.footers,
    authors,
    timestamp: raw.timestamp,
    filesChanged,
    ...merge,
  }
}

export function groupCommits(commits: ParsedCommit[]): CommitGroup[] {
  const groups: CommitGroup[] = []
  const used = new Set<string>()

  // Group by scope first
  const byScope = new Map<string, ParsedCommit[]>()
  for (const c of commits) {
    if (c.scope) {
      const existing = byScope.get(c.scope) || []
      existing.push(c)
      byScope.set(c.scope, existing)
    }
  }

  for (const [scope, scopeCommits] of byScope) {
    if (scopeCommits.length > 1) {
      groups.push({ commits: scopeCommits, reason: `Shared scope: ${scope}`, scope })
      scopeCommits.forEach((c) => used.add(c.sha))
    }
  }

  // Group by overlapping files
  const remaining = commits.filter((c) => !used.has(c.sha))
  for (let i = 0; i < remaining.length; i++) {
    if (used.has(remaining[i].sha)) continue

    const group = [remaining[i]]
    used.add(remaining[i].sha)

    for (let j = i + 1; j < remaining.length; j++) {
      if (used.has(remaining[j].sha)) continue

      const overlap = remaining[i].filesChanged.some((f) =>
        remaining[j].filesChanged.includes(f),
      )
      if (overlap) {
        group.push(remaining[j])
        used.add(remaining[j].sha)
      }
    }

    if (group.length > 1) {
      groups.push({ commits: group, reason: "Overlapping files", scope: group[0].scope })
    }
  }

  // Ungrouped commits become singleton groups
  for (const c of commits) {
    if (!used.has(c.sha)) {
      groups.push({ commits: [c], reason: "Individual commit", scope: c.scope })
    }
  }

  return groups
}

export function analyzeCommits(rawCommits: RawCommit[]): GeneratedEntry[] {
  const parsed = rawCommits.map(parseCommit)
  const groups = groupCommits(parsed)

  return groups.map((group) => {
    const primary = group.commits[0]
    const type = primary.type || "chore"
    const category = COMMIT_TYPE_TO_CATEGORY[type] || "changed"
    const allAuthors = group.commits.flatMap((c) => c.authors)
    const uniqueAuthors = allAuthors.filter(
      (a, i, arr) => arr.findIndex((b) => b.email === a.email) === i,
    )

    let title: string
    if (group.commits.length === 1) {
      title = primary.subject
    } else {
      // Use the primary subject, note the count
      title = `${primary.subject} (+${group.commits.length - 1} related changes)`
    }

    const description = group.commits.length > 1
      ? group.commits.map((c) => `- ${c.subject}`).join("\n")
      : primary.body

    return {
      category,
      title,
      description,
      impact: primary.breaking ? "critical" as const : "medium" as const,
      breaking: group.commits.some((c) => c.breaking),
      confidence: primary.type ? 0.95 : 0.6,
      authors: uniqueAuthors,
      sourceCommitShas: group.commits.map((c) => c.sha),
    }
  })
}
