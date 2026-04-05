"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, FileText, Send, GitBranch, Layers, Sparkles, Pencil, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { PublishDialog } from "@/components/editor/publish-dialog"
import { GenerateDialog } from "@/components/editor/generate-dialog"
import { useDeleteRelease, type Release } from "@/hooks/use-releases"
import { apiClient } from "@/lib/api/client"

interface EditorHeaderProps {
  release: Release
  entryCount: number
}

export function EditorHeader({ release, entryCount }: EditorHeaderProps) {
  const router = useRouter()
  const [publishOpen, setPublishOpen] = useState(false)
  const [generateOpen, setGenerateOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const deleteRelease = useDeleteRelease()
  const [editingVersion, setEditingVersion] = useState(false)
  const [versionDraft, setVersionDraft] = useState(release.version)
  const versionRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setVersionDraft(release.version)
  }, [release.version])

  useEffect(() => {
    if (editingVersion && versionRef.current) {
      versionRef.current.focus()
      versionRef.current.select()
    }
  }, [editingVersion])

  const commitVersion = async () => {
    setEditingVersion(false)
    const trimmed = versionDraft.trim()
    if (trimmed && trimmed !== release.version) {
      await apiClient.put(`/api/releases/${release.id}`, { newVersion: trimmed })
      // URL stays the same since we use release ID
      router.refresh()
    } else {
      setVersionDraft(release.version)
    }
  }

  const isDraft = release.status === "draft"
  const breakingCount = release.entries?.filter((e) => e.breaking).length ?? 0
  const reviewedCount = release.entries?.filter((e) => e.reviewed).length ?? 0

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => router.push("/dashboard/editor")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <Separator orientation="vertical" className="h-6" />

          {/* Version */}
          {editingVersion ? (
            <input
              ref={versionRef}
              value={versionDraft}
              onChange={(e) => setVersionDraft(e.target.value)}
              onBlur={commitVersion}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitVersion()
                if (e.key === "Escape") {
                  setVersionDraft(release.version)
                  setEditingVersion(false)
                }
              }}
              className="h-7 border-b border-primary/40 bg-transparent px-1 text-lg font-bold outline-none"
            />
          ) : (
            <button
              type="button"
              className={cn(
                "group/version flex items-center gap-1.5 rounded px-1.5 py-0.5 text-lg font-bold transition-colors",
                isDraft && "hover:bg-muted/50 cursor-text",
              )}
              onClick={() => isDraft && setEditingVersion(true)}
              title={isDraft ? "Click to edit version" : undefined}
            >
              v{release.version}
              {isDraft && (
                <Pencil className="h-3 w-3 text-muted-foreground opacity-0 transition-opacity group-hover/version:opacity-100" />
              )}
            </button>
          )}

          {/* Status badge */}
          <Badge
            variant={isDraft ? "outline" : "default"}
            className={cn(
              isDraft
                ? "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400"
                : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
            )}
          >
            {isDraft ? "Draft" : "Published"}
          </Badge>

          {/* Repository indicator */}
          {release.repository ? (
            <Badge variant="secondary" className="text-[10px]">
              <GitBranch className="mr-1 h-3 w-3" />
              {release.repository.fullName}
            </Badge>
          ) : (
            <Badge variant="secondary" className="text-[10px]">
              <Layers className="mr-1 h-3 w-3" />
              Manual
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Entry count + review status */}
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5" />
              {entryCount} {entryCount === 1 ? "entry" : "entries"}
            </span>
            {entryCount > 0 && (
              <span className="flex items-center gap-1.5 text-xs">
                {reviewedCount === entryCount ? (
                  <Badge variant="outline" className="border-emerald-500/30 text-[10px] text-emerald-600 dark:text-emerald-400">
                    All reviewed
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px]">
                    {reviewedCount}/{entryCount} reviewed
                  </Badge>
                )}
              </span>
            )}
          </div>

          {/* Generate */}
          {isDraft && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setGenerateOpen(true)}
            >
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              Generate
            </Button>
          )}

          {/* Publish */}
          {isDraft && (
            <Button
              size="sm"
              onClick={() => setPublishOpen(true)}
              disabled={entryCount === 0}
            >
              <Send className="mr-1.5 h-3.5 w-3.5" />
              Publish
            </Button>
          )}

          {/* Delete draft */}
          {isDraft && (
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground hover:text-destructive"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      <PublishDialog
        open={publishOpen}
        onOpenChange={setPublishOpen}
        release={release}
        entryCount={entryCount}
        breakingCount={breakingCount}
      />

      <GenerateDialog
        open={generateOpen}
        onOpenChange={setGenerateOpen}
        release={release}
      />

      {/* Delete confirmation */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Draft Release</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>v{release.version}</strong>? All
              changelog entries in this draft will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleteRelease.isPending}
              onClick={() => {
                deleteRelease.mutate(release.id, {
                  onSuccess: () => {
                    setDeleteOpen(false)
                    router.push("/dashboard/editor")
                  },
                })
              }}
            >
              {deleteRelease.isPending ? "Deleting..." : "Delete Draft"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
