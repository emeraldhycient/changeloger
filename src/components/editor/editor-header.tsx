"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, FileText, Send, GitBranch, Layers } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { PublishDialog } from "@/components/editor/publish-dialog"
import type { Release } from "@/hooks/use-releases"
import { apiClient } from "@/lib/api/client"

interface EditorHeaderProps {
  release: Release
  entryCount: number
}

export function EditorHeader({ release, entryCount }: EditorHeaderProps) {
  const router = useRouter()
  const [publishOpen, setPublishOpen] = useState(false)
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
              className="rounded px-1 text-lg font-bold transition-colors hover:bg-muted/50"
              onClick={() => isDraft && setEditingVersion(true)}
              title={isDraft ? "Click to edit version" : undefined}
            >
              v{release.version}
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
          {/* Entry count */}
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <FileText className="h-3.5 w-3.5" />
            <span>
              {entryCount} {entryCount === 1 ? "entry" : "entries"}
            </span>
          </div>

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
        </div>
      </div>

      <PublishDialog
        open={publishOpen}
        onOpenChange={setPublishOpen}
        release={release}
        entryCount={entryCount}
        breakingCount={breakingCount}
      />
    </>
  )
}
