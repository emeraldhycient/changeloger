"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import {
  GripVertical,
  Trash2,
  AlertTriangle,
  Shield,
  Zap,
  Plus,
  Minus,
  RefreshCw,
  Lock,
  FileText,
  Wrench,
  BookOpen,
  Bug,
  CheckCircle2,
  Circle,
  ToggleLeft,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { ReleaseEntry } from "@/hooks/use-releases"

// ─── Category config ───────────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<
  string,
  { label: string; color: string; icon: React.ComponentType<{ className?: string }> }
> = {
  added: { label: "Added", color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400", icon: Plus },
  fixed: { label: "Fixed", color: "bg-blue-500/15 text-blue-700 dark:text-blue-400", icon: Bug },
  changed: { label: "Changed", color: "bg-amber-500/15 text-amber-700 dark:text-amber-400", icon: RefreshCw },
  removed: { label: "Removed", color: "bg-red-500/15 text-red-700 dark:text-red-400", icon: Minus },
  deprecated: { label: "Deprecated", color: "bg-orange-500/15 text-orange-700 dark:text-orange-400", icon: AlertTriangle },
  security: { label: "Security", color: "bg-purple-500/15 text-purple-700 dark:text-purple-400", icon: Shield },
  performance: { label: "Performance", color: "bg-orange-500/15 text-orange-700 dark:text-orange-400", icon: Zap },
  documentation: { label: "Docs", color: "bg-sky-500/15 text-sky-700 dark:text-sky-400", icon: BookOpen },
  maintenance: { label: "Maintenance", color: "bg-gray-500/15 text-gray-700 dark:text-gray-400", icon: Wrench },
  breaking: { label: "Breaking", color: "bg-red-600/15 text-red-700 dark:text-red-400", icon: AlertTriangle },
}

const IMPACT_CONFIG: Record<string, { label: string; color: string }> = {
  critical: { label: "Critical", color: "bg-red-500/15 text-red-700 dark:text-red-400" },
  high: { label: "High", color: "bg-orange-500/15 text-orange-700 dark:text-orange-400" },
  medium: { label: "Medium", color: "bg-amber-500/15 text-amber-700 dark:text-amber-400" },
  low: { label: "Low", color: "bg-blue-500/15 text-blue-700 dark:text-blue-400" },
  negligible: { label: "Negligible", color: "bg-gray-500/15 text-gray-700 dark:text-gray-400" },
}

const ALL_CATEGORIES = Object.keys(CATEGORY_CONFIG)

// ─── Inline editable text ──────────────────────────────────────────────────

function InlineEditable({
  value,
  onSave,
  placeholder,
  multiline = false,
  className,
}: {
  value: string
  onSave: (value: string) => void
  placeholder?: string
  multiline?: boolean
  className?: string
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const ref = useRef<HTMLInputElement | HTMLTextAreaElement>(null)

  useEffect(() => {
    setDraft(value)
  }, [value])

  useEffect(() => {
    if (editing && ref.current) {
      ref.current.focus()
      ref.current.select()
    }
  }, [editing])

  const commit = useCallback(() => {
    setEditing(false)
    const trimmed = draft.trim()
    if (trimmed && trimmed !== value) {
      onSave(trimmed)
    } else {
      setDraft(value)
    }
  }, [draft, value, onSave])

  if (!editing) {
    return (
      <button
        type="button"
        className={cn(
          "w-full cursor-text text-left transition-colors hover:bg-muted/50 rounded px-1 -mx-1",
          !value && "text-muted-foreground italic",
          className,
        )}
        onClick={() => setEditing(true)}
      >
        {value || placeholder || "Click to edit..."}
      </button>
    )
  }

  const sharedProps = {
    value: draft,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setDraft(e.target.value),
    onBlur: commit,
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !multiline) commit()
      if (e.key === "Escape") {
        setDraft(value)
        setEditing(false)
      }
    },
    className: cn(
      "w-full bg-transparent border-b border-primary/40 px-1 -mx-1 outline-none text-foreground",
      className,
    ),
    placeholder,
  }

  if (multiline) {
    return <textarea ref={ref as React.RefObject<HTMLTextAreaElement>} rows={2} {...sharedProps} />
  }

  return <input ref={ref as React.RefObject<HTMLInputElement>} type="text" {...sharedProps} />
}

