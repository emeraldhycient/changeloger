# Contributing Guide

Thank you for your interest in contributing to Changeloger. This document covers everything you need to get started: development environment setup, code conventions, branching strategy, pull request process, testing requirements, and architectural constraints.

---

## Development Setup

### Prerequisites

| Tool | Version | Purpose |
|---|---|---|
| Node.js | 20+ | Runtime |
| pnpm | 9+ | Package manager |
| PostgreSQL | 16+ | Primary database |
| Redis | 7+ | Job queue and cache (optional for basic development; required for background job testing) |

### Getting Started

```bash
# Clone the repository
git clone https://github.com/your-org/changeloger.git
cd changeloger

# Install dependencies
pnpm install

# Copy the environment template
cp .env.example .env
```

Edit `.env` with your local configuration. At minimum, you need:

- `DATABASE_URL` pointing to a local PostgreSQL instance
- `JWT_SECRET` set to any random string (for local development)
- `NEXT_PUBLIC_APP_URL` set to `http://localhost:3000`

OAuth credentials and API keys are only required for testing those specific features.

```bash
# Set up the database
pnpm prisma migrate dev

# Start the development server
pnpm dev
```

The development server starts at `http://localhost:3000` with Turbopack enabled for fast hot module replacement.

### Useful Development Commands

| Command | Purpose |
|---|---|
| `pnpm dev` | Start dev server with Turbopack |
| `pnpm build` | Create a production build (use to verify before submitting a PR) |
| `pnpm lint` | Run ESLint |
| `pnpm typecheck` | Run the TypeScript compiler in check-only mode |
| `pnpm format` | Format all TypeScript files with Prettier |
| `pnpm prisma studio` | Open the Prisma database browser |
| `pnpm prisma migrate dev` | Apply pending migrations and generate client |
| `pnpm prisma migrate dev --name <name>` | Create a new migration |

---

## Code Style and Conventions

### File Naming

| Category | Convention | Example |
|---|---|---|
| Source files | `kebab-case.ts` | `commit-analyzer.ts`, `use-workspace.ts` |
| React components | `kebab-case.tsx` file, `PascalCase` export | `changelog-entry-card.tsx` exports `ChangelogEntryCard` |
| API routes | `route.ts` (Next.js App Router convention) | `src/app/api/repositories/[id]/route.ts` |
| Type definition files | `types.ts` within the relevant module | `src/lib/engines/types.ts` |
| Hook files | `use-<name>.ts` | `src/hooks/use-workspace.ts` |
| Query modules | `<entity>.ts` in `src/lib/db/queries/` | `src/lib/db/queries/releases.ts` |
| Test files | `<name>.test.ts` alongside the source file | `commit-analyzer.test.ts` |

### TypeScript Conventions

- **Strict mode is enabled.** The `tsconfig.json` enforces strict type checking. All code must compile without errors.
- **No `any` types.** Use `unknown` and narrow with type guards, or define proper interfaces.
- **No `@ts-ignore` or `@ts-expect-error`.** Fix the underlying type issue instead.
- **Prefer `interface` for object shapes.** Use `type` for unions, intersections, and mapped types.
- **Use Prisma-generated types** where they exist rather than redeclaring database shapes.
- **Shared types** go in `src/types/` for cross-cutting concerns, or in a local `types.ts` within the module directory for module-specific types.
- **Zod schemas** are the source of truth for API input validation. Derive TypeScript types from Zod schemas using `z.infer<>` rather than defining separate interfaces.

### Component Patterns

- **Use `"use client"` only when necessary.** Components that use React hooks, browser APIs, or event handlers need the directive. Server components are the default.
- **Props interfaces** are defined inline for simple components or as named types in the same file for complex ones. Do not create separate `props.ts` files.
- **Use shadcn/ui components** as the base for all UI elements. Do not introduce additional component libraries.
- **Use Lucide React or Phosphor Icons** for iconography. Do not mix icon libraries within a single feature area.
- **Tailwind CSS** is the only styling approach. Do not use CSS modules, styled-components, or inline style objects.
- **Use `cn()` from `src/lib/utils`** for conditional class merging (wraps `clsx` and `tailwind-merge`).

### API Route Patterns

API routes follow a thin-controller pattern. The route handler is responsible for:

1. Authentication (via `requireAuth()` or `requireWorkspaceRole()`)
2. Input validation (via Zod schemas)
3. Delegating to a service function in `src/lib/`
4. Returning a JSON response

```typescript
import { requireAuth } from "@/lib/auth/middleware"
import { handleApiError } from "@/lib/api/errors"
import { createReleaseSchema } from "@/lib/api/schemas"
import { createRelease } from "@/lib/db/queries/releases"

export async function POST(request: Request) {
  try {
    const session = await requireAuth()
    const body = await request.json()
    const parsed = createReleaseSchema.safeParse(body)

    if (!parsed.success) {
      return Response.json(
        { error: "Invalid input", details: parsed.error.format() },
        { status: 400 }
      )
    }

    const result = await createRelease(parsed.data)
    return Response.json(result, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
```

Rules:

- Always validate input with a Zod schema.
- Always check authentication before processing the request.
- Always use `handleApiError` for consistent error response formatting.
- Never call Prisma directly from route handlers. Use query functions in `src/lib/db/queries/`.
- Return appropriate HTTP status codes: `200` for success, `201` for creation, `204` for deletion, `400` for validation errors, `401` for unauthenticated, `403` for unauthorized, `404` for not found, `402` for plan limit exceeded.

