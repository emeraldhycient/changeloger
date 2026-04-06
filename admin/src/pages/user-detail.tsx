import { useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { cn } from "@/lib/utils"
import {
  ArrowLeft, User, Ban, Trash2, ChevronRight,
  Mail, Calendar, Shield, Clock,
} from "lucide-react"

type Tab = "profile" | "workspaces" | "activity"

const planColors: Record<string, string> = {
  free: "bg-gray-500/10 text-gray-400",
  pro: "bg-blue-500/10 text-blue-400",
  team: "bg-violet-500/10 text-violet-400",
  enterprise: "bg-amber-500/10 text-amber-400",
}

const roleColors: Record<string, string> = {
  owner: "bg-amber-500/10 text-amber-400",
  admin: "bg-violet-500/10 text-violet-400",
  member: "bg-blue-500/10 text-blue-400",
  viewer: "bg-gray-500/10 text-gray-400",
}

export function UserDetailPage() {
  const { userId } = useParams<{ userId: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [tab, setTab] = useState<Tab>("profile")
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const { data: user, isLoading } = useQuery({
    queryKey: ["admin-user", userId],
    queryFn: async () => {
      const { data } = await api.get(`/api/admin/users/${userId}`)
      return data.user || data
    },
    enabled: !!userId,
  })

  const { data: activityData } = useQuery({
    queryKey: ["admin-user-activity", userId],
    queryFn: async () => {
      const { data } = await api.get(`/api/admin/users/${userId}/activity`)
      return data
    },
    enabled: !!userId && tab === "activity",
  })

  const suspendMutation = useMutation({
    mutationFn: async () => {
      const action = user?.isSystemSuspended ? "unsuspend" : "suspend"
      await api.post(`/api/admin/users/${userId}/${action}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-user", userId] })
      queryClient.invalidateQueries({ queryKey: ["admin-users"] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/api/admin/users/${userId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] })
      navigate("/users")
    },
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="h-64 animate-pulse rounded-lg bg-muted/50" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-muted-foreground">User not found</p>
        <button onClick={() => navigate("/users")} className="mt-4 text-sm text-primary hover:underline">
          Back to Users
        </button>
      </div>
    )
  }

  // Map API response { recentReleases, recentEntries, workspaceMemberships } into unified activity list
  const activities: any[] = (() => {
    if (!activityData) return []
    if (Array.isArray(activityData)) return activityData
    if (activityData.activities) return activityData.activities
    const unified: any[] = []
    if (activityData.recentReleases) {
      for (const r of activityData.recentReleases) {
        unified.push({ id: r.id, action: "Published release", targetType: r.title || "release", createdAt: r.createdAt || r.publishedAt })
      }
    }
    if (activityData.recentEntries) {
      for (const e of activityData.recentEntries) {
        unified.push({ id: e.id, action: "Created entry", targetType: e.title || "entry", createdAt: e.createdAt })
      }
    }
    if (activityData.workspaceMemberships) {
      for (const m of activityData.workspaceMemberships) {
        unified.push({ id: m.id, action: `Joined workspace`, targetType: m.workspace?.name || m.workspaceName || "workspace", createdAt: m.createdAt })
      }
    }
    return unified.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  })()

  const tabs: { key: Tab; label: string }[] = [
    { key: "profile", label: "Profile" },
    { key: "workspaces", label: "Workspaces" },
    { key: "activity", label: "Activity" },
  ]

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link to="/users" className="hover:text-foreground">Users</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground">{user.name || user.email}</span>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/users")} className="rounded-md border border-border p-2 hover:bg-muted">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
              {(user.name || user.email || "?").charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold">{user.name || "Unnamed User"}</h1>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => suspendMutation.mutate()}
            disabled={suspendMutation.isPending}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              user.isSystemSuspended
                ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
                : "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20",
            )}
          >
            <Ban className="h-3.5 w-3.5" />
            {user.isSystemSuspended ? "Unsuspend" : "Suspend"}
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="inline-flex items-center gap-1.5 rounded-md bg-red-500/10 px-3 py-1.5 text-sm font-medium text-red-500 hover:bg-red-500/20"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        </div>
      </div>

      {/* Status badge */}
      {user.isSystemSuspended && (
        <div className="rounded-md border border-red-500/20 bg-red-500/5 px-4 py-2 text-sm text-red-500">
          This user is currently suspended.
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "border-b-2 px-4 py-2 text-sm font-medium transition-colors",
              tab === t.key
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === "profile" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4 rounded-lg border border-border p-5">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Details</h3>
            <div className="space-y-3">
              <InfoRow icon={User} label="Name" value={user.name || "Not set"} />
              <InfoRow icon={Mail} label="Email" value={user.email} />
              <InfoRow icon={Calendar} label="Joined" value={new Date(user.createdAt).toLocaleDateString()} />
              <InfoRow icon={Clock} label="Last Login" value={user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : "Never"} />
              <InfoRow icon={Shield} label="Status" value={user.isSystemSuspended ? "Suspended" : "Active"} />
            </div>
          </div>
          <div className="space-y-4 rounded-lg border border-border p-5">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">OAuth Providers</h3>
            {user.accounts && user.accounts.length > 0 ? (
              <div className="space-y-2">
                {user.accounts.map((acct: any, i: number) => (
                  <div key={i} className="flex items-center gap-2 rounded-md bg-muted/50 px-3 py-2 text-sm">
                    <span className="font-medium capitalize">{acct.provider}</span>
                    {acct.providerUserId && (
                      <span className="text-xs text-muted-foreground">({acct.providerUserId})</span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No OAuth providers linked</p>
            )}
          </div>
        </div>
      )}

      {tab === "workspaces" && (
        <div className="rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Workspace</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Role</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Plan</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(user.workspaceMembers ?? user.memberships ?? []).length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">No workspace memberships</td></tr>
              ) : (
                (user.workspaceMembers ?? user.memberships ?? []).map((m: any) => {
                  const ws = m.workspace || m
                  return (
                    <tr key={m.id || ws.id} className="border-b border-border hover:bg-muted/30">
                      <td className="px-4 py-3 font-medium">{ws.name || ws.slug || "—"}</td>
                      <td className="px-4 py-3">
                        <span className={cn("inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize", roleColors[m.role] || "bg-gray-500/10 text-gray-400")}>
                          {m.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn("inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize", planColors[ws.plan] || "")}>
                          {ws.plan || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Link to={`/workspaces/${ws.id}`} className="text-sm text-primary hover:underline">
                          View
                        </Link>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === "activity" && (
        <div className="space-y-2">
          {(Array.isArray(activities) ? activities : []).length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16">
              <Clock className="h-10 w-10 text-muted-foreground" />
              <p className="mt-3 text-sm text-muted-foreground">No activity recorded</p>
            </div>
          ) : (
            (activities as any[]).map((entry: any, i: number) => (
              <div key={entry.id || i} className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
                <div>
                  <p className="text-sm font-medium">{entry.action}</p>
                  <p className="text-xs text-muted-foreground">{entry.targetType || entry.resource || ""}</p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {entry.createdAt ? new Date(entry.createdAt).toLocaleString() : ""}
                </span>
              </div>
            ))
          )}
        </div>
      )}

      {/* Delete confirmation dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-lg">
            <h2 className="text-lg font-bold">Delete User</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Are you sure you want to delete <strong>{user.name || user.email}</strong>? This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={() => { deleteMutation.mutate(); setShowDeleteConfirm(false) }}
                disabled={deleteMutation.isPending}
                className="rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
      <span className="text-sm text-muted-foreground w-24 shrink-0">{label}</span>
      <span className="text-sm">{value}</span>
    </div>
  )
}
