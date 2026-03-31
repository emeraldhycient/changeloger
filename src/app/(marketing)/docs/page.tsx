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
    href: "#",
    links: [
      { label: "Quick Start Guide", href: "#" },
      { label: "Core Concepts", href: "#" },
      { label: "Your First Changelog", href: "#" },
    ],
  },
  {
    title: "GitHub App Setup",
    description:
      "Install the Changeloger GitHub App, configure repository permissions, and manage webhook events.",
    icon: GitBranch,
    href: "#",
    links: [
      { label: "Installation", href: "#" },
      { label: "Permissions Explained", href: "#" },
      { label: "Webhook Events", href: "#" },
    ],
  },
  {
    title: "Detection Engines",
    description:
      "Understand how Changeloger detects and classifies changes from commits, PRs, and release tags.",
    icon: Cpu,
    href: "#",
    links: [
      { label: "Conventional Commits", href: "#" },
      { label: "AI Classification", href: "#" },
      { label: "Custom Rules", href: "#" },
    ],
  },
  {
    title: "Changelog Editor",
    description:
      "Use the visual editor to curate, rewrite, and organise changelog entries before publishing.",
    icon: PenLine,
    href: "#",
    links: [
      { label: "Editor Overview", href: "#" },
      { label: "Drag & Drop", href: "#" },
      { label: "Markdown Shortcuts", href: "#" },
    ],
  },
  {
    title: "Embeddable Widgets",
    description:
      "Add a live changelog widget to your site with a single script tag. Fully themeable.",
    icon: Code2,
    href: "#",
    links: [
      { label: "Quick Embed", href: "#" },
      { label: "Theming", href: "#" },
      { label: "Framework Guides", href: "#" },
    ],
  },
  {
    title: "API Reference",
    description:
      "Programmatic access to changelogs, releases, and workspace settings via our REST API.",
    icon: BookOpen,
    href: "#",
    links: [
      { label: "Authentication", href: "#" },
      { label: "Endpoints", href: "#" },
      { label: "Rate Limits", href: "#" },
    ],
  },
  {
    title: "Team Management",
    description:
      "Invite collaborators, assign roles, and manage workspace-level permissions.",
    icon: Users,
    href: "#",
    links: [
      { label: "Inviting Members", href: "#" },
      { label: "Roles & Permissions", href: "#" },
      { label: "SSO Configuration", href: "#" },
    ],
  },
  {
    title: "Billing & Plans",
    description:
      "Manage your subscription, view invoices, and understand what each plan includes.",
    icon: CreditCard,
    href: "#",
    links: [
      { label: "Plan Comparison", href: "#" },
      { label: "Upgrading", href: "#" },
      { label: "Invoices & Receipts", href: "#" },
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
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10">
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
