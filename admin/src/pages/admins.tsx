import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { cn } from "@/lib/utils"
import { Plus, Shield, ChevronDown } from "lucide-react"

const roleColors: Record<string, string> = {
  super_admin: "bg-red-500/10 text-red-400",
  admin: "bg-violet-500/10 text-violet-400",
  moderator: "bg-blue-500/10 text-blue-400",
  viewer: "bg-gray-500/10 text-gray-400",
}

const ROLES = ["super_admin", "admin", "moderator", "viewer"]

export function AdminsPage() {
  const queryClient = useQueryClient()
  const [showCreate, setShowCreate] = useState(false)
  const [roleMenuId, setRoleMenuId] = useState<string | null>(null)
  const [createForm, setCreateForm] = useState({ email: "", password: "", name: "", role: "admin" })

  const { data: admins = [], isLoading } = useQuery({
    queryKey: ["admin-admins"],
    queryFn: async () => {
      const { data } = await api.get("/api/admin/admins")
      return data.admins ?? data ?? []
    },
  })

  const createMutation = useMutation({
    mutationFn: async (payload: typeof createForm) => {
      await api.post("/api/admin/admins", payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-admins"] })
      setShowCreate(false)
      setCreateForm({ email: "", password: "", name: "", role: "admin" })
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...payload }: { id: string; role?: string; isActive?: boolean }) => {
      await api.patch(`/api/admin/admins/${id}`, payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-admins"] })
      setRoleMenuId(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/admin/admins/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-admins"] })
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admins</h1>
          <p className="text-sm text-muted-foreground">Manage admin users and roles</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-3.5 w-3.5" />
          Create Admin
        </button>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Email</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Role</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Last Login</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i} className="border-b border-border">
                  <td colSpan={6} className="px-4 py-3">
                    <div className="h-4 w-48 animate-pulse rounded bg-muted" />
                  </td>
                </tr>
              ))
            ) : (admins as any[]).length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  No admin users found
                </td>
              </tr>
            ) : (
              (admins as any[]).map((admin: any) => (
                <tr key={admin.id} className="border-b border-border hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{admin.name || "—"}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{admin.email}</td>
                  <td className="px-4 py-3">
                    <div className="relative">
                      <button
                        onClick={() => setRoleMenuId(roleMenuId === admin.id ? null : admin.id)}
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                          roleColors[admin.role] || "bg-gray-500/10 text-gray-400",
                        )}
                      >
                        {admin.role}
                        <ChevronDown className="h-3 w-3" />
                      </button>
                      {roleMenuId === admin.id && (
                        <div className="absolute left-0 top-full z-10 mt-1 w-36 rounded-md border border-border bg-card py-1 shadow-lg">
                          {ROLES.map((r) => (
                            <button
                              key={r}
                              onClick={() => updateMutation.mutate({ id: admin.id, role: r })}
                              className={cn(
                                "w-full px-3 py-1.5 text-left text-sm hover:bg-muted",
                                admin.role === r && "font-medium text-primary",
                              )}
                            >
                              {r}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {admin.lastLoginAt ? new Date(admin.lastLoginAt).toLocaleString() : "Never"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                      admin.isActive !== false
                        ? "bg-emerald-500/10 text-emerald-500"
                        : "bg-red-500/10 text-red-500",
                    )}>
                      {admin.isActive !== false ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateMutation.mutate({ id: admin.id, isActive: admin.isActive === false })}
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >
                        {admin.isActive !== false ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        onClick={() => {
                          if (confirm("Delete this admin?")) deleteMutation.mutate(admin.id)
                        }}
                        className="text-xs text-red-500 hover:text-red-400"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Admin Dialog */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-lg">
            <h2 className="text-lg font-bold">Create Admin</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                createMutation.mutate(createForm)
              }}
              className="mt-4 space-y-4"
            >
              <div>
                <label className="mb-1 block text-sm font-medium">Name</label>
                <input
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Email</label>
                <input
                  type="email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Password</label>
                <input
                  type="password"
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Role</label>
                <select
                  value={createForm.role}
                  onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {createMutation.isPending ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
