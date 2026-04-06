import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { api } from "@/lib/api"
import { cn } from "@/lib/utils"
import { timeAgo } from "@/lib/format"
import { exportToCSV } from "@/lib/export"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { useAuthStore } from "@/stores/auth-store"
import { canPerform } from "@/lib/permissions"
import {
  Search, ChevronLeft, ChevronRight, MoreVertical,
  Eye, Ban, Trash2, ArrowUpDown, CreditCard, Filter, Download,
} from "lucide-react"

type SortField = "name" | "plan" | "createdAt"
type SortDir = "asc" | "desc"
type StatusFilter = "all" | "active" | "suspended"
type PlanFilter = "all" | "free" | "pro" | "team" | "enterprise"
type TrialFilter = "all" | "active_trial" | "expired_trial" | "no_trial"

const planColors: Record<string, string> = {
  free: "bg-gray-500/10 text-gray-400",
  pro: "bg-blue-500/10 text-blue-400",
  team: "bg-violet-500/10 text-violet-400",
  enterprise: "bg-amber-500/10 text-amber-400",
}

const PLANS = ["free", "pro", "team", "enterprise"]

export function WorkspacesPage() {
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [sortField, setSortField] = useState<SortField>("createdAt")
  const [sortDir, setSortDir] = useState<SortDir>("desc")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [planFilter, setPlanFilter] = useState<PlanFilter>("all")
  const [trialFilter, setTrialFilter] = useState<TrialFilter>("all")
  const [menuOpen, setMenuOpen] = useState<string | null>(null)
  const [planMenuOpen, setPlanMenuOpen] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean; title: string; description: string; confirmText: string;
    typeToConfirm?: string; destructive: boolean; onConfirm: () => void
  }>({ open: false, title: "", description: "", confirmText: "Confirm", destructive: false, onConfirm: () => {} })
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { admin } = useAuthStore()
  const canEdit = canPerform(admin?.role || "", "admin")

  const { data, isLoading } = useQuery({
    queryKey: ["admin-workspaces", search, page, sortField, sortDir, statusFilter, planFilter, trialFilter],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: "20" })
      if (search) params.set("search", search)
      params.set("sortBy", sortField)
      params.set("sortDir", sortDir)
      if (statusFilter === "active") params.set("suspended", "false")
      else if (statusFilter === "suspended") params.set("suspended", "true")
      if (planFilter !== "all") params.set("plan", planFilter)
      if (trialFilter !== "all") params.set("trial", trialFilter)
      const { data } = await api.get(`/api/admin/workspaces?${params}`)
      return data
    },
  })

  const suspendMutation = useMutation({
    mutationFn: async ({ id, suspend }: { id: string; suspend: boolean }) => {
      await api.post(`/api/admin/workspaces/${id}/${suspend ? "suspend" : "unsuspend"}`)
    },
    onSuccess: (_data, variables) => {
      toast.success(variables.suspend ? "Workspace suspended successfully" : "Workspace unsuspended successfully")
      queryClient.invalidateQueries({ queryKey: ["admin-workspaces"] })
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || "Failed to update workspace status")
    },
  })

  const planMutation = useMutation({
    mutationFn: async ({ id, plan }: { id: string; plan: string }) => {
      await api.patch(`/api/admin/workspaces/${id}/plan`, { plan })
    },
    onSuccess: (_data, variables) => {
      toast.success(`Plan changed to ${variables.plan} successfully`)
      queryClient.invalidateQueries({ queryKey: ["admin-workspaces"] })
      setPlanMenuOpen(null)
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || "Failed to change plan")
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/admin/workspaces/${id}`)
    },
    onSuccess: () => {
      toast.success("Workspace deleted successfully")
      queryClient.invalidateQueries({ queryKey: ["admin-workspaces"] })
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || "Failed to delete workspace")
    },
  })

  const bulkSuspendMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      await Promise.all(ids.map(id => api.post(`/api/admin/workspaces/${id}/suspend`)))
    },
    onSuccess: () => {
      toast.success(`${selectedIds.size} workspace(s) suspended successfully`)
      queryClient.invalidateQueries({ queryKey: ["admin-workspaces"] })
      setSelectedIds(new Set())
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || "Failed to suspend workspaces")
    },
  })

  const workspaces = data?.workspaces ?? []
  const pagination = data?.pagination ?? { page: 1, total: 0, totalPages: 0 }

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDir("asc")
    }
  }

  function toggleSelect(id: string) {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(next)
  }

  function toggleSelectAll() {
    if (selectedIds.size === workspaces.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(workspaces.map((ws: any) => ws.id)))
    }
  }

  function handleExportCSV() {
    const exportData = workspaces.map((ws: any) => ({
      id: ws.id,
      name: ws.name,
      slug: ws.slug,
      plan: ws.plan,
      owner: ws.owner?.email || "",
      members: ws._count?.members ?? 0,
      status: ws.isSystemSuspended ? "Suspended" : "Active",
      createdAt: new Date(ws.createdAt).toISOString(),
    }))
    exportToCSV(exportData, "workspaces-export")
    toast.success("Workspaces exported to CSV")
  }

  function handleExportSelected() {
    const exportData = workspaces
      .filter((ws: any) => selectedIds.has(ws.id))
      .map((ws: any) => ({
        id: ws.id,
        name: ws.name,
        slug: ws.slug,
        plan: ws.plan,
        owner: ws.owner?.email || "",
        members: ws._count?.members ?? 0,
        status: ws.isSystemSuspended ? "Suspended" : "Active",
        createdAt: new Date(ws.createdAt).toISOString(),
      }))
    exportToCSV(exportData, "workspaces-selected-export")
    toast.success(`${exportData.length} workspace(s) exported to CSV`)
  }

  function SortHeader({ field, children }: { field: SortField; children: React.ReactNode }) {
    return (
      <th className="px-4 py-3 text-left font-medium text-muted-foreground">
        <button
          onClick={() => toggleSort(field)}
          className="inline-flex items-center gap-1 hover:text-foreground"
        >
          {children}
          <ArrowUpDown className={cn("h-3 w-3", sortField === field && "text-foreground")} />
        </button>
      </th>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Workspaces</h1>
          <p className="text-sm text-muted-foreground">Manage platform workspaces and plans</p>
        </div>
        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted"
        >
          <Download className="h-3.5 w-3.5" />
          Export CSV
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            placeholder="Search by name or slug..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="flex h-9 w-full max-w-sm rounded-md border border-input bg-background pl-9 pr-3 text-sm outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value as StatusFilter); setPage(1) }}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
          <select
            value={planFilter}
            onChange={(e) => { setPlanFilter(e.target.value as PlanFilter); setPage(1) }}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="all">All Plans</option>
            <option value="free">Free</option>
            <option value="pro">Pro</option>
            <option value="team">Team</option>
            <option value="enterprise">Enterprise</option>
          </select>
          <select
            value={trialFilter}
            onChange={(e) => { setTrialFilter(e.target.value as TrialFilter); setPage(1) }}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="all">All Trials</option>
            <option value="active_trial">Active Trial</option>
            <option value="expired_trial">Expired Trial</option>
            <option value="no_trial">No Trial</option>
          </select>
        </div>
      </div>

      {/* Bulk action toolbar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/50 px-4 py-2">
          <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
            {selectedIds.size} selected
          </span>
          {canEdit && (
            <button
              onClick={() => setConfirmDialog({
                open: true,
                title: "Suspend Selected Workspaces",
                description: `Are you sure you want to suspend ${selectedIds.size} workspace(s)?`,
                confirmText: "Suspend All",
                destructive: true,
                onConfirm: () => {
                  bulkSuspendMutation.mutate(Array.from(selectedIds))
                  setConfirmDialog(prev => ({ ...prev, open: false }))
                },
              })}
              disabled={bulkSuspendMutation.isPending}
              className="inline-flex items-center gap-1.5 rounded-md bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-500 hover:bg-amber-500/20"
            >
              <Ban className="h-3 w-3" />
              Suspend Selected
            </button>
          )}
          <button
            onClick={handleExportSelected}
            className="inline-flex items-center gap-1.5 rounded-md bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-500 hover:bg-blue-500/20"
          >
            <Download className="h-3 w-3" />
            Export Selected
          </button>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="ml-auto text-xs text-muted-foreground hover:text-foreground"
          >
            Clear Selection
          </button>
        </div>
      )}

      <div className="rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left w-10">
                <input
                  type="checkbox"
                  checked={workspaces.length > 0 && selectedIds.size === workspaces.length}
                  onChange={toggleSelectAll}
                  className="rounded border-border"
                />
              </th>
              <SortHeader field="name">Workspace</SortHeader>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Owner</th>
              <SortHeader field="plan">Plan</SortHeader>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Members</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Trial</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">AI Usage</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
              <SortHeader field="createdAt">Created</SortHeader>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground w-12" />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-border">
                  <td colSpan={10} className="px-4 py-3"><div className="h-4 w-48 animate-pulse rounded bg-muted" /></td>
                </tr>
              ))
            ) : workspaces.length === 0 ? (
              <tr><td colSpan={10} className="px-4 py-8 text-center text-muted-foreground">No workspaces found</td></tr>
            ) : (
              workspaces.map((ws: any) => {
                const aiUsed = ws.aiGenerationsUsed ?? 0
                const aiLimit = ws.aiGenerationsLimit ?? 100
                const aiPercent = aiLimit > 0 ? Math.round((aiUsed / aiLimit) * 100) : 0
                return (
                  <tr
                    key={ws.id}
                    className={cn(
                      "border-b border-border hover:bg-muted/30 cursor-pointer",
                      selectedIds.has(ws.id) && "bg-primary/5",
                    )}
                    onClick={() => navigate(`/workspaces/${ws.id}`)}
                  >
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(ws.id)}
                        onChange={() => toggleSelect(ws.id)}
                        className="rounded border-border"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium">{ws.name}</p>
                        <p className="text-xs text-muted-foreground">{ws.slug}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {ws.owner?.email || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize", planColors[ws.plan] || "")}>
                        {ws.plan}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{ws._count?.members ?? 0}</td>
                    <td className="px-4 py-3">
                      {ws.trialEndsAt && new Date(ws.trialEndsAt) > new Date() ? (
                        <span className="inline-flex rounded-full bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-400">Trial</span>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                          <div
                            className={cn("h-full rounded-full", aiPercent >= 90 ? "bg-red-500" : aiPercent >= 70 ? "bg-amber-500" : "bg-primary")}
                            style={{ width: `${Math.min(100, aiPercent)}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">{aiPercent}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                        ws.isSystemSuspended ? "bg-red-500/10 text-red-500" : "bg-emerald-500/10 text-emerald-500",
                      )}>
                        {ws.isSystemSuspended ? "Suspended" : "Active"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground" title={new Date(ws.createdAt).toLocaleString()}>{timeAgo(ws.createdAt)}</td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="relative">
                        <button
                          onClick={() => setMenuOpen(menuOpen === ws.id ? null : ws.id)}
                          className="rounded p-1 hover:bg-muted"
                        >
                          <MoreVertical className="h-4 w-4 text-muted-foreground" />
                        </button>
                        {menuOpen === ws.id && (
                          <div className="absolute right-0 top-full z-10 mt-1 w-48 rounded-md border border-border bg-card py-1 shadow-lg">
                            <button
                              onClick={() => { navigate(`/workspaces/${ws.id}`); setMenuOpen(null) }}
                              className="flex w-full items-center gap-2 px-3 py-1.5 text-sm hover:bg-muted"
                            >
                              <Eye className="h-3.5 w-3.5" /> View Details
                            </button>
                            {/* Plan submenu */}
                            {canEdit && (
                              <div className="relative">
                                <button
                                  onClick={() => setPlanMenuOpen(planMenuOpen === ws.id ? null : ws.id)}
                                  className="flex w-full items-center gap-2 px-3 py-1.5 text-sm hover:bg-muted"
                                >
                                  <CreditCard className="h-3.5 w-3.5" /> Change Plan
                                </button>
                                {planMenuOpen === ws.id && (
                                  <div className="border-t border-border py-1">
                                    {PLANS.map((p) => (
                                      <button
                                        key={p}
                                        onClick={() => {
                                          planMutation.mutate({ id: ws.id, plan: p })
                                          setMenuOpen(null)
                                        }}
                                        className={cn(
                                          "w-full px-6 py-1 text-left text-sm capitalize hover:bg-muted",
                                          ws.plan === p && "font-medium text-primary",
                                        )}
                                      >
                                        {p}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                            {canEdit && (
                              <button
                                onClick={() => { suspendMutation.mutate({ id: ws.id, suspend: !ws.isSystemSuspended }); setMenuOpen(null) }}
                                className="flex w-full items-center gap-2 px-3 py-1.5 text-sm hover:bg-muted"
                              >
                                <Ban className="h-3.5 w-3.5" />
                                {ws.isSystemSuspended ? "Unsuspend" : "Suspend"}
                              </button>
                            )}
                            {canEdit && (
                              <button
                                onClick={() => {
                                  setMenuOpen(null)
                                  setConfirmDialog({
                                    open: true,
                                    title: "Delete Workspace",
                                    description: `Are you sure you want to delete "${ws.name}"? This will remove all associated data. This action cannot be undone.`,
                                    confirmText: "Delete",
                                    typeToConfirm: ws.name,
                                    destructive: true,
                                    onConfirm: () => {
                                      deleteMutation.mutate(ws.id)
                                      setConfirmDialog(prev => ({ ...prev, open: false }))
                                    },
                                  })
                                }}
                                className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-red-500 hover:bg-muted"
                              >
                                <Trash2 className="h-3.5 w-3.5" /> Delete
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
          </p>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded border border-border p-1.5 disabled:opacity-50">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button disabled={page >= pagination.totalPages} onClick={() => setPage(page + 1)} className="rounded border border-border p-1.5 disabled:opacity-50">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog(prev => ({ ...prev, open: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        description={confirmDialog.description}
        confirmText={confirmDialog.confirmText}
        typeToConfirm={confirmDialog.typeToConfirm}
        destructive={confirmDialog.destructive}
        loading={deleteMutation.isPending || bulkSuspendMutation.isPending}
      />
    </div>
  )
}
