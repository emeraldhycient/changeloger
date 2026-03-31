"use client"

import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Code, Globe, Bell, Copy, Check, ExternalLink } from "lucide-react"
import { apiClient } from "@/lib/api/client"
import { useWorkspaceStore } from "@/stores/workspace-store"

const WIDGET_TYPES = [
  {
    type: "page" as const,
    title: "Changelog Page",
    description: "Full-page changelog rendered into a target div. Perfect for docs sites and standalone changelog pages.",
    icon: Globe,
  },
  {
    type: "modal" as const,
    title: "Changelog Modal",
    description: "Floating button + modal overlay with changelog content. Ideal for in-app \"What's New\" experiences.",
    icon: Code,
  },
  {
    type: "badge" as const,
    title: "Changelog Badge",
    description: "Minimal notification indicator (dot or count) on any element. Shows when new changes are available.",
    icon: Bell,
  },
]

export default function WidgetsPage() {
  const workspaceId = useWorkspaceStore((s) => s.currentWorkspaceId)
  const queryClient = useQueryClient()
  const [createType, setCreateType] = useState<"page" | "modal" | "badge" | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  const { data: repos = [] } = useQuery({
    queryKey: ["repositories", workspaceId],
    queryFn: async () => {
      if (!workspaceId) return []
      const { data } = await apiClient.get(`/api/repositories?workspaceId=${workspaceId}`)
      return data as Array<{ id: string; fullName: string }>
    },
    enabled: !!workspaceId,
  })

  const { data: widgets = [] } = useQuery({
    queryKey: ["widgets", repos.map((r: { id: string }) => r.id)],
    queryFn: async () => {
      if (repos.length === 0) return []
      const results = await Promise.all(
        repos.map(async (r: { id: string }) => {
          const { data } = await apiClient.get(`/api/widgets?repositoryId=${r.id}`)
          return data as Array<{ id: string; type: string; embedToken: string; repositoryId: string }>
        }),
      )
      return results.flat()
    },
    enabled: repos.length > 0,
  })

  const createWidget = useMutation({
    mutationFn: async ({ repositoryId, type }: { repositoryId: string; type: string }) => {
      const { data } = await apiClient.post("/api/widgets", { repositoryId, type })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["widgets"] })
      setCreateType(null)
    },
  })

  const [selectedRepo, setSelectedRepo] = useState("")

  const getEmbedSnippet = (token: string, type: string) => {
    const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    return `<script async src="${base}/widget/changeloger.js" data-token="${token}" data-type="${type}"></script>`
  }

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Embeddable Widgets</h1>
        <p className="mt-1 text-muted-foreground">
          Copy-paste a snippet to embed your changelog anywhere
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {WIDGET_TYPES.map((widget) => (
          <Card key={widget.type}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center bg-primary/10">
                  <widget.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">{widget.title}</CardTitle>
                  <Badge variant="secondary" className="mt-1 text-xs">{widget.type}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-4">{widget.description}</CardDescription>
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2"
                onClick={() => {
                  setCreateType(widget.type)
                  setSelectedRepo(repos[0]?.id || "")
                }}
                disabled={repos.length === 0}
              >
                <Copy className="h-3.5 w-3.5" />
                {repos.length === 0 ? "Connect a repo first" : "Create Widget"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Existing widgets */}
      <Card>
        <CardHeader>
          <CardTitle>Your Widgets</CardTitle>
          <CardDescription>
            {widgets.length === 0
              ? "No widgets created yet. Select a widget type above to get started."
              : `${widgets.length} widget${widgets.length === 1 ? "" : "s"} created`}
          </CardDescription>
        </CardHeader>
        {widgets.length > 0 && (
          <CardContent className="space-y-3">
            {widgets.map((w: { id: string; type: string; embedToken: string }) => (
              <div
                key={w.id}
                className="flex items-center justify-between border border-border p-3"
              >
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="capitalize">{w.type}</Badge>
                  <code className="text-xs text-muted-foreground">{w.embedToken.slice(0, 8)}...</code>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => handleCopy(getEmbedSnippet(w.embedToken, w.type), w.id)}
                  >
                    {copied === w.id ? (
                      <><Check className="h-3.5 w-3.5 text-green-500" /> Copied</>
                    ) : (
                      <><Copy className="h-3.5 w-3.5" /> Copy Snippet</>
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        )}
      </Card>

      {/* Create Widget Dialog */}
      <Dialog open={!!createType} onOpenChange={(open) => !open && setCreateType(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create {createType} Widget</DialogTitle>
            <DialogDescription>
              Select a repository to create a widget for.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <label className="text-sm font-medium">Repository</label>
            <select
              value={selectedRepo}
              onChange={(e) => setSelectedRepo(e.target.value)}
              className="flex h-8 w-full items-center border border-border bg-background px-2.5 text-xs outline-none focus:border-ring focus:ring-1 focus:ring-ring/50"
            >
              {repos.map((r: { id: string; fullName: string }) => (
                <option key={r.id} value={r.id}>{r.fullName}</option>
              ))}
            </select>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setCreateType(null)}>Cancel</Button>
            <Button
              onClick={() => {
                if (selectedRepo && createType) {
                  createWidget.mutate({ repositoryId: selectedRepo, type: createType })
                }
              }}
              disabled={!selectedRepo || createWidget.isPending}
            >
              {createWidget.isPending ? "Creating..." : "Create Widget"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
