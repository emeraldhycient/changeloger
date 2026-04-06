**PRODUCT REQUIREMENTS DOCUMENT**

**Changeloger**

Automated Changelog Generation Platform

Web-First SaaS with GitHub App Integration

| **Version**        | 2.3.0          |
| ------------------ | -------------- |
| **Status**         | Draft          |
| **Author**         | Product Team   |
| **Date**           | March 16, 2026 |
| **Classification** | Internal       |

# Table of Contents

# 1\. Executive Summary

Changeloger is a web-first SaaS platform that automates changelog generation for software teams. By connecting directly to GitHub repositories (and other platforms in the future) via a one-click app installation, Changeloger monitors commits, analyzes code diffs, and tracks semantic version bumps - then uses AI to transform raw development activity into polished, human-readable changelog entries.

The platform provides a full-featured web dashboard where teams can review, edit, and publish changelogs. Published changelogs can be embedded directly into any product via copy-paste widgets - as a standalone page or inside a modal - giving end users a professional, always-up-to-date view of what's new. Team members can be invited with role-based permissions, and the analytics dashboard surfaces detailed metrics on changelog views, engagement, and adoption.

There is no CLI. Users onboard entirely through the web: sign up with Google or GitHub, install the Changeloger GitHub App to their repositories, configure detection settings, and start generating changelogs immediately. This web-first approach eliminates setup friction, makes the product accessible to non-technical team members, and enables collaboration features that a CLI tool cannot offer.

## 1.1 Key Value Propositions

- Zero-config setup: Install the GitHub App from the web dashboard - no CLI, no package installation, no config files committed to the repo. Connected in under 60 seconds.
- Collaborative editing: The web UI provides a rich changelog editor where teams review AI-generated entries, make edits, add context, and publish together - with full revision history.
- Embeddable widgets: Copy a snippet to embed the changelog as a public page or as an in-app modal. Widgets are styled, responsive, and auto-update on each publish.
- Team management: Invite team members via email, assign roles (admin, editor, viewer), and manage access across multiple repositories from a single dashboard.
- Analytics and insights: Track how many people view the changelog, which entries get the most attention, and how engagement changes over time - data that proves the value of communicating changes.
- AI-powered summarization: Raw technical changes are translated into clear, audience-appropriate language suitable for developers, product managers, and end users alike.
- Multi-signal intelligence: Combines commit messages, code diffs, and version metadata for comprehensive change detection that no single source could provide alone.

# 2\. Problem Statement

## 2.1 Current Pain Points

Software teams face a persistent documentation gap between what they build and what they communicate. The following problems are observed across teams of all sizes:

### 2.1.1 Manual Changelog Authoring is Unsustainable

Writing changelogs by hand requires developers to context-switch from coding to documentation, often days or weeks after the actual changes were made. This introduces recall bias, omissions, and inconsistent formatting. In fast-moving teams shipping multiple times per day, manual authoring simply cannot keep pace.

### 2.1.2 Existing Tooling is Developer-Only

Current solutions are almost exclusively CLI-based tools that dump commit messages into a file. They require developer setup, produce unreadable output for non-technical stakeholders, and offer no collaboration, editing, or publishing capabilities. Product managers, support teams, and marketing cannot participate in the changelog workflow.

### 2.1.3 No Publishing or Distribution Layer

Even when changelogs are written, there is no easy way to surface them to end users. Teams resort to manually copying content into blog posts, Notion pages, or in-app notification systems. There is no standardized, embeddable, always-current changelog widget that connects directly to the source of truth.

### 2.1.4 Stakeholder Communication Breaks Down

Without reliable changelogs, product managers cannot confidently communicate what shipped to customers. Support teams lack context for troubleshooting. Sales teams cannot articulate recent improvements. The absence of good changelogs creates an information vacuum that affects the entire organization.

### 2.1.5 No Visibility Into Changelog Engagement

Teams have no idea whether anyone reads their changelogs. Without analytics, there is no way to measure the ROI of changelog efforts, understand which types of changes resonate with users, or justify continued investment in change communication.

## 2.2 Target Users

| **Persona**            | **Role**                         | **Primary Pain Point**                                 | **Key Need**                                                     |
| ---------------------- | -------------------------------- | ------------------------------------------------------ | ---------------------------------------------------------------- |
| Dev Lead               | Engineering manager or tech lead | Spends 2-4 hrs/release writing changelogs manually     | Automated generation from commits and diffs with team review     |
| Solo Developer         | Indie hacker or solo maintainer  | Skips changelogs entirely due to time constraints      | Zero-config GitHub App install, set-and-forget generation        |
| Product Manager        | Non-technical stakeholder        | Cannot get timely, readable summaries of what shipped  | Web UI for editing, publishing, and embedding changelogs         |
| Open Source Maintainer | OSS project lead                 | Contributor commits are inconsistent and hard to parse | AI normalization of messy commit histories + public embed widget |
| Marketing / Growth     | Go-to-market team                | No professional changelog to show customers            | Embeddable widget with analytics on views and engagement         |
| Support Lead           | Customer support manager         | Cannot quickly reference what changed in a release     | Searchable, browsable changelog with version filtering           |

# 3\. Product Vision and Scope

## 3.1 Vision Statement

_Every software change, automatically captured, collaboratively refined, and beautifully published to the people who need to know - with zero developer setup._

## 3.2 Scope: Phase 1 (MVP)

Phase 1 delivers the complete web platform: an enterprise-grade marketing site (built with Tailwind CSS and shadcn/ui), three core detection engines, a collaborative changelog editor, embeddable widgets, team management, analytics, and a tiered pricing model. All repository integration happens via GitHub App installation from the web dashboard.

| **Feature**                  | **Description**                                                                                                                                                   | **Priority**  |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| Landing Pages                | Marketing website with hero, features, pricing, testimonials, comparison, and CTA sections; built with Tailwind CSS and shadcn/ui for enterprise-grade aesthetics | P0 - Critical |
| Web Dashboard                | Full-featured web application for managing repos, editing changelogs, inviting teams, viewing analytics, and configuring settings                                 | P0 - Critical |
| GitHub App Integration       | One-click GitHub App installation from the web UI; auto-discovers repos, monitors commits, diffs, and version bumps without any CLI or local setup                | P0 - Critical |
| Git Commit Analysis          | Real-time commit monitoring, conventional commit parsing, AI grouping and summarization of commit messages into changelog entries                                 | P0 - Critical |
| Diff-Based Detection         | Codebase comparison between two versions/tags, detection of new endpoints, modified components, deleted functions, AI plain-English descriptions                  | P0 - Critical |
| Semantic Versioning Triggers | Watch package.json, pyproject.toml, Cargo.toml, etc. for version bumps; auto-compile changes since last version tag into structured changelog                     | P0 - Critical |
| Changelog Editor             | Rich web-based editor for reviewing, editing, rewriting, and organizing AI-generated entries before publishing                                                    | P0 - Critical |
| Embeddable Widgets           | Copy-paste code snippets to embed the changelog as a public page or as an in-app modal; auto-updates on publish                                                   | P0 - Critical |
| Authentication               | Google and GitHub sign-in/sign-up via OAuth 2.0                                                                                                                   | P0 - Critical |
| Team Management              | Invite members via email, assign roles (admin, editor, viewer), manage access across repos                                                                        | P1 - High     |
| Analytics Dashboard          | Track changelog page views, unique visitors, per-entry engagement, traffic sources, and trends over time                                                          | P1 - High     |
| Pricing and Plans            | Free, Pro, and Team tiers with usage-based limits; Polar billing integration                                                                                      | P1 - High     |
| Output Formatting            | Render changelogs in Markdown, JSON, HTML; support Keep a Changelog format; configurable templates                                                                | P1 - High     |

## 3.3 Scope: Phase 2 (Future)

Phase 2 extends Changeloger beyond GitHub into the broader development ecosystem. These features are documented here for architectural planning but are not in scope for the initial release.

| **Feature**                            | **Description**                                                                                                                              | **Dependency**                                 |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| CLI Tool                               | Local command-line interface for offline generation, CI/CD scripting, and advanced developer workflows                                       | Core engine extraction into standalone package |
| PR/Issue Scraping                      | Pull data from GitHub, GitLab, Linear, Jira; trigger changelog entries on PR merge; leverage PR descriptions as higher-quality input         | GitHub/GitLab API extensions                   |
| Deployment Hooks                       | Hook into CI/CD pipelines (GitHub Actions, Vercel, Railway); snapshot changes between deploys; generate per-release changelogs automatically | CI/CD provider plugin system                   |
| Additional Platform Integrations       | GitLab App, Bitbucket App, Azure DevOps integration - same one-click install experience as GitHub                                            | Platform-specific OAuth and webhook APIs       |
| Browser Extension / Screenshot Capture | Before/after screenshots on each deploy; visual diffing of UI changes; auto-generate user-facing what's new entries from visual differences  | Headless browser infrastructure                |
| Custom Domains                         | Allow teams to host their public changelog on a custom domain (e.g., changelog.yourcompany.com)                                              | DNS verification and SSL provisioning          |

# 4\. Platform Architecture

## 4.1 High-Level Architecture

Changeloger is a web-first SaaS application built entirely on Next.js as a unified full-stack framework. The frontend uses React with server-side rendering for marketing pages and client-side rendering for the authenticated dashboard. The backend logic runs via Next.js API routes and Server Actions, handling authentication, repository management, changelog processing, and widget serving within the same deployment. The GitHub App provides the integration layer for repository access. All data is stored in PostgreSQL via Prisma ORM.

### 4.1.1 Architecture Layers

| **Layer**      | **Components**                                                | **Responsibility**                                                                                                                                                 |
| -------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Frontend       | Next.js (React), Zustand store, TanStack Query, Axios         | SSG marketing pages, SSR dashboard, changelog editor, analytics views, team management, widget configuration                                                       |
| API Server     | Next.js API Routes (TypeScript)                               | REST API (via Next.js API routes) for all frontend operations, webhook handlers, widget serving endpoints, Polar billing integration; unified full-stack framework |
| Auth Layer     | OAuth 2.0 (Google, GitHub), JWT sessions                      | User authentication, session management, team authorization, GitHub App token management                                                                           |
| Integration    | GitHub App (webhooks + API), future: GitLab, Bitbucket        | Repository access, commit monitoring, diff retrieval, version file reading                                                                                         |
| Processing     | Commit Parser, AST Analyzer, Change Classifier, AI Summarizer | Parse, classify, group, and summarize raw changes into human-readable entries                                                                                      |
| Storage        | PostgreSQL, Redis (caching/queues)                            | Persistent data storage, session cache, job queue for background processing                                                                                        |
| Widget Service | Static asset CDN, iframe/script endpoints                     | Serve embeddable changelog widgets (page and modal variants) with real-time publish sync                                                                           |
| Analytics      | Event ingestion pipeline, PostgreSQL aggregation              | Track page views, unique visitors, per-entry clicks, traffic sources, and engagement trends                                                                        |

### 4.1.2 Request and Data Flow

