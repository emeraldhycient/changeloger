import { useState, useEffect, useRef, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { api } from "@/lib/api"
import {
  LayoutDashboard, Users, Building2, Activity,
  BarChart3, CreditCard, Settings, UserCog, Search,
} from "lucide-react"

interface SearchResult {
  id: string
  label: string
  sublabel?: string
  type: "user" | "workspace"
  href: string
}

const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/" },
  { label: "Users", icon: Users, href: "/users" },
  { label: "Workspaces", icon: Building2, href: "/workspaces" },
  { label: "Analytics", icon: BarChart3, href: "/analytics" },
  { label: "Billing", icon: CreditCard, href: "/billing" },
  { label: "Activity", icon: Activity, href: "/activity" },
  { label: "System", icon: Settings, href: "/system" },
  { label: "Admins", icon: UserCog, href: "/admins" },
]

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  // Global keyboard listener
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  // Focus input on open
  useEffect(() => {
    if (open) {
      setQuery("")
      setResults([])
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  // Live search
  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      try {
        const [usersRes, workspacesRes] = await Promise.allSettled([
          api.get(`/api/admin/users?search=${encodeURIComponent(query)}&limit=5`),
          api.get(`/api/admin/workspaces?search=${encodeURIComponent(query)}&limit=5`),
        ])
        const items: SearchResult[] = []
        if (usersRes.status === "fulfilled") {
          const users = usersRes.value.data?.users ?? []
          for (const u of users) {
            items.push({ id: u.id, label: u.name || u.email, sublabel: u.email, type: "user", href: `/users/${u.id}` })
          }
        }
        if (workspacesRes.status === "fulfilled") {
          const workspaces = workspacesRes.value.data?.workspaces ?? []
          for (const w of workspaces) {
            items.push({ id: w.id, label: w.name, sublabel: w.slug, type: "workspace", href: `/workspaces/${w.id}` })
          }
        }
        setResults(items)
        setSelectedIndex(0)
      } catch {
        // ignore search errors
      }
    }, 250)
  }, [query])

  // Filter nav items by query
  const filteredNav = query.trim()
    ? NAV_ITEMS.filter((n) => n.label.toLowerCase().includes(query.toLowerCase()))
    : NAV_ITEMS

  const allItems = [...filteredNav.map((n) => ({ ...n, kind: "nav" as const })), ...results.map((r) => ({ ...r, kind: "result" as const }))]

  const handleSelect = useCallback(
    (idx: number) => {
      const item = allItems[idx]
      if (!item) return
      const href = item.kind === "nav" ? item.href : item.href
      navigate(href)
      setOpen(false)
    },
    [allItems, navigate],
  )

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIndex((i) => Math.min(i + 1, allItems.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === "Enter") {
      e.preventDefault()
      handleSelect(selectedIndex)
    } else if (e.key === "Escape") {
      setOpen(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]" onClick={() => setOpen(false)}>
      <div className="fixed inset-0 bg-black/50" />
      <div
        className="relative w-full max-w-lg rounded-lg border border-border bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search users, workspaces, or navigate..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <kbd className="hidden rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground sm:inline-block">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-72 overflow-y-auto py-2">
          {filteredNav.length > 0 && (
            <div>
              <p className="px-4 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                Navigation
              </p>
              {filteredNav.map((item, i) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.href}
                    onClick={() => { navigate(item.href); setOpen(false) }}
                    className={`flex w-full items-center gap-3 px-4 py-2 text-sm transition-colors ${i === selectedIndex ? "bg-accent text-accent-foreground" : "text-foreground hover:bg-muted"}`}
                  >
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    {item.label}
                  </button>
                )
              })}
            </div>
          )}

          {results.length > 0 && (
            <div>
              <p className="px-4 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                Search Results
              </p>
              {results.map((r, i) => {
                const idx = filteredNav.length + i
                return (
                  <button
                    key={`${r.type}-${r.id}`}
                    onClick={() => { navigate(r.href); setOpen(false) }}
                    className={`flex w-full items-center gap-3 px-4 py-2 text-sm transition-colors ${idx === selectedIndex ? "bg-accent text-accent-foreground" : "text-foreground hover:bg-muted"}`}
                  >
                    {r.type === "user" ? <Users className="h-4 w-4 text-muted-foreground" /> : <Building2 className="h-4 w-4 text-muted-foreground" />}
                    <div className="text-left">
                      <p>{r.label}</p>
                      {r.sublabel && r.sublabel !== r.label && (
                        <p className="text-xs text-muted-foreground">{r.sublabel}</p>
                      )}
                    </div>
                    <span className="ml-auto text-xs capitalize text-muted-foreground">{r.type}</span>
                  </button>
                )
              })}
            </div>
          )}

          {query.trim() && filteredNav.length === 0 && results.length === 0 && (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">No results found</p>
          )}
        </div>
      </div>
    </div>
  )
}
