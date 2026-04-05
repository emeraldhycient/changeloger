"use client"

import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import {
  GitBranch,
  FileText,
  Share2,
  ArrowRight,
  FolderGit2,
  ScrollText,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  Activity,
  Code,
  Eye,
  AlertTriangle,
  Layers,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { apiClient } from "@/lib/api/client"
import { useWorkspaceStore } from "@/stores/workspace-store"

interface DashboardStats {
  repos: number
  activeRepos: number
  drafts: number
  published: number
  archived: number
  members: number
  widgets: number
  unprocessedChanges: number
  totalChanges: number
  processedChanges: number
  totalEntries: number
  unreviewedEntries: number
  reviewedEntries: number
  breakingEntries: number
  recentEvents24h: number
  recentDrafts: Array<{
    id: string
    version: string
    repository: { name: string; fullName: string } | null
    totalEntries: number
    unreviewedEntries: number
    updatedAt: string
  }>
}

const gettingStartedCards = [
  {
    title: "Connect Repository",
    description: "Install the GitHub App to start tracking your commits and generating changelogs.",
    icon: GitBranch,
    cta: "Connect GitHub",
    href: "/dashboard/repositories",
  },
  {
    title: "Review Changelog",
    description: "AI will analyze your commits and generate your first changelog automatically.",
    icon: FileText,
    cta: "Open Editor",
    href: "/dashboard/editor",
  },
  {
    title: "Share with Your Team",
    description: "Invite team members to collaborate on changelogs and manage releases together.",
    icon: Share2,
    cta: "Invite Team",
    href: "/dashboard/team",
  },
]

function StatCard({
  label,
  value,
  subtext,
  icon: Icon,
  href,
  variant = "default",
}: {
  label: string
  value: string | number
  subtext?: string
  icon: React.ComponentType<{ className?: string }>
  href: string
  variant?: "default" | "warning" | "success"
}) {
  return (
    <Link href={href}>
      <Card className="transition-colors hover:bg-muted/50">
        <CardContent className="flex items-center gap-4 p-5">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center ${
            variant === "warning" ? "bg-amber-500/10" :
            variant === "success" ? "bg-emerald-500/10" : "bg-muted"
          }`}>
            <Icon className={`h-5 w-5 ${
              variant === "warning" ? "text-amber-500" :
              variant === "success" ? "text-emerald-500" : "text-muted-foreground"
            }`} />
          </div>
          <div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-sm text-muted-foreground">{label}</p>
            {subtext && (
              <p className="text-xs text-muted-foreground">{subtext}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

export default function DashboardPage() {
  const workspaceId = useWorkspaceStore((s) => s.currentWorkspaceId)

  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["dashboard-stats", workspaceId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/api/dashboard/stats?workspaceId=${workspaceId}`)
      return data
    },
    enabled: !!workspaceId,
    refetchInterval: 30000,
  })

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome to Changeloger</h1>
        <p className="mt-2 text-muted-foreground">
          Get started by connecting your first repository
        </p>
      </div>

      {/* Getting started */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {gettingStartedCards.map((card) => (
          <Card key={card.title} className="group relative">
            <CardHeader>
              <div className="flex h-10 w-10 items-center justify-center bg-primary/10">
                <card.icon className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-lg">{card.title}</CardTitle>
              <CardDescription>{card.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" size="sm" className="group/btn" asChild>
                <Link href={card.href}>
                  {card.cta}
                  <ArrowRight className="ml-2 h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Primary stats */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">Overview</h2>
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-lg bg-muted/50" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total Repos" value={stats?.repos ?? 0} subtext={`${stats?.activeRepos ?? 0} active`} icon={FolderGit2} href="/dashboard/repositories" />
            <StatCard label="Draft Changelogs" value={stats?.drafts ?? 0} icon={ScrollText} href="/dashboard/editor" variant={stats?.drafts ? "warning" : "default"} />
            <StatCard label="Published" value={stats?.published ?? 0} icon={FileText} href="/dashboard/changelogs" variant={stats?.published ? "success" : "default"} />
            <StatCard label="Team Members" value={stats?.members ?? 0} icon={Users} href="/dashboard/team" />
          </div>
        )}
      </div>

      {/* Secondary stats */}
      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Unprocessed Changes"
            value={stats.unprocessedChanges}
            subtext={`${stats.totalChanges} total detected`}
            icon={AlertCircle}
            href="/dashboard/editor"
            variant={stats.unprocessedChanges > 0 ? "warning" : "default"}
          />
          <StatCard
            label="Unreviewed Entries"
            value={stats.unreviewedEntries}
            subtext={`${stats.reviewedEntries} reviewed`}
            icon={CheckCircle2}
            href="/dashboard/editor"
            variant={stats.unreviewedEntries > 0 ? "warning" : "default"}
          />
          <StatCard
            label="Breaking Changes"
            value={stats.breakingEntries}
            subtext={`${stats.totalEntries} total entries`}
            icon={AlertTriangle}
            href="/dashboard/editor"
            variant={stats.breakingEntries > 0 ? "warning" : "default"}
          />
          <StatCard
            label="Widget Views (24h)"
            value={stats.recentEvents24h}
            subtext={`${stats.widgets} widget${stats.widgets !== 1 ? "s" : ""} active`}
            icon={Eye}
            href="/dashboard/analytics"
          />
        </div>
      )}

      {/* Recent drafts with review status */}
      {stats && stats.recentDrafts.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-semibold">Drafts Needing Review</h2>
          <Card>
            <CardContent className="divide-y p-0">
              {stats.recentDrafts.map((draft) => (
                <Link
                  key={draft.id}
                  href={`/dashboard/editor?release=${draft.id}`}
                  className="flex items-center justify-between gap-4 px-5 py-3 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <ScrollText className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-medium">v{draft.version}</p>
                        <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-[10px] text-amber-700 dark:text-amber-400">
                          Draft
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {draft.repository ? draft.repository.fullName : "Manual"} &middot; {new Date(draft.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {draft.totalEntries > 0 ? (
                      <>
                        <span className="text-xs text-muted-foreground">
                          {draft.totalEntries} {draft.totalEntries === 1 ? "entry" : "entries"}
                        </span>
                        {draft.unreviewedEntries > 0 ? (
                          <Badge variant="secondary" className="text-[10px]">
                            {draft.unreviewedEntries} unreviewed
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-emerald-500/30 text-[10px] text-emerald-600 dark:text-emerald-400">
                            All reviewed
                          </Badge>
                        )}
                      </>
                    ) : (
                      <span className="text-xs text-muted-foreground">No entries</span>
                    )}
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
