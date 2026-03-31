import type { Metadata } from "next"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tag, Plus, Bug, RefreshCw, Sparkles } from "lucide-react"

export const metadata: Metadata = {
  title: "Changelog - Changeloger",
  description:
    "See what's new in Changeloger. We ship improvements every week to help you generate better changelogs.",
}

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

interface ChangelogEntry {
  type: "added" | "fixed" | "changed"
  text: string
}

interface Release {
  version: string
  date: string
  badge: string
  badgeVariant: "default" | "secondary" | "outline"
  summary: string
  entries: ChangelogEntry[]
}

const releases: Release[] = [
  {
    version: "v1.0.0",
    date: "March 28, 2026",
    badge: "Latest",
    badgeVariant: "default",
    summary:
      "Our first stable release. Everything you need to detect, curate, and publish changelogs from your GitHub repos.",
    entries: [
      { type: "added", text: "Embeddable changelog widget with customisable themes" },
      { type: "added", text: "Team workspace support with role-based access" },
      { type: "added", text: "REST API for programmatic changelog access" },
      { type: "added", text: "Custom domain support for public changelog pages" },
      { type: "fixed", text: "Improved commit message parsing for monorepos" },
      { type: "changed", text: "Upgraded detection engine to support Conventional Commits v2" },
    ],
  },
  {
    version: "v0.9.0",
    date: "March 14, 2026",
    badge: "Beta",
    badgeVariant: "secondary",
    summary:
      "Public beta with the core detection engine and changelog editor.",
    entries: [
      { type: "added", text: "AI-powered changelog generation from commit history" },
      { type: "added", text: "Visual changelog editor with drag-and-drop reordering" },
      { type: "added", text: "GitHub App integration for automatic repo connection" },
      { type: "fixed", text: "Fixed date parsing for squash-merge commits" },
      { type: "fixed", text: "Resolved OAuth token refresh issue with GitHub App" },
      { type: "changed", text: "Redesigned onboarding flow for faster setup" },
    ],
  },
  {
    version: "v0.8.0",
    date: "February 28, 2026",
    badge: "Alpha",
    badgeVariant: "outline",
    summary: "Internal alpha with foundational detection and draft editing capabilities.",
    entries: [
      { type: "added", text: "Initial commit-based changelog detection engine" },
      { type: "added", text: "Draft changelog editor with Markdown support" },
      { type: "added", text: "GitHub OAuth sign-in" },
      { type: "fixed", text: "Corrected timezone handling in release date display" },
    ],
  },
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const typeConfig = {
  added: { label: "Added", icon: Plus, className: "text-emerald-400" },
  fixed: { label: "Fixed", icon: Bug, className: "text-amber-400" },
  changed: { label: "Changed", icon: RefreshCw, className: "text-sky-400" },
} as const

function EntryIcon({ type }: { type: ChangelogEntry["type"] }) {
  const cfg = typeConfig[type]
  const Icon = cfg.icon
  return <Icon className={`h-4 w-4 shrink-0 ${cfg.className}`} />
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ChangelogPage() {
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-6 sm:px-8">
        {/* Header */}
        <div className="text-center">
          <Badge variant="outline" className="mb-4">
            <Tag className="mr-1.5 h-3 w-3" />
            Changelog
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            What&apos;s new in Changeloger
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            We ship improvements every week. Here&apos;s what&apos;s been
            happening.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative mt-16">
          {/* Vertical line */}
          <div className="absolute left-[7px] top-2 bottom-0 w-px bg-border" />

          <div className="space-y-16">
            {releases.map((release) => (
              <article key={release.version} className="relative pl-10">
                {/* Dot */}
                <div className="absolute left-0 top-1.5 h-[15px] w-[15px] rounded-full border-2 border-violet-500 bg-background" />

                {/* Version header */}
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-2xl font-semibold tracking-tight">
                    {release.version}
                  </h2>
                  <Badge variant={release.badgeVariant}>{release.badge}</Badge>
                  <span className="text-sm text-muted-foreground">
                    {release.date}
                  </span>
                </div>

                <p className="mt-2 text-muted-foreground">{release.summary}</p>

                {/* Entries grouped by type */}
                <ul className="mt-4 space-y-2">
                  {release.entries.map((entry, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <EntryIcon type={entry.type} />
                      <span>
                        <span className="font-medium text-foreground">
                          {typeConfig[entry.type].label}:
                        </span>{" "}
                        <span className="text-muted-foreground">
                          {entry.text}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>

                {release.version !== releases[releases.length - 1].version && (
                  <Separator className="mt-10" />
                )}
              </article>
            ))}
          </div>
        </div>

        {/* Powered by */}
        <div className="mt-20 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4 text-violet-400" />
          <span>Powered by Changeloger</span>
        </div>
      </div>
    </section>
  )
}
