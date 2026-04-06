# Detection Engine Documentation

This document describes the three-engine architecture used by Changeloger to detect, classify, and summarize code changes from GitHub repositories, as well as the pluggable AI provider system that enhances the output.

---

## Overview

Changeloger uses three complementary detection engines that run in sequence against incoming GitHub events. Each engine specializes in a different signal source and produces `GeneratedEntry` objects that are merged, deduplicated, and optionally polished by an AI provider before landing as draft changelog entries.

```
GitHub Webhook Event
    |
    v
+-------------------+     +-------------------+     +--------------------+
| Commit Analyzer   | --> | Diff Detector     | --> | Version Watcher    |
| (commit messages) |     | (file diffs)      |     | (manifest + tags)  |
+-------------------+     +-------------------+     +--------------------+
    |                          |                          |
    v                          v                          v
+---------------------------------------------------------------+
|                  Merge + Deduplicate                           |
+---------------------------------------------------------------+
    |
    v
+-------------------+
| AI Provider       |
| (summarize)       |
+-------------------+
    |
    v
Draft Release with ChangelogEntries
```

The three engines are intentionally redundant. A well-formatted conventional commit will be captured by the commit analyzer with high confidence. A commit with a vague message like "fix stuff" will still be detected by the diff detector, which analyzes the actual code changes. Version bumps in manifest files are caught by the version watcher even when the commit message does not mention a version change. This layered approach maximizes coverage across teams with varying commit discipline.

---

## Engine 1: Git Commit Analysis Engine

**Source file:** `src/lib/engines/commit-analyzer.ts`
**Type definitions:** `src/lib/engines/types.ts`

### Conventional Commit Format

The commit analyzer parses commit messages that follow the [Conventional Commits v1.0.0](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope][optional !]: <subject>

[optional body]

[optional footer(s)]
```

The parser uses the following regular expression for the first line:

```
/^(?<type>[a-z]+)(?:\((?<scope>[^)]+)\))?(?<breaking>!)?:\s*(?<subject>.+)$/
```

### Recognized Commit Types and Category Mapping

| Type | Category Mapping | Semver Impact | Description |
|---|---|---|---|
| `feat` | `added` | `minor` | A new feature |
| `fix` | `fixed` | `patch` | A bug fix |
| `perf` | `performance` | `patch` | A performance improvement |
| `refactor` | `changed` | `none` | Code restructuring without behavior change |
| `docs` | `documentation` | `none` | Documentation changes |
| `chore` | `maintenance` | `none` | Routine tasks and maintenance |
| `build` | `maintenance` | `none` | Build system or dependency changes |
| `ci` | `maintenance` | `none` | CI/CD configuration changes |
| `style` | `maintenance` | `none` | Code formatting (no logic changes) |
| `test` | `maintenance` | `none` | Adding or modifying tests |
| `revert` | `changed` | `patch` | Reverting a previous commit |

Non-conventional commits (those not matching the pattern or using an unrecognized type) are still processed but receive a lower confidence score of `0.6` compared to `0.95` for properly formatted conventional commits.

### Parsing Rules

**First line parsing.** The commit message's first line is matched against the conventional commit regex. If it matches and the type is in the recognized set of 11 types, the commit is classified as conventional. Otherwise, the entire first line is treated as the subject with `type` set to `null`.

**Body extraction.** Everything after the first blank line following the subject is treated as the commit body. The body is trimmed of leading and trailing whitespace.

**Footer parsing.** Lines after the body that match the `Key: Value` pattern (where `Key` contains letters, hyphens, and optionally a space followed by uppercase letters) are extracted as key-value footer pairs. Two footer keys receive special treatment:

- `BREAKING CHANGE` and `BREAKING-CHANGE` -- mark the commit as a breaking change and store the value as the `breakingDescription`.
- `Co-authored-by` -- parsed separately by the co-author extractor.

**Breaking change detection.** A commit is marked as breaking if any of the following conditions hold:

1. The `!` character appears immediately before the colon in the subject line (e.g., `feat(api)!: remove legacy endpoints`).
2. A `BREAKING CHANGE` footer is present in the commit body.
3. A `BREAKING-CHANGE` footer (hyphenated variant) is present in the commit body.

**Merge commit detection.** The parser recognizes two merge commit patterns:

| Pattern | Extracted Data |
|---|---|
| `Merge pull request #<number> from <owner>/<branch>` | PR number, source branch name |
| `Merge branch '<branch>'` | Source branch name |

