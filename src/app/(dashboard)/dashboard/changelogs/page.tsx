import { FileText } from "lucide-react"

export default function ChangelogsPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Published Changelogs</h1>
        <p className="mt-1 text-muted-foreground">
          View and manage your published changelogs
        </p>
      </div>

      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <FileText className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">No published changelogs</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Your published changelogs will appear here once you release a version.
        </p>
      </div>
    </div>
  )
}
