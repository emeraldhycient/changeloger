import { useEffect, useRef, useCallback } from "react"

type ShortcutHandler = () => void

interface ShortcutDef {
  key: string
  meta?: boolean
  ctrl?: boolean
  shift?: boolean
  handler: ShortcutHandler
  description: string
  category: string
}

/**
 * Global keyboard shortcut definitions — used by the help overlay
 */
export const SHORTCUT_DEFINITIONS = [
  { category: "Navigation", shortcuts: [
    { keys: ["g", "d"], description: "Go to Dashboard" },
    { keys: ["g", "u"], description: "Go to Users" },
    { keys: ["g", "w"], description: "Go to Workspaces" },
    { keys: ["g", "a"], description: "Go to Activity" },
    { keys: ["g", "n"], description: "Go to Analytics" },
    { keys: ["g", "b"], description: "Go to Billing" },
    { keys: ["g", "s"], description: "Go to System" },
    { keys: ["g", "m"], description: "Go to Admins" },
  ]},
  { category: "Actions", shortcuts: [
    { keys: ["⌘", "K"], description: "Open command palette" },
    { keys: ["?"], description: "Show keyboard shortcuts" },
    { keys: ["Esc"], description: "Close dialog / modal" },
    { keys: ["Enter"], description: "Confirm dialog" },
  ]},
]

/**
 * Hook for "g then X" style two-key navigation shortcuts.
 * Returns nothing — attaches/detaches listeners automatically.
 */
export function useNavigationShortcuts(navigate: (path: string) => void) {
  const pendingRef = useRef<string | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Ignore when typing in inputs
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return
      if ((e.target as HTMLElement)?.isContentEditable) return
      // Ignore if modifier keys are held
      if (e.metaKey || e.ctrlKey || e.altKey) return

      const key = e.key.toLowerCase()

      if (pendingRef.current === "g") {
        clearTimeout(timeoutRef.current)
        pendingRef.current = null

        const routes: Record<string, string> = {
          d: "/",
          u: "/users",
          w: "/workspaces",
          a: "/activity",
          n: "/analytics",
          b: "/billing",
          s: "/system",
          m: "/admins",
        }

        if (routes[key]) {
          e.preventDefault()
          navigate(routes[key])
        }
        return
      }

      if (key === "g") {
        pendingRef.current = "g"
        timeoutRef.current = setTimeout(() => {
          pendingRef.current = null
        }, 800)
      }
    },
    [navigate],
  )

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      clearTimeout(timeoutRef.current)
    }
  }, [handleKeyDown])
}
