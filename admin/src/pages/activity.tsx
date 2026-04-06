import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { Activity } from "lucide-react"

export function ActivityPage() {
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["admin-activity"],
    queryFn: async () => {
      const { data } = await api.get("/api/admin/activity")
      return data.logs || []
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Activity Log</h1>
        <p className="text-sm text-muted-foreground">Platform-wide admin actions and events</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-lg bg-muted/50" />
          ))}
        </div>
      ) : logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16">
          <Activity className="h-10 w-10 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">No activity yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {logs.map((log: any) => (
            <div key={log.id} className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
              <div>
                <p className="text-sm font-medium">{log.action}</p>
                <p className="text-xs text-muted-foreground">{log.targetType} · {log.admin?.name || "System"}</p>
              </div>
              <span className="text-xs text-muted-foreground">{new Date(log.createdAt).toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
