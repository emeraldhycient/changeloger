"use client"

import { Button } from "@/components/ui/button"
import { GitBranch } from "lucide-react"
import { useWorkspaceStore } from "@/stores/workspace-store"

const GITHUB_APP_SLUG = process.env.NEXT_PUBLIC_GITHUB_APP_SLUG || "changeloger"

export function GitHubConnectButton() {
  const { currentWorkspaceId } = useWorkspaceStore()

  const handleConnect = () => {
    const base = `https://github.com/apps/${GITHUB_APP_SLUG}/installations/new`
    const url = currentWorkspaceId ? `${base}?state=${currentWorkspaceId}` : base
    window.location.href = url
  }

  return (
    <Button className="gap-2" onClick={handleConnect}>
      <GitBranch className="h-4 w-4" />
      Connect GitHub Repository
    </Button>
  )
}
