import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api/client"

interface Workspace {
  id: string
  name: string
  slug: string
  plan: string
  polarCustomerId: string | null
  polarSubscriptionId: string | null
  trialEndsAt: string | null
  _count: { members: number; repositories: number }
}

export function useWorkspaces() {
  return useQuery<Workspace[]>({
    queryKey: ["workspaces"],
    queryFn: async () => {
      const { data } = await apiClient.get("/api/workspaces")
      return data
    },
  })
}

export function useCreateWorkspace() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: { name: string; slug: string }) => {
      const { data: workspace } = await apiClient.post("/api/workspaces", data)
      return workspace
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] })
    },
  })
}
