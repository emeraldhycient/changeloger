# Contributing Guide

## Development Setup

### Prerequisites

- Node.js 20+
- pnpm 9+
- PostgreSQL 16
- Redis (optional for development, required for job queue)

### Getting Started

```bash
git clone https://github.com/your-org/changeloger.git
cd changeloger
pnpm install
cp .env.example .env
# Edit .env with your local database credentials and OAuth keys
npx prisma migrate dev
pnpm dev
```

The development server runs at `http://localhost:3000` with Turbopack for fast HMR.

## Code Style

### File Naming

- Files: `kebab-case.ts` (e.g., `commit-analyzer.ts`, `use-workspace.ts`)
- Components: `PascalCase` in exports, `kebab-case` filenames (e.g., `changelog-entry-card.tsx` exports `ChangelogEntryCard`)
- API routes: `route.ts` in Next.js App Router convention

### TypeScript

- Strict mode enabled, no `any` types, no `ts-ignore`
- Shared types in `src/types/`
- Use Prisma-generated types where available
- Prefer `interface` for object shapes, `type` for unions/intersections

### Component Patterns

- Use `"use client"` only when React hooks or browser APIs are needed
- Props interfaces defined inline or as named types in the same file
- Use shadcn/ui components as the base for all UI
- Use lucide-react for icons

### API Route Patterns

API routes are thin controllers that delegate to service functions:

```typescript
export async function POST(request: Request) {
  try {
    const session = await requireAuth()
    const body = await request.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) throw new ValidationError("Invalid input", parsed.error.format())

    const result = await serviceFunction(parsed.data)
    return Response.json(result, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
```

- Always validate input with Zod
- Always use `handleApiError` for error responses
- Always check auth with `requireAuth` or `requireWorkspaceRole`

### Database Access

- Never call Prisma directly from API routes or components
- Use typed query functions in `src/lib/db/queries/`
- Use the `prisma` proxy from `src/lib/db/prisma.ts`

## Branch Naming

```
feature/description    -- New features
fix/description        -- Bug fixes
chore/description      -- Maintenance, tooling, dependencies
docs/description       -- Documentation changes
```

## Pull Request Process

1. Create a branch from `main`.
2. Make your changes with clear, atomic commits.
3. Ensure `pnpm typecheck` passes with zero errors.
4. Ensure `pnpm build` completes successfully.
5. Open a PR with a description of what changed and why.
6. Address review feedback.

### PR Checklist

- [ ] TypeScript compiles without errors
- [ ] Production build succeeds
- [ ] New API routes have Zod input validation
- [ ] New API routes use auth middleware
- [ ] New components use shadcn/ui as base
- [ ] No `any` types introduced
- [ ] No secrets or credentials in code

## Architecture Constraints

- **Single codebase:** Frontend and backend live in the same Next.js app. No separate backend server.
- **Service layer:** All business logic goes in `src/lib/`, never in API routes or components.
- **Repository pattern:** All database access through `src/lib/db/queries/`, never raw Prisma in routes.
- **Adapter pattern:** AI providers, future Git platforms, and payment providers use adapters.
- **DRY:** Extract shared logic into `src/lib/`. If something is used in 2+ places, it belongs in a shared module.

## Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server with Turbopack |
| `pnpm build` | Production build |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm typecheck` | Run TypeScript compiler check |
| `pnpm format` | Format code with Prettier |
