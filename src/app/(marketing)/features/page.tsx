"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  GitCommit,
  FileDiff,
  Tag,
  Sparkles,
  PenLine,
  Code2,
  Users,
  BarChart3,
  ArrowRight,
  Check,
  Minus,
  Clock,
  Brain,
  Puzzle,
  LayoutGrid,
  TrendingUp,
  GripVertical,
  Eye,
  Shield,
  UserPlus,
  RefreshCcw,
  Activity,
  Globe,
  MousePointerClick,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

/* -------------------------------------------------------------------------- */
/*  Data                                                                      */
/* -------------------------------------------------------------------------- */

const sections = [
  {
    id: "git-commit-analysis",
    label: "Commit Analysis",
    icon: GitCommit,
    title: "Git Commit Analysis",
    description:
      "Automatically parse conventional commits, group related changes, and let AI categorize everything so you never write a changelog entry by hand again.",
    details: [
      {
        icon: GitCommit,
        title: "Conventional Commit Parsing",
        description:
          "Supports feat, fix, chore, refactor, perf, docs, and custom prefixes out of the box.",
      },
      {
        icon: Brain,
        title: "AI-Powered Grouping",
        description:
          "Machine learning clusters related commits across branches and PRs into coherent changelog entries.",
      },
      {
        icon: Tag,
        title: "Scope Detection",
        description:
          "Automatically detects scopes from commit messages and maps them to your project structure.",
      },
    ],
  },
  {
    id: "diff-based-detection",
    label: "Diff Detection",
    icon: FileDiff,
    title: "Diff-Based Detection",
    description:
      "Go beyond commit messages. Changeloger analyzes actual code changes using AST parsing to surface structural modifications that matter to your users.",
    details: [
      {
        icon: FileDiff,
        title: "AST Parsing",
        description:
          "Understands structural changes in TypeScript, JavaScript, Python, Go, and more at the syntax tree level.",
      },
      {
        icon: Code2,
        title: "Structural Change Analysis",
        description:
          "Detects API surface changes, new exports, modified interfaces, and breaking changes automatically.",
      },
      {
        icon: Shield,
        title: "Breaking Change Alerts",
        description:
          "Flags removals, type changes, and signature modifications that could impact downstream consumers.",
      },
    ],
  },
  {
    id: "semantic-version-triggers",
    label: "Version Triggers",
    icon: Tag,
    title: "Semantic Version Triggers",
    description:
      "Changeloger monitors your package manifests and git tags to automatically correlate releases with the right set of changes.",
    details: [
      {
        icon: Tag,
        title: "Manifest Monitoring",
        description:
          "Watches package.json, Cargo.toml, pyproject.toml, and other manifests for version bumps.",
      },
      {
        icon: GitCommit,
        title: "Tag Correlation",
        description:
          "Links git tags to the exact set of commits and diffs that constitute each release.",
      },
      {
        icon: RefreshCcw,
        title: "Auto-Trigger Pipelines",
        description:
          "Kicks off changelog generation the moment a new version is detected, keeping docs always current.",
      },
    ],
  },
  {
    id: "ai-summarization",
    label: "AI Summaries",
    icon: Sparkles,
    title: "AI Summarization",
    description:
      "Generate human-friendly release notes from raw commits and diffs. Choose from multiple AI providers with built-in caching and confidence scoring.",
    details: [
      {
        icon: Sparkles,
        title: "Multi-Provider Support",
        description:
          "Works with OpenAI, Anthropic, and local models. Switch providers per-project or per-run.",
      },
      {
        icon: Clock,
        title: "Smart Caching",
        description:
          "Caches summaries per commit range to avoid redundant API calls and reduce latency on repeat builds.",
      },
      {
        icon: Activity,
        title: "Confidence Scoring",
        description:
          "Each generated entry includes a confidence score so you know which items need human review.",
      },
    ],
  },
  {
    id: "changelog-editor",
    label: "Editor",
    icon: PenLine,
    title: "Changelog Editor",
    description:
      "A purpose-built editor for crafting release notes. Drag and drop entries, edit inline, and publish when you are ready.",
    details: [
      {
        icon: GripVertical,
        title: "Drag-and-Drop Ordering",
        description:
          "Reorder changelog entries with a simple drag to put the most important changes front and center.",
      },
      {
        icon: PenLine,
        title: "Inline Editing",
        description:
          "Click any entry to refine the wording. Markdown support, syntax highlighting, and live preview included.",
      },
      {
        icon: Eye,
        title: "Publish Flow",
        description:
          "Review, approve, and publish changelogs with a single click. Schedule future releases in advance.",
      },
    ],
  },
  {
    id: "embeddable-widgets",
    label: "Widgets",
    icon: Code2,
    title: "Embeddable Widgets",
    description:
      "Bring your changelog to your users. Embed a page, modal, or badge widget anywhere with a single script tag.",
    details: [
      {
        icon: LayoutGrid,
        title: "Page Widget",
        description:
          "A full-page changelog that lives at your custom URL. Themeable with your brand colors.",
      },
      {
        icon: Puzzle,
        title: "Modal Widget",
        description:
          "A popup changelog triggered by a button or link, perfect for in-app release announcements.",
      },
      {
        icon: MousePointerClick,
        title: "Badge Widget",
        description:
          "A small notification badge that shows unread changes and expands to reveal the latest release.",
      },
    ],
  },
  {
    id: "team-collaboration",
    label: "Collaboration",
    icon: Users,
    title: "Team Collaboration",
    description:
      "Built for teams from day one. Assign roles, invite members, and edit changelogs together in real time.",
    details: [
      {
        icon: Shield,
        title: "Role-Based Access",
        description:
          "Admin, Editor, and Viewer roles with granular per-repository permissions on the Team plan.",
      },
      {
        icon: UserPlus,
        title: "Team Invitations",
        description:
          "Invite teammates by email. Pending invitations are tracked and can be revoked at any time.",
      },
      {
        icon: Users,
        title: "Real-Time Editing",
        description:
          "Multiple team members can edit the same changelog simultaneously with live cursor presence.",
      },
    ],
  },
  {
    id: "analytics-dashboard",
    label: "Analytics",
    icon: BarChart3,
    title: "Analytics Dashboard",
    description:
      "Understand how your changelogs perform. Track views, engagement, and traffic sources to learn what your users care about.",
    details: [
      {
        icon: TrendingUp,
        title: "Views & Engagement",
        description:
          "See total views, unique visitors, and average time spent on each changelog entry.",
      },
      {
        icon: Globe,
        title: "Traffic Sources",
        description:
          "Know where your readers come from: direct links, search engines, in-app widgets, or API consumers.",
      },
      {
        icon: BarChart3,
        title: "Export & Reporting",
        description:
          "Export analytics data as CSV for custom dashboards. Available on the Team plan.",
      },
    ],
  },
]

