# Changeloger — Master Task Breakdown (M2–M9)

M1 is complete. This document breaks down all remaining work into parallelizable work units.

---

## M2: GitHub Integration

### M2.1 — GitHub Client & Types
- `src/lib/github/types.ts` — Webhook payload types, API response types, installation types
- `src/lib/github/client.ts` — Octokit wrapper, authenticated API calls using installation tokens
- `src/lib/github/installation.ts` — Token exchange, refresh logic, installation management

### M2.2 — Webhook Infrastructure
- `src/app/api/webhooks/github/route.ts` — Webhook receiver with HMAC SHA-256 signature verification
- Handle event types: push, create (tag), release
- Idempotent processing (check if already processed by commit SHA)
- Enqueue background jobs via BullMQ

### M2.3 — Repository Management API
- `src/app/api/repositories/route.ts` — GET list repos, POST connect repo
- `src/app/api/repositories/[id]/route.ts` — GET config, PATCH update, DELETE disconnect
- `src/lib/db/queries/repositories.ts` — Typed query functions

### M2.4 — GitHub App Installation Flow
- `src/app/api/auth/github/installation/route.ts` — Handle GitHub App installation callback
- Dashboard "Connect Repository" button → redirect to GitHub App install page
- Callback stores installation, syncs repos list

### M2.5 — Repository Dashboard UI
- `src/components/dashboard/repository-list.tsx` — Connected repos list with status indicators
- `src/components/dashboard/repository-config.tsx` — Per-repo settings (branches, ignore paths, AI)
- `src/components/dashboard/github-connect-button.tsx` — Install GitHub App CTA
- Update `src/app/(dashboard)/dashboard/repositories/page.tsx`

---

## M3: Detection Engines

### M3.1 — Conventional Commit Parser
- `src/lib/engines/types.ts` — ParsedCommit, StructuralChange, EngineResult types
- `src/lib/engines/commit-analyzer.ts` — Parse conventional commits (type, scope, breaking, body, footers), Co-authored-by parsing, merge commit detection, commit grouping heuristics

### M3.2 — AI Provider Adapter System
- `src/lib/ai/types.ts` — AIProvider interface (summarizeCommits, describeChanges, classifyCommit, generateReleaseNotes)
- `src/lib/ai/openai.ts` — OpenAI implementation with GPT-4o-mini
- `src/lib/ai/anthropic.ts` — Stub
- `src/lib/ai/ollama.ts` — Stub
- `src/lib/ai/index.ts` — Factory/selector, Redis caching (7-day TTL), rate limiting, batch processing

### M3.3 — Diff-Based Detection Engine
- `src/lib/engines/diff-detector.ts` — Fetch diffs via GitHub Compare API, detect structural changes (new files, deleted files, new functions/classes, API endpoints, migrations, config changes, dependency changes)
- `src/lib/engines/parsers/tree-sitter.ts` — AST parsing for JS/TS and Python (extensible)
- Noise filtering (whitespace, lock files, build output, formatting-only)
- Impact classification (Critical/High/Medium/Low/Negligible)

### M3.4 — Semantic Versioning Engine
- `src/lib/engines/version-watcher.ts` — Monitor manifest files (package.json, pyproject.toml, Cargo.toml, go.mod, etc.)
- Version bump detection from push diffs
- Tag correlation (v{version}, {version}, {package}@{version})
- Change compilation: collect all commits between versions, run through both engines, merge/dedupe
- Semver validation warnings
- Pre-release support

### M3.5 — Background Job Processing
- `src/lib/jobs/queue.ts` — BullMQ queue setup with Redis
- `src/lib/jobs/process-webhook.ts` — Process GitHub webhook events
- `src/lib/jobs/analyze-changes.ts` — Run commit analyzer + diff detector
- `src/lib/jobs/generate-draft.ts` — Create draft Release with AI-generated ChangelogEntries

---

## M4: Editor & Publishing

