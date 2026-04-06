"use client"

import { useState } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import {
  Search,
  Rocket,
  GitBranch,
  Cpu,
  PenLine,
  Code2,
  BookOpen,
  Users,
  CreditCard,
  ArrowRight,
} from "lucide-react"

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

interface DocCategory {
  title: string
  description: string
  icon: React.ElementType
  href: string
  links: { label: string; href: string }[]
}

const categories: DocCategory[] = [
  {
    title: "Getting Started",
    description:
      "Create your account, connect your first repository, and publish a changelog in under five minutes.",
    icon: Rocket,
    href: "/docs/getting-started",
    links: [
      { label: "Quick Start Guide", href: "/docs/getting-started#quick-start-guide" },
      { label: "Core Concepts", href: "/docs/getting-started#core-concepts" },
      { label: "Your First Changelog", href: "/docs/getting-started#your-first-changelog" },
    ],
  },
  {
    title: "GitHub App Setup",
    description:
      "Install the Changeloger GitHub App, configure repository permissions, and manage webhook events.",
    icon: GitBranch,
    href: "/docs/github-app",
    links: [
      { label: "Installation", href: "/docs/github-app#installation" },
      { label: "Permissions Explained", href: "/docs/github-app#permissions-explained" },
      { label: "Webhook Events", href: "/docs/github-app#webhook-events" },
    ],
  },
  {
    title: "Detection Engines",
    description:
      "Understand how Changeloger detects and classifies changes from commits, PRs, and release tags.",
    icon: Cpu,
    href: "/docs/detection-engines",
    links: [
      { label: "Conventional Commits", href: "/docs/detection-engines#conventional-commits" },
      { label: "AI Classification", href: "/docs/detection-engines#ai-classification" },
      { label: "Custom Rules", href: "/docs/detection-engines#custom-rules" },
    ],
  },
  {
    title: "Changelog Editor",
    description:
      "Use the visual editor to curate, rewrite, and organise changelog entries before publishing.",
    icon: PenLine,
    href: "/docs/changelog-editor",
    links: [
      { label: "Editor Overview", href: "/docs/changelog-editor#editor-overview" },
      { label: "Drag & Drop", href: "/docs/changelog-editor#drag-and-drop" },
      { label: "Markdown Shortcuts", href: "/docs/changelog-editor#markdown-shortcuts" },
    ],
  },
  {
    title: "Embeddable Widgets",
    description:
      "Add a live changelog widget to your site with a single script tag. Fully themeable.",
    icon: Code2,
    href: "/docs/embeddable-widgets",
    links: [
      { label: "Quick Embed", href: "/docs/embeddable-widgets#quick-embed" },
      { label: "Theming", href: "/docs/embeddable-widgets#theming" },
      { label: "Framework Guides", href: "/docs/embeddable-widgets#framework-guides" },
    ],
  },
  {
    title: "API Reference",
    description:
      "Programmatic access to changelogs, releases, and workspace settings via our REST API.",
    icon: BookOpen,
    href: "/docs/api-reference",
    links: [
      { label: "Authentication", href: "/docs/api-reference#authentication" },
      { label: "Endpoints", href: "/docs/api-reference#endpoints" },
      { label: "Rate Limits", href: "/docs/api-reference#rate-limits" },
    ],
  },
  {
    title: "Team Management",
    description:
      "Invite collaborators, assign roles, and manage workspace-level permissions.",
    icon: Users,
    href: "/docs/team-management",
    links: [
      { label: "Inviting Members", href: "/docs/team-management#inviting-members" },
      { label: "Roles & Permissions", href: "/docs/team-management#roles-and-permissions" },
      { label: "SSO Configuration", href: "/docs/team-management#sso-configuration" },
    ],
  },
  {
    title: "Billing & Plans",
    description:
      "Manage your subscription, view invoices, and understand what each plan includes.",
    icon: CreditCard,
    href: "/docs/billing",
    links: [
      { label: "Plan Comparison", href: "/docs/billing#plan-comparison" },
      { label: "Upgrading", href: "/docs/billing#upgrading" },
      { label: "Invoices & Receipts", href: "/docs/billing#invoices-and-receipts" },
    ],
  },
]

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function DocsPage() {
  const [query, setQuery] = useState("")

  const filtered = query
    ? categories.filter(
        (c) =>
          c.title.toLowerCase().includes(query.toLowerCase()) ||
          c.description.toLowerCase().includes(query.toLowerCase())
      )
    : categories

  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="outline" className="mb-4">
            Documentation
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            How can we help?
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Everything you need to set up, configure, and get the most out of
            Changeloger.
          </p>

          {/* Search */}
          <div className="relative mt-8">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search documentation..."
              className="pl-10"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Grid */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((cat) => {
            const Icon = cat.icon
            return (
              <Card
                key={cat.title}
                className="group flex flex-col transition-colors hover:border-violet-500/50"
              >
                <CardHeader>
                  <div className="mb-3 flex h-10 w-10 items-center justify-center bg-violet-500/10">
                    <Icon className="h-5 w-5 text-violet-400" />
                  </div>
                  <CardTitle className="text-lg">{cat.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {cat.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="mt-auto space-y-1.5">
                  {cat.links.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-violet-400 transition-colors"
                    >
                      <ArrowRight className="h-3 w-3" />
                      {link.label}
                    </Link>
                  ))}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {filtered.length === 0 && (
          <p className="mt-12 text-center text-muted-foreground">
            No results found. Try a different search term.
          </p>
        )}
      </div>
    </section>
  )
}
