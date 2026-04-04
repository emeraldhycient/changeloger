"use client"

import { useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  RefreshCw,
  Loader2,
  Search,
  GitBranch,
  Circle,
  Settings,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Filter,
  X,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { apiClient } from "@/lib/api/client"
import { useWorkspaceStore } from "@/stores/workspace-store"
import { GitHubConnectButton } from "@/components/dashboard/github-connect-button"

// ─── Types ──────────────────────────────────────────────────────────────────

interface Repository {
  id: string
  name: string
  fullName: string
  language: string | null
  isActive: boolean
  defaultBranch: string
  createdAt: string
  githubInstallation: { accountLogin: string; accountType: string }
  _count: { releases: number; changeRecords: number }
}

interface RepoListResponse {
  repositories: Repository[]
  pagination: { page: number; limit: number; total: number; totalPages: number }
  filters: { languages: string[] }
}

const ERROR_MESSAGES: Record<string, string> = {
  invalid_callback: "Invalid callback from GitHub. Please try connecting again.",
  no_workspace: "No workspace found. Create a workspace first, then connect GitHub.",
  installation_failed: "GitHub installation failed. Please try again.",
}

const SORT_OPTIONS = [
  { value: "createdAt-desc", label: "Newest first" },
  { value: "createdAt-asc", label: "Oldest first" },
  { value: "name-asc", label: "Name A–Z" },
  { value: "name-desc", label: "Name Z–A" },
]

// ─── Content ────────────────────────────────────────────────────────────────

function RepositoriesContent() {
  const workspaceId = useWorkspaceStore((s) => s.currentWorkspaceId)
  const queryClient = useQueryClient()
  const searchParams = useSearchParams()

  const setup = searchParams.get("setup")
  const error = searchParams.get("error")

  // Local state
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [sort, setSort] = useState("createdAt-desc")
  const [language, setLanguage] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState<string | null>(null)

  const [sortBy, sortOrder] = sort.split("-")

  const { data, isLoading } = useQuery<RepoListResponse>({
    queryKey: ["repositories", workspaceId, page, search, sort, language, activeFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        workspaceId: workspaceId!,
        page: String(page),
        limit: "20",
        sortBy: sortBy,
        sortOrder: sortOrder,
      })
      if (search) params.set("search", search)
      if (language) params.set("language", language)
      if (activeFilter) params.set("active", activeFilter)
      const { data } = await apiClient.get(`/api/repositories?${params}`)
      return data
    },
    enabled: !!workspaceId,
  })

  const repos = data?.repositories ?? []
  const pagination = data?.pagination ?? { page: 1, limit: 20, total: 0, totalPages: 0 }
  const availableLanguages = data?.filters?.languages ?? []

  const syncRepos = useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post("/api/github/sync", { workspaceId })
      return data as { synced: number; method: string }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["repositories"] })
    },
  })

  const hasActiveFilters = !!search || !!language || !!activeFilter

  const clearFilters = () => {
    setSearch("")
    setLanguage(null)
    setActiveFilter(null)
    setPage(1)
  }

  return (
    <div className="mx-auto max-w-5xl">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Repositories</h1>
          <p className="mt-1 text-muted-foreground">
            Manage your connected GitHub repositories
          </p>
        </div>
        <div className="flex items-center gap-2">
          {workspaceId && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => syncRepos.mutate()}
              disabled={syncRepos.isPending}
            >
              {syncRepos.isPending ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
              )}
              {syncRepos.isPending ? "Syncing..." : "Sync Repos"}
            </Button>
          )}
          <GitHubConnectButton />
        </div>
      </div>

      {/* Banners */}
      {setup === "complete" && (
        <div className="mb-4 flex items-start gap-3 rounded border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
          <div>
            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
              GitHub connected successfully!
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Your repositories have been synced. Click Sync Repos if you don't see all of them.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 flex items-start gap-3 rounded border border-destructive/20 bg-destructive/5 px-4 py-3">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
          <p className="text-sm text-destructive">
            {ERROR_MESSAGES[error] || "An error occurred. Please try again."}
          </p>
        </div>
      )}

      {!workspaceId && (
        <div className="mb-4 flex items-start gap-3 rounded border border-amber-500/20 bg-amber-500/5 px-4 py-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
          <p className="text-sm text-amber-700 dark:text-amber-400">
            Select a workspace from the sidebar to view repositories.
          </p>
        </div>
      )}

      {/* Search, sort, filter bar */}
      {workspaceId && (
        <div className="mb-4 flex items-center gap-2">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search repositories..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="h-9 pl-9"
            />
          </div>

          {/* Language filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-1.5">
                <Filter className="h-3.5 w-3.5" />
                {language || "Language"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Language</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => { setLanguage(null); setPage(1) }}>
                All languages
              </DropdownMenuItem>
              {availableLanguages.map((lang) => (
                <DropdownMenuItem key={lang} onClick={() => { setLanguage(lang); setPage(1) }}>
                  {lang}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Active filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-1.5">
                <Circle className="h-3 w-3" />
                {activeFilter === "true" ? "Active" : activeFilter === "false" ? "Inactive" : "Status"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => { setActiveFilter(null); setPage(1) }}>All</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setActiveFilter("true"); setPage(1) }}>Active</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setActiveFilter("false"); setPage(1) }}>Inactive</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Sort */}
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

          {/* Clear filters */}
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" className="h-9 gap-1.5 text-muted-foreground" onClick={clearFilters}>
              <X className="h-3.5 w-3.5" />
              Clear
            </Button>
          )}
        </div>
      )}

      {/* Repo list */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-[72px] animate-pulse rounded-lg bg-muted/50" />
          ))}
        </div>
      ) : repos.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
          <GitBranch className="h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">
            {hasActiveFilters ? "No matching repositories" : "No repositories connected"}
          </h3>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            {hasActiveFilters
              ? "Try adjusting your search or filters."
              : "Connect your GitHub repositories to start generating changelogs."}
          </p>
          {hasActiveFilters && (
            <Button variant="outline" className="mt-4" onClick={clearFilters}>
              Clear Filters
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {repos.map((repo) => (
              <Card key={repo.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <GitBranch className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-medium">{repo.fullName}</span>
                        <Circle
                          className={`h-2 w-2 shrink-0 fill-current ${repo.isActive ? "text-emerald-500" : "text-muted-foreground"}`}
                        />
                        {repo.language && (
                          <Badge variant="secondary" className="shrink-0 text-xs">
                            {repo.language}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {repo._count.releases} releases &middot; {repo._count.changeRecords} changes &middot; {repo.defaultBranch}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/dashboard/repositories/${repo.id}`}>
                      <Settings className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {(pagination.page - 1) * pagination.limit + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  {pagination.page} / {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage(page + 1)}
                >
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

// ─── Page ───────────────────────────────────────────────────────────────────

export default function RepositoriesPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-16 text-muted-foreground">Loading...</div>}>
      <RepositoriesContent />
    </Suspense>
  )
}
