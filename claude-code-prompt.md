# Changeloger — Full Build Prompt for Claude Code

You are building **Changeloger**, a web-first SaaS platform that automates changelog generation for software teams. The attached PRD (`changeloger-prd-v2_3.docx`) is the single source of truth — read it fully before writing any code.

Below is a condensed build specification. Where this prompt and the PRD conflict, the PRD wins.

---

## 1. What You're Building

A Next.js 15 monolithic full-stack application (frontend + backend in one codebase) that:

1. Lets users sign up with **Google or GitHub OAuth**, install the **Changeloger GitHub App** to their repos from the web dashboard
2. Monitors GitHub repos via webhooks and runs **three detection engines** (git commit analysis, diff-based detection, semantic versioning triggers)
3. Uses **AI** (OpenAI, pluggable) to summarize raw changes into human-readable changelog entries
4. Provides a **collaborative web editor** where teams review, edit, reorder, and publish changelogs
5. Generates **embeddable widgets** (page, modal, badge) that teams copy-paste into their product
6. Supports **team management** with role-based access (Owner, Admin, Editor, Viewer)
7. Tracks **analytics** (page views, unique visitors, per-entry engagement, traffic sources)
8. Has an **enterprise-grade marketing site** (landing pages, pricing, features, blog, docs) built with Tailwind CSS and shadcn/ui
9. Manages **subscription billing** via Polar (Free, Pro $15/mo, Team $40/mo, Enterprise)

---

## 2. Tech Stack (Non-Negotiable)

| Layer | Technology |
|-------|-----------|
| Framework | **Next.js 15** (App Router, TypeScript) — single codebase for frontend + backend |
| UI Components | **shadcn/ui** + Radix UI primitives |
| Styling | **Tailwind CSS 4** |
| State Management | **Zustand** (client-side UI state only) |
| Server State | **TanStack Query (React Query)** with **Axios** |
| Database | **PostgreSQL 16** with **Prisma** ORM |
| Cache / Queue | **Redis** (via BullMQ for background jobs) |
| Auth | **Google OAuth 2.0** + **GitHub OAuth 2.0** (JWT sessions in httpOnly cookies) |
| Payments | **Polar** (subscriptions, checkout, customer portal, webhooks) |
| AI | **OpenAI API** (default), pluggable adapter for Anthropic / Ollama |
| Git Integration | **GitHub App** via Octokit (REST + GraphQL) |
| AST Parsing | **Tree-sitter** (WASM bindings, server-side) |
| Testing | **Vitest** (unit/integration) + **Playwright** (E2E) |
| Hosting Target | **Vercel** (primary) or self-hosted Node.js |

---

## 3. Project Structure

Use a clean, scalable Next.js App Router structure. Keep the codebase DRY — extract shared logic into reusable modules.

