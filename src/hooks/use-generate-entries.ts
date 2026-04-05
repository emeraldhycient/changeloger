import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api/client"
import type { GenerateResult } from "@/types/models"

export function useUnprocessedCount(releaseId: string | undefined | null) {
  return useQuery<{ unprocessedCount: number }>({
    queryKey: ["unprocessed-count", releaseId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/api/releases/${releaseId}/generate`)
      return data
    },
    enabled: !!releaseId,
    refetchInterval: 30000, // Check for new changes every 30s
  })
}

export function useGenerateEntries() {
  const queryClient = useQueryClient()

  return useMutation<GenerateResult, Error, { releaseId: string; repositoryId?: string; useAI?: boolean }>({
    mutationFn: async ({ releaseId, ...body }) => {
      const { data } = await apiClient.post(`/api/releases/${releaseId}/generate`, body)
      return data
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["entries", variables.releaseId] })
      queryClient.invalidateQueries({ queryKey: ["release", variables.releaseId] })
      queryClient.invalidateQueries({ queryKey: ["releases"] })
      queryClient.invalidateQueries({ queryKey: ["unprocessed-count", variables.releaseId] })
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] })
      queryClient.invalidateQueries({ queryKey: ["activity-changes"] })
    },
  })
}
