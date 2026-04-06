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
  Eye, Ban, Trash2, ArrowUpDown, Download, Filter,
} from "lucide-react"

type SortField = "name" | "email" | "createdAt" | "lastLoginAt"
type SortDir = "asc" | "desc"
type StatusFilter = "all" | "active" | "suspended"
type DateRangeFilter = "all" | "7d" | "30d" | "90d"

function getCreatedAfter(range: DateRangeFilter): string | undefined {
  if (range === "all") return undefined
  const days = range === "7d" ? 7 : range === "30d" ? 30 : 90
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString()
}

export function UsersPage() {
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [sortField, setSortField] = useState<SortField>("createdAt")
  const [sortDir, setSortDir] = useState<SortDir>("desc")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [dateRange, setDateRange] = useState<DateRangeFilter>("all")
  const [menuOpen, setMenuOpen] = useState<string | null>(null)
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
    queryKey: ["admin-users", search, page, sortField, sortDir, statusFilter, dateRange],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: "20" })
      if (search) params.set("search", search)
      params.set("sortBy", sortField)
      params.set("sortDir", sortDir)
      if (statusFilter === "active") params.set("suspended", "false")
      else if (statusFilter === "suspended") params.set("suspended", "true")
      const createdAfter = getCreatedAfter(dateRange)
      if (createdAfter) params.set("createdAfter", createdAfter)
      const { data } = await api.get(`/api/admin/users?${params}`)
      return data
    },
  })

  const suspendMutation = useMutation({
    mutationFn: async ({ id, suspend }: { id: string; suspend: boolean }) => {
      await api.post(`/api/admin/users/${id}/${suspend ? "suspend" : "unsuspend"}`)
    },
    onSuccess: (_data, variables) => {
      toast.success(variables.suspend ? "User suspended successfully" : "User unsuspended successfully")
      queryClient.invalidateQueries({ queryKey: ["admin-users"] })
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || "Failed to update user status")
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/admin/users/${id}`)
    },
    onSuccess: () => {
      toast.success("User deleted successfully")
      queryClient.invalidateQueries({ queryKey: ["admin-users"] })
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || "Failed to delete user")
    },
  })

  const bulkSuspendMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      await Promise.all(ids.map(id => api.post(`/api/admin/users/${id}/suspend`)))
    },
    onSuccess: () => {
      toast.success(`${selectedIds.size} user(s) suspended successfully`)
      queryClient.invalidateQueries({ queryKey: ["admin-users"] })
      setSelectedIds(new Set())
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || "Failed to suspend users")
    },
  })

  const users = data?.users ?? []
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
    if (selectedIds.size === users.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(users.map((u: any) => u.id)))
    }
  }

  function handleExportCSV() {
    const exportData = users.map((u: any) => ({
      id: u.id,
      name: u.name || "",
      email: u.email,
      status: u.isSystemSuspended ? "Suspended" : "Active",
      lastLogin: u.lastLoginAt ? new Date(u.lastLoginAt).toISOString() : "",
      createdAt: new Date(u.createdAt).toISOString(),
    }))
    exportToCSV(exportData, "users-export")
    toast.success("Users exported to CSV")
  }

  function handleExportSelected() {
    const exportData = users
      .filter((u: any) => selectedIds.has(u.id))
      .map((u: any) => ({
        id: u.id,
        name: u.name || "",
        email: u.email,
        status: u.isSystemSuspended ? "Suspended" : "Active",
        lastLogin: u.lastLoginAt ? new Date(u.lastLoginAt).toISOString() : "",
        createdAt: new Date(u.createdAt).toISOString(),
      }))
    exportToCSV(exportData, "users-selected-export")
    toast.success(`${exportData.length} user(s) exported to CSV`)
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
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="text-sm text-muted-foreground">Manage platform users</p>
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
            placeholder="Search by name or email..."
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
            value={dateRange}
            onChange={(e) => { setDateRange(e.target.value as DateRangeFilter); setPage(1) }}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="all">All Time</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Bulk action toolbar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/50 px-4 py-2">
          <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
            {selectedIds.size} selected
          </span>
          <button
            onClick={() => setConfirmDialog({
              open: true,
              title: "Suspend Selected Users",
              description: `Are you sure you want to suspend ${selectedIds.size} user(s)?`,
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
                  checked={users.length > 0 && selectedIds.size === users.length}
                  onChange={toggleSelectAll}
                  className="rounded border-border"
                />
              </th>
              <SortHeader field="name">User</SortHeader>
              <SortHeader field="email">Email</SortHeader>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Workspaces</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">OAuth</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
              <SortHeader field="lastLoginAt">Last Login</SortHeader>
              <SortHeader field="createdAt">Joined</SortHeader>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground w-12" />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-border">
                  <td colSpan={9} className="px-4 py-3"><div className="h-4 w-48 animate-pulse rounded bg-muted" /></td>
                </tr>
              ))
            ) : users.length === 0 ? (
              <tr><td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">No users found</td></tr>
            ) : (
              users.map((user: any) => (
                <tr
                  key={user.id}
                  className={cn(
                    "border-b border-border hover:bg-muted/30 cursor-pointer",
                    selectedIds.has(user.id) && "bg-primary/5",
                  )}
                  onClick={() => navigate(`/users/${user.id}`)}
                >
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedIds.has(user.id)}
                      onChange={() => toggleSelect(user.id)}
                      className="rounded border-border"
                    />
                  </td>
                  <td className="px-4 py-3 font-medium">{user.name || "\u2014"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                  <td className="px-4 py-3 text-muted-foreground">{user._count?.workspaceMembers ?? user.workspaceCount ?? "\u2014"}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {(user.accounts ?? []).map((a: any) => a.provider).join(", ") || "\u2014"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                      user.isSystemSuspended ? "bg-red-500/10 text-red-500" : "bg-emerald-500/10 text-emerald-500",
                    )}>
                      {user.isSystemSuspended ? "Suspended" : "Active"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground" title={user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : ""}>
                    {user.lastLoginAt ? timeAgo(user.lastLoginAt) : "Never"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground" title={new Date(user.createdAt).toLocaleString()}>{timeAgo(user.createdAt)}</td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <div className="relative">
                      <button
                        onClick={() => setMenuOpen(menuOpen === user.id ? null : user.id)}
                        className="rounded p-1 hover:bg-muted"
                      >
                        <MoreVertical className="h-4 w-4 text-muted-foreground" />
                      </button>
                      {menuOpen === user.id && (
                        <div className="absolute right-0 top-full z-10 mt-1 w-44 rounded-md border border-border bg-card py-1 shadow-lg">
                          <button
                            onClick={() => { navigate(`/users/${user.id}`); setMenuOpen(null) }}
                            className="flex w-full items-center gap-2 px-3 py-1.5 text-sm hover:bg-muted"
                          >
                            <Eye className="h-3.5 w-3.5" /> View Details
                          </button>
                          {canEdit && (
                            <button
                              onClick={() => { suspendMutation.mutate({ id: user.id, suspend: !user.isSystemSuspended }); setMenuOpen(null) }}
                              className="flex w-full items-center gap-2 px-3 py-1.5 text-sm hover:bg-muted"
                            >
                              <Ban className="h-3.5 w-3.5" />
                              {user.isSystemSuspended ? "Unsuspend" : "Suspend"}
                            </button>
                          )}
                          {canEdit && (
                            <button
                              onClick={() => {
                                setMenuOpen(null)
                                setConfirmDialog({
                                open: true,
                                title: "Delete User",
                                description: `Are you sure you want to delete "${user.name || user.email}"? This action cannot be undone.`,
                                confirmText: "Delete",
                                typeToConfirm: user.name || user.email,
                                destructive: true,
                                onConfirm: () => {
                                  deleteMutation.mutate(user.id)
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
              ))
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
