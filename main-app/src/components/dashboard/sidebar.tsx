"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  GitBranch,
  PenLine,
  FileText,
  Users,
  BarChart3,
  Settings,
  Code,
  ChevronsLeft,
  ChevronsRight,
  Activity,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Logo } from "@/components/shared/logo"
import { ThemeToggle } from "@/components/shared/theme-toggle"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { WorkspaceSelector } from "@/components/dashboard/workspace-selector"
import { useAuth } from "@/hooks/use-auth"
import { useReleases } from "@/hooks/use-releases"
import { useWorkspaceStore } from "@/stores/workspace-store"

const navItems = [
  { label: "Overview", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Repositories", icon: GitBranch, href: "/dashboard/repositories" },
  { label: "Editor", icon: PenLine, href: "/dashboard/editor", badgeKey: "drafts" as const },
  { label: "Changelogs", icon: FileText, href: "/dashboard/changelogs" },
  { label: "Activity", icon: Activity, href: "/dashboard/activity" },
  { label: "Widgets", icon: Code, href: "/dashboard/widgets" },
  { label: "Team", icon: Users, href: "/dashboard/team" },
  { label: "Analytics", icon: BarChart3, href: "/dashboard/analytics" },
  { label: "Settings", icon: Settings, href: "/dashboard/settings" },
]

interface SidebarProps {
  collapsed?: boolean
  onToggleCollapse?: () => void
  className?: string
}

function NavLinks({ collapsed, pathname, draftCount }: { collapsed?: boolean; pathname: string; draftCount: number }) {
  return (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => {
        const isActive =
          item.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(item.href)

        const badge = item.badgeKey === "drafts" && draftCount > 0 ? draftCount : 0

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "group relative flex items-center gap-3 px-3 py-2 text-sm font-medium transition-colors",
              collapsed && "justify-center px-2",
              isActive
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
            )}
            title={collapsed ? `${item.label}${badge ? ` (${badge} drafts)` : ""}` : undefined}
          >
            <span className="relative">
              <item.icon className={cn("h-4 w-4 shrink-0", isActive && "text-primary")} />
              {collapsed && badge > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-500 text-[9px] font-bold text-white">
                  {badge > 9 ? "9+" : badge}
                </span>
              )}
            </span>
            {!collapsed && (
              <>
                <span className="flex-1">{item.label}</span>
                {badge > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500/15 px-1.5 text-[11px] font-semibold text-amber-500">
                    {badge}
                  </span>
                )}
              </>
            )}
          </Link>
        )
      })}
    </nav>
  )
}

function UserFooter({ collapsed }: { collapsed?: boolean }) {
  const { data: user } = useAuth()
  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.charAt(0).toUpperCase() || "U"

  if (collapsed) {
    return (
      <div className="flex flex-col items-center gap-2">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">{initials}</AvatarFallback>
        </Avatar>
        <ThemeToggle />
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 overflow-hidden">
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">{initials}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-sidebar-foreground">{user?.name || "User"}</p>
          <p className="truncate text-xs text-sidebar-foreground/50">{user?.email || ""}</p>
        </div>
      </div>
      <ThemeToggle />
    </div>
  )
}

function useDraftCount() {
  const currentWorkspaceId = useWorkspaceStore((s) => s.currentWorkspaceId)
  const { data: drafts } = useReleases(currentWorkspaceId, "draft")
  return drafts?.length ?? 0
}

export function Sidebar({ collapsed = false, onToggleCollapse, className }: SidebarProps) {
  const pathname = usePathname()
  const draftCount = useDraftCount()

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-sidebar-border bg-sidebar transition-all duration-200",
        collapsed ? "w-16" : "w-64",
        className,
      )}
    >
      <div className={cn("flex h-16 items-center border-b border-sidebar-border px-4", collapsed ? "justify-center" : "justify-between")}>
        <Logo iconOnly={collapsed} />
        {!collapsed && onToggleCollapse && (
          <Button variant="ghost" size="icon" className="h-7 w-7 text-sidebar-foreground/60 hover:text-sidebar-foreground" onClick={onToggleCollapse}>
            <ChevronsLeft className="h-4 w-4" />
          </Button>
        )}
        {collapsed && onToggleCollapse && (
          <Button variant="ghost" size="icon" className="absolute -right-3 top-5 z-10 h-6 w-6 rounded-full border border-sidebar-border bg-sidebar text-sidebar-foreground/60 shadow-sm hover:text-sidebar-foreground" onClick={onToggleCollapse}>
            <ChevronsRight className="h-3 w-3" />
          </Button>
        )}
      </div>

      {!collapsed && (
        <div className="px-3 py-3">
          <WorkspaceSelector />
        </div>
      )}

      <Separator className="bg-sidebar-border" />

      <ScrollArea className="flex-1 px-3 py-3">
        <NavLinks collapsed={collapsed} pathname={pathname} draftCount={draftCount} />
      </ScrollArea>

      <div className="border-t border-sidebar-border p-3">
        <UserFooter collapsed={collapsed} />
      </div>
    </aside>
  )
}

export function MobileSidebar() {
  const pathname = usePathname()
  const draftCount = useDraftCount()

  return (
    <div className="flex h-full flex-col bg-sidebar">
      <div className="flex h-16 items-center border-b border-sidebar-border px-4">
        <Logo />
      </div>

      <div className="px-3 py-3">
        <WorkspaceSelector />
      </div>

      <Separator className="bg-sidebar-border" />

      <ScrollArea className="flex-1 px-3 py-3">
        <NavLinks pathname={pathname} draftCount={draftCount} />
      </ScrollArea>

      <div className="border-t border-sidebar-border p-3">
        <UserFooter />
      </div>
    </div>
  )
}
