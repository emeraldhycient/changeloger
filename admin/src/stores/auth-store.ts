import { create } from "zustand"
import { api } from "@/lib/api"

interface AdminUser {
  id: string
  email: string
  name: string
  role: string
}

interface AuthState {
  admin: AdminUser | null
  token: string | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  fetchMe: () => Promise<void>
  hydrate: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  admin: null,
  token: null,
  isAuthenticated: false,

  login: async (email, password) => {
    const { data } = await api.post("/api/admin/auth/login", { email, password })
    localStorage.setItem("admin_token", data.token)
    set({ admin: data.admin, token: data.token, isAuthenticated: true })
  },

  logout: () => {
    localStorage.removeItem("admin_token")
    set({ admin: null, token: null, isAuthenticated: false })
    window.location.href = "/login"
  },

  fetchMe: async () => {
    try {
      const { data } = await api.get("/api/admin/auth/me")
      set({ admin: data, isAuthenticated: true })
    } catch {
      localStorage.removeItem("admin_token")
      set({ admin: null, token: null, isAuthenticated: false })
    }
  },

  hydrate: () => {
    const token = localStorage.getItem("admin_token")
    if (token) {
      set({ token, isAuthenticated: true })
    }
  },
}))
