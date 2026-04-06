import { NavLink } from "react-router-dom"
import { useAuthStore } from "@/stores/auth-store"
import {
  LayoutDashboard, Users, Building2, Activity, LogOut, Shield,
  BarChart3, CreditCard, Settings, UserCog,
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

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="flex h-full w-56 shrink-0 flex-col border-r border-border bg-card">
        <div className="flex h-14 items-center gap-2 border-b border-border px-4">
          <Shield className="h-5 w-5 text-primary" />
          <span className="font-bold">Admin</span>
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
            <button onClick={logout} className="rounded p-1.5 text-muted-foreground hover:text-foreground">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto p-6">
        {children}
      </main>
    </div>
  )
}
