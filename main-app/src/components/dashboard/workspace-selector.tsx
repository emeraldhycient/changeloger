"use client"

import { useState, useEffect } from "react"
import { ChevronDown, Plus, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { useWorkspaces, useCreateWorkspace } from "@/hooks/use-workspaces"
import { useWorkspaceStore } from "@/stores/workspace-store"

export function WorkspaceSelector() {
  const { data: workspaces = [], isLoading } = useWorkspaces()
  const { currentWorkspaceId, setCurrentWorkspaceId, initialized, setInitialized } = useWorkspaceStore()
  const [createOpen, setCreateOpen] = useState(false)
  const [newName, setNewName] = useState("")
  const createWorkspace = useCreateWorkspace()

  // Auto-select first workspace, or reset if stored ID doesn't belong to this user
  useEffect(() => {
    if (workspaces.length > 0) {
      const storedExists = currentWorkspaceId && workspaces.find((w) => w.id === currentWorkspaceId)
      if (!storedExists) {
        // Stored workspace doesn't belong to this user — reset to their first workspace
        setCurrentWorkspaceId(workspaces[0].id)
      }
      setInitialized(true)
    }
  }, [workspaces, currentWorkspaceId, setCurrentWorkspaceId, setInitialized])

  const current = workspaces.find((w) => w.id === currentWorkspaceId)

  const handleCreate = async () => {
    const name = newName.trim()
    if (!name) return
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
    const workspace = await createWorkspace.mutateAsync({ name, slug })
    setCurrentWorkspaceId(workspace.id)
    setCreateOpen(false)
    setNewName("")
  }

  const initial = current?.name?.charAt(0)?.toUpperCase() || "W"

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-between px-2 text-sm font-medium text-sidebar-foreground"
          >
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center bg-primary/10 text-xs font-bold text-primary">
                {initial}
              </div>
              <span className="truncate">{isLoading ? "Loading..." : current?.name || "Select workspace"}</span>
            </div>
            <ChevronDown className="h-3.5 w-3.5 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          {workspaces.map((w) => (
            <DropdownMenuItem
              key={w.id}
              onClick={() => setCurrentWorkspaceId(w.id)}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <div className="flex h-5 w-5 items-center justify-center bg-primary/10 text-[10px] font-bold text-primary">
                  {w.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <span className="block truncate text-sm">{w.name}</span>
                  <span className="block text-[10px] text-muted-foreground capitalize">{w.plan}</span>
                </div>
              </div>
              {w.id === currentWorkspaceId && <Check className="h-3.5 w-3.5 text-primary" />}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setCreateOpen(true)} className="text-muted-foreground">
            <Plus className="mr-2 h-3.5 w-3.5" />
            Create workspace...
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Workspace</DialogTitle>
            <DialogDescription>
              Workspaces let you organize repositories and team members. Each workspace has its own plan and billing.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">Workspace Name</label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                placeholder="e.g. My Team"
                className="mt-1"
                autoFocus
              />
              {newName.trim() && (
                <p className="mt-1 text-xs text-muted-foreground">
                  URL: changeloger.dev/{newName.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="secondary" className="text-[10px]">Free Plan</Badge>
              New workspaces start on the Free plan with a 14-day Pro trial.
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => { setCreateOpen(false); setNewName("") }}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!newName.trim() || createWorkspace.isPending}>
              {createWorkspace.isPending ? "Creating..." : "Create Workspace"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