- **Onboarding:** User signs up via Google or GitHub OAuth. On first login, the dashboard prompts them to install the Changeloger GitHub App to one or more repositories.
- **Installation:** The GitHub App installation grants Changeloger read access to repository contents, commits, and webhooks. The backend registers webhook subscriptions for push events, tag creation, and release events.
- **Ingestion:** When a push event arrives via webhook, the backend fetches new commits and diffs via the GitHub API. It runs the commit parser, diff analyzer, and version watcher in a background job.
- **Processing:** Raw change data is parsed, classified, and sent to the AI summarization layer. The AI returns grouped, human-readable changelog entries with confidence scores.
- **Draft Creation:** Processed entries are stored as a draft changelog version in PostgreSQL. The team is notified (email/in-app) that new entries are ready for review.
- **Editing and Review:** Team members open the web editor, review AI-generated entries, make edits, reorder, add context, or reject entries. Changes are saved in real time.
- **Publishing:** When the editor clicks Publish, the changelog version becomes live. All embedded widgets (page and modal) instantly reflect the new content.
- **Analytics:** Each widget load and entry interaction fires a lightweight analytics event. The dashboard displays aggregated metrics with configurable time ranges.

## 4.2 Technology Stack

| **Component**                | **Technology**                            | **Rationale**                                                                                                                                                                                                                                                       |
| ---------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Frontend Framework           | Next.js 15 (React 18+, TypeScript)        | Full-stack React framework with server-side rendering for landing pages and SEO, API routes for backend logic, file-based routing, Turbopack for fast HMR, mature ecosystem with broad team familiarity; single deployment unit for frontend and backend            |
| UI Components                | shadcn/ui + Radix UI primitives           | Enterprise-grade, accessible component library; copy-paste ownership model avoids dependency lock-in; fully customizable with Tailwind                                                                                                                              |
| Styling                      | Tailwind CSS 4                            | Utility-first CSS with design tokens; consistent spacing, typography, and color system; zero runtime overhead; excellent DX with VS Code IntelliSense                                                                                                               |
| State Management             | Zustand                                   | Lightweight, TypeScript-native, minimal boilerplate compared to Redux; perfect for medium-complexity SPA state                                                                                                                                                      |
| Server State / Data Fetching | TanStack Query (React Query)              | Declarative caching, background refetching, optimistic updates, pagination; eliminates manual loading/error state management                                                                                                                                        |
| HTTP Client                  | Axios                                     | Interceptors for auth token injection, request/response transforms, consistent error handling across the app                                                                                                                                                        |
| Backend / API Layer          | Next.js API Routes (TypeScript)           | Next.js API Routes and Server Actions handle all backend logic within the same deployment; no separate backend server needed. Route handlers provide REST API endpoints, middleware for auth guards, and server-side data fetching with full TypeScript type safety |
| Database                     | PostgreSQL 16                             | ACID compliance, JSONB for flexible metadata, excellent full-text search, proven scalability for SaaS workloads; row-level security for multi-tenant isolation                                                                                                      |
| ORM                          | Prisma                                    | Type-safe database access with auto-generated client, declarative schema with migrations, excellent TypeScript integration, visual database browser (Prisma Studio), proven at scale                                                                                |
| Cache / Queue                | Redis                                     | Session caching, rate limiting, background job queue (via BullMQ) for webhook processing and AI calls                                                                                                                                                               |
| Authentication               | Google OAuth 2.0 + GitHub OAuth 2.0       | Two most common auth providers for developer and business users; no password management overhead                                                                                                                                                                    |
| Payments                     | Polar                                     | Developer-first billing platform designed for software and SaaS; built-in subscription management, usage-based billing, checkout flows, and customer portal; lower friction than traditional payment processors for developer tools                                 |
| AI Provider                  | OpenAI API (default) / Anthropic / Ollama | Pluggable provider system; local Ollama support for self-hosted/enterprise customers                                                                                                                                                                                |
| Git Operations               | GitHub API (REST + GraphQL) via Octokit   | Official GitHub SDK; no local Git needed since all repo access is via the GitHub App                                                                                                                                                                                |
| AST Parsing                  | Tree-sitter (via WASM bindings)           | Language-agnostic structural analysis for diff-based detection; runs server-side                                                                                                                                                                                    |
| Widget Delivery              | CDN-hosted JS bundle + iframe fallback    | Fast global delivery, cross-origin compatible, auto-update on publish                                                                                                                                                                                               |
| Hosting                      | Vercel (preferred) or self-hosted         | Vercel is the natural deployment target for Next.js with zero-config deployment, edge functions, and global CDN; self-hosted Node.js on Railway, Render, or AWS is supported as an alternative                                                                      |
| Testing                      | Vitest (unit) + Playwright (E2E)          | Fast, TypeScript-native test runner; Playwright for full browser testing of editor and widgets                                                                                                                                                                      |

## 4.3 AI Integration Architecture

The AI layer is provider-agnostic and follows an adapter pattern. Each supported AI provider implements a common interface:

- summarizeCommits(commits: CommitRecord\[\]): ChangelogEntry\[\] - Takes a batch of parsed commits and returns grouped, summarized changelog entries.
- describeChanges(diff: StructuralDiff): ChangelogEntry\[\] - Takes structural diff output and returns plain-English descriptions of each change.
- classifyCommit(commit: RawCommit): CommitClassification - Classifies a non-conventional commit into a changelog category with a confidence score.
- generateReleaseNotes(entries: ChangelogEntry\[\], version: string): string - Produces a cohesive release notes narrative from individual entries.

AI calls are batched and cached. Identical inputs produce cached outputs (stored in Redis with a 7-day TTL) to minimize API costs. A configurable rate limiter prevents excessive API usage. For enterprise customers requiring data residency, the Ollama adapter enables fully local AI processing with no external API calls.

# 5\. Web Dashboard

## 5.1 Overview

The web dashboard is the primary interface for all Changeloger operations. It is built with Next.js and communicates with backend API routes via Axios (wrapped in TanStack Query hooks for caching and state management) and uses Zustand for client-side UI state. There is no CLI - all configuration, editing, publishing, team management, and analytics happen through this dashboard.

## 5.2 Information Architecture

| **Section**          | **Pages**                                          | **Description**                                                                                  |
| -------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Onboarding           | Sign Up, Sign In, Install GitHub App, Select Repos | First-run flow that gets users from zero to connected repo in under 60 seconds                   |
| Dashboard Home       | Overview, Activity Feed                            | Summary of recent changelog activity across all connected repos, pending drafts, quick stats     |
| Repositories         | Repo List, Repo Settings, Detection Config         | Manage connected repos, configure branch monitoring, ignored paths, AI settings per repo         |
| Changelog Editor     | Draft View, Entry Editor, Publish Flow             | The core editing experience: review AI-generated entries, edit, reorder, categorize, and publish |
| Published Changelogs | Public View, Version History, Embed Config         | Browse published changelog versions, manage widget embed codes, configure public page settings   |
| Team                 | Members, Invitations, Roles                        | Invite team members, assign roles, manage permissions across repos                               |
| Analytics            | Overview, Per-Entry, Traffic Sources, Trends       | Changelog engagement metrics: page views, unique visitors, popular entries, referral sources     |
| Settings             | Account, Billing, API Keys, Integrations           | User profile, subscription management, AI provider configuration, future integrations            |

## 5.3 Onboarding Flow

### 5.3.1 Sign Up and Authentication

Users sign up and sign in exclusively through OAuth providers. Phase 1 supports two providers:

- Google OAuth 2.0: For users who prefer Google Workspace accounts, especially product managers and non-developer team members who may not have GitHub accounts.
- GitHub OAuth 2.0: For developers. When signing in with GitHub, the system can pre-populate the user's GitHub identity, making the subsequent GitHub App installation seamless (no re-authentication needed).

No email/password authentication is supported in Phase 1. This reduces security surface area (no password storage, no reset flows) and accelerates onboarding. Users who sign in with Google can still install the GitHub App in a separate step.

### 5.3.2 GitHub App Installation

After authentication, new users are prompted to install the Changeloger GitHub App. The flow is:

- **Initiate:** User clicks "Connect GitHub Repository" in the dashboard. This redirects to GitHub's App installation page.
- **Select scope:** The user chooses which GitHub account (personal or organization) and which repositories to grant access to. They can select all repos or specific ones.
- **Authorize:** GitHub redirects back to Changeloger with an installation ID. The backend exchanges this for an installation access token.
- **Sync:** Changeloger fetches the list of accessible repositories and displays them in the dashboard. The user selects which repos to activate for changelog generation.
- **Configure:** For each activated repo, the user can optionally configure: monitored branches, ignored file patterns, AI summarization preferences, and output format. Sensible defaults are applied.
- **First generation:** Changeloger immediately runs an initial changelog generation for the most recent version (or last 50 commits if no version tags exist), giving the user instant value.

### 5.3.3 GitHub App Permissions

| **Permission**      | **Access Level**    | **Purpose**                                                                   |
| ------------------- | ------------------- | ----------------------------------------------------------------------------- |
| Repository contents | Read-only           | Read commits, diffs, file contents for version detection and AST analysis     |
| Metadata            | Read-only           | Access repo name, description, default branch, language                       |
| Webhooks            | Read & Write        | Subscribe to push, create (tags), and release events for real-time monitoring |
| Pull requests       | Read-only (Phase 2) | Reserved for future PR description scraping feature                           |

## 5.4 Changelog Editor

### 5.4.1 Overview

The changelog editor is the centerpiece of the Changeloger web experience. It provides a rich editing interface where team members can review AI-generated entries, make modifications, and publish the final changelog. The editor is designed to feel familiar to users of Notion, Linear, or any modern block-based editor.

### 5.4.2 Editor Functional Requirements

**FR-EDIT-001: Draft Management** When new changes are detected (via webhook), the system creates a draft changelog version. Drafts are visible in the editor with a clear "Draft" badge. Multiple drafts can exist simultaneously (e.g., for different unreleased versions). Drafts auto-save on every edit.

**FR-EDIT-002: Entry Review** Each AI-generated entry is displayed as an editable card showing: category badge (Added, Fixed, Changed, etc.), title, extended description (if any), impact level indicator, confidence score from the AI, source information (which commits/diffs generated this entry), and author attribution.

**FR-EDIT-003: Inline Editing** All entry fields (title, description, category, impact) are editable inline. The editor supports rich text in descriptions (bold, italic, inline code, links). Changes are persisted immediately via optimistic updates (TanStack Query mutations).

**FR-EDIT-004: Entry Operations** Users can: reorder entries via drag-and-drop, move entries between categories, split a grouped entry into multiple separate entries, merge multiple entries into one, delete entries, and manually create new entries from scratch.

**FR-EDIT-005: Version Assignment** Each draft is associated with a version number. The version can be auto-detected (from the semver trigger engine) or manually set by the editor. The system suggests the appropriate semver increment based on the types of changes detected.

**FR-EDIT-006: Publish Flow** Publishing a draft transitions it to a live state. The publish action: validates all entries have titles, assigns a publish timestamp, generates the final rendered output (Markdown, HTML, JSON), updates all embedded widgets immediately, and triggers an optional webhook notification.

**FR-EDIT-007: Revision History** Every published version maintains a full revision history. Users can view previous published states, compare versions side-by-side, and revert to a previous version if needed.

**FR-EDIT-008: Collaborative Editing** Multiple team members can view and edit the same draft simultaneously. Changes sync in real time via WebSocket connections. Cursor presence (who is editing what) is shown to prevent conflicts. Last-write-wins conflict resolution for individual fields.

## 5.5 Embeddable Widgets

### 5.5.1 Overview

