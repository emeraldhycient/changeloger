import type { DiffFile, GeneratedEntry } from "./types"

interface VersionBump {
  file: string
  ecosystem: string
  oldVersion: string | null
  newVersion: string
}

const MANIFEST_EXTRACTORS: { pattern: RegExp; ecosystem: string; versionRegex: RegExp }[] = [
  { pattern: /^package\.json$/, ecosystem: "nodejs", versionRegex: /"version":\s*"([^"]+)"/ },
  { pattern: /^pyproject\.toml$/, ecosystem: "python", versionRegex: /version\s*=\s*"([^"]+)"/ },
  { pattern: /^Cargo\.toml$/, ecosystem: "rust", versionRegex: /version\s*=\s*"([^"]+)"/ },
  { pattern: /^go\.mod$/, ecosystem: "go", versionRegex: /^module .+$/m },
  { pattern: /\.gemspec$/, ecosystem: "ruby", versionRegex: /\.version\s*=\s*['"]([^'"]+)['"]/ },
  { pattern: /^pom\.xml$/, ecosystem: "java", versionRegex: /<version>([^<]+)<\/version>/ },
  { pattern: /\.csproj$/, ecosystem: "dotnet", versionRegex: /<Version>([^<]+)<\/Version>/ },
  { pattern: /^\.version$|^VERSION$/, ecosystem: "generic", versionRegex: /^(.+)$/m },
]

export function detectVersionBumps(files: DiffFile[]): VersionBump[] {
  const bumps: VersionBump[] = []

  for (const file of files) {
    const filename = file.filename.split("/").pop() || file.filename
    const extractor = MANIFEST_EXTRACTORS.find((e) => e.pattern.test(filename))
    if (!extractor || !file.patch) continue

    const lines = file.patch.split("\n")
    let oldVersion: string | null = null
    let newVersion: string | null = null

    for (const line of lines) {
      if (line.startsWith("-")) {
        const match = line.slice(1).match(extractor.versionRegex)
        if (match) oldVersion = match[1]
      }
      if (line.startsWith("+")) {
        const match = line.slice(1).match(extractor.versionRegex)
        if (match) newVersion = match[1]
      }
    }

    if (newVersion && newVersion !== oldVersion) {
      bumps.push({
        file: file.filename,
        ecosystem: extractor.ecosystem,
        oldVersion,
        newVersion,
      })
    }
  }

  return bumps
}

export function correlateTag(
  version: string,
  tags: string[],
): string | null {
  const patterns = [
    `v${version}`,
    version,
    new RegExp(`@${version.replace(/\./g, "\\.")}$`),
  ]

  for (const tag of tags) {
    if (tag === `v${version}` || tag === version) return tag
    if (typeof patterns[2] !== "string" && patterns[2].test(tag)) return tag
  }

  return null
}

export function validateSemver(
  oldVersion: string | null,
  newVersion: string,
  hasBreaking: boolean,
): string[] {
  const warnings: string[] = []

  if (!oldVersion) return warnings

  const oldParts = parseSemver(oldVersion)
  const newParts = parseSemver(newVersion)
  if (!oldParts || !newParts) return warnings

  if (hasBreaking) {
    if (newParts.major === oldParts.major && oldParts.major !== 0) {
      warnings.push(
        `Breaking change detected but version bump is not a major increment (${oldVersion} → ${newVersion}). Consider bumping to ${oldParts.major + 1}.0.0`,
      )
    }
  }

  return warnings
}

function parseSemver(version: string): { major: number; minor: number; patch: number; prerelease?: string } | null {
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)(?:-(.+))?/)
  if (!match) return null
  return {
    major: parseInt(match[1], 10),
    minor: parseInt(match[2], 10),
    patch: parseInt(match[3], 10),
    prerelease: match[4],
  }
}

export function suggestVersionIncrement(
  currentVersion: string,
  entries: GeneratedEntry[],
): string {
  const current = parseSemver(currentVersion)
  if (!current) return currentVersion

  const hasBreaking = entries.some((e) => e.breaking)
  const hasFeatures = entries.some((e) => e.category === "added")

  if (hasBreaking && current.major > 0) {
    return `${current.major + 1}.0.0`
  }
  if (hasFeatures) {
    return `${current.major}.${current.minor + 1}.0`
  }
  return `${current.major}.${current.minor}.${current.patch + 1}`
}
