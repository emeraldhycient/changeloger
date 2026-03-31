# Detection Engines

Changeloger uses three detection engines that work together to produce comprehensive changelog entries from raw development activity.

## Architecture Overview

```
GitHub Webhook (push/create/release)
        |
        v
+-------------------+
| Git Commit        |---> Conventional commit parsing
| Analysis Engine   |---> AI classification for non-conventional
|                   |---> Commit grouping and deduplication
+-------------------+
        |
        v
+-------------------+
| Diff-Based        |---> Structural change detection
| Detection Engine  |---> Language-aware AST parsing (regex-based)
|                   |---> Noise filtering and impact classification
+-------------------+
        |
        v
+-------------------+
| Semantic Version  |---> Manifest file monitoring
| Trigger Engine    |---> Version bump detection
|                   |---> Tag correlation
+-------------------+
        |
        v
   AI Summarization
        |
        v
   Draft Release + Changelog Entries
```

## 1. Git Commit Analysis Engine

**File:** `src/lib/engines/commit-analyzer.ts`

### Conventional Commit Parsing

Parses commit messages following the [Conventional Commits v1.0.0](https://www.conventionalcommits.org/) specification.

**Format:** `<type>[optional scope][!]: <subject>`

**Supported types:**

| Type | Category | Semver Impact | Description |
|------|----------|---------------|-------------|
| `feat` | Added | Minor | New features |
| `fix` | Fixed | Patch | Bug fixes |
| `perf` | Performance | Patch | Performance improvements |
| `refactor` | Changed | None | Code restructuring |
| `docs` | Documentation | None | Documentation changes |
| `chore` | Maintenance | None | Build, tooling |
| `build` | Maintenance | None | Build system |
| `ci` | Maintenance | None | CI configuration |
| `style` | Maintenance | None | Code formatting |
| `test` | Maintenance | None | Test additions |
| `revert` | Changed | Patch | Reverted changes |

### Breaking Change Detection

Breaking changes are detected from three sources:

1. The `!` indicator after the type/scope: `feat(api)!: remove v1 endpoints`
2. `BREAKING CHANGE:` footer in the commit body
3. `BREAKING-CHANGE:` footer (hyphenated variant)

### Co-Author Parsing

Extracts `Co-authored-by` trailers from commit messages:

```
Co-authored-by: Jane Doe <jane@example.com>
```

### Merge Commit Intelligence

Detects two merge commit patterns:

- `Merge pull request #123 from owner/branch` -- Extracts PR number and source branch
- `Merge branch 'feature/xyz'` -- Extracts source branch

### Commit Grouping

Related commits are grouped into single changelog entries using heuristics:

1. **Shared scope** -- Commits with the same scope are grouped
2. **Overlapping files** -- Commits modifying the same files are grouped
3. **Singleton** -- Ungrouped commits become individual entries

### Non-Conventional Commits

Commits that do not follow conventional format are:

1. Classified via the AI provider's `classifyCommit` method
2. Assigned a confidence score (0.0 to 1.0)
3. Commits below the threshold (default: 0.6) are flagged for manual review

## 2. Diff-Based Detection Engine

**File:** `src/lib/engines/diff-detector.ts`

### Structural Change Detection

Analyzes file diffs to detect:

| Change Type | Detection Method |
|-------------|-----------------|
| New/deleted files | File status in diff |
| Functions/methods | Regex: `function name`, `def name`, `const name =` |
| Classes | Regex: `class Name` |
| API endpoints | Regex: `GET/POST/PUT/PATCH/DELETE` exports, `@app.get()` decorators |
| Database migrations | File path patterns: `migrations/`, `.sql`, `schema.prisma` |
| Config changes | File path patterns: `.config.ts`, `.env`, `tsconfig.json` |
| Dependencies | Package manifest diff parsing (added/removed/updated) |

### Language Support

| Language | Detected Entities |
|----------|------------------|
| JavaScript/TypeScript | Functions, arrow functions, classes, interfaces, React components, API route handlers, exports |
| Python | Functions, classes, FastAPI/Flask route decorators |

Additional languages (Go, Rust, Java, Ruby) use file-level detection only.

### Noise Filtering

The following are automatically filtered out:

- Lock files (`*.lock`, `package-lock.json`, `pnpm-lock.yaml`)
- Build output (`dist/`, `build/`, `.next/`)
- OS files (`.DS_Store`)
- Environment files (`.env.local`)
- Minified files (`*.min.js`, `*.min.css`)
- Whitespace-only changes

Custom ignore patterns can be configured per repository.

### Impact Classification

| Level | Criteria | Examples |
|-------|----------|---------|
| Critical | Breaking API changes, security patches, data model changes | Removed public endpoint, migration |
| High | New user-facing features, significant behavior changes | New payment UI, deleted function |
| Medium | Internal improvements, config changes, dependency updates | Updated package version |
| Low | Documentation, tests, minor refactors | Added unit test |
| Negligible | Formatting, comments | Updated code comments |

## 3. Semantic Versioning Engine

**File:** `src/lib/engines/version-watcher.ts`

### Monitored Manifest Files

| Ecosystem | File | Version Field |
|-----------|------|---------------|
| Node.js | `package.json` | `"version": "x.y.z"` |
| Python | `pyproject.toml` | `version = "x.y.z"` |
| Rust | `Cargo.toml` | `version = "x.y.z"` |
| Go | `go.mod` | Via git tags |
| Ruby | `*.gemspec` | `.version = 'x.y.z'` |
| Java | `pom.xml` | `<version>x.y.z</version>` |
| .NET | `*.csproj` | `<Version>x.y.z</Version>` |
| Generic | `.version`, `VERSION` | File contents |

### Version Bump Detection

Compares manifest file diffs in push events. Detects:

- Direct version field edits
- Version bump tool output (`npm version`, `poetry version`)
- CI-driven version updates

### Tag Correlation

Matches detected version bumps to Git tags:

| Pattern | Example |
|---------|---------|
| `v{version}` | `v1.2.0` |
| `{version}` | `1.2.0` |
| `{package}@{version}` | `@mylib/core@1.2.0` |

### Semver Validation

Warns when detected changes conflict with the version increment:

- Breaking change + patch/minor bump: recommends major increment
- Features + patch bump: recommends minor increment

### Pre-release Support

Handles semver pre-release identifiers (`1.2.0-beta.1`) and build metadata (`1.2.0+build.42`). Pre-release versions are grouped separately.

## Orchestration

When a push event arrives:

1. Webhook handler creates `ChangeRecord` entries for each commit
2. Background job runs the commit analyzer on new commits
3. If a version bump is detected, the diff detector runs between versions
4. AI summarizes grouped commits and structural changes
5. A draft `Release` is created with `ChangelogEntry` records
6. The team is notified via the editor dashboard

## Extending

### Adding a New Language

To add language support to the diff detector:

1. Add regex patterns to `JS_TS_PATTERNS` or create a new pattern set
2. Map the file extension in `detectLanguage()`
3. The patterns should match added (`+`) and removed (`-`) lines in diffs

### Adding a New Manifest File

To support a new package ecosystem:

1. Add an entry to `MANIFEST_EXTRACTORS` in `version-watcher.ts`
2. Define the file pattern, ecosystem name, and version regex