### M4.1 — Release & Entry API Routes
- `src/app/api/repositories/[id]/releases/route.ts` — GET list, POST create draft
- `src/app/api/repositories/[id]/releases/[version]/route.ts` — GET release with entries, PUT update
- `src/app/api/repositories/[id]/releases/[version]/publish/route.ts` — POST publish
- `src/app/api/repositories/[id]/releases/[version]/entries/route.ts` — CRUD for entries
- `src/lib/db/queries/releases.ts` — Release queries
- `src/lib/db/queries/changelog-entries.ts` — Entry queries (CRUD, reorder)

### M4.2 — Changelog Editor UI
- `src/components/editor/editor-header.tsx` — Version selector, publish button, save status
- `src/components/editor/changelog-entry-card.tsx` — Editable entry card (category badge, title, description, impact, confidence, authors)
- `src/components/editor/entry-list.tsx` — Drag-and-drop list with @dnd-kit
- `src/components/editor/category-selector.tsx` — Category dropdown
- `src/components/editor/impact-selector.tsx` — Impact level selector
- Update `src/app/(dashboard)/dashboard/editor/page.tsx` — Full editor page

### M4.3 — Publish Flow & Rendering
- `src/lib/releases/publish.ts` — Validate entries, set timestamp, update status
- `src/lib/releases/render.ts` — Generate Markdown, HTML, JSON output
- `src/lib/releases/snapshots.ts` — Create ReleaseRevision snapshots
- Revision history UI (compare, revert)

### M4.4 — Collaborative Editing (WebSocket)
- WebSocket server for real-time sync
- Cursor presence tracking
- Last-write-wins conflict resolution
- `src/hooks/use-collaborative-editing.ts`
- `src/components/editor/collaborative-cursor.tsx`

---

## M5: Widgets & Embed

### M5.1 — Widget Bundle
- `widget-src/index.ts` — Entry point, load config from script tag data attributes
- `widget-src/page-widget.ts` — Full-page changelog renderer
- `widget-src/modal-widget.ts` — Modal overlay with trigger button
- `widget-src/badge-widget.ts` — Notification badge (dot/count)
- `widget-src/renderer.ts` — Render changelog entries from JSON
- `widget-src/analytics.ts` — Fire page_view, entry_click events
- `widget-src/styles.ts` — CSS generation from config
- Build pipeline (esbuild) → `public/widget/changeloger.js` (<30KB gzipped)

### M5.2 — Widget API
- `src/app/api/widgets/[embedToken]/changelog/route.ts` — GET changelog data
- `src/app/api/widgets/[embedToken]/events/route.ts` — POST analytics events
- `src/app/api/widgets/route.ts` — CRUD widgets for a repo
- `src/lib/widgets/token.ts` — Token generation, validation, domain whitelisting

### M5.3 — Widget Configuration UI
- `src/components/dashboard/widget-config-form.tsx` — Colors, fonts, logo, categories, dark/light
- `src/components/dashboard/embed-code-snippet.tsx` — Copy-paste snippet
- `src/components/dashboard/widget-preview.tsx` — Live preview
- Dashboard widgets page at `src/app/(dashboard)/dashboard/widgets/page.tsx`

---

## M6: Teams & Access

### M6.1 — Email Invitations
- `src/lib/email/send.ts` — Email service (Resend)
- `src/lib/email/templates/invitation.tsx` — Invitation email template
- `src/app/api/workspaces/[id]/invitations/[token]/accept/route.ts` — Accept invitation
- `src/app/(marketing)/invitations/[token]/page.tsx` — Invitation landing page

### M6.2 — Role Enforcement
- Update `src/lib/auth/middleware.ts` — Enforce roles on all endpoints
- Per-repo access restrictions (Team/Enterprise plans)
- `src/lib/auth/rbac.ts` — Role-based access control helpers

### M6.3 — Audit Log
- Add AuditLog model to Prisma schema
- `src/lib/db/queries/audit-logs.ts` — Create/query audit entries
- `src/app/api/workspaces/[id]/audit-log/route.ts` — GET audit log
- `src/components/dashboard/audit-log-table.tsx` — Audit log UI

### M6.4 — Team Management UI
- Update `src/app/(dashboard)/dashboard/team/page.tsx` — Members list, invite form
- `src/components/dashboard/invite-modal.tsx` — Invite dialog
- `src/components/dashboard/member-row.tsx` — Member with role selector
- `src/hooks/use-team-members.ts`, `src/hooks/use-invitations.ts`