### Database Access Patterns

- **Never import `prisma` directly** in API routes or components. All database access flows through typed query functions in `src/lib/db/queries/`.
- **Use the Prisma client proxy** from `src/lib/db/prisma.ts` within query functions.
- **Always scope queries by `workspace_id`** when accessing workspace-scoped data.
- **Use transactions** for operations that modify multiple related records.
- **Return plain objects** from query functions, not Prisma model instances, to maintain a clean boundary.

---

## Branch Naming

All branches must follow this naming convention:

| Prefix | Purpose | Example |
|---|---|---|
| `feature/` | New functionality | `feature/widget-badge-variant` |
| `fix/` | Bug fixes | `fix/oauth-callback-redirect` |
| `chore/` | Maintenance, dependencies, tooling | `chore/upgrade-prisma-7` |
| `docs/` | Documentation changes | `docs/add-engine-architecture` |

Branch names should be descriptive but concise. Use hyphens to separate words.

---

## Pull Request Process

### Before Opening a PR

1. **Create a branch** from `main` following the naming convention.
2. **Make focused, atomic commits.** Each commit should represent a logical unit of work. Use conventional commit messages when possible.
3. **Run checks locally** before pushing:

```bash
pnpm typecheck    # Must pass with zero errors
pnpm lint         # Must pass with zero errors
pnpm build        # Must complete successfully
```

4. **Write or update tests** for any changed business logic.

### Opening a PR

1. Push your branch and open a pull request against `main`.
2. Fill in the PR template with:
   - A clear description of **what** changed and **why**.
   - Screenshots or recordings for UI changes.
   - Notes on any migration or environment variable changes.
3. Request review from at least one maintainer.

### Review Checklist

Reviewers will verify:

- [ ] TypeScript compiles without errors (`pnpm typecheck`)
- [ ] Production build succeeds (`pnpm build`)
- [ ] Linting passes (`pnpm lint`)
- [ ] New API routes include Zod input validation
- [ ] New API routes use authentication middleware (`requireAuth` or `requireWorkspaceRole`)
- [ ] New database queries are scoped by `workspace_id` where applicable
- [ ] New components use shadcn/ui as the base
- [ ] No `any` types, `@ts-ignore`, or `@ts-expect-error` introduced
- [ ] No secrets, credentials, or API keys in the code
- [ ] JSONB column schemas are documented if new JSONB fields are added
- [ ] Database migrations are reviewed for destructive operations
- [ ] New environment variables are added to `.env.example`

### After Review

1. Address all review feedback with additional commits (do not force-push to preserve review context).
2. Once approved, the PR will be squash-merged into `main`.
3. The branch will be deleted after merge.

---

## Testing Requirements

### Unit Tests

- All functions in `src/lib/engines/` must have comprehensive unit tests.
- All functions in `src/lib/auth/` and `src/lib/billing/` must have unit tests.
- AI provider implementations should have tests with mocked API responses.
- Target: 90% code coverage on engine, auth, and billing modules.

### Integration Tests

- All API routes should have integration tests covering success and error paths.
- Database query functions should be tested against a test database.

### End-to-End Tests

- Critical user flows (onboarding, editor, publish, widget) should have Playwright E2E tests.
- E2E tests run against a complete local environment.

### Running Tests

```bash
# Unit and integration tests
pnpm test

# E2E tests
pnpm test:e2e

# Coverage report
pnpm test:coverage
```

---

## Architecture Constraints

These constraints are non-negotiable and must be followed in all contributions:

### Single Codebase

The frontend and backend live in the same Next.js application. Do not introduce a separate backend server, microservices, or a standalone API project. Background job workers are the only exception, and they share the same `src/lib/` code.

### Service Layer Separation

All business logic belongs in `src/lib/`. API routes are thin controllers. React components contain only presentation logic and state management. The dependency flow is:

```
API Route / Component -> src/lib/* (service layer) -> src/lib/db/* (data layer)
```

Never skip a layer (e.g., do not call Prisma from a component or embed business logic in an API route).

### Repository Pattern for Data Access

All database operations flow through typed query functions in `src/lib/db/queries/`. No raw Prisma calls in API routes, components, or hooks. This ensures:

- All queries are workspace-scoped by default.
- Query logic is testable in isolation.
- The Prisma client can be swapped or proxied without touching business logic.

### Adapter Pattern for External Services

AI providers, GitHub API access, billing, and email delivery all use adapter/interface patterns. This means:

- The `AIProvider` interface in `src/lib/ai/types.ts` abstracts the AI backend.
- The GitHub client in `src/lib/github/client.ts` wraps Octokit.
- The billing module in `src/lib/billing/` wraps Polar.
- The email module in `src/lib/email/` wraps Resend.

When adding a new external integration, define an interface first and implement against it. Do not scatter direct SDK calls throughout the codebase.

### Workspace-Scoped Multi-Tenancy

All data queries involving workspace-scoped resources must include a `workspace_id` filter. Do not rely on application-level routing alone for tenant isolation. The middleware layer validates workspace membership, but the query layer must also enforce scoping as defense in depth.

### No Direct DOM Manipulation

Use React's declarative model for all UI updates. Do not use `document.querySelector`, `innerHTML`, or direct DOM manipulation in dashboard or marketing components. The embeddable widget (in `widget-src/`) is the only exception, as it must operate without React.