Embeddable widgets are the distribution layer for Changeloger. They allow teams to surface their changelogs directly inside their product, documentation site, or any web page. Widgets are configured in the dashboard and deployed by copying a code snippet.

### 5.5.2 Widget Types

| **Widget Type** | **Use Case**                                                          | **Implementation**                                                                 | **Customization**                                                                                             |
| --------------- | --------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Changelog Page  | Full-page changelog, typically linked from footer or docs site        | Script tag that renders a full changelog view into a target div element            | Brand colors, font, logo, category filters, search, version selector, dark/light mode                         |
| Changelog Modal | In-app "What's New" popup triggered by a button or notification badge | Script tag that injects a floating button and modal overlay with changelog content | Trigger button style, modal position and size, auto-show on new version, notification badge with unread count |
| Changelog Badge | Minimal notification indicator showing new changes are available      | Tiny script that adds a badge (e.g., red dot or count) to any element              | Badge style, count vs. dot, link destination                                                                  |

### 5.5.3 Widget Functional Requirements

**FR-WIDGET-001: Copy-Paste Installation** Each widget is deployed by copying a code snippet from the dashboard. The snippet is a single script tag with a project-specific embed token. No npm install, no build step, no framework dependency required.

**FR-WIDGET-002: Auto-Update on Publish** When a new changelog version is published, all embedded widgets update automatically on next page load. For actively open modals, a subtle notification prompts the user to refresh. No redeployment of the host application is needed.

**FR-WIDGET-003: Responsive Design** All widgets are fully responsive and work on mobile, tablet, and desktop. The modal widget adapts between a bottom sheet (mobile) and centered modal (desktop).

**FR-WIDGET-004: Customization** Each widget can be customized via the dashboard UI (no code required): brand colors (primary, accent, background), font family override, company logo, category visibility toggles, dark mode / light mode / auto, and custom CSS class injection for advanced styling.

**FR-WIDGET-005: Performance** The widget script bundle shall be under 30 KB gzipped. Initial render shall complete within 200ms. The script is loaded asynchronously and does not block the host page's rendering.

**FR-WIDGET-006: Analytics Integration** Each widget load fires a page_view event. Clicking on individual changelog entries fires an entry_click event. All events include: widget type, project ID, version viewed, referrer URL, and anonymized viewer fingerprint for unique visitor counting.

# 6\. Landing Pages and Marketing Site

## 17.1 Overview

The Changeloger marketing site is the primary acquisition channel for the product. It must communicate the product's value proposition instantly, look enterprise-grade, and convert visitors into sign-ups. The site is built with Next.js, Tailwind CSS for styling, and shadcn/ui components as the design foundation. Every page must feel polished, modern, and trustworthy - on par with the marketing sites of products like Linear, Vercel, Resend, and Clerk.

The marketing site shares the same Next.js application as the web dashboard, using route groups to separate public marketing pages (/) from authenticated app pages (/app). This ensures a seamless transition from the landing page to sign-up to the dashboard without a jarring context switch. Marketing pages use Next.js static generation (SSG) for optimal SEO and performance, while dashboard pages use client-side rendering with authentication gates.

## 15.2 Design System and Aesthetic Direction

### 6.2.1 Visual Identity

The Changeloger visual identity targets the intersection of developer tooling and enterprise SaaS. The aesthetic should feel technical enough to earn developer trust, yet polished enough that a VP of Engineering would feel comfortable presenting it to their team.

