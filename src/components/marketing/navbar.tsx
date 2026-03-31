"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Menu } from "lucide-react"

import { Logo } from "@/components/shared/logo"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet"

const navLinks = [
  { label: "Features", href: "/features" },
  { label: "Pricing", href: "/pricing" },
  { label: "Docs", href: "/docs" },
  { label: "Changelog", href: "/changelog" },
  { label: "Blog", href: "/blog" },
] as const

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 64)
    }

    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 right-0 left-0 z-50 transition-colors duration-300 ${
        scrolled
          ? "border-b border-border/40 bg-background/80 backdrop-blur-xl"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 sm:px-8">
        <Logo />

        <ul className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-3 md:flex">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/sign-in">Sign In</Link>
          </Button>
          <Button
            asChild
            size="sm"
            className="gradient-primary rounded-lg text-white"
          >
            <Link href="/sign-up">Get Started Free</Link>
          </Button>
        </div>

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label="Open menu"
            >
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <div className="flex flex-col gap-6 pt-8">
              <ul className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="block rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="flex flex-col gap-3 px-3">
                <Button variant="ghost" asChild>
                  <Link
                    href="/sign-in"
                    onClick={() => setMobileOpen(false)}
                  >
                    Sign In
                  </Link>
                </Button>
                <Button
                  asChild
                  className="gradient-primary rounded-lg text-white"
                >
                  <Link
                    href="/sign-up"
                    onClick={() => setMobileOpen(false)}
                  >
                    Get Started Free
                  </Link>
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  )
}
