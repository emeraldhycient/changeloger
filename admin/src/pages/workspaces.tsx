import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { Search, ChevronLeft, ChevronRight } from "lucide-react"

export function WorkspacesPage() {
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ["admin-workspaces", search, page],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: "20" })
      if (search) params.set("search", search)
      const { data } = await api.get(`/api/admin/workspaces?${params}`)
      return data
    },
  })

  const workspaces = data?.workspaces ?? []
  const pagination = data?.pagination ?? { page: 1, total: 0, totalPages: 0 }

  const planColors: Record<string, string> = {
    free: "bg-gray-500/10 text-gray-400",
    pro: "bg-blue-500/10 text-blue-400",
    team: "bg-violet-500/10 text-violet-400",
    enterprise: "bg-amber-500/10 text-amber-400",
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
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Workspace</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Plan</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Members</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Repos</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Created</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-border">
                  <td colSpan={6} className="px-4 py-3"><div className="h-4 w-48 animate-pulse rounded bg-muted" /></td>
                </tr>
              ))
            ) : workspaces.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No workspaces found</td></tr>
            ) : (
              workspaces.map((ws: any) => (
                <tr key={ws.id} className="border-b border-border hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium">{ws.name}</p>
                      <p className="text-xs text-muted-foreground">{ws.slug}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${planColors[ws.plan] || ""}`}>
                      {ws.plan}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{ws._count?.members ?? 0}</td>
                  <td className="px-4 py-3 text-muted-foreground">{ws._count?.repositories ?? 0}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${ws.isSystemSuspended ? "bg-red-500/10 text-red-500" : "bg-emerald-500/10 text-emerald-500"}`}>
                      {ws.isSystemSuspended ? "Suspended" : "Active"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(ws.createdAt).toLocaleDateString()}</td>
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
