"use client"

import { useState } from "react"
import { Sidebar, MobileSidebar } from "@/components/dashboard/sidebar"
import { Topbar } from "@/components/dashboard/topbar"
import { UpgradeModal } from "@/components/billing/upgrade-modal"
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar — fixed height, never scrolls with content */}
      <div className="hidden h-full shrink-0 md:block">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Mobile Sidebar Sheet */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <MobileSidebar />
        </SheetContent>
      </Sheet>

      {/* Main Content Area */}
      <div className="flex h-full flex-1 flex-col overflow-hidden">
        <Topbar onMobileMenuToggle={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>

      {/* Global upgrade modal — triggered by 402 errors */}
      <UpgradeModal />
    </div>
  )
}
