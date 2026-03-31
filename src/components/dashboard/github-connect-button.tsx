"use client"

import { Button } from "@/components/ui/button"
import { GitBranch } from "lucide-react"

const GITHUB_APP_SLUG = process.env.NEXT_PUBLIC_GITHUB_APP_SLUG || "changeloger"

export function GitHubConnectButton() {
  const installUrl = `https://github.com/apps/${GITHUB_APP_SLUG}/installations/new`

  return (
    <Button asChild className="gap-2">
      <a href={installUrl}>
        <GitBranch className="h-4 w-4" />
        Connect GitHub Repository
      </a>
    </Button>
  )
}