```
changeloger/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (marketing)/              # Route group: public marketing pages
│   │   │   ├── page.tsx              # Home / hero landing page
│   │   │   ├── features/page.tsx
│   │   │   ├── pricing/page.tsx
│   │   │   ├── changelog/page.tsx    # Meta changelog (dogfooding)
│   │   │   ├── blog/page.tsx
│   │   │   ├── docs/page.tsx
│   │   │   ├── about/page.tsx
│   │   │   ├── contact/page.tsx
│   │   │   ├── sign-in/page.tsx
│   │   │   ├── sign-up/page.tsx
│   │   │   └── layout.tsx            # Marketing layout (nav + footer)
│   │   ├── (dashboard)/              # Route group: authenticated app
│   │   │   ├── layout.tsx            # Dashboard layout (sidebar + topbar)
│   │   │   ├── page.tsx              # Dashboard home / overview
│   │   │   ├── repositories/
│   │   │   ├── editor/
│   │   │   ├── changelogs/
│   │   │   ├── team/
│   │   │   ├── analytics/
│   │   │   ├── settings/
│   │   │   └── onboarding/
│   │   ├── api/                      # Next.js API routes (backend)
│   │   │   ├── auth/
│   │   │   │   ├── google/route.ts
│   │   │   │   ├── github/route.ts
│   │   │   │   ├── callback/[provider]/route.ts
│   │   │   │   └── logout/route.ts
│   │   │   ├── workspaces/
│   │   │   ├── repositories/
│   │   │   ├── releases/
│   │   │   ├── widgets/
│   │   │   ├── analytics/
│   │   │   └── webhooks/
│   │   │       ├── github/route.ts
│   │   │       └── polar/route.ts
│   │   └── layout.tsx                # Root layout
│   ├── components/
│   │   ├── ui/                       # shadcn/ui components (copy-paste)
│   │   ├── marketing/                # Landing page sections
│   │   ├── dashboard/                # Dashboard-specific components
│   │   ├── editor/                   # Changelog editor components
│   │   └── shared/                   # Shared across marketing + dashboard
│   ├── lib/
│   │   ├── db/                       # Prisma client, queries, seeds
│   │   │   ├── prisma.ts
│   │   │   ├── schema.prisma
│   │   │   └── queries/              # Typed query functions per entity
│   │   ├── auth/                     # OAuth logic, JWT, session management
│   │   ├── github/                   # GitHub App: installation, webhooks, API calls
│   │   ├── engines/                  # The three detection engines
│   │   │   ├── commit-analyzer.ts
│   │   │   ├── diff-detector.ts
│   │   │   ├── version-watcher.ts
│   │   │   └── types.ts
│   │   ├── ai/                       # AI provider adapter system
│   │   │   ├── types.ts              # Common interface
│   │   │   ├── openai.ts
│   │   │   ├── anthropic.ts
│   │   │   ├── ollama.ts
│   │   │   └── index.ts              # Factory / provider selector
│   │   ├── billing/                  # Polar integration
│   │   ├── analytics/                # Event ingestion + aggregation
│   │   ├── widgets/                  # Widget serving + embed token logic
│   │   └── utils/                    # Shared utilities
│   ├── hooks/                        # Custom React hooks
│   ├── stores/                       # Zustand stores
│   ├── types/                        # Shared TypeScript types
│   └── config/                       # App config, env validation
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── public/
│   └── widget/                       # Embeddable widget JS bundle
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── docs/                             # Project documentation
├── .env.example
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── vitest.config.ts
├── playwright.config.ts
└── package.json
```

---

## 4. Implementation Order (Follow the Milestones)

Build in this exact order. Each milestone must be fully working and tested before moving to the next.

