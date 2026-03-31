import axios from "axios"

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
})

let isRefreshing = false
let refreshPromise: Promise<boolean> | null = null

async function attemptRefresh(): Promise<boolean> {
  try {
    await axios.post("/api/auth/refresh", {}, { withCredentials: true })
    return true
  } catch {
    return false
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // If 401 and we haven't tried refreshing yet, attempt silent refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      if (!isRefreshing) {
        isRefreshing = true
        refreshPromise = attemptRefresh()
      }

      const refreshed = await refreshPromise
      isRefreshing = false
      refreshPromise = null

      if (refreshed) {
        // Retry the original request with refreshed token
        return apiClient(originalRequest)
      }

      // Refresh failed — redirect to sign-in
      if (typeof window !== "undefined") {
        window.location.href = `/sign-in?redirect=${encodeURIComponent(window.location.pathname)}`
      }
    }

    // Handle 402 (billing limit)
    if (error.response?.status === 402 && typeof window !== "undefined") {
      // Could show an upgrade modal here
      console.warn("Plan limit reached:", error.response.data)
    }

    return Promise.reject(error)
  },
)

export { apiClient }
