"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api/client"
import { useWorkspaceStore } from "@/stores/workspace-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Users, Mail, UserPlus, Shield } from "lucide-react"

const ROLE_COLORS: Record<string, string> = {
  owner: "bg-violet-500/10 text-violet-500",
  admin: "bg-blue-500/10 text-blue-500",
  editor: "bg-green-500/10 text-green-500",
  viewer: "bg-gray-500/10 text-gray-500",
}

export default function TeamPage() {
  const workspaceId = useWorkspaceStore((s) => s.currentWorkspaceId)
  const queryClient = useQueryClient()
  const [inviteOpen, setInviteOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [role, setRole] = useState("editor")

  const { data: members = [] } = useQuery({
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

  return (
    <div className="mx-auto max-w-5xl space-y-8">
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Members ({members.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {members.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <Users className="mr-2 h-5 w-5" />
              Loading members...
            </div>
          ) : (
            members.map((member: { id: string; role: string; user: { id: string; name: string | null; email: string; avatarUrl: string | null } }) => (
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
