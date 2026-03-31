import { GitBranch } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function RepositoriesPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Repositories</h1>
          <p className="mt-1 text-muted-foreground">
            Manage your connected GitHub repositories
          </p>
        </div>
        <Button>
          <GitBranch className="mr-2 h-4 w-4" />
          Connect Repository
        </Button>
      </div>

      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <GitBranch className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">No repositories connected yet</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Install the GitHub App to connect your first repository.
        </p>
        <Button variant="outline" className="mt-6">
          Connect GitHub
        </Button>
      </div>
    </div>
  )
}