---

## M7: Analytics

### M7.1 — Event Ingestion Pipeline
- `src/lib/analytics/fingerprint.ts` — Anonymized browser fingerprinting (UA + screen + timezone hash)
- `src/lib/analytics/events.ts` — Event ingestion, batch processing
- `src/app/api/widgets/[embedToken]/events/route.ts` — POST events endpoint (already in M5)
- GDPR opt-out via data attribute

### M7.2 — Aggregation & Storage
- `src/lib/analytics/aggregation.ts` — Daily rollup logic (AnalyticsDaily table)
- `src/lib/jobs/rollup-analytics.ts` — BullMQ job for daily aggregation
- Indexes on analytics_events (widget_id, timestamp, event_type)

### M7.3 — Analytics Dashboard UI
- `src/app/(dashboard)/dashboard/analytics/page.tsx` — Full analytics dashboard
- `src/components/dashboard/analytics/time-series-chart.tsx` — Views + visitors line chart (Recharts)
- `src/components/dashboard/analytics/entry-performance.tsx` — Per-entry bar chart
- `src/components/dashboard/analytics/traffic-sources.tsx` — Pie/donut chart
- `src/components/dashboard/analytics/read-depth-heatmap.tsx` — Heatmap
- `src/components/dashboard/analytics/summary-cards.tsx` — Key metrics with trend arrows
- `src/components/dashboard/analytics/date-range-picker.tsx`
- `src/components/dashboard/analytics/export-dialog.tsx` — CSV/JSON export

### M7.4 — Real-Time Counter
- WebSocket endpoint for live viewer count
- `src/hooks/use-live-viewers.ts`
- Display in analytics dashboard

---

## M8: Billing & Pricing

### M8.1 — Polar Integration
- `src/lib/billing/polar.ts` — Polar SDK wrapper (checkout, customer portal, subscriptions)
- `src/app/api/billing/checkout/route.ts` — POST initiate checkout
- `src/app/api/billing/portal/route.ts` — POST redirect to customer portal
- `src/app/api/webhooks/polar/route.ts` — Webhook handler (subscription lifecycle)

### M8.2 — Plan Enforcement
- `src/lib/billing/limits.ts` — Plan feature matrix, limit checks
- `src/lib/billing/usage.ts` — AI generation usage tracking per workspace
- `src/lib/middleware/plan-enforcement.ts` — Middleware for plan-gated endpoints
- Return 402 with upgrade messaging when limits exceeded

### M8.3 — Trial Management
- `src/lib/billing/trials.ts` — 14-day Pro trial, auto-downgrade logic
- `src/lib/jobs/trial-expiry.ts` — Daily job to check/downgrade expired trials
- `src/lib/jobs/usage-reset.ts` — Monthly job to reset AI generation counters

### M8.4 — Billing UI
- `src/components/dashboard/billing/plan-card.tsx` — Current plan display
- `src/components/dashboard/billing/usage-meter.tsx` — AI generation usage
- `src/components/dashboard/billing/upgrade-prompt.tsx` — Upgrade CTA
- Update `src/app/(dashboard)/dashboard/settings/page.tsx` — Billing section

---

## M9: Beta Release

### M9.1 — Testing
- Vitest config + unit tests for all lib/ modules (>90% coverage on engines, auth, billing)
- Integration tests for all API routes
- Playwright E2E tests (onboarding, editor, team, billing, widget, marketing)

### M9.2 — Documentation
- docs/architecture.md, docs/api.md, docs/database.md, docs/engines.md
- docs/ai-providers.md, docs/widgets.md, docs/deployment.md, docs/contributing.md
- JSDoc on all public functions

### M9.3 — Performance Optimization
- Lighthouse >95 on marketing pages
- Dashboard LCP <2s, API p95 <200ms reads
- Widget bundle <30KB, render <200ms
- Database query optimization, caching

### M9.4 — Onboarding Polish
- Guided flow: sign-up → install GitHub App → configure → first changelog
- Empty states, success messages, error recovery
- Tooltips, help text throughout

### M9.5 — DevOps
- Vercel deployment config
- GitHub Actions CI (test + lint + build)
- Sentry error tracking
- Environment configs (staging, production)
