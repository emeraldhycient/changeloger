"use client"

import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import {
  Activity,
  GitCommit,
  FileText,
  Send,
  Tag,
  GitBranch,
  Clock,
  Sparkles,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { apiClient } from "@/lib/api/client"
import { useWorkspaceStore } from "@/stores/workspace-store"
import { useReleases, type Release } from "@/hooks/use-releases"
import type { ChangeRecord } from "@/types/models"

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return new Date(date).toLocaleDateString()
}

export default function ActivityPage() {
  const workspaceId = useWorkspaceStore((s) => s.currentWorkspaceId)

  const { data: allReleases = [] } = useReleases(workspaceId)

  const { data: recentChanges = [], isLoading } = useQuery<ChangeRecord[]>({
    queryKey: ["activity-changes", workspaceId],
    queryFn: async () => {
      const { data } = await apiClient.get(
        `/api/activity?workspaceId=${workspaceId}`,
      )
      return data
    },
    enabled: !!workspaceId,
  })

  // Build a unified timeline from releases + change records
  type TimelineItem =
    | { type: "release"; data: Release; timestamp: string }
    | { type: "change"; data: ChangeRecord; timestamp: string }

  const timeline: TimelineItem[] = []

  for (const release of allReleases) {
    timeline.push({
      type: "release",
      data: release,
      timestamp: release.publishedAt || release.createdAt,
    })
  }

  for (const change of recentChanges) {
    timeline.push({
      type: "change",
      data: change,
      timestamp: change.timestamp,
    })
  }

  timeline.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Activity</h1>
        <p className="mt-1 text-muted-foreground">
          Recent changes, releases, and events across your workspace
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-muted/50" />
          ))}
        </div>
      ) : timeline.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Activity className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No activity yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Connect a repository and push commits to see activity here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />

          <div className="space-y-1">
            {timeline.map((item) => {
              if (item.type === "release") {
                const release = item.data
                const isPublished = release.status === "published"
                return (
                  <Link
                    key={`release-${release.id}`}
                    href={`/dashboard/editor?release=${release.id}`}
                    className="group relative flex items-start gap-4 rounded-lg px-2 py-3 transition-colors hover:bg-muted/50"
                  >
                    <div className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 ${
                      isPublished
                        ? "border-emerald-500 bg-emerald-500/10"
                        : "border-amber-500 bg-amber-500/10"
                    }`}>
                      {isPublished ? (
                        <Send className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <FileText className="h-4 w-4 text-amber-500" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1 pt-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">v{release.version}</span>
                        <Badge
                          variant={isPublished ? "default" : "secondary"}
                          className="text-[10px]"
                        >
                          {release.status}
                        </Badge>
                        {release._count && (
                          <span className="text-xs text-muted-foreground">
                            {release._count.entries} entries
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {release.repository?.fullName || "Manual"} &middot; {timeAgo(item.timestamp)}
                      </p>
                    </div>
                  </Link>
                )
              }

              // Change record
              const change = item.data
              const SourceIcon = change.source === "commit" ? GitCommit
                : change.source === "version" ? Tag
                : GitBranch

              return (
                <div
                  key={`change-${change.id}`}
                  className="relative flex items-start gap-4 rounded-lg px-2 py-3"
                >
                  <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-border bg-background">
                    <SourceIcon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1 pt-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm">{change.subject}</span>
                      {change.breaking && (
                        <Badge variant="destructive" className="shrink-0 text-[10px]">
                          Breaking
                        </Badge>
                      )}
                      {change.processedAt && (
                        <Sparkles className="h-3 w-3 shrink-0 text-primary" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline" className="text-[10px]">
                        {change.source}
                      </Badge>
                      {change.commitSha && (
                        <code className="font-mono">{change.commitSha.slice(0, 7)}</code>
                      )}
                      <span>&middot;</span>
                      <span>{timeAgo(item.timestamp)}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
