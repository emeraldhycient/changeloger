import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { api } from "@/lib/api"
import { cn } from "@/lib/utils"
import {
  Search, ChevronLeft, ChevronRight, MoreVertical,
  Eye, Ban, Trash2, ArrowUpDown, CreditCard,
} from "lucide-react"

type SortField = "name" | "plan" | "createdAt"
type SortDir = "asc" | "desc"

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
  const [menuOpen, setMenuOpen] = useState<string | null>(null)
  const [planMenuOpen, setPlanMenuOpen] = useState<string | null>(null)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ["admin-workspaces", search, page, sortField, sortDir],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: "20" })
      if (search) params.set("search", search)
      params.set("sortBy", sortField)
      params.set("sortDir", sortDir)
      const { data } = await api.get(`/api/admin/workspaces?${params}`)
      return data
    },
  })

  const suspendMutation = useMutation({
    mutationFn: async ({ id, suspend }: { id: string; suspend: boolean }) => {
      await api.patch(`/api/admin/workspaces/${id}`, { action: suspend ? "suspend" : "unsuspend" })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-workspaces"] })
    },
  })

  const planMutation = useMutation({
    mutationFn: async ({ id, plan }: { id: string; plan: string }) => {
      await api.patch(`/api/admin/workspaces/${id}`, { plan })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-workspaces"] })
      setPlanMenuOpen(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/admin/workspaces/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-workspaces"] })
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
      <div>
        <h1 className="text-2xl font-bold">Workspaces</h1>
        <p className="text-sm text-muted-foreground">Manage platform workspaces and plans</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          placeholder="Search by name or slug..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          className="flex h-9 w-full max-w-sm rounded-md border border-input bg-background pl-9 pr-3 text-sm outline-none focus:ring-1 focus:ring-ring"
        />
      </div>

      <div className="rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
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
                  <td colSpan={9} className="px-4 py-3"><div className="h-4 w-48 animate-pulse rounded bg-muted" /></td>
                </tr>
              ))
            ) : workspaces.length === 0 ? (
              <tr><td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">No workspaces found</td></tr>
            ) : (
              workspaces.map((ws: any) => {
                const aiUsed = ws.aiGenerationsUsed ?? 0
                const aiLimit = ws.aiGenerationsLimit ?? 100
                const aiPercent = aiLimit > 0 ? Math.round((aiUsed / aiLimit) * 100) : 0
                return (
                  <tr
                    key={ws.id}
                    className="border-b border-border hover:bg-muted/30 cursor-pointer"
                    onClick={() => navigate(`/workspaces/${ws.id}`)}
                  >
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
                    <td className="px-4 py-3 text-muted-foreground">{new Date(ws.createdAt).toLocaleDateString()}</td>
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
                            <button
                              onClick={() => { suspendMutation.mutate({ id: ws.id, suspend: !ws.isSystemSuspended }); setMenuOpen(null) }}
                              className="flex w-full items-center gap-2 px-3 py-1.5 text-sm hover:bg-muted"
                            >
                              <Ban className="h-3.5 w-3.5" />
                              {ws.isSystemSuspended ? "Unsuspend" : "Suspend"}
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Delete workspace ${ws.name}?`)) deleteMutation.mutate(ws.id)
                                setMenuOpen(null)
                              }}
                              className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-red-500 hover:bg-muted"
                            >
                              <Trash2 className="h-3.5 w-3.5" /> Delete
                            </button>
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
    </div>
  )
}
