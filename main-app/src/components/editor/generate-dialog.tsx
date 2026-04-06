"use client"

import { useState } from "react"
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
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
  Sparkles,
  Loader2,
  CheckCircle2,
  Cpu,
  FileText,
  Zap,
} from "lucide-react"
import { useGenerateEntries, useUnprocessedCount } from "@/hooks/use-generate-entries"
import type { Release } from "@/hooks/use-releases"

interface GenerateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  release: Release
}

export function GenerateDialog({ open, onOpenChange, release }: GenerateDialogProps) {
  const [useAI, setUseAI] = useState(true)
  const [result, setResult] = useState<{
    entries: number
    processed: number
    method: string
  } | null>(null)

  const { data: countData } = useUnprocessedCount(release.id)
  const generate = useGenerateEntries()

  const unprocessedCount = countData?.unprocessedCount ?? 0

  const handleGenerate = async () => {
    setResult(null)
    const res = await generate.mutateAsync({
      releaseId: release.id,
      repositoryId: release.repositoryId || undefined,
      useAI,
    })
    setResult({
      entries: res.entries.length,
      processed: res.processedCount,
      method: res.method,
    })
  }

  const handleClose = () => {
    onOpenChange(false)
    // Reset result after close animation
    setTimeout(() => setResult(null), 300)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Generate from Changes
          </DialogTitle>
          <DialogDescription>
            Convert detected commits and changes into changelog entries.
          </DialogDescription>
        </DialogHeader>

        {result ? (
          <div className="space-y-4 py-4">
            <div className="flex flex-col items-center gap-3 text-center">
              <CheckCircle2 className="h-12 w-12 text-emerald-500" />
              <div>
                <p className="text-lg font-semibold">
                  {result.entries} {result.entries === 1 ? "entry" : "entries"} generated
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  From {result.processed} detected {result.processed === 1 ? "change" : "changes"} using {result.method === "ai" ? "AI summarization" : "rule-based analysis"}
                </p>
              </div>
              <Badge variant="secondary" className="mt-1">
                {result.method === "ai" ? (
                  <><Sparkles className="mr-1 h-3 w-3" /> AI Powered</>
                ) : (
                  <><Cpu className="mr-1 h-3 w-3" /> Rule-based</>
                )}
              </Badge>
            </div>
            <DialogFooter>
              <Button onClick={handleClose} className="w-full">
                Done
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <>
            <div className="space-y-5 py-2">
              {/* Unprocessed count */}
              <div className="flex items-center justify-between rounded border border-border px-4 py-3">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Unprocessed Changes</p>
                    <p className="text-xs text-muted-foreground">
                      {release.repository
                        ? `From ${release.repository.fullName}`
                        : "Across all workspace repositories"}
                    </p>
                  </div>
                </div>
                <Badge variant={unprocessedCount > 0 ? "default" : "secondary"}>
                  {unprocessedCount}
                </Badge>
              </div>

              <Separator />

              {/* AI toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Zap className="h-5 w-5 text-amber-500" />
                  <div>
                    <p className="text-sm font-medium">AI Summarization</p>
                    <p className="text-xs text-muted-foreground">
                      {useAI
                        ? "GPT-4o-mini will summarize commits into polished entries"
                        : "Use conventional commit messages directly"}
                    </p>
                  </div>
                </div>
                <Switch checked={useAI} onCheckedChange={setUseAI} />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="ghost" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={generate.isPending || unprocessedCount === 0}
              >
                {generate.isPending ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                    Generate {unprocessedCount > 0 ? `${unprocessedCount} Changes` : "Entries"}
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
