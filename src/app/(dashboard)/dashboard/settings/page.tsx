"use client"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useAuth } from "@/hooks/use-auth"
import { useWorkspaces } from "@/hooks/use-workspaces"
import { apiClient } from "@/lib/api/client"
import { GitBranch, CreditCard, AlertTriangle } from "lucide-react"

const GITHUB_APP_SLUG = process.env.NEXT_PUBLIC_GITHUB_APP_SLUG || "changeloger"

export default function SettingsPage() {
  const { data: user } = useAuth()
  const { data: workspaces = [] } = useWorkspaces()
  const workspace = workspaces[0]
  const queryClient = useQueryClient()

  const [editingName, setEditingName] = useState(false)
  const [nameValue, setNameValue] = useState("")
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState("")

  const updateWorkspace = useMutation({
    mutationFn: async (data: { name?: string }) => {
      if (!workspace) return
      await apiClient.patch(`/api/workspaces/${workspace.id}`, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] })
      setEditingName(false)
    },
  })

  const handleStartEditName = () => {
    setNameValue(workspace?.name || "")
    setEditingName(true)
  }

  const handleSaveName = () => {
    if (nameValue.trim()) {
      updateWorkspace.mutate({ name: nameValue.trim() })
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-muted-foreground">
          Manage your workspace and account settings
        </p>
      </div>

      {/* Account */}
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Your personal account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Email</p>
              <p className="text-sm text-muted-foreground">{user?.email || "Loading..."}</p>
            </div>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Name</p>
              <p className="text-sm text-muted-foreground">{user?.name || "Not set"}</p>
            </div>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Connected Providers</p>
              <div className="mt-1 flex gap-2">
                {user?.providers?.map((p: string) => (
                  <Badge key={p} variant="secondary" className="capitalize">{p}</Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Workspace</CardTitle>
          <CardDescription>
            Workspace information and preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium">Workspace Name</p>
              {editingName ? (
                <div className="mt-1 flex items-center gap-2">
                  <Input
                    value={nameValue}
                    onChange={(e) => setNameValue(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                    className="h-8 max-w-xs"
                    autoFocus
                  />
                  <Button size="sm" onClick={handleSaveName} disabled={updateWorkspace.isPending}>
                    Save
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditingName(false)}>
                    Cancel
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">{workspace?.name || "Loading..."}</p>
              )}
            </div>
            {!editingName && (
              <Button variant="outline" size="sm" onClick={handleStartEditName}>
                Edit
              </Button>
            )}
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Workspace URL</p>
              <p className="text-sm text-muted-foreground">
                changeloger.dev/{workspace?.slug || "..."}
              </p>
            </div>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Plan</p>
              <p className="text-sm text-muted-foreground capitalize">
                {workspace?.plan || "free"}
                {workspace?.trialEndsAt && (
                  <span className="ml-2 text-xs text-primary">
                    (Pro trial until {new Date(workspace.trialEndsAt).toLocaleDateString()})
                  </span>
                )}
              </p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <a href="/dashboard/settings#billing">
                <CreditCard className="mr-1.5 h-3.5 w-3.5" />
                Manage
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Integrations */}
      <Card>
        <CardHeader>
          <CardTitle>Integrations</CardTitle>
          <CardDescription>
            Manage your connected services and apps
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center bg-muted">
                <GitBranch className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium">GitHub</p>
                <p className="text-sm text-muted-foreground">Install the GitHub App to connect repositories</p>
              </div>
            </div>
            <Button variant="outline" size="sm" asChild>
              <a href={`https://github.com/apps/${GITHUB_APP_SLUG}/installations/new`}>
                Connect
              </a>
            </Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center bg-muted">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zm1.271 0a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313z" /></svg>
              </div>
              <div>
                <p className="text-sm font-medium">Slack Notifications</p>
                <p className="text-sm text-muted-foreground">Coming soon</p>
              </div>
            </div>
            <Button variant="outline" size="sm" disabled>
              Configure
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Billing */}
      <Card id="billing">
        <CardHeader>
          <CardTitle>Billing</CardTitle>
          <CardDescription>Manage your subscription and payment method</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Current Plan</p>
              <p className="text-sm text-muted-foreground capitalize">{workspace?.plan || "free"}</p>
            </div>
            <Button
              variant="default"
              size="sm"
              onClick={async () => {
                if (workspace?.polarCustomerId) {
                  const { data } = await apiClient.post("/api/billing/portal", {
                    workspaceId: workspace.id,
                  })
                  window.open(data.url, "_blank")
                } else {
                  window.location.href = "/pricing"
                }
              }}
            >
              {workspace?.polarCustomerId ? "Manage Subscription" : "Upgrade Plan"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-4 w-4" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Irreversible actions for your workspace
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Delete Workspace</p>
              <p className="text-sm text-muted-foreground">
                Permanently delete this workspace and all its data
              </p>
            </div>
            <Button variant="destructive" size="sm" onClick={() => setDeleteOpen(true)}>
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Workspace</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the workspace
              &quot;{workspace?.name}&quot; and all associated data including repositories,
              changelogs, and analytics.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Type <span className="font-mono font-medium text-foreground">{workspace?.slug}</span> to confirm:
            </p>
            <Input
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder={workspace?.slug || ""}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => { setDeleteOpen(false); setDeleteConfirm("") }}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleteConfirm !== workspace?.slug}
              onClick={() => {
                // Would call delete API here
                alert("Workspace deletion is not yet implemented for safety.")
                setDeleteOpen(false)
                setDeleteConfirm("")
              }}
            >
              Delete Workspace
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