const comparisonRows = [
  {
    feature: "Setup time",
    manual: "Hours per release",
    existing: "30-60 minutes",
    changeloger: "Under 5 minutes",
  },
  {
    feature: "AI quality",
    manual: false,
    existing: "Basic templates",
    changeloger: "Multi-provider, confidence-scored",
  },
  {
    feature: "Collaboration",
    manual: "Git conflicts",
    existing: "Limited",
    changeloger: "Real-time, role-based",
  },
  {
    feature: "Widgets",
    manual: false,
    existing: "Static embed",
    changeloger: "Page, modal, badge + auto-update",
  },
  {
    feature: "Analytics",
    manual: false,
    existing: false,
    changeloger: "Views, engagement, traffic sources",
  },
]

const ctaBanners = [
  {
    heading: "Stop writing changelogs manually",
    description:
      "Let AI analyze your commits and diffs, then generate polished release notes in seconds.",
    cta: "Start Free Trial",
    href: "/signup?plan=pro",
  },
  {
    heading: "Ship release notes your users will actually read",
    description:
      "Embed beautiful changelog widgets directly in your app. No iframes, no maintenance.",
    cta: "See the Widgets",
    href: "#embeddable-widgets",
  },
  {
    heading: "Built for teams that ship fast",
    description:
      "Real-time collaboration, role-based access, and analytics that show what matters.",
    cta: "Explore the Team Plan",
    href: "/pricing",
  },
]

/* -------------------------------------------------------------------------- */
/*  Sticky nav with IntersectionObserver                                      */
/* -------------------------------------------------------------------------- */

