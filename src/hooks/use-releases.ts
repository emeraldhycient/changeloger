import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api/client"

export interface ReleaseEntry {
  id: string
  category: string
  title: string
  description: string | null
  impact: string
  breaking: boolean
  sourceRecordIds: string[]
  authors: unknown[]
  position: number
  reviewed: boolean
  createdAt: string
  updatedAt: string
}

export interface Release {
  id: string
  workspaceId: string
  repositoryId: string | null
  version: string
  date: string
  tag: string | null
  status: "draft" | "published" | "archived"
  summary: string | null
  commitRange: { from: string; to: string } | null
  publishedAt: string | null
  publishedBy: string | null
  createdAt: string
  updatedAt: string
  _count?: { entries: number }
  entries?: ReleaseEntry[]
  repository?: { id: string; name: string; fullName: string } | null
  publisher?: { id: string; name: string | null; avatarUrl: string | null } | null
}

export function useReleases(workspaceId: string | undefined | null, status?: string) {
  return useQuery<Release[]>({
    queryKey: ["releases", workspaceId, status],
    queryFn: async () => {
      const params = new URLSearchParams({ workspaceId: workspaceId! })
      if (status) params.set("status", status)
      const { data } = await apiClient.get(`/api/releases?${params}`)
      return data
    },
    enabled: !!workspaceId,
  })
}

export function useRelease(releaseId: string | undefined | null) {
  return useQuery<Release>({
    queryKey: ["release", releaseId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/api/releases/${releaseId}`)
      return data
    },
    enabled: !!releaseId,
  })
}

export function useCreateRelease() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      workspaceId,
      version,
      summary,
      repositoryId,
    }: {
      workspaceId: string
      version: string
      summary?: string
      repositoryId?: string
    }) => {
      const { data } = await apiClient.post("/api/releases", {
        workspaceId,
        version,
        summary,
        repositoryId,
      })
      return data as Release
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["releases", variables.workspaceId] })
    },
  })
}

export function useDeleteRelease() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (releaseId: string) => {
      await apiClient.delete(`/api/releases/${releaseId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["releases"] })
    },
  })
}
