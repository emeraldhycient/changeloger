import { useEffect } from "react"
import { Routes, Route, Navigate } from "react-router-dom"
import { useAuthStore } from "@/stores/auth-store"
import { AdminLayout } from "@/components/layout/admin-layout"
import { LoginPage } from "@/pages/login"
import { DashboardPage } from "@/pages/dashboard"
import { UsersPage } from "@/pages/users"
import { WorkspacesPage } from "@/pages/workspaces"
import { ActivityPage } from "@/pages/activity"

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, hydrate } = useAuthStore()
  useEffect(() => { hydrate() }, [hydrate])

  if (!localStorage.getItem("admin_token")) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/users" element={<UsersPage />} />
                <Route path="/workspaces" element={<WorkspacesPage />} />
                <Route path="/activity" element={<ActivityPage />} />
              </Routes>
            </AdminLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}
