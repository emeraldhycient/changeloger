"use client"

import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Lock, Palette, Type, Layout, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

interface ThemeEditorProps {
  theme: Record<string, unknown>
  onChange: (updates: Record<string, unknown>) => void
  locked?: boolean
  defaultOpen?: boolean
}

function ColorField({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  disabled?: boolean
}) {
  // Normalize short hex to 6-char for the color picker
  const normalizeHex = (hex: string) => {
    if (!hex) return "#000000"
    const clean = hex.replace("#", "")
    if (clean.length === 3) return "#" + clean.split("").map(c => c + c).join("")
    if (clean.length === 6) return "#" + clean
    return hex
  }

  return (
    <div className="flex items-center justify-between gap-3">
      <label className="text-xs text-muted-foreground shrink-0">{label}</label>
      <div className="flex items-center gap-1.5">
        <input
          type="color"
          value={normalizeHex(value)}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="h-6 w-6 shrink-0 cursor-pointer border-0 bg-transparent p-0"
        />
        <Input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="h-6 w-24 font-mono text-[11px]"
          placeholder="#000000"
        />
      </div>
    </div>
  )
}

function Section({
  title,
  icon: Icon,
  locked,
  defaultOpen = false,
  children,
}: {
  title: string
  icon: React.ComponentType<{ className?: string }>
  locked?: boolean
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  return (
    <Collapsible defaultOpen={defaultOpen}>
      <CollapsibleTrigger className="flex w-full items-center justify-between py-1.5 text-sm font-medium hover:text-foreground transition-colors">
        <span className="flex items-center gap-2">
          <Icon className="h-3.5 w-3.5 text-primary" />
          {title}
          {locked && <Lock className="h-3 w-3 text-muted-foreground" />}
        </span>
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground transition-transform [[data-state=open]>&]:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="space-y-2 pb-2 pl-5.5 pt-1.5">
          {children}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

export function ThemeEditor({ theme, onChange, locked = false, defaultOpen = false }: ThemeEditorProps) {
  const update = (key: string, value: unknown) => {
    onChange({ ...theme, [key]: value })
  }

  const updateCategory = (cat: string, color: string) => {
    const existing = (theme.categoryColors as Record<string, string>) || {}
    onChange({ ...theme, categoryColors: { ...existing, [cat]: color } })
  }

  const cats = (theme.categoryColors as Record<string, string>) || {}

  return (
    <div className="space-y-1">
      {/* Primary color — always visible */}
      <div className="flex items-center justify-between gap-3 py-1.5">
        <label className="flex items-center gap-2 text-sm font-medium">
          <Palette className="h-3.5 w-3.5 text-primary" />
          Primary Color
        </label>
        <div className="flex items-center gap-1.5">
          <input
            type="color"
            value={(theme.primaryColor as string) || "#6C63FF"}
            onChange={(e) => update("primaryColor", e.target.value)}
            className="h-6 w-6 shrink-0 cursor-pointer border-0 bg-transparent p-0"
          />
          <Input
            type="text"
            value={(theme.primaryColor as string) || "#6C63FF"}
            onChange={(e) => update("primaryColor", e.target.value)}
            className="h-6 w-24 font-mono text-[11px]"
            placeholder="#6C63FF"
          />
        </div>
      </div>

      {/* Mode selector — always visible */}
      <div className="flex items-center justify-between gap-3 py-1.5">
        <label className="flex items-center gap-2 text-sm font-medium">
          Theme Mode
        </label>
        <select
          value={(theme.mode as string) || "auto"}
          onChange={(e) => update("mode", e.target.value)}
          className="h-6 border border-border bg-background px-2 text-xs outline-none"
        >
          <option value="auto">Auto</option>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>

      <Separator className="my-2" />

      {/* Collapsible advanced sections */}
      <Section title="Colors" icon={Palette} locked={locked} defaultOpen={defaultOpen}>
        <ColorField label="Background" value={(theme.backgroundColor as string) || ""} onChange={(v) => update("backgroundColor", v)} disabled={locked} />
        <ColorField label="Card" value={(theme.cardColor as string) || ""} onChange={(v) => update("cardColor", v)} disabled={locked} />
        <ColorField label="Text" value={(theme.textColor as string) || ""} onChange={(v) => update("textColor", v)} disabled={locked} />
        <ColorField label="Muted text" value={(theme.mutedTextColor as string) || ""} onChange={(v) => update("mutedTextColor", v)} disabled={locked} />
        <ColorField label="Borders" value={(theme.borderColor as string) || ""} onChange={(v) => update("borderColor", v)} disabled={locked} />
      </Section>

      <Section title="Category Colors" icon={Palette} locked={locked}>
        {["added", "fixed", "changed", "removed", "deprecated", "security", "performance", "breaking"].map((cat) => (
          <ColorField
            key={cat}
            label={cat.charAt(0).toUpperCase() + cat.slice(1)}
            value={cats[cat] || ""}
            onChange={(v) => updateCategory(cat, v)}
            disabled={locked}
          />
        ))}
      </Section>

      <Section title="Typography" icon={Type} locked={locked}>
        <div className="flex items-center justify-between gap-3">
          <label className="text-xs text-muted-foreground">Font</label>
          <select
            value={(theme.fontFamily as string) || ""}
            onChange={(e) => update("fontFamily", e.target.value)}
            disabled={locked}
            className="h-6 w-36 border border-border bg-background px-2 text-[11px] outline-none"
          >
            <option value="">System default</option>
            <option value="Inter, sans-serif">Inter</option>
            <option value="'IBM Plex Sans', sans-serif">IBM Plex Sans</option>
            <option value="'Source Sans 3', sans-serif">Source Sans</option>
            <option value="Georgia, serif">Georgia</option>
          </select>
        </div>
        <div className="flex items-center justify-between gap-3">
          <label className="text-xs text-muted-foreground">Size (px)</label>
          <Input
            type="number"
            value={(theme.fontSize as number) || 14}
            onChange={(e) => update("fontSize", parseInt(e.target.value) || 14)}
            disabled={locked}
            className="h-6 w-16 text-[11px]"
            min={10} max={20}
          />
        </div>
      </Section>

      <Section title="Layout" icon={Layout} locked={locked}>
        <div className="flex items-center justify-between gap-3">
          <label className="text-xs text-muted-foreground">Border radius</label>
          <Input
            type="number"
            value={(theme.borderRadius as number) || 8}
            onChange={(e) => update("borderRadius", parseInt(e.target.value) || 0)}
            disabled={locked}
            className="h-6 w-16 text-[11px]"
            min={0} max={24}
          />
        </div>
        <div className="flex items-center justify-between gap-3">
          <label className="text-xs text-muted-foreground">Entry gap</label>
          <Input
            type="number"
            value={(theme.entrySpacing as number) || 8}
            onChange={(e) => update("entrySpacing", parseInt(e.target.value) || 8)}
            disabled={locked}
            className="h-6 w-16 text-[11px]"
            min={2} max={24}
          />
        </div>
      </Section>

      {locked && (
        <p className="pt-2 text-[11px] text-muted-foreground flex items-center gap-1.5">
          <Lock className="h-3 w-3" />
          Upgrade to Pro to unlock full customization
        </p>
      )}
    </div>
  )
}
