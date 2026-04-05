"use client"

import { useState, useCallback, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import {
  PenLine,
  Plus,
  GitBranch,
  FileText,
  Calendar,
  Loader2,
  Layers,
  Trash2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { apiClient } from "@/lib/api/client"
import { useWorkspaceStore } from "@/stores/workspace-store"
import { useReleases, useCreateRelease, useRelease, useDeleteRelease } from "@/hooks/use-releases"
import { useEntries } from "@/hooks/use-changelog-entries"
import { EditorHeader } from "@/components/editor/editor-header"
import { EntryList } from "@/components/editor/entry-list"

// ─── New Draft Dialog ──────────────────────────────────────────────────────

function NewDraftDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const router = useRouter()
  const { currentWorkspaceId } = useWorkspaceStore()
  const createRelease = useCreateRelease()
  const [version, setVersion] = useState("")

  const handleCreate = async () => {
    if (!currentWorkspaceId || !version.trim()) return

    const release = await createRelease.mutateAsync({
      workspaceId: currentWorkspaceId,
      version: version.trim(),
    })

    onOpenChange(false)
    setVersion("")
    router.push(`/dashboard/editor?release=${release.id}`)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Draft</DialogTitle>
          <DialogDescription>
            Start a new changelog release draft. You can optionally link a repository later.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Version input */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-foreground">
              Version
            </label>
            <input
              type="text"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              placeholder="e.g. 1.0.0"
              aria-label="Version number"
              className="flex h-8 w-full items-center rounded-none border border-border bg-background px-2.5 text-xs outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-1 focus:ring-ring/50"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!version.trim() || createRelease.isPending}
          >
            {createRelease.isPending ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Draft"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Draft list view ───────────────────────────────────────────────────────

function DraftListView() {
  const router = useRouter()
  const [newDraftOpen, setNewDraftOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; version: string } | null>(null)
  const { currentWorkspaceId } = useWorkspaceStore()
  const deleteRelease = useDeleteRelease()

  const { data: allDrafts = [], isLoading } = useReleases(currentWorkspaceId, "draft")

  const handleSelectDraft = useCallback(
    (releaseId: string) => {
      router.push(`/dashboard/editor?release=${releaseId}`)
    },
    [router],
  )

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Changelog Editor</h1>
          <p className="mt-1 text-muted-foreground">
            Create and edit changelogs with AI assistance
          </p>
        </div>

        <Button onClick={() => setNewDraftOpen(true)} disabled={!currentWorkspaceId}>
          <Plus className="mr-1.5 h-4 w-4" />
          New Draft
        </Button>
      </div>

      {isLoading ? (
        <div role="status" aria-label="Loading content">
          <span className="sr-only">Loading...</span>
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-lg bg-muted/50" />
            ))}
          </div>
        </div>
      ) : allDrafts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <PenLine className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">No drafts yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Create a new draft to start writing your changelog.
          </p>
          <Button
            variant="outline"
            className="mt-6"
            onClick={() => setNewDraftOpen(true)}
          >
            Create New Draft
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {allDrafts.map((draft) => {
            const entryCount = draft._count?.entries ?? 0
            return (
              <Card
                key={draft.id}
                size="sm"
                className="cursor-pointer transition-shadow hover:shadow-sm"
                onClick={() => handleSelectDraft(draft.id)}
              >
                <CardContent className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded bg-amber-500/10">
                      <PenLine className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          v{draft.version}
                        </span>
                        <Badge
                          variant="outline"
                          className="border-amber-500/30 bg-amber-500/10 text-[10px] text-amber-700 dark:text-amber-400"
                        >
                          Draft
                        </Badge>
                      </div>
                      <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                        {draft.repository ? (
                          <span className="flex items-center gap-1">
                            <GitBranch className="h-3 w-3" />
                            {draft.repository.fullName}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <Layers className="h-3 w-3" />
                            Manual
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          {entryCount} {entryCount === 1 ? "entry" : "entries"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(draft.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation()
                        setDeleteTarget({ id: draft.id, version: draft.version })
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <NewDraftDialog open={newDraftOpen} onOpenChange={setNewDraftOpen} />

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Draft Release</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>v{deleteTarget?.version}</strong>? All
              changelog entries in this draft will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleteRelease.isPending}
              onClick={() => {
                if (deleteTarget) {
                  deleteRelease.mutate(deleteTarget.id, {
                    onSuccess: () => setDeleteTarget(null),
                  })
                }
              }}
            >
              {deleteRelease.isPending ? "Deleting..." : "Delete Draft"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ─── Editor view ───────────────────────────────────────────────────────────

function EditorView({ releaseId }: { releaseId: string }) {
  const { data: release, isLoading: isLoadingRelease } = useRelease(releaseId)
  const { data: entries = [] } = useEntries(releaseId)

  if (isLoadingRelease) {
    return (
      <div className="mx-auto max-w-5xl space-y-4" role="status" aria-label="Loading content">
        <span className="sr-only">Loading...</span>
        <div className="h-10 animate-pulse rounded bg-muted/50" />
        <div className="h-6 w-48 animate-pulse rounded bg-muted/50" />
        <Separator />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-lg bg-muted/50" />
        ))}
      </div>
    )
  }

  if (!release) {
    return (
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
          <h3 className="text-lg font-semibold">Release not found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            The requested release could not be found.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <EditorHeader release={release} entryCount={entries.length} />
      <Separator />
      <EntryList releaseId={releaseId} />
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────

function EditorPageContent() {
  const searchParams = useSearchParams()
  const releaseId = searchParams.get("release")

  if (releaseId) {
    return <EditorView releaseId={releaseId} />
  }

  return <DraftListView />
}

export default function EditorPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-16 text-muted-foreground">Loading editor...</div>}>
      <EditorPageContent />
    </Suspense>
  )
}
