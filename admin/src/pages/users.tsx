import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { api } from "@/lib/api"
import { cn } from "@/lib/utils"
import {
  Search, ChevronLeft, ChevronRight, MoreVertical,
  Eye, Ban, Trash2, ArrowUpDown,
} from "lucide-react"

type SortField = "name" | "email" | "createdAt" | "lastLoginAt"
type SortDir = "asc" | "desc"

export function UsersPage() {
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [sortField, setSortField] = useState<SortField>("createdAt")
  const [sortDir, setSortDir] = useState<SortDir>("desc")
  const [menuOpen, setMenuOpen] = useState<string | null>(null)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", search, page, sortField, sortDir],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: "20" })
      if (search) params.set("search", search)
      params.set("sortBy", sortField)
      params.set("sortDir", sortDir)
      const { data } = await api.get(`/api/admin/users?${params}`)
      return data
    },
  })

  const suspendMutation = useMutation({
    mutationFn: async ({ id, suspend }: { id: string; suspend: boolean }) => {
      await api.post(`/api/admin/users/${id}/${suspend ? "suspend" : "unsuspend"}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/admin/users/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] })
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
        <h1 className="text-2xl font-bold">Users</h1>
        <p className="text-sm text-muted-foreground">Manage platform users</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          className="flex h-9 w-full max-w-sm rounded-md border border-input bg-background pl-9 pr-3 text-sm outline-none focus:ring-1 focus:ring-ring"
        />
      </div>

      <div className="rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
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
                  <td colSpan={8} className="px-4 py-3"><div className="h-4 w-48 animate-pulse rounded bg-muted" /></td>
                </tr>
              ))
            ) : users.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">No users found</td></tr>
            ) : (
              users.map((user: any) => (
                <tr
                  key={user.id}
                  className="border-b border-border hover:bg-muted/30 cursor-pointer"
                  onClick={() => navigate(`/users/${user.id}`)}
                >
                  <td className="px-4 py-3 font-medium">{user.name || "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                  <td className="px-4 py-3 text-muted-foreground">{user._count?.workspaceMembers ?? user.workspaceCount ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {(user.accounts ?? []).map((a: any) => a.provider).join(", ") || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                      user.isSystemSuspended ? "bg-red-500/10 text-red-500" : "bg-emerald-500/10 text-emerald-500",
                    )}>
                      {user.isSystemSuspended ? "Suspended" : "Active"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : "Never"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(user.createdAt).toLocaleDateString()}</td>
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
                          <button
                            onClick={() => { suspendMutation.mutate({ id: user.id, suspend: !user.isSystemSuspended }); setMenuOpen(null) }}
                            className="flex w-full items-center gap-2 px-3 py-1.5 text-sm hover:bg-muted"
                          >
                            <Ban className="h-3.5 w-3.5" />
                            {user.isSystemSuspended ? "Unsuspend" : "Suspend"}
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete user ${user.name || user.email}?`)) {
                                deleteMutation.mutate(user.id)
                              }
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
    </div>
  )
}
