import type { DiffFile, StructuralChange } from "./types"
import type { ImpactLevel } from "@prisma/client"

const NOISE_PATTERNS = [
  /\.lock$/,
  /package-lock\.json$/,
  /yarn\.lock$/,
  /pnpm-lock\.yaml$/,
  /\.min\.(js|css)$/,
  /dist\//,
  /build\//,
  /\.next\//,
  /node_modules\//,
  /\.DS_Store$/,
  /\.env\.local$/,
]

const MIGRATION_PATTERNS = [
  /migrations?\//i,
  /\.sql$/,
  /schema\.prisma$/,
]

const CONFIG_PATTERNS = [
  /\.env/,
  /\.config\.(ts|js|mjs)$/,
  /tsconfig\.json$/,
  /\.eslintrc/,
  /\.prettierrc/,
  /next\.config/,
  /tailwind\.config/,
]

const MANIFEST_FILES = new Set([
  "package.json", "pyproject.toml", "Cargo.toml", "go.mod",
  "pom.xml", "build.gradle", ".version", "VERSION",
])

// Regex patterns for detecting structural changes in code
const JS_TS_PATTERNS = {
  function: /^[+-]\s*(?:export\s+)?(?:async\s+)?function\s+(\w+)/,
  arrowFunction: /^[+-]\s*(?:export\s+)?(?:const|let)\s+(\w+)\s*=\s*(?:async\s+)?\(/,
  class: /^[+-]\s*(?:export\s+)?class\s+(\w+)/,
  interface: /^[+-]\s*(?:export\s+)?(?:interface|type)\s+(\w+)/,
  apiRoute: /^[+-]\s*(?:export\s+)?(?:async\s+)?function\s+(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\b/,
  reactComponent: /^[+-]\s*(?:export\s+)?(?:default\s+)?function\s+([A-Z]\w+)/,
}

const PYTHON_PATTERNS = {
  function: /^[+-]\s*(?:async\s+)?def\s+(\w+)/,
  class: /^[+-]\s*class\s+(\w+)/,
  route: /^[+-]\s*@(?:app|router)\.(get|post|put|patch|delete)\s*\(\s*["'](.+?)["']/,
}

export function filterNoise(files: DiffFile[]): DiffFile[] {
  return files.filter((file) => {
    if (NOISE_PATTERNS.some((p) => p.test(file.filename))) return false
    // Filter formatting-only changes (only whitespace diffs)
    if (file.patch && file.additions === file.deletions) {
      const lines = file.patch.split("\n").filter((l) => l.startsWith("+") || l.startsWith("-"))
      const onlyWhitespace = lines.every((l) => l.slice(1).trim() === lines[0]?.slice(1).trim())
      if (onlyWhitespace) return false
    }
    return true
  })
}

export function detectStructuralChanges(files: DiffFile[]): StructuralChange[] {
  const changes: StructuralChange[] = []
  const filtered = filterNoise(files)

  for (const file of filtered) {
    // File-level changes
    if (file.status === "added") {
      changes.push({
        file: file.filename,
        changeType: "added",
        entityType: "file",
        entityName: file.filename.split("/").pop() || file.filename,
        language: detectLanguage(file.filename),
        description: `New file: ${file.filename}`,
        impact: classifyFileImpact(file),
      })
    } else if (file.status === "removed") {
      changes.push({
        file: file.filename,
        changeType: "deleted",
        entityType: "file",
        entityName: file.filename.split("/").pop() || file.filename,
        language: detectLanguage(file.filename),
        description: `Deleted file: ${file.filename}`,
        impact: "high",
      })
    }

    // Check for migrations
    if (MIGRATION_PATTERNS.some((p) => p.test(file.filename))) {
      changes.push({
        file: file.filename,
        changeType: file.status as "added" | "modified" | "deleted",
        entityType: "migration",
        entityName: file.filename,
        language: null,
        description: `Database migration: ${file.filename}`,
        impact: "critical",
      })
    }

    // Check for config changes
    if (CONFIG_PATTERNS.some((p) => p.test(file.filename))) {
      changes.push({
        file: file.filename,
        changeType: file.status as "added" | "modified" | "deleted",
        entityType: "config",
        entityName: file.filename,
        language: null,
        description: `Configuration change: ${file.filename}`,
        impact: "medium",
      })
    }

    // Check for dependency changes
    if (MANIFEST_FILES.has(file.filename.split("/").pop() || "")) {
      const depChanges = detectDependencyChanges(file.patch || "", file.filename)
      changes.push(...depChanges)
    }

    // Parse patch for structural code changes
    if (file.patch) {
      const codeChanges = detectCodeChanges(file.filename, file.patch)
      changes.push(...codeChanges)
    }
  }

  return changes
}

function detectCodeChanges(filename: string, patch: string): StructuralChange[] {
  const changes: StructuralChange[] = []
  const lang = detectLanguage(filename)
  if (!lang) return changes

  const lines = patch.split("\n")
  const patterns = lang === "python" ? PYTHON_PATTERNS : JS_TS_PATTERNS

  for (const line of lines) {
    const isAdded = line.startsWith("+")
    const isRemoved = line.startsWith("-")
    if (!isAdded && !isRemoved) continue

    for (const [entityType, pattern] of Object.entries(patterns)) {
      const match = line.match(pattern)
      if (match) {
        const name = match[1] || match[2]
        const type = entityType === "apiRoute" || entityType === "route" ? "endpoint" : entityType as StructuralChange["entityType"]
        changes.push({
          file: filename,
          changeType: isAdded ? "added" : "deleted",
          entityType: (entityType === "arrowFunction" ? "function" : type) as StructuralChange["entityType"],
          entityName: name,
          language: lang,
          description: `${isAdded ? "Added" : "Removed"} ${entityType}: ${name} in ${filename}`,
          impact: type === "endpoint" ? "high" : "medium",
        })
        break
      }
    }
  }

  return changes
}

export function detectDependencyChanges(patch: string, filename: string): StructuralChange[] {
  const changes: StructuralChange[] = []
  if (!patch) return changes

  const lines = patch.split("\n")
  for (const line of lines) {
    if (!line.startsWith("+") && !line.startsWith("-")) continue
    if (line.startsWith("+++") || line.startsWith("---")) continue

    // package.json dependency lines
    const depMatch = line.match(/^[+-]\s*"([^"]+)":\s*"([^"]+)"/)
    if (depMatch && filename.includes("package.json")) {
      const [, name, version] = depMatch
      changes.push({
        file: filename,
        changeType: line.startsWith("+") ? "added" : "deleted",
        entityType: "dependency",
        entityName: name,
        language: "javascript",
        description: `${line.startsWith("+") ? "Added" : "Removed"} dependency: ${name}@${version}`,
        impact: "medium",
      })
    }
  }

  return changes
}

function detectLanguage(filename: string): string | null {
  const ext = filename.split(".").pop()?.toLowerCase()
  const map: Record<string, string> = {
    ts: "typescript", tsx: "typescript", js: "javascript", jsx: "javascript",
    py: "python", go: "go", rs: "rust", java: "java", kt: "kotlin", rb: "ruby",
  }
  return map[ext || ""] || null
}

function classifyFileImpact(file: DiffFile): ImpactLevel {
  const name = file.filename.toLowerCase()
  if (name.includes("migration") || name.includes("schema")) return "critical"
  if (name.includes("api") || name.includes("route")) return "high"
  if (name.includes("test") || name.includes("spec")) return "low"
  if (name.includes("readme") || name.includes("doc")) return "low"
  return "medium"
}

export function classifyImpact(change: StructuralChange): ImpactLevel {
  if (change.entityType === "migration") return "critical"
  if (change.entityType === "endpoint" && change.changeType === "deleted") return "critical"
  if (change.entityType === "endpoint") return "high"
  if (change.changeType === "deleted" && change.entityType === "function") return "high"
  if (change.entityType === "dependency") return "medium"
  if (change.entityType === "config") return "medium"
  return change.impact
}
