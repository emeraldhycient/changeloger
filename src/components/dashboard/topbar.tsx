"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, Bell, LogOut, User, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/shared/theme-toggle"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth, useLogout } from "@/hooks/use-auth"

const pageTitles: Record<string, string> = {
  "/dashboard": "Overview",
  "/dashboard/repositories": "Repositories",
  "/dashboard/editor": "Changelog Editor",
  "/dashboard/changelogs": "Published Changelogs",
  "/dashboard/widgets": "Widgets",
  "/dashboard/team": "Team Members",
  "/dashboard/analytics": "Analytics",
  "/dashboard/settings": "Settings",
}

interface TopbarProps {
  onMobileMenuToggle: () => void
}

export function Topbar({ onMobileMenuToggle }: TopbarProps) {
  const pathname = usePathname()
  const pageTitle = pageTitles[pathname] ?? "Dashboard"
  const { data: user } = useAuth()
  const logout = useLogout()

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user?.email?.charAt(0).toUpperCase() || "U"

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onMobileMenuToggle}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Dashboard</span>
          {pageTitle !== "Overview" && (
            <>
              <span className="text-muted-foreground">/</span>
              <span className="font-medium">{pageTitle}</span>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          <span className="sr-only">Notifications</span>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>
              <p className="text-sm font-medium">{user?.name || "User"}</p>
              <p className="text-xs text-muted-foreground">{user?.email || ""}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings">
                <User className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => logout.mutate()}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
