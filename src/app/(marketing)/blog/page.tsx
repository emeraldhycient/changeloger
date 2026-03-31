import type { Metadata } from "next"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  Card,
  CardHeader,
  CardContent,
} from "@/components/ui/card"
import { ArrowRight, Clock, User } from "lucide-react"

export const metadata: Metadata = {
  title: "Blog - Changeloger",
  description:
    "Tips on changelog best practices, product updates, and engineering deep dives from the Changeloger team.",
}

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

interface BlogPost {
  slug: string
  title: string
  excerpt: string
  date: string
  author: string
  readTime: string
  category: string
  color: string // tailwind bg class for image placeholder
}

const posts: BlogPost[] = [
  {
    slug: "why-changelogs-matter",
    title: "Why Changelogs Matter More Than You Think",
    excerpt:
      "A well-maintained changelog builds trust with users, reduces support tickets, and turns updates into a marketing channel. Here's how to make yours count.",
    date: "March 25, 2026",
    author: "Sarah Chen",
    readTime: "6 min read",
    category: "Best Practices",
    color: "bg-violet-600/30",
  },
  {
    slug: "introducing-ai-detection",
    title: "Introducing AI-Powered Changelog Detection",
    excerpt:
      "Our new detection engine uses large language models to turn messy commit histories into polished, human-readable changelogs automatically.",
    date: "March 18, 2026",
    author: "Marcus Oliveira",
    readTime: "4 min read",
    category: "Product Updates",
    color: "bg-sky-600/30",
  },
  {
    slug: "conventional-commits-deep-dive",
    title: "Conventional Commits: A Deep Dive for Teams",
    excerpt:
      "Conventional Commits give your changelog automation superpowers. We break down the spec, share real-world patterns, and show how Changeloger uses them under the hood.",
    date: "March 10, 2026",
    author: "Priya Patel",
    readTime: "8 min read",
    category: "Engineering",
    color: "bg-emerald-600/30",
  },
  {
    slug: "embed-changelog-widget",
    title: "How to Embed a Changelog Widget in Under 5 Minutes",
    excerpt:
      "Step-by-step guide to adding a live changelog widget to your marketing site, docs, or app. No build step required.",
    date: "March 3, 2026",
    author: "Sarah Chen",
    readTime: "3 min read",
    category: "Best Practices",
    color: "bg-amber-600/30",
  },
]

const categoryColors: Record<string, string> = {
  "Best Practices": "bg-violet-500/10 text-violet-400 border-violet-500/20",
  "Product Updates": "bg-sky-500/10 text-sky-400 border-sky-500/20",
  Engineering: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function BlogPage() {
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="outline" className="mb-4">
            Blog
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Insights &amp; Updates
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Changelog best practices, product news, and engineering deep dives
            from the Changeloger team.
          </p>
        </div>

        {/* Grid */}
        <div className="mt-16 grid gap-8 sm:grid-cols-2">
          {posts.map((post) => (
            <Link key={post.slug} href="#" className="group">
              <Card className="h-full overflow-hidden transition-colors hover:border-violet-500/50">
                {/* Image placeholder */}
                <div
                  className={`h-48 w-full ${post.color} flex items-center justify-center`}
                >
                  <span className="text-sm font-medium text-muted-foreground/60 select-none">
                    {post.category}
                  </span>
                </div>

                <CardHeader className="pb-2">
                  <Badge
                    variant="outline"
                    className={`w-fit text-xs ${categoryColors[post.category] ?? ""}`}
                  >
                    {post.category}
                  </Badge>
                  <h2 className="mt-2 text-xl font-semibold leading-tight group-hover:text-violet-400 transition-colors">
                    {post.title}
                  </h2>
                </CardHeader>

                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {post.excerpt}
                  </p>

                  <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {post.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {post.readTime}
                    </span>
                    <span>{post.date}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Newsletter CTA */}
        <Separator className="my-16" />

        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-2xl font-semibold tracking-tight">
            Stay in the loop
          </h2>
          <p className="mt-2 text-muted-foreground">
            Get changelog tips and product updates delivered to your inbox. No
            spam, unsubscribe anytime.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
            <Input
              type="email"
              placeholder="you@company.com"
              className="sm:w-72"
              readOnly
            />
            <Button>
              Subscribe
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
