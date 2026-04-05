"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { GitBranch, Settings, Circle } from "lucide-react"
import type { Repository } from "@/types/models"

export function RepositoryList({ repositories }: { repositories: Repository[] }) {
  if (repositories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-12 text-center">
        <GitBranch className="h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">No repositories connected</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Connect your GitHub repositories to start generating changelogs.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {repositories.map((repo) => (
        <Card key={repo.id}>
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <GitBranch className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{repo.fullName}</span>
                  <Circle className={`h-2 w-2 fill-current ${repo.isActive ? "text-green-500" : "text-muted-foreground"}`} />
                  {repo.language && (
                    <Badge variant="secondary" className="text-xs">
                      {repo.language}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {repo._count?.releases ?? 0} releases &middot; {repo._count?.changeRecords ?? 0} changes detected
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/dashboard/repositories/${repo.id}`}>
                <Settings className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
