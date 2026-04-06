import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import { api } from "@/lib/api"
import { timeAgo } from "@/lib/format"
import { exportToCSV } from "@/lib/export"
import { Activity, Search, ChevronLeft, ChevronRight, Download } from "lucide-react"

const ACTION_TYPES = [
  { label: "All", value: "" },
  { label: "User Suspend", value: "user.suspend" },
  { label: "User Unsuspend", value: "user.unsuspend" },
  { label: "Plan Change", value: "workspace.plan_change" },
  { label: "User Signup", value: "user.signup" },
  { label: "User Delete", value: "user.delete" },
  { label: "Workspace Delete", value: "workspace.delete" },
  { label: "Admin Create", value: "admin.create" },
]

export function ActivityPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [actionFilter, setActionFilter] = useState("")
  const [adminFilter, setAdminFilter] = useState("")

  const { data: adminsData } = useQuery({
    queryKey: ["admin-admins-list"],
    queryFn: async () => {
      const { data } = await api.get("/api/admin/admins")
      return data
    },
  })

  const adminsList: any[] = adminsData?.admins ?? adminsData ?? []

  const { data, isLoading } = useQuery({
    queryKey: ["admin-activity", page, search, actionFilter, adminFilter],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: "20" })
      if (search) params.set("search", search)
      if (actionFilter) params.set("action", actionFilter)
      if (adminFilter) params.set("adminId", adminFilter)
      const { data } = await api.get(`/api/admin/activity?${params}`)
      return data
    },
  })

  const logs = data?.logs ?? []
  const pagination = data?.pagination ?? { page: 1, total: 0, totalPages: 0 }

  function entityLink(log: any) {
    const type = log.type || log.action || ""
    const targetId = log.targetId
    if (!targetId) return null
    if (type.startsWith("user.")) {
      return `/users/${targetId}`
    }
    if (type.startsWith("workspace.")) {
      return `/workspaces/${targetId}`
    }
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Activity Log</h1>
          <p className="text-sm text-muted-foreground">Platform-wide admin actions and events</p>
        </div>
        <button
          onClick={() => {
            const exportData = logs.map((log: any) => ({
              id: log.id,
              type: log.type || log.action || "",
              description: log.description || "",
              admin: log.admin?.name || "",
              date: log.date || log.createdAt || "",
            }))
            exportToCSV(exportData, "activity-export")
            toast.success("Activity log exported to CSV")
          }}
          className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted"
        >
          <Download className="h-3.5 w-3.5" />
          Export CSV
        </button>
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            placeholder="Search activity..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="flex h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <select
          value={actionFilter}
          onChange={(e) => { setActionFilter(e.target.value); setPage(1) }}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring"
        >
          {ACTION_TYPES.map((a) => (
            <option key={a.value} value={a.value}>{a.label}</option>
          ))}
        </select>
        <select
          value={adminFilter}
          onChange={(e) => { setAdminFilter(e.target.value); setPage(1) }}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="">All Admins</option>
          {adminsList.map((a: any) => (
            <option key={a.id} value={a.id}>{a.name || a.email}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-lg bg-muted/50" />
          ))}
        </div>
      ) : logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16">
          <Activity className="h-10 w-10 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">No activity yet</p>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {logs.map((log: any) => {
              const link = entityLink(log)
              const dateStr = log.date || log.createdAt
              return (
                <div key={log.id} className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">
                      {log.description || log.type || log.action}
                      {link && log.targetId && (
                        <>
                          {" "}
                          <Link to={link} className="text-primary hover:underline" onClick={(e) => e.stopPropagation()}>
                            {log.targetId.slice(0, 8)}...
                          </Link>
                        </>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {log.type} {log.admin ? `\u00b7 ${log.admin.name}` : ""}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground" title={dateStr ? new Date(dateStr).toLocaleString() : ""}>
                    {dateStr ? timeAgo(dateStr) : ""}
                  </span>
                </div>
              )
            })}
          </div>

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Page {pagination.page} of {pagination.totalPages}
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
        </>
      )}
    </div>
  )
}
