"use client"

import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api/client"
import { useWorkspaceStore } from "@/stores/workspace-store"
import { GitHubConnectButton } from "@/components/dashboard/github-connect-button"
import { RepositoryList } from "@/components/dashboard/repository-list"

export default function RepositoriesPage() {
  const workspaceId = useWorkspaceStore((s) => s.currentWorkspaceId)

  const { data: repositories = [], isLoading } = useQuery({
    queryKey: ["repositories", workspaceId],
    queryFn: async () => {
      if (!workspaceId) return []
      const { data } = await apiClient.get(`/api/repositories?workspaceId=${workspaceId}`)
      return data
    },
    enabled: !!workspaceId,
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
        <GitHubConnectButton />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          Loading repositories...
        </div>
      ) : (
        <RepositoryList repositories={repositories} />
      )}
    </div>
  )
}
