"use client"

import { useState, useMemo } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api/client"
import { useWorkspaceStore } from "@/stores/workspace-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { Users, Mail, UserPlus, Shield, Search, Filter, ArrowUpDown } from "lucide-react"

const ROLE_COLORS: Record<string, string> = {
  owner: "bg-violet-500/10 text-violet-500",
  admin: "bg-blue-500/10 text-blue-500",
  editor: "bg-green-500/10 text-green-500",
  viewer: "bg-gray-500/10 text-gray-500",
}

const ROLES = ["owner", "admin", "editor", "viewer"]

interface Member {
  id: string
  role: string
  user: { id: string; name: string | null; email: string; avatarUrl: string | null }
}

export default function TeamPage() {
  const workspaceId = useWorkspaceStore((s) => s.currentWorkspaceId)
  const queryClient = useQueryClient()
  const [inviteOpen, setInviteOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [role, setRole] = useState("editor")

  // Search & filter
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState<string | null>(null)
  const [sort, setSort] = useState<"name-asc" | "name-desc" | "role">("name-asc")

  const { data: members = [], isLoading } = useQuery<Member[]>({
    queryKey: ["members", workspaceId],
    queryFn: async () => {
      if (!workspaceId) return []
      const { data } = await apiClient.get(`/api/workspaces/${workspaceId}/members`)
      return data
    },
    enabled: !!workspaceId,
  })

  const invite = useMutation({
    mutationFn: async () => {
      await apiClient.post(`/api/workspaces/${workspaceId}/invitations`, { email, role })
    },
    onSuccess: () => {
      setInviteOpen(false)
      setEmail("")
      queryClient.invalidateQueries({ queryKey: ["members", workspaceId] })
    },
  })

  const filtered = useMemo(() => {
    let result = [...members]

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (m) =>
          (m.user.name || "").toLowerCase().includes(q) ||
          m.user.email.toLowerCase().includes(q),
      )
    }

    if (roleFilter) {
      result = result.filter((m) => m.role === roleFilter)
    }

    if (sort === "name-asc") result.sort((a, b) => (a.user.name || a.user.email).localeCompare(b.user.name || b.user.email))
    else if (sort === "name-desc") result.sort((a, b) => (b.user.name || b.user.email).localeCompare(a.user.name || a.user.email))
    else if (sort === "role") result.sort((a, b) => ROLES.indexOf(a.role) - ROLES.indexOf(b.role))

    return result
  }, [members, search, roleFilter, sort])

  const hasFilters = !!search || !!roleFilter

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Members</h1>
          <p className="mt-1 text-muted-foreground">
            Manage your workspace team and invitations
          </p>
        </div>
        <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <UserPlus className="h-4 w-4" />
              Invite Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite Team Member</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <label className="text-sm font-medium">Email address</label>
                <Input
                  type="email"
                  placeholder="colleague@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-required="true"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Role</label>
                <div className="mt-1 flex gap-2">
                  {["viewer", "editor", "admin"].map((r) => (
                    <Button
                      key={r}
                      variant={role === r ? "default" : "outline"}
                      size="sm"
                      onClick={() => setRole(r)}
                      className="capitalize"
                    >
                      {r}
                    </Button>
                  ))}
                </div>
              </div>
              <Button
                className="w-full gap-2"
                onClick={() => invite.mutate()}
                disabled={!email || invite.isPending}
              >
                <Mail className="h-4 w-4" />
                {invite.isPending ? "Sending..." : "Send Invitation"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search / filter / sort bar */}
      {members.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 pl-9"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-1.5">
                <Filter className="h-3.5 w-3.5" />
                {roleFilter ? roleFilter.charAt(0).toUpperCase() + roleFilter.slice(1) : "All Roles"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Role</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setRoleFilter(null)}>All Roles</DropdownMenuItem>
              {ROLES.map((r) => (
                <DropdownMenuItem key={r} onClick={() => setRoleFilter(r)} className="capitalize">
                  {r}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-1.5">
                <ArrowUpDown className="h-3.5 w-3.5" />
                Sort
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSort("name-asc")}>Name A–Z</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSort("name-desc")}>Name Z–A</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSort("role")}>By Role</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {hasFilters && (
            <Button variant="ghost" size="sm" className="h-9" onClick={() => { setSearch(""); setRoleFilter(null) }}>
              Clear
            </Button>
          )}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Members ({filtered.length}{hasFilters ? ` of ${members.length}` : ""})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-14 animate-pulse rounded-lg bg-muted/50" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Users className="h-8 w-8 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
                {hasFilters ? "No members match your filters" : "No members found"}
              </p>
              {hasFilters && (
                <Button variant="ghost" size="sm" className="mt-2" onClick={() => { setSearch(""); setRoleFilter(null) }}>
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            filtered.map((member) => (
              <div key={member.id} className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {(member.user.name || member.user.email).charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{member.user.name || member.user.email}</p>
                    <p className="text-xs text-muted-foreground">{member.user.email}</p>
                  </div>
                </div>
                <Badge className={ROLE_COLORS[member.role] || ""} variant="secondary">
                  {member.role}
                </Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
