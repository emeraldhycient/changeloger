"use client"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useAuth } from "@/hooks/use-auth"
import { useWorkspaces, type Workspace } from "@/hooks/use-workspaces"
import { apiClient } from "@/lib/api/client"
import {
  GitBranch,
  CreditCard,
  AlertTriangle,
  Check,
  X,
  Sparkles,
  Zap,
  Crown,
  Loader2,
  Clock,
  Palette,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useWorkspaceStore } from "@/stores/workspace-store"
import { ThemeEditor } from "@/components/widgets/theme-editor"

const GITHUB_APP_SLUG = process.env.NEXT_PUBLIC_GITHUB_APP_SLUG || "changeloger"

// ─── Plan data for billing section ─────────────────────────────────────────

const BILLING_PLANS = [
  {
    id: "free" as const,
    name: "Free",
    icon: Sparkles,
    monthlyPrice: 0,
    annualPrice: 0,
    highlights: ["1 repo", "1 member", "50 AI gen/mo", "Page widget"],
  },
  {
    id: "pro" as const,
    name: "Pro",
    icon: Zap,
    popular: true,
    monthlyPrice: 15,
    annualPrice: 12,
    highlights: ["5 repos", "3 members", "500 AI gen/mo", "All widgets", "Analytics"],
  },
  {
    id: "team" as const,
    name: "Team",
    icon: Crown,
    monthlyPrice: 40,
    annualPrice: 32,
    highlights: ["Unlimited repos", "Unlimited members", "2K AI gen/mo", "Audit log"],
  },
]

