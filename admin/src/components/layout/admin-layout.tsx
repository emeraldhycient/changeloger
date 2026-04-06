import { useState, useEffect } from "react"
import { NavLink } from "react-router-dom"
import { useAuthStore } from "@/stores/auth-store"
import {
  LayoutDashboard, Users, Building2, Activity, LogOut, Shield,
  BarChart3, CreditCard, Settings, UserCog, Sun, Moon, Menu, X,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface NavSection {
  title: string
  items: { label: string; icon: React.ComponentType<{ className?: string }>; to: string }[]
}

const navSections: NavSection[] = [
  {
    title: "Platform",
    items: [
      { label: "Dashboard", icon: LayoutDashboard, to: "/" },
      { label: "Analytics", icon: BarChart3, to: "/analytics" },
    ],
  },
  {
    title: "Management",
    items: [
      { label: "Users", icon: Users, to: "/users" },
      { label: "Workspaces", icon: Building2, to: "/workspaces" },
    ],
  },
  {
    title: "Revenue",
    items: [
      { label: "Billing", icon: CreditCard, to: "/billing" },
    ],
  },
  {
    title: "Operations",
    items: [
      { label: "Activity", icon: Activity, to: "/activity" },
      { label: "System", icon: Settings, to: "/system" },
      { label: "Admins", icon: UserCog, to: "/admins" },
    ],
  },
]

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { admin, logout } = useAuthStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isDark, setIsDark] = useState(() => {
    return document.documentElement.classList.contains("dark") || localStorage.getItem("admin_theme") !== "light"
  })

  const toggleTheme = () => {
    const next = !isDark
    setIsDark(next)
    localStorage.setItem("admin_theme", next ? "dark" : "light")
    document.documentElement.classList.toggle("dark", next)
  }

  // Close sidebar on route change (mobile)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setSidebarOpen(false)
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const sidebarContent = (
    <>
      <div className="flex h-14 items-center gap-2 border-b border-border px-4">
        <Shield className="h-5 w-5 text-primary" />
        <span className="font-bold">Admin</span>
        {/* Close button on mobile */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="ml-auto rounded p-1 text-muted-foreground hover:text-foreground md:hidden"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto p-3">
        {navSections.map((section) => (
          <div key={section.title} className="mb-4">
            <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
              {section.title}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 my-4 px-3 py-2 text-sm transition-colors",
                      isActive
                        ? "border-l-2 border-primary bg-accent text-accent-foreground font-medium"
                        : "border-transparent text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                    )
                  }
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-border p-3">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{admin?.name || "Admin"}</p>
            <p className="truncate text-xs text-muted-foreground">{admin?.role}</p>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={toggleTheme}
              className="rounded p-1.5 text-muted-foreground hover:text-foreground"
              title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button onClick={logout} className="rounded p-1.5 text-muted-foreground hover:text-foreground">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  )

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile hamburger */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="fixed left-3 top-3 z-40 rounded-md border border-border bg-card p-2 shadow-sm md:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — hidden on mobile by default, overlay when open */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-full w-56 shrink-0 flex-col border-r border-border bg-card transition-transform md:static md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {sidebarContent}
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto p-6 pt-14 md:pt-6">
        {children}
      </main>
    </div>
  )
}
