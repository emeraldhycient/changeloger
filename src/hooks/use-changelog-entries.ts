import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api/client"
import type { ReleaseEntry } from "@/hooks/use-releases"

export type { ReleaseEntry as ChangelogEntry }

export function useEntries(releaseId: string | undefined | null) {
  return useQuery<ReleaseEntry[]>({
    queryKey: ["entries", releaseId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/api/releases/${releaseId}/entries`)
      return data
    },
    enabled: !!releaseId,
  })
}

export function useCreateEntry() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      releaseId,
      ...entry
    }: {
      releaseId: string
      category: string
      title: string
      description?: string | null
      impact?: string
      breaking?: boolean
    }) => {
      const { data } = await apiClient.post(`/api/releases/${releaseId}/entries`, entry)
      return data as ReleaseEntry
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["entries", variables.releaseId] })
      queryClient.invalidateQueries({ queryKey: ["release", variables.releaseId] })
      queryClient.invalidateQueries({ queryKey: ["releases"] })
    },
  })
}

export function useUpdateEntry() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      releaseId,
      entryId,
      ...updates
    }: {
      releaseId: string
      entryId: string
      category?: string
      title?: string
      description?: string | null
      impact?: string
      breaking?: boolean
      reviewed?: boolean
    }) => {
      const { data } = await apiClient.patch(
        `/api/releases/${releaseId}/entries/${entryId}`,
        updates,
      )
      return data as ReleaseEntry
    },
    onMutate: async (variables) => {
      const queryKey = ["entries", variables.releaseId]
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
      queryClient.invalidateQueries({ queryKey: ["entries", variables.releaseId] })
    },
  })
}

export function useDeleteEntry() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      releaseId,
      entryId,
    }: {
      releaseId: string
      entryId: string
    }) => {
      await apiClient.delete(`/api/releases/${releaseId}/entries/${entryId}`)
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["entries", variables.releaseId] })
      queryClient.invalidateQueries({ queryKey: ["release", variables.releaseId] })
      queryClient.invalidateQueries({ queryKey: ["releases"] })
    },
  })
}

export function useReorderEntries() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      releaseId,
      orderedIds,
    }: {
      releaseId: string
      orderedIds: string[]
    }) => {
      const { data } = await apiClient.patch(
        `/api/releases/${releaseId}/entries`,
        { orderedIds },
      )
      return data as ReleaseEntry[]
    },
    onMutate: async (variables) => {
      const queryKey = ["entries", variables.releaseId]
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
      queryClient.invalidateQueries({ queryKey: ["entries", variables.releaseId] })
    },
  })
}
