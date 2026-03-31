import { PenLine } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function EditorPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Changelog Editor</h1>
        <p className="mt-1 text-muted-foreground">
          Create and edit changelogs with AI assistance
        </p>
      </div>

      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <PenLine className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">No drafts available</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Connect a repository to generate your first changelog draft.
        </p>
        <Button variant="outline" className="mt-6">
          Create New Draft
        </Button>
      </div>
    </div>
  )
}
