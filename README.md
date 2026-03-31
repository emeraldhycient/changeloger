<p align="center">
  <img src="public/logo-placeholder.svg" alt="Changeloger" width="80" height="80" />
</p>

<h1 align="center">Changeloger</h1>

<p align="center">
  Automated changelog generation platform for software teams.
</p>

<p align="center">
  <a href="#"><img alt="Build Status" src="https://img.shields.io/github/actions/workflow/status/your-org/changeloger/ci.yml?branch=main&style=flat-square" /></a>
  <a href="LICENSE"><img alt="License: MIT" src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" /></a>
  <a href="package.json"><img alt="Version" src="https://img.shields.io/badge/version-0.0.1-green?style=flat-square" /></a>
</p>

---

Changeloger connects to your GitHub repositories, analyzes commits, diffs, and version bumps through a three-engine detection pipeline, then uses AI to produce polished, categorized changelog entries. Teams review and edit drafts in a collaborative editor before publishing to an embeddable widget that end-users can consume directly inside your product.

## Feature Highlights

- **Three-engine detection pipeline** -- Conventional commit parsing, diff-based structural analysis, and semantic versioning monitoring work together to capture every meaningful change.
- **AI-powered summarization** -- OpenAI (with a pluggable provider interface for Anthropic, Ollama, and others) transforms raw commit data into clear, user-facing changelog entries.
- **Collaborative drag-and-drop editor** -- A rich editing experience built with dnd-kit lets teams reorder, categorize, and refine entries before publishing.
- **Embeddable changelog widget** -- A lightweight JavaScript widget (page, modal, or badge variant) that can be dropped into any website with a single script tag.
- **Workspace-based multi-tenancy** -- Teams organize around workspaces with role-based access control (owner, admin, editor, viewer) and email-based invitations.
- **Built-in analytics** -- Track page views, entry clicks, scroll depth, and visitor sessions with privacy-respecting, anonymized fingerprinting and daily aggregation.
- **Billing with Polar** -- Subscription management with free, pro, team, and enterprise tiers including AI generation quotas and trial support.
- **Full release lifecycle** -- Draft, publish, and archive releases with revision history, commit range tracking, and Markdown/HTML/JSON export.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript 5.9 |
| UI | React 19, Radix UI, shadcn/ui, Tailwind CSS 4 |
| State | Zustand, TanStack React Query |
| Animation | Framer Motion |
| Drag & Drop | dnd-kit |
| Database | PostgreSQL 16 via Prisma ORM 7 |
| Queue | BullMQ with Redis (ioredis) |
| Auth | OAuth 2.0 (Google, GitHub), JWT sessions |
| AI | OpenAI SDK (pluggable provider interface) |
| GitHub | Octokit (GitHub App with webhook ingestion) |
| Email | Resend |
| Billing | Polar |
| Charts | Recharts |
| Validation | Zod 4 |
| Package Manager | pnpm |

## Prerequisites

| Requirement | Minimum Version |
|---|---|
| Node.js | 20+ |
| PostgreSQL | 16+ |
| Redis | 7+ |
| pnpm | 9+ |

You will also need:

- A GitHub App (for repository integration and webhook delivery)
- An OpenAI API key (for AI-powered changelog generation)
- OAuth credentials for Google and/or GitHub (for user authentication)

## Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/your-org/changeloger.git
cd changeloger
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and fill in the required values. See the [Environment Variables](#environment-variables) section below for a full reference.

### 4. Set up the database

```bash
# Generate the Prisma client
pnpm prisma generate

# Run migrations
pnpm prisma migrate dev

# (Optional) Seed with sample data
pnpm prisma db seed
```

### 5. Start the development server

```bash
pnpm dev
```

The application will be available at `http://localhost:3000`.

## Project Structure

```
changeloger/
├── prisma/
│   └── schema.prisma            # Database schema (models, enums, relations)
├── public/                      # Static assets and widget bundle output
├── src/
│   ├── app/
│   │   ├── (dashboard)/         # Authenticated dashboard pages
│   │   │   └── dashboard/
│   │   │       ├── analytics/   # Analytics dashboard
│   │   │       ├── changelogs/  # Changelog listing
│   │   │       ├── editor/      # Drag-and-drop changelog editor
│   │   │       ├── repositories/# Repository management
│   │   │       ├── settings/    # Workspace and billing settings
│   │   │       ├── team/        # Team member management
│   │   │       └── widgets/     # Widget configuration
│   │   ├── (marketing)/         # Public marketing pages
│   │   │   ├── pricing/         # Pricing page
│   │   │   ├── features/        # Feature showcase
│   │   │   ├── blog/            # Blog
│   │   │   ├── sign-in/         # Authentication
│   │   │   ├── sign-up/         # Registration
│   │   │   └── ...              # About, contact, docs, legal pages
│   │   └── api/
│   │       ├── auth/            # OAuth flows, session management
│   │       ├── billing/         # Checkout and customer portal
│   │       ├── github/          # GitHub App installation callback
│   │       ├── repositories/    # Repository CRUD and release management
│   │       ├── webhooks/        # GitHub and Polar webhook receivers
│   │       ├── widgets/         # Widget data and analytics endpoints
│   │       └── workspaces/      # Workspace, member, and invitation APIs
│   ├── components/
│   │   ├── dashboard/           # Dashboard-specific components
│   │   │   ├── analytics/       # Chart and metric components
│   │   │   └── billing/         # Plan and usage components
│   │   ├── editor/              # Changelog editor components
│   │   ├── marketing/           # Landing page components
│   │   ├── shared/              # Cross-cutting components
│   │   └── ui/                  # shadcn/ui primitives
│   ├── config/                  # Application configuration
│   ├── hooks/                   # Custom React hooks
│   ├── lib/
│   │   ├── ai/                  # AI provider interface and implementations
│   │   ├── analytics/           # Event ingestion and aggregation
│   │   ├── api/                 # API client utilities
│   │   ├── auth/                # Authentication and RBAC helpers
│   │   ├── billing/             # Polar integration and plan enforcement
│   │   ├── db/                  # Prisma client and typed query functions
│   │   │   └── queries/         # Per-entity query modules
│   │   ├── email/               # Resend client and email templates
│   │   ├── engines/             # Detection engines (commit, diff, version)
│   │   ├── github/              # Octokit wrapper and installation management
│   │   ├── jobs/                # BullMQ queue definitions and workers
│   │   ├── middleware/          # Plan enforcement middleware
│   │   ├── releases/            # Publish, render, and snapshot logic
│   │   ├── utils/               # General-purpose utilities
│   │   └── widgets/             # Widget token and domain validation
│   ├── stores/                  # Zustand state stores
│   └── types/                   # Shared TypeScript type definitions
├── docs/                        # Project documentation
├── .env.example                 # Environment variable template
├── package.json                 # Dependencies and scripts
├── prisma.config.ts             # Prisma configuration
├── tsconfig.json                # TypeScript configuration
└── next.config.mjs              # Next.js configuration
```

## Available Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start the development server with Turbopack |
| `pnpm build` | Create a production build |
| `pnpm start` | Start the production server |
| `pnpm lint` | Run ESLint across the codebase |
| `pnpm typecheck` | Run the TypeScript compiler in check-only mode |
| `pnpm format` | Format all TypeScript files with Prettier |

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `REDIS_URL` | Yes | Redis connection string for BullMQ |
| `GOOGLE_CLIENT_ID` | Yes | Google OAuth 2.0 client ID |
| `GOOGLE_CLIENT_SECRET` | Yes | Google OAuth 2.0 client secret |
| `GOOGLE_CALLBACK_URL` | Yes | Google OAuth callback URL |
| `GITHUB_CLIENT_ID` | Yes | GitHub OAuth client ID (for user login) |
| `GITHUB_CLIENT_SECRET` | Yes | GitHub OAuth client secret |
| `GITHUB_CALLBACK_URL` | Yes | GitHub OAuth callback URL |
| `GITHUB_APP_ID` | Yes | GitHub App ID (for repository integration) |
| `GITHUB_APP_PRIVATE_KEY` | Yes | GitHub App private key (PEM format) |
| `GITHUB_APP_WEBHOOK_SECRET` | Yes | Secret for verifying GitHub webhook signatures |
| `OPENAI_API_KEY` | Yes | OpenAI API key for AI-powered generation |
| `AI_PROVIDER` | No | AI provider selection (default: `openai`) |
| `AI_MODEL` | No | AI model to use (default: `gpt-4o-mini`) |
| `POLAR_ACCESS_TOKEN` | No | Polar access token for billing integration |
| `POLAR_WEBHOOK_SECRET` | No | Secret for verifying Polar webhook signatures |
| `POLAR_ORGANIZATION_ID` | No | Polar organization identifier |
| `NEXT_PUBLIC_APP_URL` | Yes | Public-facing application URL |
| `JWT_SECRET` | Yes | Secret key for signing JWT tokens |
| `JWT_EXPIRY` | No | JWT token expiration (default: `15m`) |
| `REFRESH_TOKEN_EXPIRY` | No | Refresh token expiration (default: `7d`) |
| `WIDGET_CDN_URL` | No | Base URL for the widget JavaScript bundle |

## Architecture Overview

Changeloger is a full-stack Next.js 16 application that uses the App Router for both server-rendered pages and API routes. The architecture is organized into two main route groups: a public marketing site and an authenticated dashboard. The API layer exposes RESTful endpoints for all operations and receives webhook events from GitHub and Polar.

The core processing pipeline is event-driven. When GitHub delivers a webhook (push, tag creation, or release), the API route verifies the HMAC signature and enqueues a background job via BullMQ backed by Redis. The job worker runs incoming changes through three detection engines in sequence: the commit analyzer parses conventional commit messages and groups related commits by scope and file overlap; the diff detector fetches file-level diffs from the GitHub Compare API and identifies structural code changes; and the version watcher monitors manifest files for version bumps and correlates them with Git tags. Results from all three engines are merged, deduplicated, and passed to the AI provider for summarization into human-readable changelog entries.

The generated entries land in a draft release that team members can review and edit in the browser. The editor supports drag-and-drop reordering, inline editing of titles and descriptions, category and impact classification, and revision snapshots for audit history. Once published, the release is served through an embeddable widget (available as a full page, modal overlay, or notification badge) that can be dropped into any website. The widget reports anonymized analytics events back to the platform, which are aggregated into daily summaries for the analytics dashboard.

## Contributing

Contributions are welcome. Please see [docs/contributing.md](docs/contributing.md) for development setup instructions, code conventions, branching strategy, and the pull request process.

## License

This project is licensed under the [MIT License](LICENSE).
