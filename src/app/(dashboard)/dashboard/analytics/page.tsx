import { BarChart3 } from "lucide-react"

export default function AnalyticsPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="mt-1 text-muted-foreground">
          Track changelog views, engagement, and adoption metrics
        </p>
      </div>

      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <BarChart3 className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">No analytics data yet</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Analytics will appear once you publish your first changelog.
        </p>
      </div>
    </div>
  )
}