Merge commits that match either pattern have their `isMerge` flag set to `true`.

**Co-author parsing.** `Co-authored-by: Name <email>` trailers anywhere in the commit message are parsed using a case-insensitive regex. Each co-author is added to the commit's author list alongside the primary author.

### Grouping Heuristics

After individual commits are parsed, the `groupCommits` function clusters related commits to produce more cohesive changelog entries. Grouping is performed in three sequential passes:

**Pass 1: Scope-based grouping.** All commits with the same non-null scope are collected. If a scope has two or more commits (e.g., three commits with scope `auth`), they are placed in a single group. The `reason` field is set to `Shared scope: <scope>`.

**Pass 2: File overlap grouping.** Among the remaining ungrouped commits, the algorithm iterates pairwise. If two commits modified at least one common file path, they are placed in the same group. The `reason` field is set to `Overlapping files`.

**Pass 3: Singleton grouping.** Any commits not captured by either of the above passes become singleton groups (one commit per group). The `reason` field is set to `Individual commit`.

### Entry Generation

Each commit group produces one `GeneratedEntry`:

| Field | Derivation |
|---|---|
| `category` | Mapped from the primary (first) commit's type via `COMMIT_TYPE_TO_CATEGORY`. Falls back to `changed` if the type is unrecognized. |
| `title` | For single-commit groups: the commit subject. For multi-commit groups: the primary subject followed by `(+N related changes)`. |
| `description` | For single-commit groups: the commit body (may be null). For multi-commit groups: a bullet list of all commit subjects. |
| `impact` | `critical` if any commit in the group has the `breaking` flag; otherwise `medium`. |
| `breaking` | `true` if any commit in the group is marked as breaking. |
| `confidence` | `0.95` if the primary commit is conventional; `0.6` otherwise. |
| `authors` | Deduplicated by email across all authors and co-authors in the group. |
| `sourceCommitShas` | Array of all commit SHAs in the group. |

---

## Engine 2: Diff-Based Detection Engine

**Source file:** `src/lib/engines/diff-detector.ts`
**AST parsing:** `src/lib/engines/parsers/tree-sitter.ts`

### Purpose

The diff detector analyzes file-level diffs fetched from the GitHub Compare API to identify structural code changes that may not be adequately described in commit messages. This engine is especially valuable for teams that do not follow conventional commit conventions or for changes where the commit message understates the impact (e.g., "update code" for a commit that introduces a new API endpoint).

### Structural Change Detection

The engine identifies changes at seven entity levels:

| Entity Type | Detection Method | Examples |
|---|---|---|
| `file` | File status in the GitHub diff (added, removed, renamed, modified) | New module file, deleted legacy code |
| `function` | AST parsing of added/removed function declarations and arrow function assignments | New exported function, removed handler |
| `class` | AST parsing of added/removed class declarations | New service class, removed data model |
| `endpoint` | Pattern matching on route files, HTTP method decorators, and Next.js App Router conventions | New `POST` handler in `route.ts`, new Flask route |
| `migration` | File path pattern matching against known migration directories | New file in `prisma/migrations/`, new `.sql` file |
| `config` | Detection of changes to known configuration files | Modified `tsconfig.json`, updated `next.config.mjs`, changed `.env.example` |
| `dependency` | Parsing of manifest file diffs for added, removed, or updated dependencies | New package in `package.json`, bumped version in `Cargo.toml` |

### Supported Languages for AST Parsing

| Language | File Extensions | Detected Entities |
|---|---|---|
| JavaScript / TypeScript | `.js`, `.jsx`, `.ts`, `.tsx` | Functions, arrow functions, classes, interfaces, React components, API route handlers, named exports |
| Python | `.py` | Functions (`def`), classes, FastAPI/Flask route decorators |

Additional languages (Go, Rust, Java, Ruby) receive file-level detection only. The architecture is extensible -- new language parsers can be added by implementing a parser module in `src/lib/engines/parsers/`.

### Noise Filtering Rules

The diff detector applies the following filters to exclude non-meaningful changes from the output:

