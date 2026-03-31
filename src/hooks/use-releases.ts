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
  repositoryId: string
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
  publisher?: { id: string; name: string | null; avatarUrl: string | null } | null
}

export function useReleases(repositoryId: string | undefined, status?: string) {
  return useQuery<Release[]>({
    queryKey: ["releases", repositoryId, status],
    queryFn: async () => {
      const params = status ? `?status=${status}` : ""
      const { data } = await apiClient.get(`/api/repositories/${repositoryId}/releases${params}`)
      return data
    },
    enabled: !!repositoryId,
  })
}

export function useRelease(repositoryId: string | undefined, version: string | undefined) {
  return useQuery<Release>({
    queryKey: ["release", repositoryId, version],
    queryFn: async () => {
      const { data } = await apiClient.get(
        `/api/repositories/${repositoryId}/releases/${encodeURIComponent(version!)}`,
      )
      return data
    },
    enabled: !!repositoryId && !!version,
  })
}

export function useCreateRelease() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      repositoryId,
      version,
      summary,
    }: {
      repositoryId: string
      version: string
      summary?: string
    }) => {
      const { data } = await apiClient.post(`/api/repositories/${repositoryId}/releases`, {
        version,
        summary,
      })
      return data as Release
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["releases", variables.repositoryId] })
    },
  })
}
