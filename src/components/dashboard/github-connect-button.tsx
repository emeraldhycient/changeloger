"use client"

import { Button } from "@/components/ui/button"
import { GitBranch } from "lucide-react"
import { useWorkspaceStore } from "@/stores/workspace-store"

const GITHUB_APP_SLUG = process.env.NEXT_PUBLIC_GITHUB_APP_SLUG || "changeloger"

export function GitHubConnectButton() {
  const { currentWorkspaceId } = useWorkspaceStore()

  // Pass workspace ID as state so the callback knows which workspace to link
  const installUrl = currentWorkspaceId
    ? `https://github.com/apps/${GITHUB_APP_SLUG}/installations/new?state=${currentWorkspaceId}`
    : `https://github.com/apps/${GITHUB_APP_SLUG}/installations/new`

  return (
    <Button asChild className="gap-2" disabled={!currentWorkspaceId}>
      <a href={installUrl}>
        <GitBranch className="h-4 w-4" />
        Connect GitHub Repository
      </a>
    </Button>
  )
}