| Filter | Excluded Patterns | Rationale |
|---|---|---|
| Lock files | `*.lock`, `package-lock.json`, `yarn.lock`, `pnpm-lock.yaml` | Auto-generated dependency locks, not user-authored |
| Build output | `dist/**`, `build/**`, `.next/**`, `out/**` | Generated build artifacts |
| Formatting-only | Diffs consisting entirely of whitespace changes | No functional impact |
| Auto-generated | `.generated.*`, `*.gen.*` | Machine-generated code |
| Vendored code | `vendor/**`, `third_party/**` | External dependencies |
| OS files | `.DS_Store`, `Thumbs.db` | Operating system metadata |
| Minified files | `*.min.js`, `*.min.css` | Compressed production assets |
| Environment files | `.env.local` | Local development configuration (security) |

Custom ignore patterns can be configured per repository via the `config.ignorePaths` JSONB field on the `repositories` table.

### Impact Classification Matrix

Each structural change is assigned an impact level based on the combination of entity type and change type:

| Entity Type | Added | Modified | Deleted | Renamed |
|---|---|---|---|---|
| `endpoint` | High | High | Critical | Medium |
| `migration` | High | Critical | Critical | Low |
| `class` | Medium | Medium | High | Low |
| `function` | Medium | Low | Medium | Low |
| `config` | Medium | Medium | High | Low |
| `dependency` | Medium | Low | High | Low |
| `file` | Low | Low | Medium | Negligible |

The rationale for the higher severity of deletions: removing a public API endpoint or database migration is more likely to be a breaking change than adding one. Configuration deletions often indicate removal of an integration or feature.

### Output Type

The diff detector produces `StructuralChange` objects:

```typescript
interface StructuralChange {
  file: string                    // File path relative to repository root
  changeType: "added" | "modified" | "deleted" | "renamed"
  entityType: "file" | "function" | "class" | "endpoint" | "migration" | "config" | "dependency"
  entityName: string | null       // Name of the function, class, or endpoint (null for file-level changes)
  language: string | null         // Detected programming language
  description: string             // Human-readable description of the change
  impact: ImpactLevel             // Assessed impact level from the classification matrix
}
```

These structural changes are converted into `GeneratedEntry` objects for merging with commit analyzer output.

---

## Engine 3: Semantic Versioning Engine

**Source file:** `src/lib/engines/version-watcher.ts`

### Purpose

The version watcher monitors manifest files for version bumps and correlates them with Git tags to identify release boundaries. It ensures that version changes are captured even when the commit message does not mention the version, and it compiles all changes between versions into a single cohesive release.

### Monitored Manifest Files

| File | Ecosystem | Version Field |
|---|---|---|
| `package.json` | Node.js / npm | `"version": "x.y.z"` |
| `pyproject.toml` | Python (PEP 621 / Poetry) | `[project].version` or `[tool.poetry].version` |
| `Cargo.toml` | Rust | `[package].version` |
| `go.mod` | Go | Module version via Git tags |
| `build.gradle` / `build.gradle.kts` | Java / Kotlin (Gradle) | `version` property |
| `pom.xml` | Java (Maven) | `<version>` element |
| `*.gemspec` | Ruby | `spec.version` |
| `setup.py` / `setup.cfg` | Python (legacy) | `version` parameter / field |
| `*.csproj` | .NET | `<Version>` element |
| `.version` / `VERSION` | Generic | File contents |

### Version Bump Detection

When a push event includes changes to a monitored manifest file, the engine performs the following steps:

1. **Fetch the diff** for the manifest file from the GitHub Compare API.
2. **Extract versions** by parsing the previous and new version strings from the diff hunks.
3. **Validate** both version strings against the semver specification.
4. **Classify the bump type** as `major`, `minor`, or `patch` based on which component changed.
5. **Cross-check consistency** -- emit a warning if the bump type conflicts with the detected changes:
   - Breaking change detected but only a `patch` or `minor` bump was applied: recommend `major`.
   - New features detected but only a `patch` bump was applied: recommend `minor`.

### Tag Correlation Patterns

The engine recognizes the following Git tag formats and attempts to match them with detected version bumps:

| Pattern | Example | Common Usage |
|---|---|---|
| `v{version}` | `v1.3.0` | Most common convention across ecosystems |
| `{version}` | `1.3.0` | Bare version number |
| `{package}@{version}` | `@scope/package@1.3.0` | npm/pnpm monorepo convention |
| `{package}-v{version}` | `my-lib-v1.3.0` | Alternative monorepo convention |

