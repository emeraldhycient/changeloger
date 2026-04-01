import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api/client"

interface AuthUser {
  id: string
  email: string
  name: string | null
  avatarUrl: string | null
  providers: string[]
}

export function useAuth() {
  return useQuery<AuthUser | null>({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get("/api/auth/me")
        return data
      } catch {
        return null
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  })
}

export function useLogout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      await apiClient.post("/api/auth/logout")
    },
    onSuccess: () => {
      queryClient.setQueryData(["auth", "me"], null)
      // Clear persisted workspace to prevent data leaking to next user
      localStorage.removeItem("changeloger_workspace_id")
      window.location.href = "/"
    },
  })
}