function BillingSection({ workspace }: { workspace: Workspace | undefined }) {
  const [annual, setAnnual] = useState(false)
  const queryClient = useQueryClient()
  const currentPlan = workspace?.plan || "free"

  const checkout = useMutation({
    mutationFn: async (plan: "free" | "pro" | "team") => {
      if (!workspace) throw new Error("No workspace")
      const { data } = await apiClient.post("/api/billing/checkout", {
        workspaceId: workspace.id,
        plan,
        interval: annual ? "annual" : "monthly",
      })
      return data as { url?: string; success?: boolean; mock?: boolean }
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url
      } else {
        queryClient.invalidateQueries({ queryKey: ["workspaces"] })
      }
    },
  })

  // Trial countdown
  const trialDaysLeft = workspace?.trialEndsAt
    ? Math.max(0, Math.ceil((new Date(workspace.trialEndsAt).getTime() - Date.now()) / 86400000))
    : null

  return (
    <Card id="billing">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Billing
        </CardTitle>
        <CardDescription>Manage your subscription and plan</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Trial banner */}
        {trialDaysLeft !== null && trialDaysLeft > 0 && (
          <div className="flex items-center gap-3 rounded border border-primary/20 bg-primary/5 px-4 py-3">
            <Clock className="h-4 w-4 shrink-0 text-primary" />
            <div>
              <p className="text-sm font-medium">Pro trial active</p>
              <p className="text-xs text-muted-foreground">
                {trialDaysLeft} {trialDaysLeft === 1 ? "day" : "days"} remaining. Upgrade to keep Pro features.
              </p>
            </div>
          </div>
        )}

        {/* Current plan */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Current Plan</p>
            <p className="text-lg font-bold capitalize">{currentPlan}</p>
          </div>
          {workspace?.polarCustomerId && (
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                const { data } = await apiClient.post("/api/billing/portal", {
                  workspaceId: workspace.id,
                })
                window.open(data.url, "_blank")
              }}
            >
              Manage Subscription
            </Button>
          )}
        </div>

        <Separator />

        {/* Billing toggle */}
        <div className="flex items-center justify-center gap-3">
          <span className={cn("text-sm", !annual ? "font-medium" : "text-muted-foreground")}>
            Monthly
          </span>
          <Switch checked={annual} onCheckedChange={setAnnual} />
          <span className={cn("text-sm", annual ? "font-medium" : "text-muted-foreground")}>
            Annual
          </span>
          {annual && (
            <Badge variant="secondary" className="text-[10px] text-emerald-600 dark:text-emerald-400">
              Save 20%
            </Badge>
          )}
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-3 gap-3">
          {BILLING_PLANS.map((plan) => {
            const isCurrent = plan.id === currentPlan
            const isUpgrade =
              (currentPlan === "free" && plan.id !== "free") ||
              (currentPlan === "pro" && plan.id === "team")
            const price = annual ? plan.annualPrice : plan.monthlyPrice

            return (
              <div
                key={plan.id}
                className={cn(
                  "flex flex-col rounded border p-4",
                  isCurrent
                    ? "border-emerald-500/40 bg-emerald-500/5"
                    : plan.popular
                      ? "border-primary/40"
                      : "border-border",
                )}
              >
                <div className="mb-2 flex items-center gap-2">
                  <plan.icon className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold">{plan.name}</span>
                  {isCurrent && (
                    <Badge variant="outline" className="ml-auto border-emerald-500/30 text-[9px] text-emerald-600 dark:text-emerald-400">
                      Current
                    </Badge>
                  )}
                </div>

                <div className="mb-3">
                  <span className="text-xl font-bold">${price}</span>
                  <span className="text-xs text-muted-foreground">/mo</span>
                </div>

                <ul className="mb-4 flex-1 space-y-1.5">
                  {plan.highlights.map((h) => (
                    <li key={h} className="flex items-center gap-2 text-xs">
                      <Check className="h-3 w-3 shrink-0 text-emerald-500" />
                      {h}
                    </li>
                  ))}
                </ul>

                {isCurrent ? (
                  <Button variant="outline" size="sm" disabled className="w-full text-xs">
                    Current Plan
                  </Button>
                ) : isUpgrade ? (
                  <Button
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => checkout.mutate(plan.id as "free" | "pro" | "team")}
                    disabled={checkout.isPending}
                  >
                    {checkout.isPending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      `Upgrade to ${plan.name}`
                    )}
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => {
                      if (confirm(`Downgrade to ${plan.name}? You'll lose access to features above this plan's limits.`)) {
                        checkout.mutate(plan.id as "free" | "pro" | "team")
                      }
                    }}
                    disabled={checkout.isPending}
                  >
                    {checkout.isPending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      `Switch to ${plan.name}`
                    )}
                  </Button>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

export default function SettingsPage() {
  const { data: user } = useAuth()
  const { data: workspaces = [] } = useWorkspaces()
  const { currentWorkspaceId } = useWorkspaceStore()
  const workspace = workspaces.find((w) => w.id === currentWorkspaceId) || workspaces[0]
  const queryClient = useQueryClient()

  const [editingName, setEditingName] = useState(false)
  const [nameValue, setNameValue] = useState("")
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState("")
  const [widgetThemeConfig, setWidgetThemeConfig] = useState<Record<string, unknown>>(
    workspace?.widgetTheme || {}
  )

  const isFreePlan = (workspace?.plan || "free") === "free"

  const updateWorkspace = useMutation({
    mutationFn: async (data: { name?: string; widgetTheme?: Record<string, unknown> }) => {
      if (!workspace) return
      await apiClient.patch(`/api/workspaces/${workspace.id}`, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] })
      setEditingName(false)
    },
  })

  const saveWidgetTheme = useMutation({
    mutationFn: async () => {
      if (!workspace) return
      await apiClient.patch(`/api/workspaces/${workspace.id}`, {
        widgetTheme: widgetThemeConfig,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] })
    },
  })

  const handleStartEditName = () => {
    setNameValue(workspace?.name || "")
    setEditingName(true)
  }

  const handleSaveName = () => {
    if (nameValue.trim()) {
      updateWorkspace.mutate({ name: nameValue.trim() })
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-muted-foreground">
          Manage your workspace and account settings
        </p>
      </div>

      {/* Account */}
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Your personal account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Email</p>
              <p className="text-sm text-muted-foreground">{user?.email || "Loading..."}</p>
            </div>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Name</p>
              <p className="text-sm text-muted-foreground">{user?.name || "Not set"}</p>
            </div>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Connected Providers</p>
              <div className="mt-1 flex gap-2">
                {user?.providers?.map((p: string) => (
                  <Badge key={p} variant="secondary" className="capitalize">{p}</Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Workspace</CardTitle>
          <CardDescription>
            Workspace information and preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium">Workspace Name</p>
              {editingName ? (
                <div className="mt-1 flex items-center gap-2">
                  <Input
                    value={nameValue}
                    onChange={(e) => setNameValue(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                    className="h-8 max-w-xs"
                    autoFocus
                  />
                  <Button size="sm" onClick={handleSaveName} disabled={updateWorkspace.isPending}>
                    Save
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditingName(false)}>
                    Cancel
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">{workspace?.name || "Loading..."}</p>
              )}
            </div>
            {!editingName && (
              <Button variant="outline" size="sm" onClick={handleStartEditName}>
                Edit
              </Button>
            )}
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Workspace URL</p>
              <p className="text-sm text-muted-foreground">
                changeloger.dev/{workspace?.slug || "..."}
              </p>
            </div>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Plan</p>
              <p className="text-sm text-muted-foreground capitalize">
                {workspace?.plan || "free"}
                {workspace?.trialEndsAt && (
                  <span className="ml-2 text-xs text-primary">
                    (Pro trial until {new Date(workspace.trialEndsAt).toLocaleDateString()})
                  </span>
                )}
              </p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <a href="/dashboard/settings#billing">
                <CreditCard className="mr-1.5 h-3.5 w-3.5" />
                Manage
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Integrations */}
      <Card>
        <CardHeader>
          <CardTitle>Integrations</CardTitle>
          <CardDescription>
            Manage your connected services and apps
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center bg-muted">
                <GitBranch className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium">GitHub</p>
                <p className="text-sm text-muted-foreground">Install the GitHub App to connect repositories</p>
              </div>
            </div>
            <Button variant="outline" size="sm" asChild>
              <a href={`https://github.com/apps/${GITHUB_APP_SLUG}/installations/new`}>
                Connect
              </a>
            </Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center bg-muted">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zm1.271 0a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313z" /></svg>
              </div>
              <div>
                <p className="text-sm font-medium">Slack Notifications</p>
                <p className="text-sm text-muted-foreground">Coming soon</p>
              </div>
            </div>
            <Button variant="outline" size="sm" disabled>
              Configure
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Default Widget Theme */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Default Widget Theme
          </CardTitle>
          <CardDescription>
            Set default theme for new widgets. Individual widgets can override these settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ThemeEditor
            theme={widgetThemeConfig}
            onChange={setWidgetThemeConfig}
            locked={isFreePlan}
          />
          <Button
            onClick={() => saveWidgetTheme.mutate()}
            disabled={saveWidgetTheme.isPending || !workspace}
          >
            {saveWidgetTheme.isPending ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Theme"
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Billing */}
      <BillingSection workspace={workspace} />

      {/* Danger Zone */}
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-4 w-4" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Irreversible actions for your workspace
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Delete Workspace</p>
              <p className="text-sm text-muted-foreground">
                Permanently delete this workspace and all its data
              </p>
            </div>
            <Button variant="destructive" size="sm" onClick={() => setDeleteOpen(true)}>
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Workspace</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the workspace
              &quot;{workspace?.name}&quot; and all associated data including repositories,
              changelogs, and analytics.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Type <span className="font-mono font-medium text-foreground">{workspace?.slug}</span> to confirm:
            </p>
            <Input
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder={workspace?.slug || ""}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => { setDeleteOpen(false); setDeleteConfirm("") }}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleteConfirm !== workspace?.slug}
              onClick={() => {
                // Would call delete API here
                alert("Workspace deletion is not yet implemented for safety.")
                setDeleteOpen(false)
                setDeleteConfirm("")
              }}
            >
              Delete Workspace
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
