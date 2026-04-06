"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"

export default function ImpersonatePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const token = searchParams.get("token")
    if (!token) {
      setError("No impersonation token provided.")
      return
    }

    // Set the token as a session cookie and redirect to dashboard
    async function activateSession() {
      try {
        const res = await fetch("/api/auth/impersonate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        })

        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          setError(data.error || "Failed to activate impersonation session.")
          return
        }

        // Redirect to dashboard
        router.replace("/dashboard")
      } catch {
        setError("Failed to activate impersonation session.")
      }
    }

    activateSession()
  }, [searchParams, router])

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="w-full max-w-md rounded-lg border border-red-200 bg-red-50 p-6 text-center dark:border-red-900 dark:bg-red-950">
          <h1 className="text-lg font-bold text-red-700 dark:text-red-400">Impersonation Error</h1>
          <p className="mt-2 text-sm text-red-600 dark:text-red-300">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
        <p className="mt-4 text-sm text-muted-foreground">Activating impersonation session…</p>
      </div>
    </div>
  )
}
