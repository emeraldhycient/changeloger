"use client"

import { useState, useMemo } from "react"
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
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { apiClient } from "@/lib/api/client"
import { useWorkspaceStore } from "@/stores/workspace-store"
import { useReleases, type Release } from "@/hooks/use-releases"
import type { ChangeRecord } from "@/types/models"

// ─── Constants ─────────────────────────────────────────────────────────────

const ITEMS_PER_PAGE = 20

const TYPE_FILTER_OPTIONS = [
  { value: "all", label: "All types" },
  { value: "commits", label: "Commits only" },
  { value: "releases", label: "Releases only" },
]

const SOURCE_FILTER_OPTIONS = [
  { value: "all", label: "All sources" },
  { value: "commit", label: "Commit" },
  { value: "version", label: "Version" },
]

const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
]

// ─── Helpers ───────────────────────────────────────────────────────────────

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

// ─── Page ──────────────────────────────────────────────────────────────────

export default function ActivityPage() {
  const workspaceId = useWorkspaceStore((s) => s.currentWorkspaceId)

  // Filter / sort / pagination state
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [sourceFilter, setSourceFilter] = useState("all")
  const [sort, setSort] = useState("newest")
  const [page, setPage] = useState(1)

  const { data: allReleases = [] } = useReleases(workspaceId)

  const { data: activityData, isLoading } = useQuery<{
    changes: ChangeRecord[]
    pagination: { page: number; limit: number; total: number; totalPages: number }
  }>({
    queryKey: ["activity-changes", workspaceId],
    queryFn: async () => {
      const { data } = await apiClient.get(
        `/api/activity?workspaceId=${workspaceId}&limit=100`,
      )
      return data
    },
    enabled: !!workspaceId,
  })

  const recentChanges = activityData?.changes ?? []

  // Build a unified timeline from releases + change records
  type TimelineItem =
    | { type: "release"; data: Release; timestamp: string }
    | { type: "change"; data: ChangeRecord; timestamp: string }

  const filteredTimeline = useMemo(() => {
    const timeline: TimelineItem[] = []

    // Add releases unless filtered to commits only
    if (typeFilter !== "commits") {
      for (const release of allReleases) {
        timeline.push({
          type: "release",
          data: release,
          timestamp: release.publishedAt || release.createdAt,
        })
      }
    }

    // Add changes unless filtered to releases only
    if (typeFilter !== "releases") {
      for (const change of recentChanges) {
        // Apply source filter on change records
        if (sourceFilter !== "all" && change.source !== sourceFilter) continue
        timeline.push({
          type: "change",
          data: change,
          timestamp: change.timestamp,
        })
      }
    }

    // Apply search filter
    const searchLower = search.toLowerCase()
    const searched = search
      ? timeline.filter((item) => {
          if (item.type === "release") {
            const r = item.data
            return (
              r.version.toLowerCase().includes(searchLower) ||
              (r.repository?.fullName || "").toLowerCase().includes(searchLower)
            )
          }
          return item.data.subject.toLowerCase().includes(searchLower)
        })
      : timeline

    // Sort
    searched.sort((a, b) => {
      const diff = new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      return sort === "oldest" ? -diff : diff
    })

    return searched
  }, [allReleases, recentChanges, typeFilter, sourceFilter, search, sort])

  // Pagination
  const totalItems = filteredTimeline.length
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE))
  const safePage = Math.min(page, totalPages)
  const startIdx = (safePage - 1) * ITEMS_PER_PAGE
  const endIdx = Math.min(startIdx + ITEMS_PER_PAGE, totalItems)
  const paginatedTimeline = filteredTimeline.slice(startIdx, endIdx)

  // Reset page when filters change
  const handleSearch = (value: string) => {
    setSearch(value)
    setPage(1)
  }
  const handleTypeFilter = (value: string) => {
    setTypeFilter(value)
    setPage(1)
  }
  const handleSourceFilter = (value: string) => {
    setSourceFilter(value)
    setPage(1)
  }
  const handleSort = (value: string) => {
    setSort(value)
    setPage(1)
  }

  const currentTypeLabel = TYPE_FILTER_OPTIONS.find((o) => o.value === typeFilter)?.label ?? "All types"
  const currentSourceLabel = SOURCE_FILTER_OPTIONS.find((o) => o.value === sourceFilter)?.label ?? "All sources"
  const currentSortLabel = SORT_OPTIONS.find((o) => o.value === sort)?.label ?? "Newest first"

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Activity</h1>
        <p className="mt-1 text-muted-foreground">
          Recent changes, releases, and events across your workspace
        </p>
      </div>

      {/* Search + Filter bar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search activity..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Type filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Filter className="h-3.5 w-3.5" />
              {currentTypeLabel}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {TYPE_FILTER_OPTIONS.map((opt) => (
              <DropdownMenuItem
                key={opt.value}
                onClick={() => handleTypeFilter(opt.value)}
                className={typeFilter === opt.value ? "font-medium" : ""}
              >
                {opt.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Source filter (only relevant when showing commits) */}
        {typeFilter !== "releases" && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5">
                <GitBranch className="h-3.5 w-3.5" />
                {currentSourceLabel}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {SOURCE_FILTER_OPTIONS.map((opt) => (
                <DropdownMenuItem
                  key={opt.value}
                  onClick={() => handleSourceFilter(opt.value)}
                  className={sourceFilter === opt.value ? "font-medium" : ""}
                >
                  {opt.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Sort */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5">
              <ArrowUpDown className="h-3.5 w-3.5" />
              {currentSortLabel}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {SORT_OPTIONS.map((opt) => (
              <DropdownMenuItem
                key={opt.value}
                onClick={() => handleSort(opt.value)}
                className={sort === opt.value ? "font-medium" : ""}
              >
                {opt.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-muted/50" />
          ))}
        </div>
      ) : paginatedTimeline.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Activity className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">
              {search || typeFilter !== "all" || sourceFilter !== "all"
                ? "No matching activity"
                : "No activity yet"}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {search || typeFilter !== "all" || sourceFilter !== "all"
                ? "Try adjusting your search or filters."
                : "Connect a repository and push commits to see activity here."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />

            <div className="space-y-1">
              {paginatedTimeline.map((item) => {
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-sm text-muted-foreground">
                Showing {startIdx + 1}–{endIdx} of {totalItems}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={safePage <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Prev
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {safePage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={safePage >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