When a tag is found that correlates with a version bump, it is recorded on the `Release.tag` field.

### Change Compilation

When a version bump is detected, the engine compiles a complete picture of the release:

1. **Identify the commit range** between the previous version tag (or the last known release SHA) and the current push.
2. **Collect all commits** in that range from the GitHub API.
3. **Run the commit analyzer** on the collected commits.
4. **Run the diff detector** on the aggregated file diffs.
5. **Merge and deduplicate** results from both engines.
6. **Create or update a draft release** with the detected version number and compiled changelog entries.

### Pre-release Support

The engine recognizes semver pre-release identifiers and handles them as follows:

- Pre-release versions (e.g., `1.3.0-beta.1`, `2.0.0-rc.1`) create draft releases but are not automatically published.
- Sequential pre-release bumps (e.g., `beta.1` to `beta.2`) accumulate changes rather than creating separate releases.
- The transition from a pre-release to a stable release (e.g., `2.0.0-rc.3` to `2.0.0`) triggers a final compilation of all accumulated changes since the last stable version.
- Build metadata (e.g., `1.2.0+build.42`) is recognized but does not affect version ordering or release creation.

---

## AI Provider System

**Interface:** `src/lib/ai/types.ts`
**OpenAI implementation:** `src/lib/ai/openai.ts`
**Factory and caching:** `src/lib/ai/index.ts`

### Provider Interface Specification

All AI providers implement the `AIProvider` interface:

```typescript
interface AIProvider {
  name: string
  summarizeCommits(commits: ParsedCommit[]): Promise<GeneratedEntry[]>
  describeChanges(changes: StructuralChange[]): Promise<string[]>
  classifyCommit(message: string, files?: string[]): Promise<{ type: string; confidence: number }>
  generateReleaseNotes(entries: GeneratedEntry[], version: string): Promise<string>
}
```

| Method | Purpose | When Used |
|---|---|---|
| `summarizeCommits` | Group and summarize parsed commits into polished changelog entries | During draft generation after commit analysis |
| `describeChanges` | Produce plain-English descriptions of structural code changes | After the diff detector identifies structural changes |
| `classifyCommit` | Classify a non-conventional commit into a recognized type with a confidence score | When the commit analyzer encounters a non-conventional commit |
| `generateReleaseNotes` | Produce a cohesive release notes narrative in Markdown | When a user requests generated release notes for a version |

### Provider Configuration

```typescript
interface AIProviderConfig {
  provider: "openai" | "anthropic" | "ollama"
  model: string
  apiKey?: string
  baseUrl?: string
}
```

The active provider is selected via the `AI_PROVIDER` environment variable (default: `openai`). The model is set via `AI_MODEL` (default: `gpt-4o-mini`).

### OpenAI Implementation Details

The OpenAI provider uses the OpenAI SDK and configures each method with specific parameters optimized for its task:

| Method | Temperature | Max Tokens | Response Format | Notes |
|---|---|---|---|---|
| `summarizeCommits` | 0.3 | 2000 | JSON object | Low temperature for consistent categorization |
| `describeChanges` | 0.3 | 1000 | JSON object | Technical accuracy over creativity |
| `classifyCommit` | 0.1 | 100 | JSON object | Very low temperature for deterministic classification |
| `generateReleaseNotes` | 0.4 | 2000 | Plain text (Markdown) | Slightly higher temperature for natural prose |

**System prompt design:**

- `summarizeCommits` instructs the model to produce grouped entries starting with past-tense verbs (Added, Fixed, Improved, Removed, Updated) and return a JSON array with `category`, `title`, `description`, and `breaking` fields.
- `describeChanges` instructs the model to act as a technical writer producing brief plain-English descriptions suitable for a changelog audience.
- `classifyCommit` instructs the model to classify into one of the 11 recognized commit types and return a confidence score between 0 and 1.
- `generateReleaseNotes` instructs the model to produce a cohesive narrative with a brief summary paragraph followed by categorized details.

All JSON-returning methods use `response_format: { type: "json_object" }` to enforce structurally valid output. Error handling wraps all API calls in try-catch blocks and falls back to empty arrays or default values rather than propagating failures upstream.

### Caching Strategy

AI responses are cached in Redis to reduce costs and latency for repeated processing:

