import { useEffect } from "react"
import { Routes, Route, Navigate } from "react-router-dom"
import { useAuthStore } from "@/stores/auth-store"
import { AdminLayout } from "@/components/layout/admin-layout"
import { LoginPage } from "@/pages/login"
import { DashboardPage } from "@/pages/dashboard"
import { UsersPage } from "@/pages/users"
import { UserDetailPage } from "@/pages/user-detail"
import { WorkspacesPage } from "@/pages/workspaces"
import { WorkspaceDetailPage } from "@/pages/workspace-detail"
import { ActivityPage } from "@/pages/activity"
import { AnalyticsPage } from "@/pages/analytics"
import { BillingPage } from "@/pages/billing"
import { AdminsPage } from "@/pages/admins"
import { SystemPage } from "@/pages/system"

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
                <Route path="/users/:userId" element={<UserDetailPage />} />
                <Route path="/workspaces" element={<WorkspacesPage />} />
                <Route path="/workspaces/:workspaceId" element={<WorkspaceDetailPage />} />
                <Route path="/activity" element={<ActivityPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/billing" element={<BillingPage />} />
                <Route path="/admins" element={<AdminsPage />} />
                <Route path="/system" element={<SystemPage />} />
              </Routes>
            </AdminLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}