// ─── ChangelogEntryCard ────────────────────────────────────────────────────

export interface ChangelogEntryCardProps {
  entry: ReleaseEntry
  onUpdate: (updates: Partial<ReleaseEntry>) => void
  onDelete: () => void
  dragHandleProps?: Record<string, unknown>
}

export function ChangelogEntryCard({
  entry,
  onUpdate,
  onDelete,
  dragHandleProps,
}: ChangelogEntryCardProps) {
  const category = CATEGORY_CONFIG[entry.category] ?? CATEGORY_CONFIG.changed
  const impact = IMPACT_CONFIG[entry.impact] ?? IMPACT_CONFIG.medium
  const CategoryIcon = category.icon

  return (
    <Card size="sm" className="group relative transition-shadow hover:shadow-sm">
      <CardContent className="flex gap-3">
        {/* Drag handle */}
        <div
          className="flex shrink-0 cursor-grab items-center text-muted-foreground/40 hover:text-muted-foreground active:cursor-grabbing"
          {...dragHandleProps}
        >
          <GripVertical className="h-4 w-4" />
        </div>

        {/* Main content */}
        <div className="min-w-0 flex-1 space-y-1.5">
          {/* Top row: category badge + impact + breaking */}
          <div className="flex flex-wrap items-center gap-1.5">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    "inline-flex h-5 items-center gap-1 rounded-none px-2 text-xs font-medium transition-opacity hover:opacity-80",
                    category.color,
                  )}
                >
                  <CategoryIcon className="h-3 w-3" />
                  {category.label}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {ALL_CATEGORIES.map((cat) => {
                  const cfg = CATEGORY_CONFIG[cat]
                  const Icon = cfg.icon
                  return (
                    <DropdownMenuItem
                      key={cat}
                      onClick={() => onUpdate({ category: cat } as Partial<ReleaseEntry>)}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {cfg.label}
                    </DropdownMenuItem>
                  )
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            <Badge variant="outline" className={cn("text-[10px]", impact.color)}>
              {impact.label}
            </Badge>

            {/* Breaking toggle */}
            <button
              type="button"
              onClick={() => onUpdate({ breaking: !entry.breaking } as Partial<ReleaseEntry>)}
              className={cn(
                "inline-flex h-5 items-center gap-1 rounded-none px-2 text-[10px] font-medium transition-colors",
                entry.breaking
                  ? "bg-red-600/15 text-red-700 dark:text-red-400"
                  : "bg-muted text-muted-foreground hover:bg-red-600/10 hover:text-red-600",
              )}
            >
              <AlertTriangle className="h-2.5 w-2.5" />
              Breaking
            </button>

            {/* Review toggle */}
            <button
              type="button"
              onClick={() => onUpdate({ reviewed: !entry.reviewed } as Partial<ReleaseEntry>)}
              className={cn(
                "inline-flex h-5 items-center gap-1 rounded-none px-2 text-[10px] font-medium transition-colors",
                entry.reviewed
                  ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                  : "bg-muted text-muted-foreground hover:bg-emerald-500/10 hover:text-emerald-600",
              )}
            >
              {entry.reviewed ? (
                <CheckCircle2 className="h-2.5 w-2.5" />
              ) : (
                <Circle className="h-2.5 w-2.5" />
              )}
              {entry.reviewed ? "Reviewed" : "Mark Reviewed"}
            </button>
          </div>

          {/* Title */}
          <InlineEditable
            value={entry.title}
            onSave={(title) => onUpdate({ title })}
            placeholder="Entry title..."
            className="text-sm font-medium"
          />

          {/* Description */}
          <InlineEditable
            value={entry.description ?? ""}
            onSave={(description) => onUpdate({ description })}
            placeholder="Add a description..."
            multiline
            className="text-xs text-muted-foreground"
          />
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-start gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            variant="ghost"
            size="icon-xs"
            className="text-muted-foreground hover:text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
