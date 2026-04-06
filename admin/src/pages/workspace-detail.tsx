import { useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { cn } from "@/lib/utils"
import {
  ArrowLeft, Ban, Trash2, ChevronRight, ChevronDown,
  Users, GitBranch, FileText, Eye, Sparkles, Calendar,
} from "lucide-react"

type Tab = "overview" | "members" | "billing"

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

export function WorkspaceDetailPage() {
  const { workspaceId } = useParams<{ workspaceId: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [tab, setTab] = useState<Tab>("overview")
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showPlanMenu, setShowPlanMenu] = useState(false)

  const { data: workspace, isLoading } = useQuery({
    queryKey: ["admin-workspace", workspaceId],
    queryFn: async () => {
      const { data } = await api.get(`/api/admin/workspaces/${workspaceId}`)
      return data
    },
    enabled: !!workspaceId,
  })

  const suspendMutation = useMutation({
    mutationFn: async () => {
      const action = workspace?.isSystemSuspended ? "unsuspend" : "suspend"
      await api.patch(`/api/admin/workspaces/${workspaceId}`, { action })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-workspace", workspaceId] })
      queryClient.invalidateQueries({ queryKey: ["admin-workspaces"] })
    },
  })

  const planMutation = useMutation({
    mutationFn: async (plan: string) => {
      await api.patch(`/api/admin/workspaces/${workspaceId}`, { plan })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-workspace", workspaceId] })
      queryClient.invalidateQueries({ queryKey: ["admin-workspaces"] })
      setShowPlanMenu(false)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/api/admin/workspaces/${workspaceId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-workspaces"] })
      navigate("/workspaces")
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

  if (!workspace) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-muted-foreground">Workspace not found</p>
        <button onClick={() => navigate("/workspaces")} className="mt-4 text-sm text-primary hover:underline">
          Back to Workspaces
        </button>
      </div>
    )
  }

  const aiUsed = workspace.aiGenerationsUsed ?? 0
  const aiLimit = workspace.aiGenerationsLimit ?? 100
  const aiPercent = aiLimit > 0 ? Math.min(100, Math.round((aiUsed / aiLimit) * 100)) : 0

  const members = workspace.members ?? workspace.workspaceMembers ?? []
  const counts = workspace._count || {}

  const statItems = [
    { label: "Members", value: counts.members ?? members.length ?? 0, icon: Users },
    { label: "Repositories", value: counts.repositories ?? 0, icon: GitBranch },
    { label: "Releases", value: counts.releases ?? 0, icon: FileText },
    { label: "Widgets", value: counts.widgets ?? 0, icon: Eye },
    { label: "Changes", value: counts.changes ?? counts.changelogs ?? 0, icon: FileText },
  ]

  const plans = ["free", "pro", "team", "enterprise"]

  const tabs: { key: Tab; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "members", label: "Members" },
    { key: "billing", label: "Billing" },
  ]

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link to="/workspaces" className="hover:text-foreground">Workspaces</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground">{workspace.name}</span>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/workspaces")} className="rounded-md border border-border p-2 hover:bg-muted">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold">{workspace.name}</h1>
            <p className="text-sm text-muted-foreground">{workspace.slug}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Plan selector */}
          <div className="relative">
            <button
              onClick={() => setShowPlanMenu(!showPlanMenu)}
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted"
            >
              Change Plan
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
            {showPlanMenu && (
              <div className="absolute right-0 top-full z-10 mt-1 w-36 rounded-md border border-border bg-card py-1 shadow-lg">
                {plans.map((p) => (
                  <button
                    key={p}
                    onClick={() => planMutation.mutate(p)}
                    className={cn(
                      "w-full px-3 py-1.5 text-left text-sm capitalize hover:bg-muted",
                      workspace.plan === p && "font-medium text-primary",
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={() => suspendMutation.mutate()}
            disabled={suspendMutation.isPending}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              workspace.isSystemSuspended
                ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
                : "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20",
            )}
          >
            <Ban className="h-3.5 w-3.5" />
            {workspace.isSystemSuspended ? "Unsuspend" : "Suspend"}
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

      {workspace.isSystemSuspended && (
        <div className="rounded-md border border-red-500/20 bg-red-500/5 px-4 py-2 text-sm text-red-500">
          This workspace is currently suspended.
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

      {/* Overview */}
      {tab === "overview" && (
        <div className="space-y-6">
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Owner info */}
            <div className="space-y-4 rounded-lg border border-border p-5">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Owner</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold">
                    {(workspace.owner?.name || workspace.owner?.email || "?").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{workspace.owner?.name || "—"}</p>
                    <p className="text-xs text-muted-foreground">{workspace.owner?.email || "—"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn("inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize", planColors[workspace.plan] || "")}>
                    {workspace.plan}
                  </span>
                  {workspace.trialEndsAt && new Date(workspace.trialEndsAt) > new Date() && (
                    <span className="inline-flex rounded-full bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-400">
                      Trial
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  Created {new Date(workspace.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* AI Usage */}
            <div className="space-y-4 rounded-lg border border-border p-5">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">AI Usage</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-muted-foreground" />
                    Generations
                  </span>
                  <span className="font-medium">{aiUsed} / {aiLimit}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      aiPercent >= 90 ? "bg-red-500" : aiPercent >= 70 ? "bg-amber-500" : "bg-primary",
                    )}
                    style={{ width: `${aiPercent}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">{aiPercent}% used</p>
              </div>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {statItems.map((s) => (
              <div key={s.label} className="rounded-lg border border-border p-4 text-center">
                <s.icon className="mx-auto h-5 w-5 text-muted-foreground" />
                <p className="mt-2 text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Members */}
      {tab === "members" && (
        <div className="rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Email</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Role</th>
              </tr>
            </thead>
            <tbody>
              {members.length === 0 ? (
                <tr><td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">No members</td></tr>
              ) : (
                members.map((m: any) => {
                  const u = m.user || m
                  return (
                    <tr key={m.id || u.id} className="border-b border-border hover:bg-muted/30">
                      <td className="px-4 py-3 font-medium">{u.name || "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{u.email || "—"}</td>
                      <td className="px-4 py-3">
                        <span className={cn("inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize", roleColors[m.role] || "bg-gray-500/10 text-gray-400")}>
                          {m.role}
                        </span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Billing */}
      {tab === "billing" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4 rounded-lg border border-border p-5">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Plan Details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Current Plan</span>
                <span className={cn("inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize", planColors[workspace.plan] || "")}>
                  {workspace.plan}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Polar Customer ID</span>
                <span className="font-mono text-xs">{workspace.polarCustomerId || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subscription ID</span>
                <span className="font-mono text-xs">{workspace.polarSubscriptionId || "—"}</span>
              </div>
            </div>
          </div>
          <div className="space-y-4 rounded-lg border border-border p-5">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Trial & Usage</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Trial Start</span>
                <span>{workspace.trialStartedAt ? new Date(workspace.trialStartedAt).toLocaleDateString() : "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Trial End</span>
                <span>{workspace.trialEndsAt ? new Date(workspace.trialEndsAt).toLocaleDateString() : "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">AI Generations</span>
                <span>{aiUsed} / {aiLimit}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-lg">
            <h2 className="text-lg font-bold">Delete Workspace</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Are you sure you want to delete <strong>{workspace.name}</strong>? This will remove all associated data. This action cannot be undone.
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
