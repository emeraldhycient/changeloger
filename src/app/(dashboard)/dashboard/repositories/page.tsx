"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { CheckCircle2, AlertCircle, AlertTriangle, RefreshCw, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { apiClient } from "@/lib/api/client"
import { useWorkspaceStore } from "@/stores/workspace-store"
import { GitHubConnectButton } from "@/components/dashboard/github-connect-button"
import { RepositoryList } from "@/components/dashboard/repository-list"

const ERROR_MESSAGES: Record<string, string> = {
  invalid_callback: "Invalid callback from GitHub. Please try connecting again.",
  no_workspace: "No workspace found. Create a workspace first, then connect GitHub.",
  installation_failed: "GitHub installation failed. Please try again.",
}

function RepositoriesContent() {
  const workspaceId = useWorkspaceStore((s) => s.currentWorkspaceId)
  const queryClient = useQueryClient()
  const searchParams = useSearchParams()

  const setup = searchParams.get("setup")
  const error = searchParams.get("error")
  const syncWarning = searchParams.get("sync_warning")

  const { data: repositories = [], isLoading } = useQuery({
    queryKey: ["repositories", workspaceId],
    queryFn: async () => {
      if (!workspaceId) return []
      const { data } = await apiClient.get(`/api/repositories?workspaceId=${workspaceId}`)
      return data
    },
    enabled: !!workspaceId,
  })

  const syncRepos = useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post("/api/github/sync", { workspaceId })
      return data as { synced: number; method: string }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["repositories", workspaceId] })
    },
  })

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8 flex items-center justify-between">
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

      {/* Success banner */}
      {setup === "complete" && (
        <div className="mb-6 flex items-start gap-3 rounded border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
          <div>
            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
              GitHub connected successfully!
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {syncWarning
                ? "Your repositories were linked but some may still be syncing. Refresh in a moment."
                : "Your repositories have been synced and are ready to use."}
            </p>
          </div>
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className="mb-6 flex items-start gap-3 rounded border border-destructive/20 bg-destructive/5 px-4 py-3">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
          <div>
            <p className="text-sm font-medium text-destructive">
              Connection failed
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {ERROR_MESSAGES[error] || "An unexpected error occurred. Please try again."}
            </p>
          </div>
        </div>
      )}

      {/* No workspace selected */}
      {!workspaceId && (
        <div className="mb-6 flex items-start gap-3 rounded border border-amber-500/20 bg-amber-500/5 px-4 py-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
          <div>
            <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
              No workspace selected
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Select a workspace from the sidebar to view repositories.
            </p>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-lg bg-muted/50" />
          ))}
        </div>
      ) : (
        <RepositoryList repositories={repositories} />
      )}
    </div>
  )
}

export default function RepositoriesPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-16 text-muted-foreground">Loading...</div>}>
      <RepositoriesContent />
    </Suspense>
  )
}