### M1: Foundation + Landing (Weeks 1–4)
1. Initialize Next.js 15 project with TypeScript, Tailwind CSS 4, shadcn/ui
2. Set up PostgreSQL + Prisma schema (users, oauth_accounts, sessions, workspaces, workspace_members, invitations)
3. Implement Google and GitHub OAuth 2.0 flows (sign-up, sign-in, callback, session management with JWT in httpOnly cookies)
4. Build the complete marketing site with ALL sections from PRD Section 6:
   - **Design system**: Deep navy (#0F172A) backgrounds, violet accent (#6C63FF), Inter + JetBrains Mono fonts, dark mode default
   - **Home page**: Sticky nav (backdrop-blur-xl), hero with animated product demo, social proof logo bar, 3-column feature grid, live changelog preview component, alternating feature deep-dives, integration icons, testimonials carousel, inline pricing preview, bottom CTA, comprehensive footer
   - **Pricing page**: Monthly/annual toggle with animated price counter, 3 plan cards (Free/Pro/Team) with Pro elevated + "Popular" badge, enterprise section, full feature comparison matrix (shadcn Table + Accordion), FAQ accordion
   - **Features page**: Sticky anchor nav (IntersectionObserver), 8 feature sections with screenshots, comparison table vs. manual/existing tools, inter-section CTAs
   - **Changelog page**: Self-hosted changelog powered by Changeloger itself
   - **Additional pages**: Blog, Docs, About, Contact, Legal (privacy/terms), Sign-in, Sign-up
   - All pages: Lighthouse >95, LCP <1.5s, CLS <0.05, WCAG 2.1 AA, responsive breakpoints (mobile/tablet/desktop/wide)
5. Build dashboard shell (sidebar + topbar layout, workspace selector, empty states)
6. Set up Zustand stores (workspace selection, UI state) and TanStack Query + Axios data layer

### M2: GitHub Integration (Weeks 5–7)
1. Create and register the Changeloger GitHub App with proper permissions (contents: read, metadata: read, webhooks: read+write)
2. Build the installation flow in the dashboard (redirect to GitHub → callback → store installation → sync repos)
3. Implement webhook receiver (`/api/webhooks/github`) for push, create (tag), and release events
4. GitHub webhook signature verification
5. Repository connection UI (list synced repos, activate/deactivate, configure branches and ignore paths)

### M3: Detection Engines (Weeks 8–11)
1. **Git Commit Analysis Engine**:
   - Conventional commit parser (feat, fix, chore, docs, style, refactor, perf, test, build, ci, revert)
   - Extract type, scope, breaking change indicator (!), subject, body, BREAKING CHANGE footers
   - Non-conventional commit handling via AI classification with confidence scoring
   - Commit grouping heuristics (shared scope, overlapping files, temporal proximity, semantic similarity)
   - Merge commit intelligence (extract source branch, PR number, squashed commits)
   - Author attribution with Co-authored-by trailer parsing
2. **Diff-Based Detection Engine**:
   - Fetch diffs via GitHub Compare API between two references
   - Tree-sitter AST parsing for JS/TS and Python (extensible to Go, Rust, Java, Ruby)
   - Detect: new files, deleted files, new/modified functions/classes, API endpoints, migrations, config changes, dependency changes
   - AI description generation for each structural change
   - Noise filtering (whitespace, lock files, build output, formatting-only, ignored paths)
   - Impact classification (Critical/High/Medium/Low/Negligible)
3. **Semantic Versioning Trigger Engine**:
   - Monitor package.json, pyproject.toml, Cargo.toml, go.mod, *.gemspec, pom.xml, *.csproj, .version files
   - Detect version bumps in push event diffs
   - Tag correlation (v{version}, {version}, {package}@{version}, custom patterns)
   - Compile changes from both engines into structured draft changelog
   - Semver validation warnings (breaking change with patch/minor bump)
   - Pre-release and build metadata support
4. **AI Provider Adapter System**:
   - Common interface: summarizeCommits, describeChanges, classifyCommit, generateReleaseNotes
   - OpenAI implementation (default)
   - Response caching in Redis (7-day TTL)
   - Rate limiting
   - Batch processing

### M4: Editor and Publishing (Weeks 12–14)
1. Changelog editor UI:
   - Draft management (auto-created from webhook events, "Draft" badge, auto-save)
   - Entry cards showing: category badge, title, description, impact level, confidence score, source info, authors
   - Inline editing with rich text (bold, italic, code, links) via TanStack Query optimistic mutations
   - Drag-and-drop reorder, move between categories, split/merge entries, delete, create new
   - Version assignment (auto-detected or manual, semver increment suggestion)
2. Publish flow:
   - Validate all entries have titles
   - Assign publish timestamp
   - Generate rendered output (Markdown, HTML, JSON)
   - Update all embedded widgets instantly
   - Optional webhook notification
3. Revision history (full snapshot per publish, side-by-side compare, revert)
4. Collaborative editing (WebSocket real-time sync, cursor presence, last-write-wins)

### M5: Widgets and Embed (Weeks 15–17)
1. Build three widget types:
   - **Page widget**: Full changelog rendered into a target div via script tag
   - **Modal widget**: Floating button + modal overlay with changelog content
   - **Badge widget**: Notification indicator (dot or count) on any element
2. Widget configuration UI in dashboard (colors, fonts, logo, dark/light/auto, category toggles, CSS override)
3. Copy-paste embed snippet generation (single script tag with embed token)
4. CDN delivery for widget JS bundle (<30KB gzipped, async loading, <200ms render)
5. Auto-update on publish (next page load refreshes content; open modals show refresh prompt)
6. Widget analytics integration (page_view and entry_click events with embed token auth)

### M6: Teams and Access (Weeks 18–19)
1. Email invitation flow (send invite link, sign-up if needed, accept into workspace)
2. Role-based access control (Viewer: read-only, Editor: edit+publish, Admin: team+billing, Owner: full+transfer)
3. Workspace member management UI
4. Per-repo access restrictions (Team/Enterprise plans)
5. Audit log (invitations, role changes, publishes, deletions)
6. API middleware enforcing role checks on every endpoint

### M7: Analytics (Weeks 20–21)
1. Analytics event ingestion pipeline:
   - Lightweight script in widget bundle fires events: page_load, entry_click, scroll_depth (25/50/75/100%), session_end
   - Batched 5-second interval sends to `/api/widgets/:embed_token/events`
   - Anonymized browser fingerprinting (user agent + screen resolution + timezone hash, no cookies, no PII)
2. Daily rollup aggregation (analytics_daily table)
3. Analytics dashboard:
   - Time-series line chart (views + visitors, zoomable with comparison overlay)
   - Bar chart for per-entry engagement (sortable)
   - Pie/donut chart for traffic sources
   - Heatmap for read depth distribution
   - Summary card row with key metrics + trend arrows
   - Real-time active viewer count (WebSocket)
4. CSV/JSON export
5. GDPR-compliant by design (opt-out via data attribute on script tag)

### M8: Pricing and Billing (Weeks 22–23)
1. Polar integration:
   - Checkout for initial subscription
   - Customer Portal for plan changes and payment updates
   - Webhook handler (`/api/webhooks/polar`) for lifecycle events
2. Plan enforcement at API level (free tier: 1 repo, 1 member, 50 AI generations/mo, last 5 versions)
3. Usage metering (AI generations per workspace per billing cycle, 80% warning notification)
4. 14-day free trial of Pro plan (no credit card required, auto-downgrade to Free)
5. Annual billing with 20% discount

### M9: Beta Release (Weeks 24–26)
1. Onboarding polish and user feedback integration
2. Performance optimization (all targets in PRD Section 14.1)
3. Bug fixes, edge case handling
4. Documentation site
5. Feedback collection mechanism

---

## 5. Database Schema (Prisma)

Implement these tables exactly as specified in PRD Section 11. Use Prisma with PostgreSQL.

**Core tables**: users, oauth_accounts, sessions, workspaces, workspace_members, invitations, github_installations, repositories, change_records, changelog_entries, releases, release_revisions, widgets, analytics_events, analytics_daily

**Key design decisions**:
- Multi-tenant via workspace_id on all data tables
- PostgreSQL Row-Level Security (RLS) as defense-in-depth
- JSONB columns for: repository config, files_changed, authors, entry metadata, widget config, analytics metadata
- analytics_events partitioned by month
- UUID primary keys throughout
- Proper indexes on foreign keys and frequently queried columns

---

## 6. Architecture and Code Quality Rules

Follow these strictly throughout the entire codebase:

### DRY Principle
- Extract all shared logic into `lib/` modules — never duplicate query logic, auth checks, or validation
- Create reusable React components in `components/shared/` for anything used in 2+ places
- Build typed query functions in `lib/db/queries/` — components never call Prisma directly
- Use a single Axios instance configured in `lib/api/client.ts` with interceptors for auth, error handling, and logging
- Centralize all environment variable access in `config/env.ts` with Zod validation

### Clean Architecture
- **Separation of concerns**: API routes are thin controllers that call service functions in `lib/`
- **Service layer** (`lib/engines/`, `lib/ai/`, `lib/github/`, `lib/billing/`, `lib/analytics/`): all business logic lives here, independent of HTTP/Next.js
- **Repository pattern**: all database access goes through typed query functions, never raw Prisma calls in routes or components
- **Adapter pattern** for AI providers, future Git platform integrations (GitLab/Bitbucket), and payment providers
- **Error handling**: custom error classes (AppError, AuthError, BillingError, GitHubError), consistent error response format `{ error: string, code: string, details?: any }`
- **Input validation**: Zod schemas for all API request bodies, query params, and environment variables
- **Middleware**: reusable auth guard, role check, workspace scoping, rate limiting middleware for API routes

### TypeScript
- Strict mode enabled, no `any` types, no `ts-ignore`
- Shared types in `types/` — never define the same type in two files
- Prisma generates types from schema — use them everywhere
- Discriminated unions for AI provider configs, webhook event types, widget types

### Naming Conventions
- Files: kebab-case (`commit-analyzer.ts`, `use-workspace.ts`)
- Components: PascalCase (`ChangelogEditor.tsx`, `PricingCard.tsx`)
- Functions/variables: camelCase
- Types/interfaces: PascalCase with descriptive names (`ChangelogEntry`, `WorkspaceMember`)
- API routes: RESTful (`GET /api/workspaces/:id/repositories`, not `/api/getRepos`)
- Database: snake_case tables and columns (Prisma maps to camelCase in TypeScript)

### Consistent Theme
- All colors derive from Tailwind config tokens defined in PRD Section 6.2.3
- Primary: violet-600 (#6C63FF), background: slate-950 (dark) / white (light)
- Typography: Inter (body), JetBrains Mono (code)
- Spacing: Tailwind default scale, sections py-24 to py-32, content max-w-7xl
- Border radius: rounded-xl (12px) cards, rounded-lg (8px) buttons, rounded-full badges
- Dark mode is DEFAULT for marketing site; system preference + manual toggle for dashboard
- All shadcn/ui components customized to match brand (see PRD Section 6.2.2 for each component)
- Framer Motion for scroll animations (fade-in-up, 200ms ease-out, respects prefers-reduced-motion)

---

## 7. Testing Requirements

### Unit Tests (Vitest)
Write unit tests for every module in `lib/`. Minimum coverage targets:
- Detection engines (commit parser, diff detector, version watcher): >90% coverage
- AI adapter interface compliance: test each provider implementation
- Auth logic (JWT creation/verification, OAuth flow, role checks): >90%
- Billing logic (plan enforcement, usage metering, trial management): >90%
- Utility functions: 100%

### Integration Tests (Vitest)
- API route tests using Next.js test helpers: all 19+ endpoints from PRD Section 13.2
- Database query tests against a test PostgreSQL instance
- GitHub webhook processing (mock webhook payloads → verify correct change_records created)
- Polar webhook processing (subscription lifecycle events)

### E2E Tests (Playwright)
- Complete onboarding flow: sign-up → install GitHub App → see repos → first changelog generated
- Editor flow: open draft → edit entry → reorder → publish → verify widget updates
- Team flow: invite member → accept invitation → role enforcement
- Billing flow: upgrade plan → verify feature access → downgrade → verify limits
- Widget rendering: embed snippet on test page → verify changelog renders → verify analytics events fire
- Marketing site: navigation, responsive layout, pricing toggle, dark mode

### Test Conventions
- Test files co-located with source: `commit-analyzer.test.ts` next to `commit-analyzer.ts`
- E2E tests in `tests/e2e/`
- Use factories for test data generation (never hardcode UUIDs or timestamps)
- Mock external services (GitHub API, OpenAI, Polar) at the adapter boundary
- CI-ready: all tests runnable via `npm test` (unit + integration) and `npm run test:e2e`

---

## 8. Documentation

Create comprehensive documentation in `docs/`:

- **README.md** (root): Project overview, quick start, tech stack, environment setup, development commands
- **docs/architecture.md**: System architecture diagram (mermaid), data flow, layer responsibilities, key design decisions
- **docs/api.md**: Full API reference for all endpoints (method, path, request body, response, auth requirement, example)
- **docs/database.md**: Schema documentation with entity relationships, index strategy, RLS policies
- **docs/engines.md**: How each detection engine works, configuration options, extending with new languages
- **docs/ai-providers.md**: How to add a new AI provider, the adapter interface, caching strategy
- **docs/widgets.md**: Widget types, embed snippet format, customization options, analytics events
- **docs/deployment.md**: Vercel deployment, self-hosted setup, environment variables, database migrations
- **docs/contributing.md**: Code style, PR process, testing requirements, branch naming

Every public function and class should have JSDoc comments. Complex logic gets inline comments explaining *why*, not *what*.

---

## 9. Environment Variables

Create `.env.example` with all required variables:

```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/changeloger

# Redis
REDIS_URL=redis://localhost:6379

# Auth - Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/callback/google

# Auth - GitHub OAuth
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_CALLBACK_URL=http://localhost:3000/api/auth/callback/github

# GitHub App
GITHUB_APP_ID=
GITHUB_APP_PRIVATE_KEY=
GITHUB_APP_WEBHOOK_SECRET=

# AI
OPENAI_API_KEY=
AI_PROVIDER=openai  # openai | anthropic | ollama
AI_MODEL=gpt-4o-mini

# Billing
POLAR_ACCESS_TOKEN=
POLAR_WEBHOOK_SECRET=
POLAR_ORGANIZATION_ID=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
JWT_SECRET=
JWT_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d

# Widget CDN
WIDGET_CDN_URL=http://localhost:3000/widget
```

Validate ALL env vars at startup with Zod. Fail fast with clear error messages for missing vars.

---

## 10. Performance Targets

These are non-negotiable. Measure and verify:

| Metric | Target |
|--------|--------|
| Dashboard LCP | <2 seconds |
| Marketing page LCP | <1.5 seconds |
| Lighthouse (marketing) | >95 |
| API p95 response time | <200ms reads, <500ms writes |
| Webhook → draft visible | <30 seconds |
| AI summarization (50 commits) | <5 seconds |
| Widget bundle size | <30KB gzipped |
| Widget render | <200ms |
| Editor operations (drag/reorder) | <100ms |
| Analytics dashboard query (90 days) | <1 second |

---

## 11. Security Checklist

- [ ] OAuth-only auth (no passwords stored)
- [ ] JWT in httpOnly, secure, SameSite=Strict cookies; 15-min expiry with refresh token rotation
- [ ] GitHub App installation tokens encrypted at rest, auto-refreshed (1-hour expiry)
- [ ] GitHub webhook signature verification (HMAC SHA-256)
- [ ] Polar webhook signature verification
- [ ] Only commit messages, file paths, and structural summaries sent to AI — never raw source code (unless user opts in)
- [ ] PostgreSQL RLS for multi-tenant data isolation
- [ ] Widget embed tokens are random UUIDs, rotatable, with optional domain whitelisting
- [ ] All inputs validated with Zod before processing
- [ ] Parameterized queries via Prisma (no SQL injection)
- [ ] CSRF protection on all state-changing endpoints
- [ ] Security headers: CSP, HSTS, X-Frame-Options, X-Content-Type-Options
- [ ] Rate limiting on auth endpoints, AI generation, and webhook ingestion

---

## Important Notes

- **Read the full PRD before starting.** It contains detailed functional requirements (FR-EDIT-001 through FR-EDIT-008, FR-WIDGET-001 through FR-WIDGET-006, FR-TEAM-001 through FR-TEAM-004, FR-ANALYTICS-001 through FR-ANALYTICS-005, FR-BILLING-001 through FR-BILLING-005, FR-LP-001 through FR-LP-029, FR-GIT-001 through FR-GIT-007, FR-DIFF-001 through FR-DIFF-006, FR-SV-001 through FR-SV-006) that must all be implemented.
- **No CLI.** Everything happens through the web UI. CLI is Phase 2.
- **Ship incrementally.** Each milestone should be a working, tested state. Don't skip ahead.
- **Ask questions** if any requirement is ambiguous rather than guessing.
- When in doubt, favor **simplicity over cleverness**, **readability over brevity**, and **explicit over implicit**.
