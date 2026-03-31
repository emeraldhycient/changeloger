"use client"

import Link from "next/link"
import { motion, useReducedMotion, type Variants, type Easing } from "framer-motion"
import {
  ArrowRight,
  Check,
  Code,
  GitCommit,
  Tag,
  Sparkles,
  Users,
  PanelTop,
  BarChart3,
  Copy,
  Zap,
  Shield,
  Globe,
  Star,
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"

// ---------------------------------------------------------------------------
// Animation helpers
// ---------------------------------------------------------------------------

const EASE_OUT: Easing = [0.16, 1, 0.3, 1]

function useFadeUp(delay = 0) {
  const prefersReduced = useReducedMotion()
  return {
    initial: prefersReduced ? {} : { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-60px" },
    transition: { duration: 0.5, delay, ease: EASE_OUT },
  }
}

const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const fadeUpItem: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT } },
}

// ---------------------------------------------------------------------------
// Section 1 -- Hero
// ---------------------------------------------------------------------------

function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-12 pb-24 sm:pt-16 sm:pb-32">
      {/* Background glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute top-[-20%] left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-[#6C63FF]/10 blur-[120px]" />
      </div>

      <div className="container-width text-center">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="flex flex-col items-center gap-6"
        >
          {/* Announcement badge */}
          <motion.div variants={fadeUpItem}>
            <Badge
              variant="secondary"
              className="rounded-full px-4 py-1.5 text-sm font-medium"
            >
              <Sparkles className="mr-1.5 size-3.5" />
              New: AI-powered changelog generation
              <ArrowRight className="ml-1.5 size-3.5" />
            </Badge>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeUpItem}
            className="max-w-4xl text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl"
          >
            Your code changes,{" "}
            <span className="gradient-text">automatically documented</span>
          </motion.h1>

          {/* Sub-headline */}
          <motion.p
            variants={fadeUpItem}
            className="mx-auto max-w-2xl text-xl text-muted-foreground"
          >
            Changeloger connects to your repository, analyzes every commit and
            diff, and produces polished, categorized changelogs your users will
            actually read.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            variants={fadeUpItem}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            <Button
              asChild
              size="lg"
              className="gradient-primary rounded-lg px-6 text-sm font-semibold text-white"
            >
              <Link href="/signup">Get Started Free</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-lg px-6 text-sm">
              <Link href="/demo">View Demo</Link>
            </Button>
          </motion.div>

          {/* Browser chrome mockup */}
          <motion.div
            variants={fadeUpItem}
            className="mx-auto mt-8 w-full max-w-4xl"
          >
            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-2xl shadow-[#6C63FF]/5">
              {/* Browser chrome bar */}
              <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-4 py-3">
                <span className="size-3 rounded-full bg-red-400/80" />
                <span className="size-3 rounded-full bg-yellow-400/80" />
                <span className="size-3 rounded-full bg-green-400/80" />
                <span className="ml-4 flex-1 rounded-md bg-background/60 px-3 py-1 text-xs text-muted-foreground">
                  app.changeloger.dev/workspace/acme/changelog
                </span>
              </div>

              {/* Mock changelog content */}
              <div className="space-y-4 p-6 sm:p-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">
                    v2.4.0 &mdash; March 2026
                  </h3>
                  <Badge variant="secondary" className="rounded-full text-xs">
                    98% confidence
                  </Badge>
                </div>
                <Separator />
                <ul className="space-y-3 text-sm">
                  {[
                    {
                      cat: "Added",
                      color: "bg-emerald-500/15 text-emerald-400",
                      title: "OAuth 2.0 social login with GitHub and Google",
                    },
                    {
                      cat: "Fixed",
                      color: "bg-blue-500/15 text-blue-400",
                      title:
                        "API rate-limiting now respects per-org quotas correctly",
                    },
                    {
                      cat: "Changed",
                      color: "bg-amber-500/15 text-amber-400",
                      title:
                        "Dashboard layout updated to two-column responsive grid",
                    },
                    {
                      cat: "Added",
                      color: "bg-emerald-500/15 text-emerald-400",
                      title: "Webhook notifications for changelog publish events",
                    },
                  ].map((entry) => (
                    <li key={entry.title} className="flex items-start gap-3">
                      <span
                        className={`mt-0.5 inline-flex shrink-0 items-center rounded-md px-2 py-0.5 text-xs font-medium ${entry.color}`}
                      >
                        {entry.cat}
                      </span>
                      <span className="text-foreground">{entry.title}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Section 2 -- Social Proof Bar
// ---------------------------------------------------------------------------

const companies = [
  "Acme Corp",
  "TechFlow",
  "DevStack",
  "NovaBuild",
  "Synthex",
  "CloudPeak",
]

function SocialProofSection() {
  return (
    <section className="border-y border-border/40 py-12">
      <div className="container-width">
        <motion.p
          {...useFadeUp()}
          className="mb-8 text-center text-sm font-medium tracking-wide text-muted-foreground uppercase"
        >
          Trusted by teams building the future
        </motion.p>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6"
        >
          {companies.map((name) => (
            <motion.div
              key={name}
              variants={fadeUpItem}
              className="text-lg font-semibold tracking-tight text-muted-foreground/50 transition-opacity hover:opacity-100"
            >
              {name}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Section 3 -- How It Works
// ---------------------------------------------------------------------------

const howItWorks = [
  {
    icon: GitCommit,
    title: "Git Commit Analysis",
    description:
      "Parses conventional commit messages, groups related changes with AI, and generates human-readable summaries automatically.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  {
    icon: Code,
    title: "Diff-Based Detection",
    description:
      "Goes beyond commit messages. Analyzes actual code diffs to detect new APIs, components, refactors, and breaking changes.",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  {
    icon: Tag,
    title: "Semantic Versioning",
    description:
      "Watches package manifests, detects version bumps, and auto-compiles changelogs scoped to each release with zero configuration.",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
  },
]

function HowItWorksSection() {
  return (
    <section className="section-padding">
      <div className="container-width">
        <motion.div {...useFadeUp()} className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Three engines. One changelog.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Changeloger combines commit parsing, code-diff analysis, and
            version tracking to give you the most accurate, effortless
            changelogs possible.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 gap-8 md:grid-cols-3"
        >
          {howItWorks.map((item) => (
            <motion.div key={item.title} variants={fadeUpItem}>
              <Card className="h-full rounded-xl transition-transform duration-300 hover:-translate-y-1">
                <CardHeader>
                  <div
                    className={`mb-2 flex size-12 items-center justify-center rounded-lg ${item.bg}`}
                  >
                    <item.icon className={`size-6 ${item.color}`} />
                  </div>
                  <CardTitle className="text-base font-semibold">
                    {item.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed">
                    {item.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Section 4 -- Live Changelog Preview
// ---------------------------------------------------------------------------

const changelogEntries = [
  {
    cat: "Added",
    color: "bg-emerald-500/15 text-emerald-400",
    title: "OAuth 2.0 support for GitHub and Google",
    desc: "Users can now sign in with their GitHub or Google accounts. Includes automatic team mapping for organizations.",
  },
  {
    cat: "Fixed",
    color: "bg-blue-500/15 text-blue-400",
    title: "API rate limiting respects per-org quotas",
    desc: "Previously, rate limits were applied globally. Now each organization gets its own quota bucket.",
  },
  {
    cat: "Changed",
    color: "bg-amber-500/15 text-amber-400",
    title: "Dashboard layout updated to responsive grid",
    desc: "Switched from single-column to a two-column responsive layout for better information density.",
  },
  {
    cat: "Added",
    color: "bg-emerald-500/15 text-emerald-400",
    title: "Webhook notifications for publish events",
    desc: "Configure webhooks to notify Slack, Discord, or any HTTP endpoint when a changelog is published.",
  },
]

const markdownContent = `## v2.4.0 — March 2026

### Added
- **OAuth 2.0 support for GitHub and Google** — Users can now sign in with their GitHub or Google accounts.
- **Webhook notifications for publish events** — Configure webhooks for Slack, Discord, or HTTP endpoints.

### Fixed
- **API rate limiting respects per-org quotas** — Each organization now gets its own quota bucket.

### Changed
- **Dashboard layout updated to responsive grid** — Two-column responsive layout for better density.`

function ChangelogPreviewSection() {
  return (
    <section className="section-padding">
      <div className="container-width">
        <motion.div {...useFadeUp()} className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Beautiful changelogs, generated automatically
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            From raw commits to a polished release page in seconds &mdash; no
            manual editing required.
          </p>
        </motion.div>

        <motion.div {...useFadeUp(0.1)} className="mx-auto max-w-3xl">
          <Card className="rounded-xl">
            <Tabs defaultValue="rendered">
              <div className="flex items-center border-b border-border px-4 pt-2">
                <TabsList className="bg-transparent">
                  <TabsTrigger value="rendered">Rendered</TabsTrigger>
                  <TabsTrigger value="markdown">Markdown</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="rendered" className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold">
                    v2.4.0 &mdash; March 2026
                  </h3>
                  <Badge variant="outline" className="rounded-full text-xs">
                    4 changes
                  </Badge>
                </div>
                <ul className="space-y-4">
                  {changelogEntries.map((e) => (
                    <li key={e.title} className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-3">
                        <span
                          className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${e.color}`}
                        >
                          {e.cat}
                        </span>
                        <span className="font-medium">{e.title}</span>
                      </div>
                      <p className="ml-[calc(theme(spacing.2)+theme(spacing.3)+3.5rem)] text-sm text-muted-foreground sm:ml-0 sm:pl-[4.5rem]">
                        {e.desc}
                      </p>
                    </li>
                  ))}
                </ul>
              </TabsContent>

              <TabsContent value="markdown" className="p-6">
                <pre className="overflow-x-auto rounded-lg bg-muted/50 p-4 font-mono text-sm leading-relaxed text-foreground/80">
                  {markdownContent}
                </pre>
              </TabsContent>
            </Tabs>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Section 5 -- Feature Deep-Dives
// ---------------------------------------------------------------------------

const deepDives = [
  {
    heading: "AI-Powered Summarization",
    description:
      "Stop writing changelogs by hand. Changeloger reads every commit and diff, then produces concise, user-facing summaries that explain what changed and why it matters.",
    badges: ["GPT-4 powered", "Custom tone controls", "Multi-language"],
    icon: Sparkles,
    illustration: (
      <div className="space-y-3 rounded-xl border border-border bg-card p-5">
        <p className="text-xs font-medium text-muted-foreground uppercase">
          Before (raw commit)
        </p>
        <div className="rounded-lg bg-muted/50 p-3 font-mono text-xs text-muted-foreground">
          fix(auth): handle edge case in token refresh when exp &lt; iat
        </div>
        <div className="flex justify-center py-1">
          <ArrowRight className="size-4 rotate-90 text-[#6C63FF]" />
        </div>
        <p className="text-xs font-medium text-muted-foreground uppercase">
          After (generated)
        </p>
        <div className="rounded-lg bg-muted/50 p-3 text-sm text-foreground">
          <span className="font-medium text-blue-400">Fixed:</span> Resolved a
          token refresh bug that could log users out prematurely when server
          clocks were slightly out of sync.
        </div>
      </div>
    ),
  },
  {
    heading: "Collaborative Editor",
    description:
      "AI generates the first draft. Your team refines it. Real-time collaborative editing with cursor presence, inline comments, and approval workflows lets everyone contribute.",
    badges: ["Real-time cursors", "Inline comments", "Approval flow"],
    icon: Users,
    illustration: (
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
          <div className="size-2 rounded-full bg-emerald-400" />
          <span>Sarah is editing&hellip;</span>
          <div className="ml-2 size-2 rounded-full bg-blue-400" />
          <span>James is viewing</span>
        </div>
        <div className="space-y-2 rounded-lg bg-muted/50 p-3 text-sm">
          <p>
            <span className="border-l-2 border-emerald-400 pl-2">
              Added OAuth 2.0 social login with GitHub and Google
            </span>
          </p>
          <p className="text-muted-foreground">
            Fixed API rate limiting for per-org quotas
          </p>
          <p className="text-muted-foreground">
            Updated dashboard to two-column responsive grid
          </p>
        </div>
        <div className="mt-3 flex gap-2">
          <Badge variant="outline" className="rounded-full text-xs">
            Draft
          </Badge>
          <Badge variant="secondary" className="rounded-full text-xs">
            2 comments
          </Badge>
        </div>
      </div>
    ),
  },
  {
    heading: "Embeddable Widgets",
    description:
      "Ship your changelog as a widget inside your app. A single script tag gives your users a slide-out panel, inline feed, or modal with every release note.",
    badges: ["Copy-paste embed", "Customizable theme", "Auto-updates"],
    icon: PanelTop,
    illustration: (
      <div className="rounded-xl border border-border bg-card p-5">
        <p className="mb-2 text-xs font-medium text-muted-foreground">
          Paste this into your app:
        </p>
        <div className="group relative rounded-lg bg-muted/50 p-3 font-mono text-xs leading-relaxed text-foreground/80">
          <code>
            {`<script src="https://cdn.changeloger.dev/widget.js"
  data-workspace="acme"
  data-position="bottom-right">
</script>`}
          </code>
          <button
            className="absolute top-2 right-2 rounded-md p-1 opacity-0 transition-opacity group-hover:opacity-100"
            aria-label="Copy embed code"
          >
            <Copy className="size-3.5 text-muted-foreground" />
          </button>
        </div>
      </div>
    ),
  },
  {
    heading: "Analytics Dashboard",
    description:
      "Understand which release notes resonate. Track views, reactions, and engagement per entry so you can write better changelogs over time.",
    badges: ["View tracking", "Reaction metrics", "Export CSV"],
    icon: BarChart3,
    illustration: (
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="mb-3 flex items-center justify-between text-sm">
          <span className="font-medium">Engagement &mdash; last 30 days</span>
          <Badge variant="secondary" className="rounded-full text-xs">
            +24%
          </Badge>
        </div>
        <div className="flex items-end gap-1.5">
          {[40, 55, 35, 60, 45, 70, 80, 65, 75, 90, 85, 95].map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-sm bg-[#6C63FF]/60"
              style={{ height: `${h}px` }}
            />
          ))}
        </div>
        <div className="mt-3 flex gap-6 text-xs text-muted-foreground">
          <span>
            <strong className="text-foreground">12.4k</strong> views
          </span>
          <span>
            <strong className="text-foreground">1.2k</strong> reactions
          </span>
          <span>
            <strong className="text-foreground">89%</strong> read-through
          </span>
        </div>
      </div>
    ),
  },
]

function FeatureDeepDivesSection() {
  return (
    <section className="section-padding">
      <div className="container-width space-y-24 sm:space-y-32">
        {deepDives.map((item, idx) => {
          const reversed = idx % 2 !== 0
          return (
            <motion.div
              key={item.heading}
              {...useFadeUp()}
              className={`flex flex-col items-center gap-12 lg:flex-row lg:gap-16 ${
                reversed ? "lg:flex-row-reverse" : ""
              }`}
            >
              {/* Text */}
              <div className="flex-1 space-y-5">
                <div className="flex size-12 items-center justify-center rounded-lg bg-[#6C63FF]/10">
                  <item.icon className="size-6 text-[#6C63FF]" />
                </div>
                <h3 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  {item.heading}
                </h3>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {item.badges.map((b) => (
                    <Badge
                      key={b}
                      variant="secondary"
                      className="rounded-full text-xs"
                    >
                      {b}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Illustration */}
              <div className="w-full flex-1">{item.illustration}</div>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Section 6 -- Integrations
// ---------------------------------------------------------------------------

const languages = [
  { name: "JavaScript", color: "bg-yellow-400" },
  { name: "TypeScript", color: "bg-blue-400" },
  { name: "Python", color: "bg-emerald-400" },
  { name: "Go", color: "bg-cyan-400" },
  { name: "Rust", color: "bg-orange-400" },
  { name: "Java", color: "bg-red-400" },
  { name: "Ruby", color: "bg-rose-400" },
]

function IntegrationsSection() {
  return (
    <section className="section-padding border-y border-border/40">
      <div className="container-width text-center">
        <motion.div {...useFadeUp()} className="mx-auto mb-16 max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Works with your stack
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Connect your repository in one click. Changeloger integrates natively
            with the platforms your team already uses.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mx-auto mb-12 grid max-w-xl grid-cols-1 gap-6 sm:grid-cols-3"
        >
          {[
            { name: "GitHub", soon: false },
            { name: "GitLab", soon: true },
            { name: "Bitbucket", soon: true },
          ].map((p) => (
            <motion.div key={p.name} variants={fadeUpItem}>
              <Card className="rounded-xl py-6 text-center transition-transform duration-300 hover:-translate-y-1">
                <CardContent className="flex flex-col items-center gap-3">
                  <div className="flex size-14 items-center justify-center rounded-full bg-muted">
                    <Globe className="size-7 text-foreground" />
                  </div>
                  <span className="text-sm font-semibold">{p.name}</span>
                  {p.soon && (
                    <Badge variant="outline" className="rounded-full text-xs">
                      Coming Soon
                    </Badge>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <motion.div {...useFadeUp(0.15)}>
          <p className="mb-4 text-sm font-medium text-muted-foreground">
            Language-aware change detection
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {languages.map((lang) => (
              <div key={lang.name} className="flex items-center gap-2 text-sm">
                <span className={`size-2.5 rounded-full ${lang.color}`} />
                <span className="text-muted-foreground">{lang.name}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Section 7 -- Testimonials
// ---------------------------------------------------------------------------

const testimonials = [
  {
    quote:
      "Changeloger cut our release-note writing time from two hours to two minutes. The AI summaries are shockingly accurate, and our users actually read the changelog now.",
    name: "Sarah Chen",
    role: "Engineering Lead",
    company: "TechFlow",
    initials: "SC",
  },
  {
    quote:
      "We used to forget half the changes in our release notes. With diff-based detection, nothing slips through the cracks. It is like having a dedicated docs engineer on the team.",
    name: "Marcus Rivera",
    role: "CTO",
    company: "NovaBuild",
    initials: "MR",
  },
  {
    quote:
      "The embeddable widget is a game-changer. We dropped it into our app in five minutes and now our customers always know what is new. Support tickets for 'what changed?' dropped to zero.",
    name: "Priya Sharma",
    role: "Product Manager",
    company: "Synthex",
    initials: "PS",
  },
]

function TestimonialsSection() {
  return (
    <section className="section-padding">
      <div className="container-width">
        <motion.div {...useFadeUp()} className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Loved by engineering teams
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            See what beta testers say about Changeloger.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 gap-8 md:grid-cols-3"
        >
          {testimonials.map((t) => (
            <motion.div key={t.name} variants={fadeUpItem}>
              <Card className="h-full rounded-xl">
                <CardContent className="flex h-full flex-col justify-between gap-6 pt-6">
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className="size-4 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>
                  <p className="flex-1 text-sm leading-relaxed text-foreground/90">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <Avatar size="sm">
                      <AvatarFallback>{t.initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{t.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {t.role}, {t.company}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Section 8 -- Pricing
// ---------------------------------------------------------------------------

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "/mo",
    tagline: "For solo developers and side projects",
    features: [
      "1 repository",
      "50 AI generations / month",
      "Basic embed widget",
      "Community support",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Pro",
    price: "$15",
    period: "/mo",
    tagline: "For growing teams shipping fast",
    features: [
      "5 repositories",
      "500 AI generations / month",
      "All embed widgets",
      "Collaborative editor",
      "Analytics dashboard",
      "Priority email support",
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Team",
    price: "$40",
    period: "/mo",
    tagline: "For engineering organizations at scale",
    features: [
      "Unlimited repositories",
      "2,000 AI generations / month",
      "All Pro features",
      "Team roles and permissions",
      "SSO / SAML",
      "Dedicated Slack support",
      "Custom branding",
    ],
    cta: "Contact Sales",
    popular: false,
  },
]

function PricingSection() {
  return (
    <section className="section-padding">
      <div className="container-width">
        <motion.div {...useFadeUp()} className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Start free. Upgrade when your team grows. No hidden fees.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 gap-8 md:grid-cols-3"
        >
          {plans.map((plan) => (
            <motion.div key={plan.name} variants={fadeUpItem}>
              <Card
                className={`relative h-full rounded-xl ${
                  plan.popular
                    ? "ring-2 ring-[#6C63FF] shadow-lg shadow-[#6C63FF]/10"
                    : ""
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-[#6C63FF] px-3 text-xs text-white">
                    Most Popular
                  </Badge>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  <div className="mt-2 flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-sm text-muted-foreground">
                      {plan.period}
                    </span>
                  </div>
                  <CardDescription className="mt-2">
                    {plan.tagline}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-6">
                  <ul className="space-y-3">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm">
                        <Check className="size-4 shrink-0 text-[#6C63FF]" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    asChild
                    variant={plan.popular ? "default" : "outline"}
                    className={`w-full rounded-lg ${
                      plan.popular
                        ? "gradient-primary text-white"
                        : ""
                    }`}
                  >
                    <Link href={plan.name === "Team" ? "/contact" : "/signup"}>
                      {plan.cta}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <motion.div {...useFadeUp(0.2)} className="mt-8 text-center">
          <Link
            href="/pricing"
            className="inline-flex items-center gap-1 text-sm font-medium text-[#6C63FF] hover:underline"
          >
            See full comparison
            <ArrowRight className="size-3.5" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Section 9 -- Bottom CTA
// ---------------------------------------------------------------------------

function BottomCTASection() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      {/* Gradient background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#6C63FF]/10 via-background to-background" />
        <div className="absolute top-0 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-[#6C63FF]/8 blur-[100px]" />
      </div>

      <div className="container-width text-center">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="flex flex-col items-center gap-6"
        >
          <motion.h2
            variants={fadeUpItem}
            className="max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl"
          >
            Start generating changelogs in 60 seconds
          </motion.h2>
          <motion.p
            variants={fadeUpItem}
            className="max-w-xl text-lg text-muted-foreground"
          >
            Free forever for solo projects. No credit card required.
          </motion.p>
          <motion.div
            variants={fadeUpItem}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            <Button
              asChild
              size="lg"
              className="gradient-primary rounded-lg px-6 text-sm font-semibold text-white"
            >
              <Link href="/signup">Get Started Free</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-lg px-6 text-sm">
              <Link href="/demo">Book a Demo</Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function MarketingHomePage() {
  return (
    <>
      <HeroSection />
      <SocialProofSection />
      <HowItWorksSection />
      <ChangelogPreviewSection />
      <FeatureDeepDivesSection />
      <IntegrationsSection />
      <TestimonialsSection />
      <PricingSection />
      <BottomCTASection />
    </>
  )
}
