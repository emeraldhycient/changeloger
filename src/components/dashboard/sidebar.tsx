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

const navItems = [
  { label: "Overview", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Repositories", icon: GitBranch, href: "/dashboard/repositories" },
  { label: "Editor", icon: PenLine, href: "/dashboard/editor" },
  { label: "Changelogs", icon: FileText, href: "/dashboard/changelogs" },
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

function NavLinks({ collapsed, pathname }: { collapsed?: boolean; pathname: string }) {
  return (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => {
        const isActive =
          item.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(item.href)

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "group flex items-center gap-3 px-3 py-2 text-sm font-medium transition-colors",
              collapsed && "justify-center px-2",
              isActive
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
            )}
            title={collapsed ? item.label : undefined}
          >
            <item.icon className={cn("h-4 w-4 shrink-0", isActive && "text-primary")} />
            {!collapsed && <span>{item.label}</span>}
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

export function Sidebar({ collapsed = false, onToggleCollapse, className }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-r border-sidebar-border bg-sidebar transition-all duration-200",
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
        <NavLinks collapsed={collapsed} pathname={pathname} />
      </ScrollArea>

      <div className="border-t border-sidebar-border p-3">
        <UserFooter collapsed={collapsed} />
      </div>
    </aside>
  )
}

export function MobileSidebar() {
  const pathname = usePathname()

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
        <NavLinks pathname={pathname} />
      </ScrollArea>

      <div className="border-t border-sidebar-border p-3">
        <UserFooter />
      </div>
    </div>
  )
}
