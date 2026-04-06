import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { api } from "@/lib/api"
import { cn } from "@/lib/utils"
import { timeAgo } from "@/lib/format"
import { ConfirmDialog } from "@/components/confirm-dialog"
import {
  ArrowLeft, Ban, Trash2, ChevronRight, ChevronDown,
  Users, GitBranch, FileText, Eye, Sparkles, Calendar, Clock, UserMinus,
  ToggleLeft, ToggleRight, Save, StickyNote,
} from "lucide-react"
import { useAuthStore } from "@/stores/auth-store"
import { canPerform } from "@/lib/permissions"

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
  const [showTrialDialog, setShowTrialDialog] = useState(false)
  const [trialDays, setTrialDays] = useState<number | "">("")
  const [trialPreset, setTrialPreset] = useState<number | null>(null)
  const [removeMemberConfirm, setRemoveMemberConfirm] = useState<{ open: boolean; memberId: string; name: string }>({ open: false, memberId: "", name: "" })
  const { admin } = useAuthStore()
  const canEdit = canPerform(admin?.role || "", "admin")
  const [adminNotes, setAdminNotes] = useState("")
  const [notesLoaded, setNotesLoaded] = useState(false)

  const { data: workspace, isLoading } = useQuery({
    queryKey: ["admin-workspace", workspaceId],
    queryFn: async () => {
      const { data } = await api.get(`/api/admin/workspaces/${workspaceId}`)
      return data.workspace || data
    },
    enabled: !!workspaceId,
  })

  const suspendMutation = useMutation({
    mutationFn: async () => {
      const action = workspace?.isSystemSuspended ? "unsuspend" : "suspend"
      await api.post(`/api/admin/workspaces/${workspaceId}/${action}`)
    },
    onSuccess: () => {
      toast.success(workspace?.isSystemSuspended ? "Workspace unsuspended successfully" : "Workspace suspended successfully")
      queryClient.invalidateQueries({ queryKey: ["admin-workspace", workspaceId] })
      queryClient.invalidateQueries({ queryKey: ["admin-workspaces"] })
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || "Failed to update workspace status")
    },
  })

  const planMutation = useMutation({
    mutationFn: async (plan: string) => {
      await api.patch(`/api/admin/workspaces/${workspaceId}/plan`, { plan })
    },
    onSuccess: (_data, plan) => {
      toast.success(`Plan changed to ${plan} successfully`)
      queryClient.invalidateQueries({ queryKey: ["admin-workspace", workspaceId] })
      queryClient.invalidateQueries({ queryKey: ["admin-workspaces"] })
      setShowPlanMenu(false)
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || "Failed to change plan")
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/api/admin/workspaces/${workspaceId}`)
    },
    onSuccess: () => {
      toast.success("Workspace deleted successfully")
      queryClient.invalidateQueries({ queryKey: ["admin-workspaces"] })
      navigate("/workspaces")
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || "Failed to delete workspace")
    },
  })

  const trialMutation = useMutation({
    mutationFn: async (days: number) => {
      await api.patch(`/api/admin/workspaces/${workspaceId}/trial`, { days })
    },
    onSuccess: () => {
      toast.success("Trial updated successfully")
      queryClient.invalidateQueries({ queryKey: ["admin-workspace", workspaceId] })
      setShowTrialDialog(false)
      setTrialDays("")
      setTrialPreset(null)
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || "Failed to update trial")
    },
  })

  const removeMemberMutation = useMutation({
    mutationFn: async (memberId: string) => {
      await api.delete(`/api/admin/workspaces/${workspaceId}/members/${memberId}`)
    },
    onSuccess: () => {
      toast.success("Member removed successfully")
      queryClient.invalidateQueries({ queryKey: ["admin-workspace", workspaceId] })
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || "Failed to remove member")
    },
  })

  // Feature flags
  const { data: featuresData } = useQuery({
    queryKey: ["admin-workspace-features", workspaceId],
    queryFn: async () => {
      const { data } = await api.get(`/api/admin/workspaces/${workspaceId}/features`)
      return data.features as Record<string, boolean>
    },
    enabled: !!workspaceId,
  })

  const featuresMutation = useMutation({
    mutationFn: async (features: Record<string, boolean>) => {
      await api.patch(`/api/admin/workspaces/${workspaceId}/features`, { features })
    },
    onSuccess: () => {
      toast.success("Feature flags updated")
      queryClient.invalidateQueries({ queryKey: ["admin-workspace-features", workspaceId] })
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || "Failed to update feature flags")
    },
  })

  const toggleFeature = (key: string) => {
    const current = featuresData || { aiEnabled: true, widgetsEnabled: true, teamEnabled: true }
    featuresMutation.mutate({ [key]: !current[key] })
  }

  // Admin notes
  const notesMutation = useMutation({
    mutationFn: async (notes: string) => {
      await api.patch(`/api/admin/workspaces/${workspaceId}`, { adminNotes: notes })
    },
    onSuccess: () => {
      toast.success("Notes saved")
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || "Failed to save notes")
    },
  })

  // Sync admin notes from workspace config
  useEffect(() => {
    if (workspace && !notesLoaded) {
      const config = workspace.widgetTheme || {}
      setAdminNotes((config as Record<string, unknown>)?._adminNotes as string || "")
      setNotesLoaded(true)
    }
  }, [workspace, notesLoaded])

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
  ]

  const plans = ["free", "pro", "team", "enterprise"]

  const tabs: { key: Tab; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "members", label: "Members" },
    { key: "billing", label: "Billing" },
  ]

  const effectiveTrialDays = trialPreset ?? (typeof trialDays === "number" ? trialDays : 0)

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
        {canEdit && (
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
        )}
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
                    <p className="text-sm font-medium">{workspace.owner?.name || "\u2014"}</p>
                    <p className="text-xs text-muted-foreground">{workspace.owner?.email || "\u2014"}</p>
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
                  <span title={new Date(workspace.createdAt).toLocaleString()}>
                    Created {timeAgo(workspace.createdAt)}
                  </span>
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

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Feature Flags */}
            <div className="space-y-4 rounded-lg border border-border p-5">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Feature Flags</h3>
              <div className="space-y-3">
                {([
                  { key: "aiEnabled", label: "AI Generation", desc: "Allow AI-powered changelog generation" },
                  { key: "widgetsEnabled", label: "Widget Creation", desc: "Allow creating embeddable widgets" },
                  { key: "teamEnabled", label: "Team Invitations", desc: "Allow inviting team members" },
                ] as const).map((flag) => {
                  const features = featuresData || { aiEnabled: true, widgetsEnabled: true, teamEnabled: true }
                  const enabled = features[flag.key] !== false
                  return (
                    <div key={flag.key} className="flex items-center justify-between rounded-md bg-muted/30 px-3 py-2.5">
                      <div>
                        <p className="text-sm font-medium">{flag.label}</p>
                        <p className="text-xs text-muted-foreground">{flag.desc}</p>
                      </div>
                      <button
                        onClick={() => toggleFeature(flag.key)}
                        disabled={featuresMutation.isPending || !canEdit}
                        className="shrink-0"
                        title={enabled ? "Disable" : "Enable"}
                      >
                        {enabled ? (
                          <ToggleRight className="h-6 w-6 text-emerald-500" />
                        ) : (
                          <ToggleLeft className="h-6 w-6 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Admin Notes */}
            <div className="space-y-4 rounded-lg border border-border p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <StickyNote className="h-3.5 w-3.5" />
                  Admin Notes
                </h3>
                <button
                  onClick={() => notesMutation.mutate(adminNotes)}
                  disabled={notesMutation.isPending || !canEdit}
                  className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted disabled:opacity-50"
                >
                  <Save className="h-3 w-3" />
                  {notesMutation.isPending ? "Saving..." : "Save Notes"}
                </button>
              </div>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                disabled={!canEdit}
                placeholder="Add internal notes about this workspace..."
                rows={5}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-ring disabled:opacity-50"
              />
            </div>
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
                <th className="px-4 py-3 text-left font-medium text-muted-foreground w-20">Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">No members</td></tr>
              ) : (
                members.map((m: any) => {
                  const u = m.user || m
                  const isOwner = m.role === "owner"
                  return (
                    <tr key={m.id || u.id} className="border-b border-border hover:bg-muted/30">
                      <td className="px-4 py-3 font-medium">{u.name || "\u2014"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{u.email || "\u2014"}</td>
                      <td className="px-4 py-3">
                        <span className={cn("inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize", roleColors[m.role] || "bg-gray-500/10 text-gray-400")}>
                          {m.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {!isOwner && (
                          <button
                            onClick={() => setRemoveMemberConfirm({ open: true, memberId: m.id, name: u.name || u.email })}
                            disabled={removeMemberMutation.isPending}
                            className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs text-red-500 hover:bg-red-500/10"
                          >
                            <UserMinus className="h-3 w-3" />
                            Remove
                          </button>
                        )}
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
                <span className="font-mono text-xs">{workspace.polarCustomerId || "\u2014"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subscription ID</span>
                <span className="font-mono text-xs">{workspace.polarSubscriptionId || "\u2014"}</span>
              </div>
            </div>
          </div>
          <div className="space-y-4 rounded-lg border border-border p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Trial & Usage</h3>
              <button
                onClick={() => setShowTrialDialog(true)}
                className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted"
              >
                <Clock className="h-3 w-3" />
                Extend Trial
              </button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Trial Start</span>
                <span title={workspace.trialStartedAt ? new Date(workspace.trialStartedAt).toLocaleString() : ""}>
                  {workspace.trialStartedAt ? timeAgo(workspace.trialStartedAt) : "\u2014"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Trial End</span>
                <span title={workspace.trialEndsAt ? new Date(workspace.trialEndsAt).toLocaleString() : ""}>
                  {workspace.trialEndsAt ? new Date(workspace.trialEndsAt).toLocaleDateString() : "\u2014"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">AI Generations</span>
                <span>{aiUsed} / {aiLimit}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => { deleteMutation.mutate(); setShowDeleteConfirm(false) }}
        title="Delete Workspace"
        description={`Are you sure you want to delete "${workspace.name}"? This will remove all associated data. This action cannot be undone.`}
        confirmText="Delete"
        typeToConfirm={workspace.name}
        destructive
        loading={deleteMutation.isPending}
      />

      <ConfirmDialog
        open={removeMemberConfirm.open}
        onClose={() => setRemoveMemberConfirm({ open: false, memberId: "", name: "" })}
        onConfirm={() => {
          removeMemberMutation.mutate(removeMemberConfirm.memberId)
          setRemoveMemberConfirm({ open: false, memberId: "", name: "" })
        }}
        title="Remove Member"
        description={`Are you sure you want to remove "${removeMemberConfirm.name}" from this workspace?`}
        confirmText="Remove"
        destructive
        loading={removeMemberMutation.isPending}
      />

      {/* Extend Trial dialog */}
      {showTrialDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-lg">
            <h2 className="text-lg font-bold">Extend Trial</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Choose a preset or enter custom days to extend the trial for <strong>{workspace.name}</strong>.
            </p>
            <div className="mt-4 flex gap-2">
              {[7, 14, 30].map((d) => (
                <button
                  key={d}
                  onClick={() => { setTrialPreset(d); setTrialDays("") }}
                  className={cn(
                    "rounded-md border px-3 py-1.5 text-sm font-medium transition-colors",
                    trialPreset === d
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:bg-muted",
                  )}
                >
                  {d} days
                </button>
              ))}
            </div>
            <div className="mt-3">
              <label className="text-xs text-muted-foreground">Custom days</label>
              <input
                type="number"
                min={1}
                max={365}
                value={trialDays}
                onChange={(e) => { setTrialDays(e.target.value ? Number(e.target.value) : ""); setTrialPreset(null) }}
                placeholder="e.g. 45"
                className="mt-1 flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => { setShowTrialDialog(false); setTrialDays(""); setTrialPreset(null) }}
                className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={() => { if (effectiveTrialDays > 0) trialMutation.mutate(effectiveTrialDays) }}
                disabled={trialMutation.isPending || effectiveTrialDays <= 0}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {trialMutation.isPending ? "Extending..." : `Extend ${effectiveTrialDays > 0 ? `${effectiveTrialDays} days` : ""}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
