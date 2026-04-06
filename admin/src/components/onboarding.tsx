import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  LayoutDashboard, Users, Building2, CreditCard,
  Activity, BarChart3, Settings, Command, ChevronRight, X, Rocket,
} from "lucide-react"
import { cn } from "@/lib/utils"

const STORAGE_KEY = "admin_onboarding_complete"

interface OnboardingStep {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  href: string
}

const steps: OnboardingStep[] = [
  {
    title: "Dashboard Overview",
    description: "Your command center with KPIs, growth charts, and recent activity at a glance.",
    icon: LayoutDashboard,
    href: "/",
  },
  {
    title: "User Management",
    description: "View, search, suspend, and manage all platform users. Click any user for full details.",
    icon: Users,
    href: "/users",
  },
  {
    title: "Workspace Management",
    description: "Manage workspaces, change plans, toggle feature flags, and view workspace members.",
    icon: Building2,
    href: "/workspaces",
  },
  {
    title: "Revenue & Billing",
    description: "Track MRR, plan distribution, trial status, and identify churn risk.",
    icon: CreditCard,
    href: "/billing",
  },
  {
    title: "Analytics",
    description: "Deep-dive into user growth, feature adoption, and release activity trends.",
    icon: BarChart3,
    href: "/analytics",
  },
  {
    title: "Activity Log",
    description: "Full audit trail of every admin action — searchable and filterable.",
    icon: Activity,
    href: "/activity",
  },
  {
    title: "System & Settings",
    description: "Monitor service health, check database connectivity, and manage admins.",
    icon: Settings,
    href: "/system",
  },
  {
    title: "Quick Tips",
    description: "Press ⌘K to open the command palette for fast navigation. Press ? to see all keyboard shortcuts.",
    icon: Command,
    href: "",
  },
]

export function OnboardingDialog() {
  const [open, setOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    // Show onboarding if not yet completed
    const completed = localStorage.getItem(STORAGE_KEY)
    if (!completed) {
      // Small delay so the dashboard loads first
      const timer = setTimeout(() => setOpen(true), 500)
      return () => clearTimeout(timer)
    }
  }, [])

  function handleComplete() {
    localStorage.setItem(STORAGE_KEY, "true")
    setOpen(false)
  }

  function handleSkip() {
    localStorage.setItem(STORAGE_KEY, "true")
    setOpen(false)
  }

  function handleNext() {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  function handleGoTo(step: OnboardingStep) {
    if (step.href) {
      navigate(step.href)
    }
    handleNext()
  }

  // Escape to close
  useEffect(() => {
    if (!open) return
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault()
        handleSkip()
      }
      if (e.key === "Enter" || e.key === "ArrowRight") {
        e.preventDefault()
        handleNext()
      }
      if (e.key === "ArrowLeft" && currentStep > 0) {
        e.preventDefault()
        setCurrentStep(currentStep - 1)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [open, currentStep])

  if (!open) return null

  const step = steps[currentStep]
  const Icon = step.icon
  const isLast = currentStep === steps.length - 1

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="fixed inset-0 bg-black/60" onClick={handleSkip} />
      <div className="relative w-full max-w-md rounded-lg border border-border bg-card shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <Rocket className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold">Welcome to Admin Dashboard</span>
          </div>
          <button onClick={handleSkip} className="rounded p-1 text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="px-5 py-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-base font-bold">{step.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{step.description}</p>
            </div>
          </div>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-1.5 pb-4">
          {steps.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentStep(i)}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === currentStep ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/30",
              )}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border px-5 py-3">
          <button
            onClick={handleSkip}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Skip tour
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {currentStep + 1} / {steps.length}
            </span>
            {step.href ? (
              <button
                onClick={() => handleGoTo(step)}
                className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
              >
                Go there
                <ChevronRight className="h-3 w-3" />
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
              >
                {isLast ? "Get Started" : "Next"}
                <ChevronRight className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