function useActiveSectionObserver(sectionIds: string[]) {
  const [activeId, setActiveId] = useState(sectionIds[0])

  useEffect(() => {
    const observers: IntersectionObserver[] = []

    sectionIds.forEach((id) => {
      const el = document.getElementById(id)
      if (!el) return

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveId(id)
          }
        },
        { rootMargin: "-20% 0px -70% 0px", threshold: 0 }
      )
      observer.observe(el)
      observers.push(observer)
    })

    return () => observers.forEach((o) => o.disconnect())
  }, [sectionIds])

  return activeId
}

/* -------------------------------------------------------------------------- */
/*  Comparison cell                                                           */
/* -------------------------------------------------------------------------- */

function ComparisonCell({
  value,
  highlighted,
}: {
  value: boolean | string
  highlighted?: boolean
}) {
  if (typeof value === "string") {
    return (
      <span className={`text-sm ${highlighted ? "font-medium text-primary" : ""}`}>
        {value}
      </span>
    )
  }
  return value ? (
    <Check className="size-4 text-primary" />
  ) : (
    <Minus className="size-4 text-muted-foreground/40" />
  )
}

/* -------------------------------------------------------------------------- */
/*  Mock Screenshot Placeholder                                               */
/* -------------------------------------------------------------------------- */

