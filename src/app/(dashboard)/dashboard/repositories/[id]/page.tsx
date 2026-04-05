"use client"

import { use } from "react"
import { useRouter } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  ArrowLeft,
  GitBranch,
  Circle,
  Calendar,
  FileText,
  Activity,
  Trash2,
  Loader2,
  Settings,
  Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { apiClient } from "@/lib/api/client"
import type { Repository, ChangeRecord } from "@/types/models"

interface Release {
  id: string
  version: string
  status: string
  publishedAt: string | null
  createdAt: string
  _count?: { entries: number }
}

export default function RepositoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const queryClient = useQueryClient()

  const { data: repo, isLoading } = useQuery<Repository>({
    queryKey: ["repository", id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/api/repositories/${id}`)
      return data
    },
  })

  const { data: changes = [] } = useQuery<ChangeRecord[]>({
    queryKey: ["change-records", id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/api/repositories/${id}/changes`)
      return data
    },
    enabled: !!repo,
  })

  const { data: releases = [] } = useQuery<Release[]>({
    queryKey: ["repo-releases", id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/api/repositories/${id}/releases`)
      return data
    },
    enabled: !!repo,
  })

  const toggleActive = useMutation({
    mutationFn: async (isActive: boolean) => {
      const { data } = await apiClient.patch(`/api/repositories/${id}`, { isActive })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["repository", id] })
      queryClient.invalidateQueries({ queryKey: ["repositories"] })
    },
  })

  const deleteRepo = useMutation({
    mutationFn: async () => {
      await apiClient.delete(`/api/repositories/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["repositories"] })
      queryClient.invalidateQueries({ queryKey: ["releases"] })
      queryClient.invalidateQueries({ queryKey: ["widgets"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] })
      router.push("/dashboard/repositories")
    },
  })

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="h-8 w-64 animate-pulse rounded bg-muted/50" />
        <div className="h-32 animate-pulse rounded-lg bg-muted/50" />
        <div className="h-64 animate-pulse rounded-lg bg-muted/50" />
      </div>
    )
  }

  if (!repo) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
          <h3 className="text-lg font-semibold">Repository not found</h3>
          <Button variant="outline" className="mt-4" onClick={() => router.push("/dashboard/repositories")}>
            Back to Repositories
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => router.push("/dashboard/repositories")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center gap-3">
            <GitBranch className="h-5 w-5 text-muted-foreground" />
            <h1 className="text-2xl font-bold">{repo.fullName}</h1>
            <Circle
              className={`h-2.5 w-2.5 fill-current ${repo.isActive ? "text-emerald-500" : "text-muted-foreground"}`}
            />
          </div>
        </div>
      </div>

      {/* Info card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Settings className="h-4 w-4" />
            Repository Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Full Name</p>
              <p className="font-medium">{repo.fullName}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Default Branch</p>
              <p className="font-medium">{repo.defaultBranch}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Language</p>
              <p className="font-medium">{repo.language || "Not detected"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">GitHub Account</p>
              <p className="font-medium">{repo.githubInstallation?.accountLogin}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Connected</p>
              <p className="font-medium">{new Date(repo.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Workspace</p>
              <p className="font-medium">{repo.workspace?.name}</p>
            </div>
          </div>

          <Separator />

          {/* Active toggle */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Monitoring</p>
              <p className="text-xs text-muted-foreground">
                {repo.isActive
                  ? "Actively monitoring commits, tags, and releases"
                  : "Monitoring paused — no new changes will be detected"}
              </p>
            </div>
            <Switch
              checked={repo.isActive}
              onCheckedChange={(checked) => toggleActive.mutate(checked)}
              disabled={toggleActive.isPending}
            />
          </div>
        </CardContent>
      </Card>

      {/* Recent releases */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4" />
            Releases
          </CardTitle>
          <CardDescription>Changelogs linked to this repository</CardDescription>
        </CardHeader>
        <CardContent>
          {releases.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No releases yet. Publish a changelog to see it here.
            </p>
          ) : (
            <div className="space-y-2">
              {releases.slice(0, 10).map((release) => (
                <button
                  key={release.id}
                  type="button"
                  onClick={() => router.push(`/dashboard/editor?release=${release.id}`)}
                  className="flex w-full items-center justify-between rounded border border-border px-4 py-2.5 text-left transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">v{release.version}</span>
                    <Badge
                      variant={release.status === "published" ? "default" : "secondary"}
                      className="text-[10px]"
                    >
                      {release.status}
                    </Badge>
                    {release._count && (
                      <span className="text-xs text-muted-foreground">
                        {release._count.entries} entries
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {release.publishedAt
                      ? new Date(release.publishedAt).toLocaleDateString()
                      : new Date(release.createdAt).toLocaleDateString()}
                  </span>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent changes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="h-4 w-4" />
            Detected Changes
          </CardTitle>
          <CardDescription>Raw changes detected from commits, diffs, and version bumps</CardDescription>
        </CardHeader>
        <CardContent>
          {changes.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No changes detected yet. Push commits to this repository to start detection.
            </p>
          ) : (
            <div className="space-y-1.5">
              {changes.slice(0, 20).map((change) => (
                <div
                  key={change.id}
                  className="flex items-center justify-between rounded border border-border px-4 py-2 text-sm"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Badge variant="outline" className="shrink-0 text-[10px]">
                      {change.source}
                    </Badge>
                    {change.type && (
                      <Badge variant="secondary" className="shrink-0 text-[10px]">
                        {change.type}
                      </Badge>
                    )}
                    <span className="truncate">{change.subject}</span>
                    {change.breaking && (
                      <Badge variant="destructive" className="shrink-0 text-[10px]">
                        Breaking
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0 text-xs text-muted-foreground">
                    {change.commitSha && (
                      <code className="font-mono">{change.commitSha.slice(0, 7)}</code>
                    )}
                    <Clock className="h-3 w-3" />
                    {new Date(change.timestamp).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-base text-destructive">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Delete Repository</p>
              <p className="text-xs text-muted-foreground">
                Remove this repository and all associated changelogs, releases, and analytics data.
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                if (confirm(`Delete ${repo.fullName}? This cannot be undone.`)) {
                  deleteRepo.mutate()
                }
              }}
              disabled={deleteRepo.isPending}
            >
              {deleteRepo.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <>
                  <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                  Delete
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