| Aspect | Details |
|---|---|
| Cache key | SHA-256 hash of the input data concatenated with the provider name and model identifier |
| TTL | 7 days |
| Scope | Global (not per-workspace), since identical input produces identical output regardless of which workspace triggers the analysis |
| Invalidation | Entries expire naturally via TTL. No manual invalidation is required. |
| Cache miss behavior | The AI API is called and the response is stored before being returned |

### Rate Limiting

AI API calls are rate-limited per workspace to prevent abuse and manage costs:

- The `workspace.ai_generations_used` counter is incremented before each AI call.
- If the counter exceeds the plan's limit, the call is rejected with a 402 response and an upgrade prompt.
- The counter is reset monthly by a scheduled BullMQ job (`src/lib/jobs/usage-reset.ts`).

### Adding a New Provider

To add support for a new AI backend:

1. **Create the implementation file** at `src/lib/ai/<provider-name>.ts`.
2. **Implement all four methods** of the `AIProvider` interface. Each method must handle errors gracefully and return sensible defaults on failure.
3. **Register the provider** in the factory function in `src/lib/ai/index.ts`.
4. **Update the type union** -- add the provider name to the `AIProviderConfig.provider` type in `src/lib/ai/types.ts`.
5. **Add environment variables** -- document any required API keys or base URLs in `.env.example`.
6. **Test** -- verify all four methods produce valid `GeneratedEntry` objects and handle edge cases (empty input, API errors, rate limits).

Stub implementations exist for Anthropic (`src/lib/ai/anthropic.ts`) and Ollama (`src/lib/ai/ollama.ts`) as starting points.

---

## How Engines Work Together (Orchestration Flow)

The engine orchestration is managed by background job workers defined in `src/lib/jobs/`.

### Step 1: Webhook Receipt

The GitHub webhook handler at `src/app/api/webhooks/github/route.ts`:

1. Receives the incoming HTTP POST with the event payload.
2. Verifies the HMAC-SHA256 signature using `GITHUB_APP_WEBHOOK_SECRET`.
3. Checks for idempotency by looking up the commit SHA in existing `ChangeRecord` entries.
4. Enqueues a `process-webhook` job via BullMQ if the event is new.

### Step 2: Event Dispatch

The `process-webhook` worker (`src/lib/jobs/process-webhook.ts`) determines the event type and dispatches accordingly:

| Event Type | Action |
|---|---|
| `push` | Enqueues an `analyze-changes` job with the commit list and before/after SHAs |
| `create` (tag) | Triggers the version watcher to check for tag-version correlation |
| `release` | Correlates with existing draft releases and may trigger publication |

### Step 3: Change Analysis

The `analyze-changes` worker (`src/lib/jobs/analyze-changes.ts`) runs the engines in sequence:

1. **Commit analyzer** -- Parses all commits in the push, groups related commits, and produces `GeneratedEntry` objects.
2. **Diff detector** -- Fetches the file-level diff between the `before` and `after` SHAs from the GitHub Compare API, identifies structural changes, and produces additional `GeneratedEntry` objects.
3. **Version watcher** -- Checks whether any manifest files were modified and whether a version bump occurred.
4. **Merge** -- Combines results from all three engines, deduplicating entries that describe the same change.

### Step 4: Draft Generation

The `generate-draft` worker (`src/lib/jobs/generate-draft.ts`):

1. Takes the merged engine results.
2. If AI is enabled for the repository (`config.aiEnabled`), sends the results to the AI provider for summarization.
3. Creates `ChangeRecord` entries in the database for audit and traceability.
4. Creates or updates a draft `Release` with `ChangelogEntry` records.
5. Assigns positions (display order), categories, and impact levels to each entry.

### Deduplication Rules

When merging results from multiple engines, the following rules apply:

1. **SHA-based deduplication** -- Entries with the same `sourceCommitShas` are deduplicated. The entry with the highest confidence score is retained.
2. **Content overlap** -- Entries from the diff detector that describe the same file changes as commit analyzer entries are merged, combining metadata from both engines.
3. **Version watcher precedence** -- The version watcher's output takes precedence for determining release boundaries (version number, commit range, tag association).
4. **Confidence thresholds** -- Entries below a minimum confidence threshold (default: 0.3) are discarded unless they describe breaking changes.