function MockScreenshot({ label }: { label: string }) {
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-muted/60 via-muted/30 to-muted/60">
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
        {/* Fake browser chrome */}
        <div className="flex w-3/4 max-w-xs items-center gap-1.5 rounded-t-lg border border-border/30 bg-muted/60 px-3 py-2">
          <span className="size-2 rounded-full bg-red-400/60" />
          <span className="size-2 rounded-full bg-yellow-400/60" />
          <span className="size-2 rounded-full bg-green-400/60" />
          <span className="ml-2 h-3 flex-1 rounded bg-muted" />
        </div>
        {/* Content lines */}
        <div className="flex w-3/4 max-w-xs flex-col gap-2 rounded-b-lg border border-t-0 border-border/30 bg-muted/40 p-4">
          <div className="h-2 w-2/3 rounded bg-primary/20" />
          <div className="h-2 w-full rounded bg-border/40" />
          <div className="h-2 w-5/6 rounded bg-border/40" />
          <div className="h-2 w-3/4 rounded bg-border/40" />
          <div className="mt-2 h-6 w-1/3 rounded bg-primary/15" />
        </div>
      </div>
      <p className="absolute bottom-3 left-1/2 -translate-x-1/2 text-xs text-muted-foreground/60">
        {label}
      </p>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

export default function FeaturesPage() {
  const sectionIds = sections.map((s) => s.id)
  const activeId = useActiveSectionObserver(sectionIds)
  const navRef = useRef<HTMLDivElement>(null)

  const scrollToSection = useCallback((id: string) => {
    const el = document.getElementById(id)
    if (!el) return
    const offset = 120
    const y = el.getBoundingClientRect().top + window.scrollY - offset
    window.scrollTo({ top: y, behavior: "smooth" })
  }, [])

  // Keep active nav item visible by scrolling the nav container
  useEffect(() => {
    if (!navRef.current) return
    const activeBtn = navRef.current.querySelector(
      `[data-section="${activeId}"]`
    )
    if (activeBtn) {
      activeBtn.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" })
    }
  }, [activeId])

  return (
    <div className="relative overflow-hidden">
      {/* Background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute top-0 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />
      </div>

      {/* ------------------------------------------------------------------ */}
      {/*  Hero                                                              */}
      {/* ------------------------------------------------------------------ */}
      <section className="mx-auto max-w-7xl px-6 pt-24 pb-12 text-center sm:px-8 sm:pt-32 sm:pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Badge variant="secondary" className="mb-4">
            <Sparkles className="mr-1 size-3" />
            Powerful Features
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Everything you need for
            <br />
            beautiful changelogs
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            From commit to published release notes, Changeloger automates
            the entire workflow with AI, real-time collaboration, and
            embeddable widgets.
          </p>
        </motion.div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*  Sticky Feature Navigation (FR-LP-020)                             */}
      {/* ------------------------------------------------------------------ */}
      <div className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-lg">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <nav
            ref={navRef}
            className="scrollbar-none flex gap-1 overflow-x-auto py-2"
          >
            {sections.map((s) => {
              const Icon = s.icon
              const isActive = activeId === s.id
              return (
                <button
                  key={s.id}
                  data-section={s.id}
                  onClick={() => scrollToSection(s.id)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="size-3.5" />
                  <span className="hidden sm:inline">{s.label}</span>
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/*  Feature Sections (FR-LP-021)                                      */}
      {/* ------------------------------------------------------------------ */}
      {sections.map((section, i) => (
        <div key={section.id}>
          <section
            id={section.id}
            className="mx-auto max-w-7xl px-6 py-24 sm:px-8 sm:py-32"
          >
            <div
              className={`flex flex-col gap-12 lg:flex-row lg:items-center lg:gap-16 ${
                i % 2 === 1 ? "lg:flex-row-reverse" : ""
              }`}
            >
              {/* Text + detail cards */}
              <motion.div
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5 }}
                className="flex-1"
              >
                <div className="mb-4 inline-flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
                    <section.icon className="size-4 text-primary" />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                    Feature {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  {section.title}
                </h2>
                <p className="mt-3 max-w-xl text-muted-foreground">
                  {section.description}
                </p>

                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                  {section.details.map((d) => (
                    <Card key={d.title} size="sm">
                      <CardContent className="flex flex-col gap-2 pt-3">
                        <d.icon className="size-4 text-primary" />
                        <p className="text-sm font-medium">{d.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {d.description}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </motion.div>

              {/* Mock screenshot */}
              <motion.div
                initial={{ opacity: 0, x: i % 2 === 0 ? 30 : -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="flex-1"
              >
                <MockScreenshot label={section.title} />
              </motion.div>
            </div>
          </section>

          {/* Inter-section CTA (FR-LP-023) — after every 3rd section */}
          {(i + 1) % 3 === 0 && ctaBanners[Math.floor(i / 3)] && (
            <section className="mx-auto max-w-7xl px-6 sm:px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="rounded-xl border border-primary/20 bg-primary/5 px-8 py-10 text-center"
              >
                <h3 className="text-xl font-bold sm:text-2xl">
                  {ctaBanners[Math.floor(i / 3)].heading}
                </h3>
                <p className="mx-auto mt-2 max-w-lg text-muted-foreground">
                  {ctaBanners[Math.floor(i / 3)].description}
                </p>
                <div className="mt-6">
                  <Button size="lg" asChild>
                    <Link href={ctaBanners[Math.floor(i / 3)].href}>
                      {ctaBanners[Math.floor(i / 3)].cta}
                      <ArrowRight className="ml-1 size-4" />
                    </Link>
                  </Button>
                </div>
              </motion.div>
            </section>
          )}
        </div>
      ))}

      {/* ------------------------------------------------------------------ */}
      {/*  Comparison Section (FR-LP-022)                                    */}
      {/* ------------------------------------------------------------------ */}
      <section className="mx-auto max-w-7xl px-6 py-24 sm:px-8 sm:py-32">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            How Changeloger compares
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            See why teams switch from manual processes and legacy tools to
            Changeloger.
          </p>
        </div>

        <div className="mt-12 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px] text-sm" />
                <TableHead className="text-center text-sm text-muted-foreground">
                  Manual
                </TableHead>
                <TableHead className="text-center text-sm text-muted-foreground">
                  Existing Tools
                </TableHead>
                <TableHead className="text-center text-sm">
                  <span className="font-semibold text-primary">
                    Changeloger
                  </span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {comparisonRows.map((row) => (
                <TableRow key={row.feature}>
                  <TableCell className="text-sm font-medium">
                    {row.feature}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center">
                      <ComparisonCell value={row.manual} />
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center">
                      <ComparisonCell value={row.existing} />
                    </div>
                  </TableCell>
                  <TableCell className="text-center bg-primary/5">
                    <div className="flex justify-center">
                      <ComparisonCell
                        value={row.changeloger}
                        highlighted
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*  Bottom CTA                                                        */}
      {/* ------------------------------------------------------------------ */}
      <section className="mx-auto max-w-7xl px-6 py-24 sm:px-8 sm:py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to see it in action?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Connect your first repository in under 5 minutes. No credit
            card required.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/signup">
                Get Started Free
                <ArrowRight className="ml-1 size-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/pricing">View Pricing</Link>
            </Button>
          </div>
        </motion.div>
      </section>
    </div>
  )
}
