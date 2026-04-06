import Link from "next/link"
import {
  Rocket,
  GitBranch,
  Cpu,
  PenLine,
  Code2,
  BookOpen,
  Users,
  CreditCard,
  ChevronLeft,
} from "lucide-react"

const sidebarLinks = [
  { title: "Getting Started", href: "/docs/getting-started", icon: Rocket },
  { title: "GitHub App Setup", href: "/docs/github-app", icon: GitBranch },
  { title: "Detection Engines", href: "/docs/detection-engines", icon: Cpu },
  { title: "Changelog Editor", href: "/docs/changelog-editor", icon: PenLine },
  { title: "Embeddable Widgets", href: "/docs/embeddable-widgets", icon: Code2 },
  { title: "API Reference", href: "/docs/api-reference", icon: BookOpen },
  { title: "Team Management", href: "/docs/team-management", icon: Users },
  { title: "Billing & Plans", href: "/docs/billing", icon: CreditCard },
]

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-7xl px-6 py-24 sm:px-8 sm:py-32">
      <div className="flex flex-col gap-10 lg:flex-row">
        {/* Sidebar */}
        <aside className="w-full shrink-0 lg:w-56">
          <Link
            href="/docs"
            className="mb-6 flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            All docs
          </Link>
          <nav className="flex flex-row flex-wrap gap-1 lg:flex-col">
            {sidebarLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <link.icon className="h-4 w-4 shrink-0" />
                {link.title}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  )
}
