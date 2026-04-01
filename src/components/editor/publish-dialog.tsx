"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AlertTriangle, CheckCircle2, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { apiClient } from "@/lib/api/client"
import type { Release } from "@/hooks/use-releases"

interface PublishDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  release: Release
  entryCount: number
  breakingCount: number
}

export function PublishDialog({
  open,
  onOpenChange,
  release,
  entryCount,
  breakingCount,
}: PublishDialogProps) {
  const router = useRouter()
  const [publishing, setPublishing] = useState(false)
  const [published, setPublished] = useState(false)

  const unreviewedCount =
    release.entries?.filter((e) => !e.reviewed).length ?? 0

  const handlePublish = async () => {
    setPublishing(true)
    try {
      await apiClient.post(`/api/releases/${release.id}/publish`)
      setPublished(true)
      setTimeout(() => {
        onOpenChange(false)
        router.push("/dashboard/editor")
        router.refresh()
      }, 1500)
    } catch {
      setPublishing(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!publishing) {
          onOpenChange(value)
          setPublished(false)
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {published ? "Published!" : "Publish Release"}
          </DialogTitle>
          <DialogDescription>
            {published
              ? `Version ${release.version} has been published successfully.`
              : `Review the summary before publishing v${release.version}.`}
          </DialogDescription>
        </DialogHeader>

        {published ? (
          <div className="flex flex-col items-center gap-3 py-6">
            <CheckCircle2 className="h-12 w-12 text-emerald-500" />
            <p className="text-sm text-muted-foreground">Redirecting...</p>
          </div>
        ) : (
          <>
            {/* Summary */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Version</span>
                <span className="font-medium">{release.version}</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Entries</span>
                <span className="font-medium">{entryCount}</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Breaking changes</span>
                <span className="font-medium">
                  {breakingCount > 0 ? (
                    <Badge variant="destructive" className="text-[10px]">
                      {breakingCount}
                    </Badge>
                  ) : (
                    "None"
                  )}
                </span>
              </div>

              {/* Warnings */}
              {(breakingCount > 0 || unreviewedCount > 0) && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    {breakingCount > 0 && (
                      <div className="flex items-start gap-2 text-xs text-amber-700 dark:text-amber-400">
                        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        <span>
                          This release contains {breakingCount} breaking{" "}
                          {breakingCount === 1 ? "change" : "changes"}.
                        </span>
                      </div>
                    )}
                    {unreviewedCount > 0 && (
                      <div className="flex items-start gap-2 text-xs text-amber-700 dark:text-amber-400">
                        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        <span>
                          {unreviewedCount} {unreviewedCount === 1 ? "entry has" : "entries have"}{" "}
                          not been reviewed.
                        </span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={publishing}
              >
                Cancel
              </Button>
              <Button onClick={handlePublish} disabled={publishing}>
                {publishing ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  "Confirm & Publish"
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
