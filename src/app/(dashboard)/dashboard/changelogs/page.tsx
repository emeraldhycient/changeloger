"use client"

import Link from "next/link"
import { FileText, ArrowRight, Calendar, Eye, GitBranch, Layers } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useWorkspaceStore } from "@/stores/workspace-store"
import { useReleases } from "@/hooks/use-releases"

export default function ChangelogsPage() {
  const { currentWorkspaceId } = useWorkspaceStore()
  const { data: changelogs = [], isLoading } = useReleases(currentWorkspaceId, "published")

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Published Changelogs</h1>
          <p className="mt-1 text-muted-foreground">
            View and manage your published changelogs
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/editor">
            <FileText className="mr-2 h-4 w-4" />
            Open Editor
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-lg bg-muted/50" />
          ))}
        </div>
      ) : changelogs.length === 0 ? (
        <div className="flex flex-col items-center justify-center border border-dashed py-16">
          <div className="flex h-12 w-12 items-center justify-center bg-muted">
            <FileText className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">No published changelogs</h3>
          <p className="mt-1 max-w-sm text-center text-sm text-muted-foreground">
            Your published changelogs will appear here. Start by creating a draft in the editor.
          </p>
          <Button variant="outline" className="mt-6" asChild>
            <Link href="/dashboard/editor">
              Go to Editor
              <ArrowRight className="ml-2 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {changelogs.map((cl) => (
            <Card key={cl.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">v{cl.version}</span>
                      {cl.repository ? (
                        <Badge variant="secondary" className="text-[10px]">
                          <GitBranch className="mr-1 h-3 w-3" />
                          {cl.repository.fullName}
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[10px]">
                          <Layers className="mr-1 h-3 w-3" />
                          Manual
                        </Badge>
                      )}
                    </div>
                    <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {cl.publishedAt ? new Date(cl.publishedAt).toLocaleDateString() : "—"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {cl._count?.entries ?? 0} entries
                      </span>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/dashboard/editor?release=${cl.id}`}>
                    View
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
