"use client"

import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { GitBranch, FileText, Share2, ArrowRight, FolderGit2, ScrollText, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { apiClient } from "@/lib/api/client"
import { useWorkspaceStore } from "@/stores/workspace-store"

const gettingStartedCards = [
  {
    title: "Connect Repository",
    description: "Install the GitHub App to start tracking your commits and generating changelogs.",
    icon: GitBranch,
    cta: "Connect GitHub",
    href: "/dashboard/repositories",
  },
  {
    title: "Review Changelog",
    description: "AI will analyze your commits and generate your first changelog automatically.",
    icon: FileText,
    cta: "Open Editor",
    href: "/dashboard/editor",
  },
  {
    title: "Share with Your Team",
    description: "Invite team members to collaborate on changelogs and manage releases together.",
    icon: Share2,
    cta: "Invite Team",
    href: "/dashboard/team",
  },
]

export default function DashboardPage() {
  const workspaceId = useWorkspaceStore((s) => s.currentWorkspaceId)

  const { data: repos = [] } = useQuery({
    queryKey: ["repositories", workspaceId],
    queryFn: async () => {
      if (!workspaceId) return []
      const { data } = await apiClient.get(`/api/repositories?workspaceId=${workspaceId}`)
      return data
    },
    enabled: !!workspaceId,
  })

  const { data: workspaces = [] } = useQuery({
    queryKey: ["workspaces"],
    queryFn: async () => {
      const { data } = await apiClient.get("/api/workspaces")
      return data
    },
  })

  const memberCount = workspaces[0]?._count?.members ?? 1
  const repoCount = repos.length

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome to Changeloger</h1>
        <p className="mt-2 text-muted-foreground">
          Get started by connecting your first repository
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {gettingStartedCards.map((card) => (
          <Card key={card.title} className="group relative">
            <CardHeader>
              <div className="flex h-10 w-10 items-center justify-center bg-primary/10">
                <card.icon className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-lg">{card.title}</CardTitle>
              <CardDescription>{card.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" size="sm" className="group/btn" asChild>
                <Link href={card.href}>
                  {card.cta}
                  <ArrowRight className="ml-2 h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold">Overview</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total Repos", value: String(repoCount), icon: FolderGit2, href: "/dashboard/repositories" },
            { label: "Draft Changelogs", value: "0", icon: ScrollText, href: "/dashboard/editor" },
            { label: "Published Versions", value: "0", icon: FileText, href: "/dashboard/changelogs" },
            { label: "Team Members", value: String(memberCount), icon: Users, href: "/dashboard/team" },
          ].map((stat) => (
            <Link key={stat.label} href={stat.href}>
              <Card className="transition-colors hover:bg-muted/50">
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-muted">
                    <stat.icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
