import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api/client"
import type { ReleaseEntry } from "@/hooks/use-releases"

export type { ReleaseEntry as ChangelogEntry }

export function useEntries(repositoryId: string | undefined, version: string | undefined) {
  return useQuery<ReleaseEntry[]>({
    queryKey: ["entries", repositoryId, version],
    queryFn: async () => {
      const { data } = await apiClient.get(
        `/api/repositories/${repositoryId}/releases/${encodeURIComponent(version!)}/entries`,
      )
      return data
    },
    enabled: !!repositoryId && !!version,
  })
}

export function useCreateEntry() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      repositoryId,
      version,
      ...entry
    }: {
      repositoryId: string
      version: string
      category: string
      title: string
      description?: string | null
      impact?: string
      breaking?: boolean
    }) => {
      const { data } = await apiClient.post(
        `/api/repositories/${repositoryId}/releases/${encodeURIComponent(version)}/entries`,
        entry,
      )
      return data as ReleaseEntry
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["entries", variables.repositoryId, variables.version],
      })
      queryClient.invalidateQueries({
        queryKey: ["release", variables.repositoryId, variables.version],
      })
      queryClient.invalidateQueries({
        queryKey: ["releases", variables.repositoryId],
      })
    },
  })
}

export function useUpdateEntry() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      repositoryId,
      version,
      entryId,
      ...updates
    }: {
      repositoryId: string
      version: string
      entryId: string
      category?: string
      title?: string
      description?: string | null
      impact?: string
      breaking?: boolean
      reviewed?: boolean
    }) => {
      const { data } = await apiClient.patch(
        `/api/repositories/${repositoryId}/releases/${encodeURIComponent(version)}/entries/${entryId}`,
        updates,
      )
      return data as ReleaseEntry
    },
    onMutate: async (variables) => {
      const queryKey = ["entries", variables.repositoryId, variables.version]
      await queryClient.cancelQueries({ queryKey })

      const previousEntries = queryClient.getQueryData<ReleaseEntry[]>(queryKey)

      queryClient.setQueryData<ReleaseEntry[]>(queryKey, (old) =>
        old?.map((entry) =>
          entry.id === variables.entryId
            ? { ...entry, ...variables }
            : entry,
        ),
      )

      return { previousEntries, queryKey }
    },
    onError: (_error, _variables, context) => {
      if (context?.previousEntries) {
        queryClient.setQueryData(context.queryKey, context.previousEntries)
      }
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["entries", variables.repositoryId, variables.version],
      })
    },
  })
}

export function useDeleteEntry() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      repositoryId,
      version,
      entryId,
    }: {
      repositoryId: string
      version: string
      entryId: string
    }) => {
      await apiClient.delete(
        `/api/repositories/${repositoryId}/releases/${encodeURIComponent(version)}/entries/${entryId}`,
      )
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["entries", variables.repositoryId, variables.version],
      })
      queryClient.invalidateQueries({
        queryKey: ["release", variables.repositoryId, variables.version],
      })
      queryClient.invalidateQueries({
        queryKey: ["releases", variables.repositoryId],
      })
    },
  })
}

export function useReorderEntries() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      repositoryId,
      version,
      orderedIds,
    }: {
      repositoryId: string
      version: string
      orderedIds: string[]
    }) => {
      const { data } = await apiClient.patch(
        `/api/repositories/${repositoryId}/releases/${encodeURIComponent(version)}/entries`,
        { orderedIds },
      )
      return data as ReleaseEntry[]
    },
    onMutate: async (variables) => {
      const queryKey = ["entries", variables.repositoryId, variables.version]
      await queryClient.cancelQueries({ queryKey })

      const previousEntries = queryClient.getQueryData<ReleaseEntry[]>(queryKey)

      queryClient.setQueryData<ReleaseEntry[]>(queryKey, (old) => {
        if (!old) return old
        const entryMap = new Map(old.map((e) => [e.id, e]))
        return variables.orderedIds
          .map((id, index) => {
            const entry = entryMap.get(id)
            return entry ? { ...entry, position: index } : undefined
          })
          .filter(Boolean) as ReleaseEntry[]
      })

      return { previousEntries, queryKey }
    },
    onError: (_error, _variables, context) => {
      if (context?.previousEntries) {
        queryClient.setQueryData(context.queryKey, context.previousEntries)
      }
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["entries", variables.repositoryId, variables.version],
      })
    },
  })
}
