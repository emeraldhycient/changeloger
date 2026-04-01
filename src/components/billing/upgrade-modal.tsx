"use client"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Check,
  X,
  Loader2,
  AlertCircle,
  Sparkles,
  Zap,
  Crown,
} from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { apiClient } from "@/lib/api/client"
import { useBillingStore } from "@/stores/billing-store"
import { useWorkspaceStore } from "@/stores/workspace-store"
import { useWorkspaces } from "@/hooks/use-workspaces"

// ─── Plan data ─────────────────────────────────────────────────────────────

const PLANS = [
  {
    id: "free" as const,
    name: "Free",
    icon: Sparkles,
    monthlyPrice: 0,
    annualPrice: 0,
    features: [
      { label: "1 repository", included: true },
      { label: "1 team member", included: true },
      { label: "50 AI generations/mo", included: true },
      { label: "Page widget only", included: true },
      { label: "Analytics", included: false },
      { label: "API access", included: false },
    ],
  },
  {
    id: "pro" as const,
    name: "Pro",
    icon: Zap,
    popular: true,
    monthlyPrice: 15,
    annualPrice: 12,
    features: [
      { label: "5 repositories", included: true },
      { label: "3 team members", included: true },
      { label: "500 AI generations/mo", included: true },
      { label: "All widget types", included: true },
      { label: "Full analytics", included: true },
      { label: "API access", included: true },
    ],
  },
  {
    id: "team" as const,
    name: "Team",
    icon: Crown,
    monthlyPrice: 40,
    annualPrice: 32,
    features: [
      { label: "Unlimited repositories", included: true },
      { label: "Unlimited members", included: true },
      { label: "2,000 AI generations/mo", included: true },
      { label: "All widget types", included: true },
      { label: "Analytics + export", included: true },
      { label: "Audit log + per-repo access", included: true },
    ],
  },
]

// ─── Component ─────────────────────────────────────────────────────────────

export function UpgradeModal() {
  const { upgradeModalOpen, limitMessage, closeUpgradeModal } = useBillingStore()
  const { currentWorkspaceId } = useWorkspaceStore()
  const { data: workspaces = [] } = useWorkspaces()
  const currentWorkspace = workspaces.find((w) => w.id === currentWorkspaceId)
  const currentPlan = currentWorkspace?.plan || "free"
  const queryClient = useQueryClient()

  const [annual, setAnnual] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)

  const checkout = useMutation({
    mutationFn: async (plan: "pro" | "team") => {
      if (!currentWorkspaceId) throw new Error("No workspace selected")
      const { data } = await apiClient.post("/api/billing/checkout", {
        workspaceId: currentWorkspaceId,
        plan,
        interval: annual ? "annual" : "monthly",
      })
      return data as { url?: string; success?: boolean; mock?: boolean; plan?: string }
    },
    onSuccess: (data) => {
      if (data.url) {
        // Polar checkout — redirect
        window.location.href = data.url
      } else if (data.mock) {
        // Mock mode — plan updated directly
        queryClient.invalidateQueries({ queryKey: ["workspaces"] })
        closeUpgradeModal()
      }
    },
    onError: (err: Error) => {
      setCheckoutError(err.message)
    },
  })

  const handleUpgrade = (plan: "pro" | "team") => {
    setCheckoutError(null)
    checkout.mutate(plan)
  }

  return (
    <Dialog
      open={upgradeModalOpen}
      onOpenChange={(open) => !open && closeUpgradeModal()}
    >
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Upgrade Your Plan</DialogTitle>
          <DialogDescription>
            Unlock more features and higher limits for your team.
          </DialogDescription>
        </DialogHeader>

        {/* Limit message */}
        {limitMessage && (
          <div className="flex items-start gap-2.5 rounded border border-amber-500/20 bg-amber-500/5 px-4 py-3">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
            <p className="text-sm text-amber-700 dark:text-amber-400">
              {limitMessage}
            </p>
          </div>
        )}

        {/* Billing toggle */}
        <div className="flex items-center justify-center gap-3 py-1">
          <span className={cn("text-sm font-medium transition-colors", !annual ? "text-foreground" : "text-muted-foreground")}>
            Monthly
          </span>
          <Switch checked={annual} onCheckedChange={setAnnual} />
          <span className={cn("text-sm font-medium transition-colors", annual ? "text-foreground" : "text-muted-foreground")}>
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
          {PLANS.map((plan) => {
            const isCurrent = plan.id === currentPlan
            const isDowngrade =
              (currentPlan === "team" && plan.id !== "team") ||
              (currentPlan === "pro" && plan.id === "free")
            const price = annual ? plan.annualPrice : plan.monthlyPrice

            return (
              <div
                key={plan.id}
                className={cn(
                  "flex flex-col rounded border p-4",
                  plan.popular && !isCurrent
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-border",
                  isCurrent && "border-emerald-500/40 bg-emerald-500/5",
                )}
              >
                {/* Header */}
                <div className="mb-3 flex items-center gap-2">
                  <plan.icon className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold">{plan.name}</span>
                  {isCurrent && (
                    <Badge
                      variant="outline"
                      className="ml-auto border-emerald-500/30 text-[10px] text-emerald-600 dark:text-emerald-400"
                    >
                      Current
                    </Badge>
                  )}
                  {plan.popular && !isCurrent && (
                    <Badge className="ml-auto text-[10px]">Popular</Badge>
                  )}
                </div>

                {/* Price */}
                <div className="mb-3">
                  <span className="text-2xl font-bold">${price}</span>
                  <span className="text-sm text-muted-foreground">/mo</span>
                  {annual && plan.monthlyPrice > 0 && (
                    <div className="mt-0.5 text-xs text-muted-foreground line-through">
                      ${plan.monthlyPrice}/mo
                    </div>
                  )}
                </div>

                <Separator className="mb-3" />

                {/* Features */}
                <ul className="mb-4 flex-1 space-y-1.5">
                  {plan.features.map((f) => (
                    <li key={f.label} className="flex items-center gap-2 text-xs">
                      {f.included ? (
                        <Check className="h-3 w-3 shrink-0 text-emerald-500" />
                      ) : (
                        <X className="h-3 w-3 shrink-0 text-muted-foreground/40" />
                      )}
                      <span
                        className={cn(
                          f.included
                            ? "text-foreground"
                            : "text-muted-foreground/60",
                        )}
                      >
                        {f.label}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                {isCurrent ? (
                  <Button variant="outline" size="sm" disabled className="w-full">
                    Current Plan
                  </Button>
                ) : isDowngrade ? (
                  <Button variant="outline" size="sm" disabled className="w-full">
                    Downgrade
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                    onClick={() => handleUpgrade(plan.id as "pro" | "team")}
                    disabled={checkout.isPending}
                  >
                    {checkout.isPending && checkout.variables === plan.id ? (
                      <>
                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      `Upgrade to ${plan.name}`
                    )}
                  </Button>
                )}
              </div>
            )
          })}
        </div>

        {/* Error */}
        {checkoutError && (
          <p className="text-center text-sm text-destructive">{checkoutError}</p>
        )}
      </DialogContent>
    </Dialog>
  )
}
