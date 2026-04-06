# AI Provider System

Changeloger uses a pluggable AI provider system for changelog generation. The system follows an adapter pattern, allowing different AI services to be swapped without changing business logic.

## Architecture

```
src/lib/ai/
  types.ts      -- AIProvider interface
  openai.ts     -- OpenAI implementation (default)
  anthropic.ts  -- Anthropic stub (planned)
  ollama.ts     -- Ollama stub (planned)
  index.ts      -- Factory function + caching layer
```

## Provider Interface

Every AI provider must implement the `AIProvider` interface:

```typescript
interface AIProvider {
  name: string
  summarizeCommits(commits: ParsedCommit[]): Promise<GeneratedEntry[]>
  describeChanges(changes: StructuralChange[]): Promise<string[]>
  classifyCommit(message: string, files?: string[]): Promise<{ type: string; confidence: number }>
  generateReleaseNotes(entries: GeneratedEntry[], version: string): Promise<string>
}
```

### Method Details

#### `summarizeCommits`

Takes an array of parsed git commits and returns grouped, human-readable changelog entries. The AI groups related commits, deduplicates, and produces entries with appropriate categories.

**Input:** Array of `ParsedCommit` objects (type, scope, subject, body, files changed)

**Output:** Array of `GeneratedEntry` objects (category, title, description, impact, confidence)

#### `describeChanges`

Takes structural code changes (from the diff detection engine) and returns plain-English descriptions suitable for non-technical audiences.

**Input:** Array of `StructuralChange` objects (file, entity type, change type)

**Output:** Array of description strings

#### `classifyCommit`

Classifies a non-conventional commit into a changelog category. Used when commits do not follow the Conventional Commits specification.

**Input:** Commit message string, optional array of changed file paths

**Output:** `{ type: string, confidence: number }` where type is a conventional commit type and confidence is 0.0-1.0

#### `generateReleaseNotes`

Produces a cohesive release notes narrative from individual changelog entries.

**Input:** Array of `GeneratedEntry` objects, version string

**Output:** Formatted Markdown string

## OpenAI Implementation

The default provider uses OpenAI's API with the `gpt-4o-mini` model.

### Configuration

```env
AI_PROVIDER=openai
AI_MODEL=gpt-4o-mini
OPENAI_API_KEY=sk-...
```

### Prompt Design

Each method uses a specialized system prompt:

- **summarizeCommits:** Instructs the model to produce JSON arrays of changelog entries, starting each title with a past-tense verb (Added, Fixed, Improved, Removed, Updated).
- **classifyCommit:** Uses low temperature (0.1) for deterministic classification.
- **describeChanges:** Instructs for brief, plain-English descriptions.
- **generateReleaseNotes:** Produces professional Markdown with summary paragraph and categorized details.

All structured outputs use `response_format: { type: "json_object" }` for reliable parsing.

### Temperature Settings

| Method | Temperature | Reasoning |
|--------|-------------|-----------|
| summarizeCommits | 0.3 | Low creativity, consistent output |
| describeChanges | 0.3 | Factual descriptions |
| classifyCommit | 0.1 | Deterministic classification |
| generateReleaseNotes | 0.4 | Slight creativity for narrative |

## Adding a New Provider

To add support for a new AI service:

1. Create a new file `src/lib/ai/{provider}.ts`

2. Implement the `AIProvider` interface:

```typescript
import type { AIProvider } from "./types"

export function createMyProvider(config: MyProviderConfig): AIProvider {
  return {
    name: "my-provider",

    async summarizeCommits(commits) {
      // Your implementation
    },

    async describeChanges(changes) {
      // Your implementation
    },

    async classifyCommit(message, files) {
      // Your implementation
    },

    async generateReleaseNotes(entries, version) {
      // Your implementation
    },
  }
}
```

3. Register in the factory (`src/lib/ai/index.ts`):

```typescript
case "my-provider": {
  const config = process.env.MY_PROVIDER_KEY
  if (!config) throw new Error("MY_PROVIDER_KEY required")
  cachedProvider = createMyProvider({ apiKey: config })
  break
}
```

4. Add the provider name to the `AI_PROVIDER` enum in `src/config/env.ts`

## Caching Strategy

AI responses are cached by input hash in Redis with a 7-day TTL. This ensures:

- Identical inputs (same commits/diffs) return cached results instantly
- API costs are minimized for repeated webhook processing
- Cache is automatically invalidated after 7 days

Cache key format: `ai:${method}:${sha256(JSON.stringify(input))}`

## Rate Limiting

Per-workspace rate limits prevent excessive AI usage:

| Plan | AI Generations / Month |
|------|----------------------|
| Free | 50 |
| Pro | 500 |
| Team | 2,000 |
| Enterprise | Unlimited |

When limits are reached, new AI generations are paused. Existing changelogs remain accessible and publishable. Admins receive a notification at 80% usage.

## Graceful Degradation

If the AI provider is unreachable, the system falls back to rule-based summarization:

- Conventional commit subjects are used as-is for entry titles
- Non-conventional commits are flagged for manual review
- A banner in the editor indicates reduced quality mode
- The system retries with exponential backoff (up to 3 attempts)