| **Element**     | **Specification**                                                                                                                                                            | **Rationale**                                                                                                              |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Primary Palette | Deep navy (#0F172A) backgrounds, violet accent (#6C63FF), clean white surfaces. Gradient accents from violet to indigo for CTAs and hero elements.                           | Dark-on-light communicates technical sophistication. Violet differentiates from the blue-dominant developer tool market.   |
| Typography      | Inter for body and UI text (clean, highly legible), JetBrains Mono for code snippets and technical elements. Tight letter-spacing on headings.                               | Inter is the de facto standard for modern SaaS. JetBrains Mono signals developer audience without sacrificing readability. |
| Spacing System  | Tailwind's default spacing scale (4px base). Generous whitespace between sections (py-24 to py-32). Content max-width of 1280px (max-w-7xl).                                 | Generous whitespace conveys premium quality. Consistent spacing scale prevents visual clutter.                             |
| Border Radius   | Rounded-xl (12px) for cards and containers. Rounded-lg (8px) for buttons and inputs. Rounded-full for avatars and badges.                                                    | Softened corners feel modern and approachable while maintaining professionalism.                                           |
| Shadows         | Subtle layered shadows using Tailwind's shadow-sm through shadow-xl. Cards use shadow-md with a slight colored shadow tint matching the accent palette.                      | Layered shadows create depth without heaviness. Tinted shadows add brand consistency.                                      |
| Motion          | Subtle entrance animations on scroll (Framer Motion). 200ms ease-out transitions on interactive elements. No aggressive animations or auto-playing videos.                   | Motion adds polish without distracting. Fast transitions feel responsive.                                                  |
| Dark Mode       | Full dark mode support via Tailwind's dark: variant and shadcn/ui's theme system. Dark mode is the default for the marketing site, matching developer aesthetic preferences. | Developer audience strongly prefers dark interfaces. System-preference detection with manual toggle.                       |

### 6.2.2 shadcn/ui Component Usage

The marketing site uses shadcn/ui as the component foundation. Because shadcn/ui is a copy-paste component library (not a dependency), all components are owned by the codebase and fully customized to match the Changeloger brand. Key components used across the marketing site:

| **shadcn/ui Component** | **Usage on Marketing Site**                                                            | **Customization**                                                                                                     |
| ----------------------- | -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Button                  | Primary CTAs ("Get Started Free", "Start Free Trial"), secondary actions, nav links    | Custom gradient variants (violet-to-indigo for primary), ghost variant for nav, size-lg for hero CTAs with icon slots |
| Card                    | Feature cards, pricing tier cards, testimonial cards, comparison table cells           | Custom border treatment (subtle gradient border on hover), elevated variant with colored shadow tint                  |
| Badge                   | Plan labels, feature tags, "New" indicators, commit type pills in demo sections        | Brand-colored variants: violet for features, green for "Included", amber for "Popular" plan badge                     |
| Tabs                    | Feature section tab navigation, pricing toggle (monthly/annual), code example switcher | Custom underline variant matching brand accent, animated indicator using Framer Motion                                |
| Dialog / Sheet          | Mobile navigation menu, video demo modal, contact sales form                           | Custom backdrop blur, smooth enter/exit animations, responsive bottom sheet on mobile                                 |
| Accordion               | FAQ section, feature detail expansion, comparison table expandable rows                | Custom chevron animation, border-bottom separator style, smooth height transition                                     |
| Tooltip                 | Feature info icons, pricing footnotes, technical term explanations                     | Styled with brand colors, 200ms delay, arrow pointer                                                                  |
| Switch                  | Monthly/annual pricing toggle, dark/light mode toggle                                  | Custom track and thumb colors matching brand palette                                                                  |
| Separator               | Section dividers, card content separators, footer column dividers                      | Subtle gradient separator variant for major section breaks                                                            |
| Avatar + AvatarGroup    | Testimonial photos, team photos, "Trusted by" logo section                             | Custom ring color on hover, stacked group with overflow count badge                                                   |

### 6.2.3 Tailwind CSS Configuration

The Tailwind configuration extends the default theme with Changeloger brand tokens. These tokens ensure consistency across the marketing site, dashboard, and widget themes.

| **Token Category** | **Key Values**                                                                                                                                                                                                 | **Usage**                                                                                            |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Colors             | primary (violet-600 #6C63FF), primary-foreground (white), secondary (slate-100/slate-800), accent (indigo-500), destructive (red-500), muted (slate-500), background (white/slate-950), card (white/slate-900) | All component colors derive from these tokens. shadcn/ui's CSS variable system maps to these values. |
| Font Family        | sans: \['Inter', ...defaultTheme.fontFamily.sans\], mono: \['JetBrains Mono', ...defaultTheme.fontFamily.mono\]                                                                                                | Applied globally. Mono font used for code blocks, commit hashes, version numbers.                    |
| Animation          | Custom keyframes for fade-in-up, fade-in-left, scale-in, blur-in. Duration tokens: fast (150ms), normal (300ms), slow (500ms).                                                                                 | Scroll-triggered entrance animations. Interactive state transitions.                                 |
| Container          | max-w-7xl center padding (px-6 sm:px-8), section padding (py-24 sm:py-32)                                                                                                                                      | Consistent content width and vertical rhythm across all landing page sections.                       |
| Border Radius      | radius: 0.75rem (12px) as the base. Components override: sm (6px), md (8px), lg (12px), xl (16px)                                                                                                              | Matches shadcn/ui's radius variable system.                                                          |

## 8.3 Page Structure

The marketing site consists of the following pages, each with a specific conversion goal. All pages share a common navigation header and footer.

| **Page**         | **URL**          | **Primary Goal**                    | **Key Sections**                                                                                   |
| ---------------- | ---------------- | ----------------------------------- | -------------------------------------------------------------------------------------------------- |
| Home / Hero      | /                | Convert visitor to sign-up          | Hero with headline + demo, social proof logos, 3-column feature overview, live changelog demo, CTA |
| Features         | /features        | Educate on capabilities             | Feature deep-dives with screenshots, detection engine explanations, editor demo, widget showcase   |
| Pricing          | /pricing         | Convert to paid plan                | Plan comparison table, FAQ, feature matrix, annual toggle, enterprise CTA                          |
| Changelog (meta) | /changelog       | Demonstrate the product by using it | Changeloger's own changelog, powered by itself - a live demo of the product                        |
| Blog             | /blog            | SEO and thought leadership          | Articles on changelog best practices, release communication, developer productivity                |
| Docs             | /docs            | Reduce support burden               | Integration guide, API reference, widget customization, FAQ                                        |
| About            | /about           | Build trust                         | Team, mission, investors (if applicable), contact information                                      |
| Contact / Sales  | /contact         | Enterprise lead capture             | Contact form, calendly embed for demo booking, sales email                                         |
| Legal            | /privacy, /terms | Compliance                          | Privacy policy, terms of service, cookie policy, DPA                                               |
| Sign In          | /sign-in         | Authenticate existing users         | Google and GitHub OAuth buttons, redirect to dashboard on success                                  |
| Sign Up          | /sign-up         | Create new accounts                 | Google and GitHub OAuth buttons, value proposition reminder, redirect to onboarding                |

## 6.4 Home Page Specification

The home page is the highest-traffic landing page and must convert visitors into sign-ups within 30 seconds of arrival. Every section is designed to build progressive confidence in the product.

### 6.4.1 Navigation Header

**FR-LP-001: Sticky Navigation** A fixed-position header with backdrop blur (backdrop-blur-xl) that becomes visible on scroll. Contains: the Changeloger logo (left), navigation links (Features, Pricing, Docs, Changelog, Blog), and two CTAs (Sign In as ghost button, Get Started Free as primary gradient button). On mobile, the nav collapses into a hamburger menu using shadcn/ui's Sheet component as a slide-out drawer.

**FR-LP-002: Navigation Behavior** The header has a transparent background at the top of the page (hero section) and transitions to a solid background with bottom border (border-b border-border/40) when the user scrolls past the hero. This creates a clean, immersive hero experience while maintaining navigation access on scroll.

### 6.4.2 Hero Section

**FR-LP-003: Hero Layout** Full-width hero section with dark background (slate-950). Centered content layout with: an announcement badge at the top (e.g., "New: AI-powered changelog generation →" using shadcn Badge), a large headline (text-5xl sm:text-6xl lg:text-7xl, font-bold, tracking-tight), a supporting subheadline (text-xl text-muted-foreground, max-w-2xl), two CTA buttons side-by-side (Get Started Free as primary gradient, View Demo as secondary outline), and a hero visual below the CTAs.

**FR-LP-004: Hero Visual** The hero visual is an interactive or animated product screenshot showing the changelog editor in action. Options (to be tested): a looping animation of the editor receiving AI-generated entries and publishing them, an interactive mini-demo where visitors can see a sample changelog, or a high-fidelity static screenshot with subtle CSS animations (floating cards, typing indicators). The visual is framed in a browser chrome mockup with a subtle glow effect (box-shadow with violet tint).

**FR-LP-005: Hero Animation** The headline, subheadline, CTAs, and hero visual animate in sequentially on page load using Framer Motion. Staggered fade-in-up with 100ms delays between elements. Total animation duration under 800ms. No animation on reduced-motion preference.

### 6.4.3 Social Proof Bar

**FR-LP-006: Logo Cloud** Immediately below the hero, a horizontal bar displaying logos of notable companies or open-source projects using Changeloger. Minimum 6 logos. Grayscale by default, color on hover. Heading: "Trusted by teams at" in small muted text. On mobile, logos scroll horizontally in a subtle infinite marquee animation. Before launch (pre-beta), this section can show "Built for teams like yours" with generic persona icons (startup, enterprise, open source) instead of real logos.

### 6.4.4 Feature Overview Section

**FR-LP-007: Three-Column Feature Grid** A section with heading "How it works" (or similar) and three feature cards in a responsive grid (grid-cols-1 md:grid-cols-3). Each card uses shadcn Card with: a colored icon at the top (from Lucide icons), a feature title (text-lg font-semibold), a concise description (text-muted-foreground), and a subtle hover lift effect (hover:-translate-y-1 transition-transform). The three features map to the three core engines: Git Commit Analysis, Diff-Based Detection, and Semantic Versioning Triggers.

### 6.4.5 Product Demo Section

**FR-LP-008: Live Changelog Preview** A full-width section showing a realistic, interactive preview of a Changeloger-generated changelog. This is a styled React component (not a screenshot) that visitors can scroll through, click entries to expand, and toggle between versions. It demonstrates the actual output quality. The section heading is something like "Beautiful changelogs, generated automatically" with a supporting line about zero effort. The preview is framed in a card with tabs for Rendered view vs. Raw Markdown view.

### 6.4.6 Feature Deep-Dive Sections

**FR-LP-009: Alternating Feature Rows** Three to four alternating left-right sections, each highlighting a major capability. Layout: one side has text content (heading, description, bullet points using shadcn Badge for keywords), the other side has a product screenshot or illustration. The sections alternate which side the text appears on. Features to highlight: (1) AI-powered summarization with before/after example, (2) the web editor with collaboration features, (3) embeddable widgets with embed code preview, (4) analytics dashboard with sample charts.

### 6.4.7 Integration Section

**FR-LP-010: Platform Compatibility** A section showing supported integrations and platforms. Centered grid of platform icons (GitHub prominently, with "coming soon" badges on GitLab, Bitbucket, Linear, Jira). Heading: "Works with your stack". Below the icons, a row of supported language logos (JavaScript, TypeScript, Python, Go, Rust, Java, Ruby) with the subheading "Language-aware change detection".

### 6.4.8 Testimonials Section

**FR-LP-011: Testimonial Cards** A carousel or grid of testimonial cards using shadcn Card. Each card contains: a quote (text-lg italic), the person's name and role (text-sm text-muted-foreground), their company, and an avatar (shadcn Avatar). Minimum 3 testimonials. Cards have a subtle border with gradient hover effect. Before launch, this section can use placeholder testimonials attributed to beta testers with their permission.

### 6.4.9 Pricing Preview

**FR-LP-012: Inline Pricing Summary** A compact version of the pricing table on the home page. Shows the three main tiers (Free, Pro, Team) as shadcn Cards in a horizontal row. Each card shows: plan name, price, key features (3-4 bullet points), and a CTA button. The "Pro" card has a "Popular" badge and a ring border to draw attention. A link below says "See full comparison →" linking to /pricing.

### 6.4.10 Final CTA Section

**FR-LP-013: Bottom CTA** A full-width section with a dark gradient background (violet-to-indigo). Large centered heading: "Start generating changelogs in 60 seconds". Subheading: "Free forever for solo projects. No credit card required." Two buttons: Get Started Free (white primary) and Book a Demo (outline white). This section creates urgency and provides a final conversion point.

### 6.4.11 Footer

**FR-LP-014: Site Footer** A comprehensive footer with: four columns (Product: features, pricing, changelog, docs; Company: about, blog, careers, contact; Legal: privacy, terms, DPA; Resources: API docs, status page, community). Below the columns: a row with the logo, copyright notice, and social media links (GitHub, Twitter/X, LinkedIn). The footer uses a muted color scheme (text-muted-foreground on dark background) with hover:text-foreground transitions.

## 6.5 Pricing Page Specification

### 6.5.1 Overview

The pricing page is the second most important conversion page. It must clearly communicate the value of each tier and make upgrading feel like a natural decision, not a hard sell. The page should handle objections (FAQ), enable comparison (feature matrix), and provide a clear path for enterprise buyers.

### 6.5.2 Pricing Page Requirements

**FR-LP-015: Monthly/Annual Toggle** A prominent toggle (shadcn Switch or Tabs) at the top of the pricing section. Annual pricing shows the monthly equivalent with a "Save 20%" badge. The toggle uses Framer Motion for a smooth price number transition (animated counter that rolls from monthly to annual price).

**FR-LP-016: Plan Cards** Three plan cards (Free, Pro, Team) displayed in a horizontal row (grid-cols-1 md:grid-cols-3). Each card is a shadcn Card with: plan name (text-xl font-bold), price with billing period (text-4xl font-bold for the number, text-muted for /month), a brief tagline (e.g., "For solo developers"), a divider, a feature list with check icons (Lucide Check in green), and a full-width CTA button at the bottom. The Pro card is visually elevated (scale-105, ring-2 ring-primary, shadow-xl) with a "Most Popular" badge.

**FR-LP-017: Enterprise Section** Below the three plan cards, a separate full-width card for Enterprise. Horizontal layout with text on the left (heading, description of enterprise features: SSO, SCIM, custom contracts, SLA, dedicated CSM) and a CTA on the right ("Contact Sales" button + "Book a demo" link). Muted background (bg-muted/50).

**FR-LP-018: Feature Comparison Matrix** A full-width expandable table (shadcn Table + Accordion trigger) showing every feature across all four plans. Rows are grouped by category (Core Features, Collaboration, Analytics, Support, Security). Checkmarks (Lucide Check) for included features, dashes for excluded, and specific values for numeric limits. The table is responsive: on mobile, it collapses into a plan-by-plan view using Tabs.

**FR-LP-019: FAQ Section** An accordion (shadcn Accordion) with 8-12 frequently asked questions. Questions include: billing mechanics, trial details, plan differences, data ownership, migration, cancellation, team size limits, overage handling, and enterprise security. Each answer is concise (2-3 sentences max).

## 6.6 Features Page Specification

### 6.6.1 Overview

The features page provides detailed explanations of each product capability for visitors who need more information before signing up. It is optimized for both organic search (long-form content) and conversion (CTAs between sections).

### 6.6.2 Features Page Requirements

**FR-LP-020: Feature Navigation** A sticky secondary navigation bar (below the main header) with anchor links to each feature section. Uses shadcn Tabs in an underline variant. Active section is highlighted based on scroll position (IntersectionObserver). Smooth scroll on click.

**FR-LP-021: Feature Sections** Each major feature gets a full-width section with: a heading (text-3xl font-bold), a description paragraph (text-lg text-muted-foreground, max-w-3xl), a product screenshot or interactive demo, and supporting detail cards (grid of 2-3 shadcn Cards with icons and descriptions). Features covered: (1) Git Commit Analysis, (2) Diff-Based Detection, (3) Semantic Version Triggers, (4) AI Summarization, (5) Changelog Editor, (6) Embeddable Widgets, (7) Team Collaboration, (8) Analytics Dashboard.

**FR-LP-022: Comparison Section** A section comparing Changeloger against manual changelog writing and existing tools. Uses a three-column comparison table (shadcn Table): "Manual", "Existing Tools", "Changeloger" with rows for key differentiators (setup time, AI quality, collaboration, widgets, analytics). Changeloger column is highlighted with a brand-colored header.

**FR-LP-023: Inter-Section CTAs** A call-to-action banner appears between every 2-3 feature sections. These are compact horizontal bars (bg-muted rounded-xl p-8) with a headline, supporting text, and a CTA button. They vary in messaging to avoid repetition: "Try it free", "See it in action", "Get started in 60 seconds".

## 6.7 Changelog Page (Meta) Specification

**FR-LP-024: Self-Hosted Changelog** The /changelog page displays Changeloger's own changelog, generated and published by Changeloger itself. This serves as both a marketing page ("we eat our own dog food") and a live product demo. The page uses the same rendering engine as the embeddable page widget, styled to match the marketing site. It includes version filtering, category toggles, and search.

## 6.8 Landing Page Performance Requirements

| **Metric**                     | **Target**           | **Implementation**                                                                                                                                       |
| ------------------------------ | -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Largest Contentful Paint (LCP) | <1.5 seconds         | Next.js static generation (SSG) for above-the-fold content, automatic image optimization via next/image, optimized hero image/animation, font preloading |
| First Input Delay (FID)        | <50ms                | Minimal client-side JavaScript in the critical path; defer non-essential scripts                                                                         |
| Cumulative Layout Shift (CLS)  | <0.05                | Explicit dimensions on all images and embeds; font-display: swap with matched fallback fonts                                                             |
| Total Page Weight (home)       | <500 KB initial load | Tailwind CSS purging, code splitting, lazy-loaded below-fold sections, WebP/AVIF images                                                                  |
| Lighthouse Performance Score   | \>95                 | SSR, static generation where possible, CDN asset delivery, optimal caching headers                                                                       |
| Time to Interactive (TTI)      | <2.5 seconds         | Async hydration for interactive components; static rendering for content-only sections                                                                   |

## 6.9 SEO Requirements

**FR-LP-025: Technical SEO** All marketing pages are statically generated at build time via Next.js SSG for full search engine crawlability. Each page has: unique title and meta description, Open Graph and Twitter Card meta tags, canonical URLs, structured data (JSON-LD) for the organization and product (SoftwareApplication schema), and a comprehensive XML sitemap generated at build time. Dynamic app pages behind authentication use client-side rendering.

**FR-LP-026: Content SEO** The home page targets the primary keyword "automated changelog generator". The features page targets long-tail keywords like "AI changelog from git commits" and "embeddable changelog widget." The blog provides ongoing SEO content targeting developer productivity, release management, and changelog best practices.

**FR-LP-027: Performance as SEO Signal** Core Web Vitals (LCP, FID, CLS) are treated as first-class requirements because Google uses them as ranking signals. All targets in section 6.8 are designed to exceed Google's "Good" thresholds.

## 17.10 Responsive Design Breakpoints

| **Breakpoint** | **Tailwind Class**               | **Layout Behavior**                                                                                                                 |
| -------------- | -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Mobile         | Default (< 640px)                | Single column, stacked sections, hamburger nav, bottom sheet modals, full-width cards, touch-optimized tap targets (min 44px)       |
| Tablet         | sm: (640px+) and md: (768px+)    | Two-column grids for features, side-by-side pricing cards begin, navigation remains collapsed or horizontal depending on item count |
| Desktop        | lg: (1024px+)                    | Full three-column layouts, alternating feature rows, full pricing comparison table, sticky secondary navigation on features page    |
| Wide Desktop   | xl: (1280px+) and 2xl: (1536px+) | Content maxes out at max-w-7xl with auto margins, hero visual scales up, additional whitespace for breathing room                   |

## 17.11 Accessibility Requirements

**FR-LP-028: WCAG 2.1 AA Compliance** All landing pages meet WCAG 2.1 Level AA. This includes: minimum 4.5:1 contrast ratio for body text and 3:1 for large text (verified against both light and dark themes), full keyboard navigation for all interactive elements, ARIA labels on icon-only buttons and decorative elements, focus-visible outlines on all focusable elements, reduced-motion support via prefers-reduced-motion media query (disables all animations), and screen reader testing with VoiceOver and NVDA.

**FR-LP-029: shadcn/ui Accessibility** shadcn/ui components are built on Radix UI primitives, which provide built-in accessibility (keyboard navigation, screen reader support, focus management). The team must not override these accessibility features during customization. All custom components (e.g., the hero animation, pricing toggle, testimonial carousel) must match the accessibility standard set by shadcn/ui.

# 7\. Team Management

## 17.1 Overview

Changeloger supports multi-user teams with role-based access control. Teams are organized at the account level (a "workspace") and can manage multiple repositories. Team members are invited via email and can access the workspace after signing in with Google or GitHub.

## 15.2 Roles and Permissions

| **Role** | **View Changelogs** | **Edit Drafts** | **Publish** | **Manage Team** | **Billing** | **Delete Repo**     |
| -------- | ------------------- | --------------- | ----------- | --------------- | ----------- | ------------------- |
| Viewer   | Yes                 | No              | No          | No              | No          | No                  |
| Editor   | Yes                 | Yes             | Yes         | No              | No          | No                  |
| Admin    | Yes                 | Yes             | Yes         | Yes             | Yes         | Yes                 |
| Owner    | Yes                 | Yes             | Yes         | Yes             | Yes         | Yes (transfer only) |

## 8.3 Invitation Flow

**FR-TEAM-001: Email Invitations** Admins and Owners can invite new members by email address. The invitee receives an email with a link to join the workspace. If the invitee does not have a Changeloger account, they are prompted to sign up (via Google or GitHub) before being added to the workspace.

**FR-TEAM-002: Role Assignment** The inviter selects a role (Viewer, Editor, Admin) at invitation time. Roles can be changed later by any Admin or Owner.

**FR-TEAM-003: Repository-Level Access** In addition to workspace-level roles, Admins can restrict specific members to specific repositories. By default, all workspace members can access all repos in the workspace. Fine-grained per-repo restrictions are available on Team and Enterprise plans.

**FR-TEAM-004: Audit Log** All team actions (invitations, role changes, publishes, deletions) are recorded in an audit log visible to Admins and Owners.

# 8\. Analytics Dashboard

## 17.1 Overview

The analytics dashboard provides teams with visibility into how their changelogs are consumed. This data helps teams understand the ROI of changelog efforts, identify which types of changes resonate with users, and optimize their change communication strategy. Analytics data is collected from all embedded widgets and the public changelog page.

## 15.2 Metrics

| **Metric**           | **Description**                                                                                   | **Granularity**                                    |
| -------------------- | ------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| Page Views           | Total number of times the changelog was loaded across all widgets and public page                 | Daily, weekly, monthly; filterable by widget type  |
| Unique Visitors      | Deduplicated visitor count using anonymized browser fingerprinting (no cookies required)          | Daily, weekly, monthly                             |
| Per-Entry Engagement | Click/expand count for individual changelog entries, showing which changes get the most attention | Per entry, aggregated over configurable time range |
| Version Comparison   | Side-by-side view and engagement comparison across published versions                             | Per version                                        |
| Traffic Sources      | Referrer URL analysis showing where changelog viewers come from (direct, docs, in-app, etc.)      | Per source, over time                              |
| Read Depth           | How far down the changelog a visitor scrolls (viewport tracking)                                  | Percentile distribution per version                |
| Time on Page         | Average time spent viewing the changelog per session                                              | Daily average, per widget type                     |
| Trend Analysis       | Week-over-week and month-over-month growth/decline in all metrics above                           | Automated trendline with percentage change         |

## 8.3 Analytics Functional Requirements

**FR-ANALYTICS-001: Event Collection** A lightweight analytics script (included in the widget bundle) fires events on: page load, entry click/expand, scroll depth milestones (25%, 50%, 75%, 100%), and session end. Events are batched and sent to the analytics ingestion endpoint in 5-second intervals.

**FR-ANALYTICS-002: Privacy Compliance** Analytics use anonymized browser fingerprinting (no cookies, no PII collection). The system is GDPR-compliant by design - no personal data is stored. Visitors are identified only by a hashed combination of user agent, screen resolution, and timezone. An opt-out mechanism is available via a data attribute on the widget script tag.

**FR-ANALYTICS-003: Dashboard Visualizations** The analytics section displays: a time-series line chart for views and visitors (zoomable, with comparison overlay), a bar chart for per-entry engagement (sortable by clicks), a pie/donut chart for traffic sources, a heatmap for read depth distribution, and a summary card row with key metrics and trend arrows.

**FR-ANALYTICS-004: Export** Analytics data can be exported as CSV or JSON for further analysis. Pro and Team plan users can set up scheduled email reports (weekly or monthly digest).

**FR-ANALYTICS-005: Real-Time Counter** The dashboard shows a real-time active viewer count (WebSocket-updated) when the changelog is currently being viewed by one or more visitors.

# 9\. Pricing and Plans

## 17.1 Plan Overview

Changeloger uses a tiered SaaS pricing model with a generous free tier for individuals and open source projects, and paid tiers for teams and businesses. All plans include the core detection engines and AI-powered changelog generation. Paid tiers unlock collaboration, analytics, customization, and higher usage limits.

| **Feature**                  | **Free**            | **Pro (\$15/mo)**               | **Team (\$40/mo)**          | **Enterprise (Custom)** |
| ---------------------------- | ------------------- | ------------------------------- | --------------------------- | ----------------------- |
| Connected Repositories       | 1                   | 5                               | Unlimited                   | Unlimited               |
| Team Members                 | 1 (owner only)      | 3                               | Unlimited                   | Unlimited + SSO         |
| AI Generations / month       | 50 entries          | 500 entries                     | 2,000 entries               | Unlimited               |
| Changelog Versions (history) | Last 5              | Last 50                         | Unlimited                   | Unlimited               |
| Embeddable Widgets           | Page only           | Page + Modal + Badge            | Page + Modal + Badge        | All + custom widgets    |
| Widget Customization         | Basic (colors only) | Full (colors, fonts, logo, CSS) | Full + custom domain        | Full + white-label      |
| Analytics                    | Page views only     | Full dashboard                  | Full + export + reports     | Full + API access       |
| Team Roles                   | N/A                 | Admin + Editor                  | All roles + per-repo access | All + SCIM provisioning |
| Audit Log                    | No                  | No                              | Yes                         | Yes + API export        |
| Support                      | Community           | Email                           | Priority email + chat       | Dedicated CSM           |
| Data Retention               | 30 days             | 1 year                          | Unlimited                   | Unlimited + SLA         |
| API Access                   | No                  | Read-only                       | Full CRUD                   | Full + webhooks         |

## 15.2 Billing Implementation

**FR-BILLING-001: Polar Integration** All subscription management is handled via Polar. The backend uses Polar Checkout for initial subscription, Polar Customer Portal for self-service plan changes and payment method updates, and Polar Webhooks for lifecycle events (subscription created, updated, canceled, payment failed). Polar's developer-first API and SDK simplify integration compared to traditional payment processors.

**FR-BILLING-002: Usage Metering** AI generation usage is tracked per workspace per billing cycle. When a workspace approaches their limit (80%), an in-app notification warns the admin. When the limit is reached, new AI generations are paused (but existing changelogs remain accessible and publishable). The admin can upgrade to continue.

**FR-BILLING-003: Free Tier Limits** The free tier has hard limits enforced at the API level. Attempting to connect a second repository or invite a team member on the free plan returns a 402 response with upgrade messaging.

**FR-BILLING-004: Trial Period** New sign-ups receive a 14-day free trial of the Pro plan. No credit card required. At the end of the trial, the workspace downgrades to the Free plan unless the user subscribes.

**FR-BILLING-005: Annual Billing** All paid plans offer a 20% discount for annual billing (Pro: \$144/year, Team: \$384/year). Annual plans are managed via Polar subscription schedules.

# 10\. Detection Engine Specifications

## 17.1 Git Commit Analysis Engine

### 10.1.1 Overview

The Git Commit Analysis Engine is the primary input source for changelog generation. When a push event is received via the GitHub App webhook, the engine fetches new commits via the GitHub API, parses commit messages according to conventional commit standards, and uses AI to group, deduplicate, and summarize them into human-readable changelog entries.

### 10.1.2 Functional Requirements

**FR-GIT-001: Webhook-Driven Monitoring** The system receives push events from the GitHub App webhook. For each push, it fetches the new commits via the GitHub Commits API. The system processes commits on configured branches (default: default branch). All monitoring is server-side - no local Git operations or CLI required.

**FR-GIT-002: Conventional Commit Parsing** The system shall parse commit messages following the Conventional Commits specification (v1.0.0). Recognized prefixes include: feat, fix, chore, docs, style, refactor, perf, test, build, ci, revert. The parser extracts: type, optional scope, breaking change indicator (!), subject line, optional body, and optional footer (including BREAKING CHANGE: footers).

**FR-GIT-003: Non-Conventional Commit Handling** For commits that do not follow conventional commit format, the system uses AI classification to infer the change type based on the commit message content, the files changed, and the diff content. Confidence scores are assigned and commits below a configurable threshold (default: 0.6) are flagged for manual review in the web editor.

**FR-GIT-004: AI Grouping and Summarization** The system groups related commits (e.g., multiple commits for the same feature, fixup commits, work-in-progress commits) and produces a single, consolidated changelog entry. Grouping heuristics include: shared scope, overlapping file paths, temporal proximity (within configurable window), and semantic similarity of commit messages.

**FR-GIT-005: Merge Commit Intelligence** The system detects merge commits and extracts the source branch name, linked PR number (if present in the merge message), and the set of squashed commits. For squash merges, the system uses the squash commit's body to generate a richer changelog entry.

**FR-GIT-006: Author Attribution** Each changelog entry records the commit author(s) and optionally includes attribution in the rendered output. Co-authored-by trailers are parsed and respected.

**FR-GIT-007: Breaking Change Detection** Breaking changes are detected from: the ! indicator in conventional commits, BREAKING CHANGE: footers, and AI analysis of the diff (e.g., removed public API methods, changed function signatures). Breaking changes are prominently flagged in the editor and output.

### 10.1.3 Conventional Commit Mapping

| **Commit Type** | **Changelog Category** | **Semver Impact**        | **Example**                                        |
| --------------- | ---------------------- | ------------------------ | -------------------------------------------------- |
| feat            | Added / New Features   | Minor                    | feat(auth): add OAuth2 PKCE flow                   |
| fix             | Fixed / Bug Fixes      | Patch                    | fix(api): resolve race condition in batch endpoint |
| perf            | Performance            | Patch                    | perf(db): add index on users.email column          |
| refactor        | Changed (internal)     | None (hidden by default) | refactor(core): extract validation logic           |
| docs            | Documentation          | None                     | docs: update API rate limit docs                   |
| chore           | Maintenance            | None (hidden by default) | chore: upgrade eslint to v9                        |
| build/ci        | Build / CI             | None (hidden by default) | ci: add Node 22 to test matrix                     |
| BREAKING CHANGE | Breaking Changes       | Major                    | feat(api)!: remove deprecated v1 endpoints         |

### 10.1.4 AI Summarization Requirements

- Language: Output in clear, concise English (or a configured language). Technical jargon is preserved when the target audience is developers, and simplified when the audience is end users.
- Tone: Professional, factual, and action-oriented. Each entry starts with a past-tense verb (Added, Fixed, Improved, Removed, Updated).
- Deduplication: Multiple commits addressing the same change are collapsed into a single entry describing the final state.
- Scope inference: When commits lack an explicit scope, the AI infers scope from changed file paths (e.g., changes in src/auth/ suggest scope "auth").
- Confidence scoring: Each generated entry carries an internal confidence score (0.0-1.0). Entries below the configured threshold are flagged for review in the web editor.

## 15.2 Diff-Based Detection Engine

### 11.2.1 Overview

The Diff-Based Detection Engine complements commit analysis by examining the actual code changes between two reference points (tags, branches, or commits). While commit messages describe intent, diffs reveal reality. This engine detects structural changes - new API endpoints, modified UI components, deleted functions, changed configuration - and uses AI to describe them in plain English. All diff retrieval happens via the GitHub API, not local Git operations.

### 11.2.2 Functional Requirements

**FR-DIFF-001: Reference Point Selection** The system accepts two Git references (tags, branches, commit SHAs) and fetches the full diff between them via the GitHub Compare API. Default behavior: diff between the two most recent version tags.

**FR-DIFF-002: Structural Change Detection** The system analyzes diffs to detect: new files added (categorized by type), files deleted, new functions/methods/classes introduced, modified function signatures or bodies, new or modified API endpoints, database migrations, configuration changes, and dependency additions/removals/version changes.

**FR-DIFF-003: Language-Aware Parsing** The system supports language-aware AST (Abstract Syntax Tree) parsing for the following languages at launch:

| **Language**          | **Detection Capabilities**                                                             | **Parser**                   |
| --------------------- | -------------------------------------------------------------------------------------- | ---------------------------- |
| JavaScript/TypeScript | Functions, classes, React components, Next.js API routes, Express/Nest routes, exports | Tree-sitter + custom queries |
| Python                | Functions, classes, FastAPI/Flask/Django routes, decorators                            | Tree-sitter + custom queries |
| Go                    | Functions, structs, interfaces, HTTP handlers                                          | Tree-sitter + custom queries |
| Rust                  | Functions, structs, traits, impl blocks                                                | Tree-sitter + custom queries |
| Java/Kotlin           | Methods, classes, Spring endpoints, annotations                                        | Tree-sitter + custom queries |
| Ruby                  | Methods, classes, Rails routes/controllers                                             | Tree-sitter + custom queries |

**FR-DIFF-004: AI Description Generation** For each detected structural change, the AI generates a plain-English description suitable for non-technical audiences: what changed, where (component/module), and the likely user-facing impact.

**FR-DIFF-005: Noise Filtering** The system filters out non-meaningful diffs: whitespace-only changes, auto-generated files (lock files, build output), formatting-only changes, and changes in configured ignore paths.

**FR-DIFF-006: Impact Classification** Each detected change is classified by estimated impact:

| **Impact Level** | **Criteria**                                               | **Example**                              |
| ---------------- | ---------------------------------------------------------- | ---------------------------------------- |
| Critical         | Breaking API changes, security patches, data model changes | Removed public endpoint /api/v1/users    |
| High             | New user-facing features, significant behavior changes     | Added new payment method selection UI    |
| Medium           | Internal improvements, performance optimizations           | Optimized database query for user search |
| Low              | Documentation, tests, minor refactors                      | Added unit tests for auth middleware     |
| Negligible       | Formatting, comments, internal-only changes                | Updated code comments in utility module  |

## 10.3 Semantic Versioning Trigger Engine

### 10.3.1 Overview

The Semantic Versioning Trigger Engine watches for version changes in package manifest files. When a version bump is detected (via commit diff or Git tag creation webhook), it compiles all changes since the last version into a structured, versioned changelog entry. This engine orchestrates output from both the Git Commit Analysis and Diff-Based Detection engines into a cohesive release changelog.

### 10.3.2 Functional Requirements

**FR-SV-001: Manifest File Monitoring** The system monitors the following manifest files for version changes:

| **Ecosystem** | **File**                 | **Version Field**                      |
| ------------- | ------------------------ | -------------------------------------- |
| Node.js       | package.json             | version                                |
| Python        | pyproject.toml           | project.version or tool.poetry.version |
| Rust          | Cargo.toml               | package.version                        |
| Go            | go.mod (via git tags)    | module version tag                     |
| Ruby          | \*.gemspec or version.rb | spec.version                           |
| Java          | pom.xml or build.gradle  | version                                |
| .NET          | \*.csproj                | Version or PackageVersion              |
| Generic       | .version or VERSION file | File contents                          |

**FR-SV-002: Version Bump Detection** Version changes are detected by comparing the manifest file's version field in push event diffs. Detection works for: direct file edits, version bump tool output (npm version, poetry version, cargo release), and CI-driven version updates.

**FR-SV-003: Tag Correlation** When a version bump is detected, the system correlates it with a Git tag matching common patterns: v{version}, {version}, {package}@{version}, and configurable custom patterns. Tag creation webhooks from the GitHub App provide an additional detection signal.

**FR-SV-004: Change Compilation** Upon detecting a version bump, the system: identifies the previous version, collects all commits between versions, runs each through the Git Commit Analysis Engine, runs the full diff through the Diff-Based Detection Engine, merges and deduplicates outputs, and produces a structured draft changelog entry tagged with the new version and date.

**FR-SV-005: Semver Validation** If a breaking change is detected but the version bump is only a patch or minor increment, the system emits a warning in the web editor recommending a major version bump.

**FR-SV-006: Pre-release Support** The system supports semver pre-release identifiers (e.g., 1.2.0-beta.1) and build metadata (e.g., 1.2.0+build.42). Pre-release versions are grouped separately in the changelog output.

# 11\. Data Model

## 17.1 Database

All persistent data is stored in PostgreSQL 16. The schema is designed for multi-tenant SaaS with workspace-level isolation. Row-level security policies ensure that queries are automatically scoped to the current workspace. JSONB columns are used for flexible metadata fields.

## 15.2 Core Entities

### 11.2.1 Users and Authentication

| **Table**      | **Key Fields**                                                                        | **Description**                                                      |
| -------------- | ------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| users          | id, email, name, avatar_url, created_at                                               | User accounts; one row per unique email regardless of OAuth provider |
| oauth_accounts | id, user_id, provider (google\|github), provider_user_id, access_token, refresh_token | Linked OAuth accounts; a user can have both Google and GitHub linked |
| sessions       | id, user_id, token_hash, expires_at, ip_address                                       | Active sessions; JWT tokens with server-side validation              |

### 11.2.2 Workspaces and Teams

| **Table**         | **Key Fields**                                                                          | **Description**                                           |
| ----------------- | --------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| workspaces        | id, name, slug, owner_id, plan, polar_customer_id, polar_subscription_id, trial_ends_at | Organizational unit; one per team; owns repos and billing |
| workspace_members | workspace_id, user_id, role (owner\|admin\|editor\|viewer), invited_by, joined_at       | Membership junction table with role assignment            |
| invitations       | id, workspace_id, email, role, invited_by, token, expires_at, accepted_at               | Pending invitations; expire after 7 days                  |

### 11.2.3 Repositories and Integration

| **Table**            | **Key Fields**                                                                                            | **Description**                                                          |
| -------------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| github_installations | id, installation_id, account_login, account_type (user\|org), access_token, token_expires_at              | GitHub App installations; one per GitHub account                         |
| repositories         | id, workspace_id, github_installation_id, github_repo_id, name, full_name, default_branch, config (JSONB) | Connected repos; config stores branch filters, ignore paths, AI settings |

### 11.2.4 Changelog Data

| **Table**         | **Key Fields**                                                                                                                                                                 | **Description**                                                                   |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------- |
| change_records    | id, repository_id, source (commit\|diff\|version), commit_sha, type, scope, subject, files_changed (JSONB), breaking, confidence, authors (JSONB), timestamp, metadata (JSONB) | Raw change data from ingestion engines; one row per detected change               |
| changelog_entries | id, release_id, category, title, description, impact, breaking, source_record_ids (UUID\[\]), authors (JSONB), position (integer), reviewed, created_at                        | Processed, human-readable entries; position field for manual reordering in editor |
| releases          | id, repository_id, version, date, tag, status (draft\|published\|archived), summary, commit_range, published_at, published_by                                                  | Versioned changelog releases; status tracks the editorial lifecycle               |
| release_revisions | id, release_id, snapshot (JSONB), created_by, created_at                                                                                                                       | Revision history; snapshot stores the full state of all entries at publish time   |

### 11.2.5 Widgets and Analytics

| **Table**        | **Key Fields**                                                                                       | **Description**                                                            |
| ---------------- | ---------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| widgets          | id, repository_id, type (page\|modal\|badge), embed_token, config (JSONB), created_at                | Widget configurations; embed_token is the public identifier in the snippet |
| analytics_events | id, widget_id, event_type, entry_id (nullable), visitor_hash, referrer, metadata (JSONB), timestamp  | Raw analytics events; partitioned by month for query performance           |
| analytics_daily  | widget_id, date, page_views, unique_visitors, entry_clicks (JSONB), avg_read_depth, avg_time_on_page | Pre-aggregated daily rollups for fast dashboard queries                    |

# 12\. Authentication and Authorization

## 17.1 Authentication Flow

Changeloger uses OAuth 2.0 for all authentication. No email/password authentication is supported in Phase 1. The flow is:

- **Initiate:** User clicks "Sign in with Google" or "Sign in with GitHub" on the login page.
- **Redirect:** The frontend redirects to the OAuth provider's authorization URL with the appropriate scopes (Google: openid, email, profile; GitHub: user:email, read:user).
- **Callback:** The provider redirects back to Changeloger's callback URL with an authorization code.
- **Token exchange:** The backend exchanges the code for access and refresh tokens. It fetches the user's profile (email, name, avatar) from the provider.
- **Account resolution:** If a user with that email already exists (from a different provider), the new OAuth account is linked. If not, a new user is created.
- **Session creation:** A JWT session token is issued and returned to the frontend. The token is stored in an httpOnly secure cookie. TanStack Query is initialized with the authenticated user context.

## 15.2 Authorization Model

Authorization is enforced at the API layer using middleware that checks the current user's role within the target workspace. Every API endpoint that touches workspace data includes a workspace_id parameter. The middleware verifies:

- The user is a member of the workspace (workspace_members table lookup).
- The user's role has the required permission for the action (role-based check).
- For repository-specific actions, the user has access to that repository (if per-repo restrictions are configured on Team/Enterprise plans).

PostgreSQL row-level security (RLS) provides an additional layer of defense. All queries execute within a session context that sets the current workspace_id, ensuring that even a bug in the application layer cannot leak data across workspaces.

# 13\. API Design

## 17.1 API Overview

The backend exposes a RESTful JSON API consumed by the frontend (via Axios + TanStack Query) and, in the future, by third-party integrations. All endpoints require authentication via JWT bearer token except for widget serving endpoints (authenticated by embed token) and OAuth callback endpoints.

## 15.2 Core API Endpoints

| **Method** | **Endpoint**                                | **Description**                          | **Auth**         |
| ---------- | ------------------------------------------- | ---------------------------------------- | ---------------- |
| POST       | /auth/google                                | Initiate Google OAuth flow               | None             |
| POST       | /auth/github                                | Initiate GitHub OAuth flow               | None             |
| GET        | /auth/callback/:provider                    | OAuth callback handler                   | None             |
| POST       | /auth/logout                                | Invalidate session                       | JWT              |
| GET        | /workspaces                                 | List user's workspaces                   | JWT              |
| POST       | /workspaces                                 | Create a new workspace                   | JWT              |
| GET        | /workspaces/:id/members                     | List workspace members                   | JWT (any role)   |
| POST       | /workspaces/:id/invitations                 | Invite a team member                     | JWT (admin+)     |
| GET        | /workspaces/:id/repositories                | List connected repos                     | JWT (any role)   |
| POST       | /workspaces/:id/repositories                | Connect a repository (via GitHub App)    | JWT (admin+)     |
| GET        | /repositories/:id/releases                  | List changelog releases for a repo       | JWT (any role)   |
| GET        | /repositories/:id/releases/:version         | Get a specific release with entries      | JWT (any role)   |
| PUT        | /repositories/:id/releases/:version         | Update a draft (edit entries, reorder)   | JWT (editor+)    |
| POST       | /repositories/:id/releases/:version/publish | Publish a draft release                  | JWT (editor+)    |
| GET        | /repositories/:id/analytics                 | Get analytics data for a repo            | JWT (any role)   |
| GET        | /widgets/:embed_token/changelog             | Serve changelog data for embedded widget | Embed token      |
| POST       | /widgets/:embed_token/events                | Ingest analytics events from widgets     | Embed token      |
| POST       | /webhooks/github                            | GitHub App webhook receiver              | GitHub signature |
| POST       | /webhooks/polar                             | Polar billing webhook receiver           | Polar signature  |

## 15.3 Frontend Data Layer

The frontend uses a three-layer data architecture:

- Axios instance: A configured Axios instance with base URL, JWT token injection via interceptors, response error handling (401 triggers re-auth, 402 triggers upgrade modal, 429 shows rate limit message), and request/response logging in development.
- TanStack Query hooks: All API calls are wrapped in TanStack Query hooks (useQuery for reads, useMutation for writes). This provides: automatic caching with configurable stale times, background refetching on window focus, optimistic updates for the changelog editor (entries appear to save instantly), pagination support for releases and analytics, and retry logic for transient failures.
- Zustand stores: Client-side UI state that does not come from the API lives in Zustand stores: current workspace selection, editor UI state (selected entry, drag state, filter state), onboarding step tracking, and widget preview configuration. Zustand is chosen for its minimal boilerplate and TypeScript-native selectors.

# 14\. Non-Functional Requirements

## 17.1 Performance

| **Metric**                   | **Target**                                           | **Measurement**                                           |
| ---------------------------- | ---------------------------------------------------- | --------------------------------------------------------- |
| Dashboard initial load (LCP) | <2 seconds                                           | Lighthouse on 4G throttled connection                     |
| API response time (p95)      | <200ms for reads, <500ms for writes                  | APM monitoring (Datadog/Grafana)                          |
| Webhook processing latency   | <30 seconds from push to draft entries visible       | End-to-end timing from GitHub webhook receipt to DB write |
| AI summarization latency     | <5 seconds per batch of 50 commits                   | Including API round-trip to AI provider                   |
| Widget script load           | <30 KB gzipped, <200ms render                        | Bundle size analysis + real user monitoring               |
| Editor responsiveness        | <100ms for drag, reorder, and inline edit operations | Performance profiling in React DevTools                   |
| Analytics dashboard query    | <1 second for 90-day aggregated views                | PostgreSQL query EXPLAIN ANALYZE                          |

## 15.2 Reliability

- Uptime target: 99.9% availability for the web dashboard and widget serving endpoints (measured monthly).
- Graceful AI degradation: If the AI provider is unreachable, the system falls back to rule-based summarization (conventional commit subjects as-is). A banner in the editor indicates reduced quality mode.
- Webhook resilience: GitHub webhooks are processed idempotently. Failed webhook processing is retried with exponential backoff (up to 3 retries). A dead-letter queue captures permanently failed events for manual inspection.
- Data durability: PostgreSQL with daily automated backups, point-in-time recovery, and cross-region replication for production.
- Widget availability: Widget assets are served from a CDN with global edge caching. Widget functionality degrades gracefully if the API is unreachable (shows cached last-known changelog state).

## 15.3 Security

- OAuth-only authentication: No password storage, no reset flows, no brute-force attack surface.
- JWT security: Tokens are httpOnly, secure, SameSite=Strict cookies. Short expiry (15 minutes) with silent refresh via refresh token rotation.
- GitHub App tokens: Installation access tokens are short-lived (1 hour) and automatically refreshed. Stored encrypted at rest in PostgreSQL.
- Code content in AI prompts: Only commit messages, file paths, and structural summaries are sent to external AI providers. Raw source code is not included unless explicitly opted in.
- Row-level security: PostgreSQL RLS ensures multi-tenant data isolation at the database level.
- Embed token security: Widget embed tokens are random UUIDs, not guessable. Tokens can be rotated from the dashboard. Domain whitelisting prevents unauthorized embedding.
- Polar webhook verification: All Polar events are verified using the webhook signing secret before processing.
- OWASP Top 10 compliance: Input validation, parameterized queries (via ORM), CSRF protection, security headers (CSP, HSTS, X-Frame-Options).

## 14.4 Scalability

- Database: PostgreSQL with connection pooling (PgBouncer), read replicas for analytics queries, and monthly partitioning on the analytics_events table.
- Background jobs: Redis-backed job queue (BullMQ) with horizontal worker scaling. Webhook processing and AI calls are handled asynchronously.
- Widget CDN: Static assets served from a global CDN. Changelog data API responses are edge-cached with a 60-second TTL, invalidated on publish.
- Target scale for Phase 1: 10,000 workspaces, 50,000 repositories, 1M analytics events/day.

# 15\. Success Metrics

## 17.1 Adoption Metrics

| **Metric**                  | **Target (6 months)** | **Measurement Method**                             |
| --------------------------- | --------------------- | -------------------------------------------------- |
| Registered users            | 5,000+                | Database count                                     |
| Active workspaces (monthly) | 1,000+                | Workspaces with at least one publish in 30 days    |
| Connected repositories      | 3,000+                | Database count                                     |
| Embedded widgets deployed   | 500+                  | Widgets with at least 1 analytics event in 30 days |
| Paid subscribers            | 200+                  | Polar active subscription count                    |
| Monthly recurring revenue   | \$5,000+              | Polar MRR dashboard                                |

## 15.2 Quality Metrics

| **Metric**                                            | **Target**        | **Measurement Method**                                                 |
| ----------------------------------------------------- | ----------------- | ---------------------------------------------------------------------- |
| AI entry approval rate (no edits needed)              | \>80%             | Publish events where entries were not modified from AI-generated state |
| AI classification accuracy (conventional commits)     | \>95%             | Automated test suite against labeled dataset                           |
| AI classification accuracy (non-conventional commits) | \>75%             | Automated test suite against labeled dataset                           |
| User-reported missed changes                          | <5% per release   | Issue tracker + user surveys                                           |
| Time from push to draft visible                       | <30 seconds (p95) | End-to-end latency monitoring                                          |

## 15.3 Engagement Metrics

| **Metric**                                           | **Target**                                    | **Measurement Method**          |
| ---------------------------------------------------- | --------------------------------------------- | ------------------------------- |
| Median changelog views per published version         | 50+                                           | Analytics dashboard aggregation |
| Widget interaction rate (clicks/views)               | \>15%                                         | Analytics dashboard             |
| Editor usage (entries edited before publish)         | \>30% of entries touched                      | Edit event tracking             |
| Team collaboration rate                              | \>40% of Team plan workspaces with 2+ editors | Member activity tracking        |
| Onboarding completion rate (signup to first publish) | \>60%                                         | Funnel analytics                |

# 16\. Milestones and Timeline

## 17.1 Phase 1 Roadmap

| **Milestone**             | **Duration** | **Deliverables**                                                                                                                                                                                                                                                                        | **Exit Criteria**                                                                                                        |
| ------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| M1: Foundation + Landing  | Weeks 1-4    | Project scaffolding (Next.js + PostgreSQL + Prisma + Tailwind + shadcn/ui), Google and GitHub OAuth, user and workspace models, complete marketing site (home, features, pricing, docs pages) with enterprise-grade design, basic dashboard shell with Zustand + TanStack Query + Axios | Marketing site live with all sections; Lighthouse score >95; user can sign up, create workspace, and see empty dashboard |
| M2: GitHub Integration    | Weeks 5-7    | GitHub App creation and installation flow, webhook receiver, repository connection UI, commit fetching via GitHub API                                                                                                                                                                   | User can install GitHub App and see connected repos with recent commits in the dashboard                                 |
| M3: Detection Engines     | Weeks 8-11   | Git commit parser, conventional commit support, diff-based detection with Tree-sitter (JS/TS/Python), semver trigger engine, AI provider adapter (OpenAI integration), change grouping and summarization                                                                                | System generates accurate draft changelog entries from webhook-triggered commits and diffs                               |
| M4: Editor and Publishing | Weeks 12-14  | Changelog editor UI (review, edit, reorder, categorize), draft management, publish flow, Markdown/HTML/JSON renderers, revision history                                                                                                                                                 | Team can review AI-generated entries, edit them, and publish a versioned changelog                                       |
| M5: Widgets and Embed     | Weeks 15-17  | Embeddable page widget, modal widget, badge widget, widget configuration UI, copy-paste snippets, CDN delivery, auto-update on publish                                                                                                                                                  | Widget snippet renders live changelog on any external page; updates instantly on publish                                 |
| M6: Teams and Access      | Weeks 18-19  | Email invitations, role-based access control (Viewer/Editor/Admin/Owner), workspace member management UI, per-repo access restrictions                                                                                                                                                  | Multi-user team can collaborate on changelogs with appropriate permission enforcement                                    |
| M7: Analytics             | Weeks 20-21  | Analytics event ingestion, daily rollup aggregation, analytics dashboard (views, visitors, per-entry engagement, traffic sources, trends), CSV export                                                                                                                                   | Dashboard shows accurate engagement metrics for published changelogs viewed through widgets                              |
| M8: Pricing and Billing   | Weeks 22-23  | Polar integration (Checkout, Customer Portal, Webhooks), plan enforcement (free tier limits), trial management, upgrade/downgrade flows, annual billing                                                                                                                                 | Users can subscribe to Pro or Team plans; free tier limits are enforced; billing lifecycle works end-to-end              |
| M9: Beta Release          | Weeks 24-26  | Public beta launch, onboarding polish, landing page iteration based on early feedback, performance optimization, bug fixes, documentation site, feedback collection                                                                                                                     | Platform is publicly available; 20+ beta testers onboarded; no P0 bugs open; conversion funnel instrumented              |

# 17\. Phase 2 Feature Previews

The following features are planned for Phase 2 and are documented here to inform architectural decisions in Phase 1.

## 17.1 CLI Tool

A local command-line interface for developers who want offline changelog generation, CI/CD scripting, or advanced workflows. The CLI will share the same detection engines as the web platform but operate on local Git repositories. Key consideration: the core engines must be extractable into a standalone package that works without the web backend.

## 17.2 PR/Issue Scraping

Pull data from GitHub, GitLab, Linear, and Jira to enrich changelog entries with PR titles, descriptions, labels, and linked issues. When a PR merges to main, it triggers a changelog entry. PR descriptions tend to be more human-readable than commit messages, making this a higher-quality input source.

## 17.3 Deployment Hooks

CI/CD integration allowing Changeloger to hook into GitHub Actions, Vercel, Railway, and other deployment platforms. Every deploy triggers an automatic changelog snapshot capturing what changed between deploys.

## 17.4 Additional Platform Integrations

GitLab App, Bitbucket App, and Azure DevOps integration - providing the same one-click installation experience as GitHub. The integration layer is designed with an adapter pattern, so adding new Git platforms requires implementing a common interface for: webhook handling, commit fetching, diff retrieval, and manifest file reading.

## 17.5 Browser Extension / Screenshot Capture

For UI-heavy products, before/after screenshots on each deploy with visual diffing. AI analyzes visual differences to auto-generate user-facing what's new entries. Requires headless browser infrastructure (Playwright), image comparison pipeline, and multi-modal AI (vision models).

## 17.6 Custom Domains

Allow teams to host their public changelog on a custom domain (e.g., changelog.yourcompany.com). Requires DNS verification and automated SSL certificate provisioning via Let's Encrypt.

# 18\. Risks and Mitigations

| **Risk**                                                                                      | **Probability** | **Impact** | **Mitigation**                                                                                                                                                                |
| --------------------------------------------------------------------------------------------- | --------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AI hallucinations: Generated entries describe changes that didn't happen                      | Medium          | High       | Cross-reference AI output against commit/diff data; confidence scoring; mandatory editor review before publish; automated regression tests                                    |
| GitHub API rate limits: Heavy usage could hit rate limits on the GitHub API                   | Medium          | High       | Implement aggressive caching of API responses; use conditional requests (ETags); batch API calls; alert admins approaching limits; negotiate higher limits for production App |
| Poor commit hygiene: Non-descriptive commit messages reduce AI accuracy                       | High            | Medium     | AI classification fallback; diff-based detection as alternative signal; onboarding guide for commit conventions; configurable quality threshold                               |
| AI API cost overruns: Large repos or high-volume workspaces could generate expensive AI bills | Medium          | Medium     | Aggressive caching in Redis; per-plan usage limits; cost estimation before generation; Ollama support for self-hosted alternative                                             |
| Widget performance impact: Slow or heavy widget script could affect host page performance     | Low             | High       | Strict 30 KB bundle limit; async loading; lazy initialization; performance monitoring in production; CDN edge caching                                                         |
| Multi-tenant data leakage: Bug in authorization layer exposes data across workspaces          | Low             | Critical   | PostgreSQL RLS as defense-in-depth; comprehensive authorization middleware tests; security audit before launch; bug bounty program                                            |
| Polar billing edge cases: Failed payments, disputed charges, plan downgrades mid-cycle        | Medium          | Medium     | Comprehensive webhook handling for all Polar lifecycle events; grace period on failed payments; clear communication of downgrade consequences                                 |
| Competitor launches: GitHub or GitLab ships native changelog generation                       | Medium          | High       | Differentiate via collaborative editing, embeddable widgets, cross-platform analytics, and superior AI quality; maintain speed of iteration                                   |

# 19\. Open Questions

| **Question**                                                                                          | **Context**                                                                                    | **Decision Owner** | **Deadline** |
| ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ------------------ | ------------ |
| Should we support GitLab/Bitbucket in Phase 1 or strictly Phase 2?                                    | Early user research shows 20% of target users are on GitLab. May be worth minimal support.     | Product + Eng      | Before M2    |
| What is the right default AI model for cost vs. quality?                                              | gpt-4o-mini is cheap but may lack nuance; gpt-4o is more accurate but 10x the cost per token.  | Engineering        | Before M3    |
| Should widget analytics use a dedicated analytics service (e.g., Plausible, PostHog) or custom-built? | Custom gives full control but adds scope. Third-party is faster but adds dependency and cost.  | Engineering        | Before M7    |
| How should we handle monorepo changelog separation?                                                   | Per-package changelogs vs. single unified changelog. Both have valid use cases.                | Engineering        | Before M3    |
| Should the editor support real-time collaborative editing (CRDT) or simpler last-write-wins?          | CRDT is ideal but complex. Last-write-wins with presence indicators may be sufficient for MVP. | Engineering        | Before M4    |
| Free tier limits: How generous should we be?                                                          | Too generous delays conversion to paid. Too restrictive kills adoption and word-of-mouth.      | Product + Growth   | Before M8    |
| Should we offer a self-hosted / on-premise option for Enterprise?                                     | Some enterprise customers require data residency. Could be a Phase 2 or Phase 3 consideration. | Product + Sales    | Before M9    |

# 20\. Appendix

## 20.1 Glossary

| **Term**             | **Definition**                                                                                                                                                                                                      |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Conventional Commits | A specification for adding human- and machine-readable meaning to commit messages (conventionalcommits.org)                                                                                                         |
| Semver               | Semantic Versioning: MAJOR.MINOR.PATCH versioning scheme (semver.org)                                                                                                                                               |
| GitHub App           | A first-class integration on GitHub that can be installed on repositories to receive webhooks and access the API with granular permissions                                                                          |
| AST                  | Abstract Syntax Tree: a tree representation of source code structure                                                                                                                                                |
| Tree-sitter          | An incremental parsing system for programming tools                                                                                                                                                                 |
| Keep a Changelog     | A convention for maintaining a structured CHANGELOG.md file (keepachangelog.com)                                                                                                                                    |
| TanStack Query       | A data-fetching and caching library for React (formerly React Query)                                                                                                                                                |
| Zustand              | A lightweight state management library for React                                                                                                                                                                    |
| shadcn/ui            | A collection of reusable, accessible UI components built on Radix UI primitives; copy-paste model (not an npm dependency) allowing full code ownership and customization                                            |
| Tailwind CSS         | A utility-first CSS framework that provides low-level utility classes for building custom designs directly in markup                                                                                                |
| Radix UI             | A low-level, accessible component library that provides unstyled primitives; the foundation layer underneath shadcn/ui                                                                                              |
| Next.js              | A React framework providing server-side rendering, static site generation, file-based routing, and API routes                                                                                                       |
| Next.js              | A full-stack React framework by Vercel providing server-side rendering, static site generation, API routes, file-based routing, and unified frontend/backend deployment; used as the core framework for Changeloger |
| Turbopack            | A Rust-based bundler integrated into Next.js for fast development builds and hot module replacement; successor to Webpack in the Next.js ecosystem                                                                  |
| Prisma               | A next-generation ORM for Node.js and TypeScript providing type-safe database access, declarative schema management, and automated migrations                                                                       |
| Polar                | A developer-first billing platform for SaaS and software products; provides subscription management, checkout flows, usage-based billing, and customer portals                                                      |
| Core Web Vitals      | A set of Google-defined metrics (LCP, FID, CLS) measuring real-world user experience; used as search ranking signals                                                                                                |
| RLS                  | Row-Level Security: a PostgreSQL feature that restricts which rows a query can access based on session context                                                                                                      |
| Embed Token          | A unique, random identifier included in widget snippets that authenticates widget requests without exposing user credentials                                                                                        |
| Workspace            | The organizational unit in Changeloger; a team's shared context containing repos, members, billing, and changelogs                                                                                                  |

## 20.2 References

- Conventional Commits Specification v1.0.0: <https://www.conventionalcommits.org/en/v1.0.0/>
- Semantic Versioning 2.0.0: <https://semver.org/>
- Keep a Changelog: <https://keepachangelog.com/en/1.1.0/>
- GitHub Apps Documentation: <https://docs.github.com/en/apps>
- Tree-sitter Documentation: <https://tree-sitter.github.io/tree-sitter/>
- TanStack Query Documentation: <https://tanstack.com/query/latest>
- Zustand Documentation: <https://zustand-demo.pmnd.rs/>
- Polar Documentation: <https://docs.polar.sh/>
- Tailwind CSS Documentation: <https://tailwindcss.com/docs>
- shadcn/ui Documentation: <https://ui.shadcn.com/docs>
- Radix UI Primitives: <https://www.radix-ui.com/primitives>
- Framer Motion: <https://www.framer.com/motion/>
- Next.js Documentation: <https://nextjs.org/docs>
- Vercel Deployment Documentation: <https://vercel.com/docs>
- Prisma Documentation: <https://www.prisma.io/docs>

## 20.3 Revision History

| **Version** | **Date**       | **Author**   | **Changes**                                                                                                                                                                                                                                                                                                                                                                               |
| ----------- | -------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.0.0       | March 16, 2026 | Product Team | Initial draft: CLI-based tool with core detection engines                                                                                                                                                                                                                                                                                                                                 |
| 2.0.0       | March 16, 2026 | Product Team | Major revision: web-first SaaS platform, GitHub App integration, collaborative editor, embeddable widgets, team management, analytics, pricing/plans, PostgreSQL, Axios/TanStack Query/Zustand stack. CLI moved to Phase 2.                                                                                                                                                               |
| 2.1.0       | March 16, 2026 | Product Team | Added Section 6: Landing Pages and Marketing Site. Comprehensive spec for enterprise-grade marketing site using Tailwind CSS and shadcn/ui. Includes design system, visual identity, page-by-page specifications (home, features, pricing, changelog), component usage guide, performance/SEO/accessibility requirements, responsive breakpoints. Revised milestone timeline to 26 weeks. |
| 2.2.0       | March 16, 2026 | Product Team | Tech stack updates: Prisma (ORM), Polar (payments). Replaced Drizzle and Stripe references throughout.                                                                                                                                                                                                                                                                                    |
| 2.3.0       | March 31, 2026 | Product Team | Unified architecture: Next.js as single full-stack framework for both frontend and backend, replacing Vite (frontend) and NestJS (backend). API routes and server actions replace separate backend framework. Updated hosting to Vercel. All references, glossary, milestones, and architecture layers updated throughout.                                                                |

_End of Document_