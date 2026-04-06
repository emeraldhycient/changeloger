import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { cn } from "@/lib/utils"
import { Database, Server, AlertTriangle, CheckCircle, XCircle } from "lucide-react"

export function SystemPage() {
  const { data: health, isLoading } = useQuery({
    queryKey: ["admin-system-health"],
    queryFn: async () => {
      const { data } = await api.get("/api/admin/system/health")
      return data
    },
    refetchInterval: 30000,
  })

  const dbStatus = health?.database ?? health?.db
  const isDbHealthy = dbStatus?.status === "ok" || dbStatus?.status === "healthy" || dbStatus?.connected === true

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">System</h1>
        <p className="text-sm text-muted-foreground">Platform health and system information</p>
      </div>

      {/* Health Checks */}
      <div>
        <h3 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">Health Checks</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <HealthCard
            label="Database"
            icon={Database}
            isLoading={isLoading}
            healthy={isDbHealthy}
            latency={dbStatus?.latency ?? dbStatus?.responseTime}
          />
          <HealthCard
            label="API Server"
            icon={Server}
            isLoading={isLoading}
            healthy={health?.status === "ok" || health?.status === "healthy" || !!health}
            latency={health?.latency}
          />
        </div>
      </div>

      {/* Platform Info */}
      <div>
        <h3 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">Platform Info</h3>
        <div className="rounded-lg border border-border">
          <table className="w-full text-sm">
            <tbody>
              <InfoRow label="Uptime" value={health?.uptime ? formatUptime(health.uptime) : "—"} />
              <InfoRow label="Node Version" value={health?.nodeVersion ?? health?.node ?? "—"} />
              <InfoRow label="Environment" value={health?.environment ?? health?.env ?? "—"} />
              <InfoRow label="Version" value={health?.version ?? health?.appVersion ?? "—"} />
              <InfoRow label="Memory Usage" value={health?.memoryUsage ? `${Math.round(health.memoryUsage / 1024 / 1024)} MB` : "—"} />
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Errors */}
      <div>
        <h3 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">Recent Errors</h3>
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16">
          <AlertTriangle className="h-10 w-10 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">Error tracking integration coming soon</p>
          <p className="mt-1 text-xs text-muted-foreground">Connect Sentry or similar for production error monitoring</p>
        </div>
      </div>
    </div>
  )
}

function HealthCard({
  label,
  icon: Icon,
  isLoading,
  healthy,
  latency,
}: {
  label: string
  icon: React.ComponentType<{ className?: string }>
  isLoading: boolean
  healthy: boolean
  latency?: number
}) {
  return (
    <div className="rounded-lg border border-border p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{label}</span>
        </div>
        {isLoading ? (
          <div className="h-5 w-16 animate-pulse rounded bg-muted" />
        ) : (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
              healthy ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500",
            )}
          >
            {healthy ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
            {healthy ? "Healthy" : "Unhealthy"}
          </span>
        )}
      </div>
      {latency !== undefined && (
        <p className={cn(
          "mt-2 text-xs",
          latency < 100 ? "text-emerald-500" : latency < 500 ? "text-amber-500" : "text-red-500",
        )}>
          Latency: {latency}ms
        </p>
      )}
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <tr className="border-b border-border last:border-0">
      <td className="px-4 py-3 font-medium text-muted-foreground w-48">{label}</td>
      <td className="px-4 py-3">{value}</td>
    </tr>
  )
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const parts: string[] = []
  if (days > 0) parts.push(`${days}d`)
  if (hours > 0) parts.push(`${hours}h`)
  parts.push(`${mins}m`)
  return parts.join(" ")
}
