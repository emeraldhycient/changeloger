"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import {
  FileText, ArrowRight, Calendar, Eye, GitBranch, Layers,
  Search, ChevronLeft, ChevronRight, ArrowUpDown, Filter,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { useWorkspaceStore } from "@/stores/workspace-store"
import { useReleases } from "@/hooks/use-releases"
import { apiClient } from "@/lib/api/client"

const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "version-asc", label: "Version A–Z" },
  { value: "version-desc", label: "Version Z–A" },
]

const PER_PAGE = 10

export default function ChangelogsPage() {
  const { currentWorkspaceId } = useWorkspaceStore()
  const { data: changelogs = [], isLoading } = useReleases(currentWorkspaceId, "published")

  const { data: repos = [] } = useQuery<Array<{ id: string; fullName: string }>>({
    queryKey: ["changelog-repos", currentWorkspaceId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/api/repositories?workspaceId=${currentWorkspaceId}&limit=100`)
      return (data.repositories || []).map((r: { id: string; fullName: string }) => ({ id: r.id, fullName: r.fullName }))
    },
    enabled: !!currentWorkspaceId,
  })

  const [search, setSearch] = useState("")
  const [repoFilter, setRepoFilter] = useState<string | null>(null)
  const [sort, setSort] = useState("newest")
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    let result = [...changelogs]

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (r) =>
          r.version.toLowerCase().includes(q) ||
          (r.repository?.fullName || "").toLowerCase().includes(q),
      )
    }

    if (repoFilter) {
      result = result.filter((r) => r.repositoryId === repoFilter)
    }

    if (sort === "newest") result.sort((a, b) => new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime())
    else if (sort === "oldest") result.sort((a, b) => new Date(a.publishedAt || a.createdAt).getTime() - new Date(b.publishedAt || b.createdAt).getTime())
    else if (sort === "version-asc") result.sort((a, b) => a.version.localeCompare(b.version))
    else if (sort === "version-desc") result.sort((a, b) => b.version.localeCompare(a.version))

    return result
  }, [changelogs, search, repoFilter, sort])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const safePage = Math.min(page, totalPages)
  const paginated = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE)
  const hasFilters = !!search || !!repoFilter

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Published Changelogs</h1>
          <p className="mt-1 text-muted-foreground">View and manage your published changelogs</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/editor">
            <FileText className="mr-2 h-4 w-4" />
            Open Editor
          </Link>
        </Button>
      </div>

      {/* Search / filter / sort bar */}
      {changelogs.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by version or repository..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="h-9 pl-9"
            />
          </div>

          {repos.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 gap-1.5">
                  <Filter className="h-3.5 w-3.5" />
                  {repoFilter ? repos.find((r) => r.id === repoFilter)?.fullName || "Repo" : "All Repos"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Repository</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => { setRepoFilter(null); setPage(1) }}>All Repos</DropdownMenuItem>
                {repos.map((r) => (
                  <DropdownMenuItem key={r.id} onClick={() => { setRepoFilter(r.id); setPage(1) }}>
                    {r.fullName}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-1.5">
                <ArrowUpDown className="h-3.5 w-3.5" />
                Sort
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {SORT_OPTIONS.map((opt) => (
                <DropdownMenuItem key={opt.value} onClick={() => { setSort(opt.value); setPage(1) }}>
                  {opt.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {hasFilters && (
            <Button variant="ghost" size="sm" className="h-9" onClick={() => { setSearch(""); setRepoFilter(null); setPage(1) }}>
              Clear
            </Button>
          )}
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-lg bg-muted/50" />
          ))}
        </div>
      ) : paginated.length === 0 ? (
        <div className="flex flex-col items-center justify-center border border-dashed py-16">
          <div className="flex h-12 w-12 items-center justify-center bg-muted">
            <FileText className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">
            {hasFilters ? "No matching changelogs" : "No published changelogs"}
          </h3>
          <p className="mt-1 max-w-sm text-center text-sm text-muted-foreground">
            {hasFilters
              ? "Try adjusting your search or filters."
              : "Your published changelogs will appear here. Start by creating a draft in the editor."}
          </p>
          {hasFilters ? (
            <Button variant="outline" className="mt-4" onClick={() => { setSearch(""); setRepoFilter(null) }}>
              Clear Filters
            </Button>
          ) : (
            <Button variant="outline" className="mt-6" asChild>
              <Link href="/dashboard/editor">
                Go to Editor
                <ArrowRight className="ml-2 h-3.5 w-3.5" />
              </Link>
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {paginated.map((cl) => (
              <Card key={cl.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center bg-primary/10">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">v{cl.version}</span>
                        {cl.repository ? (
                          <Badge variant="secondary" className="text-[10px]">
                            <GitBranch className="mr-1 h-3 w-3" />
                            {cl.repository.fullName}
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[10px]">
                            <Layers className="mr-1 h-3 w-3" />
                            Manual
                          </Badge>
                        )}
                      </div>
                      <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {cl.publishedAt ? new Date(cl.publishedAt).toLocaleDateString() : "—"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {cl._count?.entries ?? 0} entries
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/dashboard/editor?release=${cl.id}`}>View</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {(safePage - 1) * PER_PAGE + 1}–{Math.min(safePage * PER_PAGE, filtered.length)} of {filtered.length}
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={safePage <= 1} onClick={() => setPage(safePage - 1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground">{safePage} / {totalPages}</span>
                <Button variant="outline" size="sm" disabled={safePage >= totalPages} onClick={() => setPage(safePage + 1)}>
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
