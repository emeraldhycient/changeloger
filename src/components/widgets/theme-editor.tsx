"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Lock, Palette, Type, Layout } from "lucide-react"
import { cn } from "@/lib/utils"

interface ThemeEditorProps {
  theme: Record<string, unknown>
  onChange: (updates: Record<string, unknown>) => void
  locked?: boolean // true for free plan — only primaryColor editable
}

// Color input with preview swatch
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
  return (
    <div className="flex items-center justify-between gap-3">
      <label className="text-sm text-muted-foreground shrink-0">{label}</label>
      <div className="flex items-center gap-2">
        <div
          className="h-7 w-7 shrink-0 border border-border rounded"
          style={{ backgroundColor: value || "#000" }}
        />
        <Input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="h-7 w-24 font-mono text-xs"
          placeholder="#000000"
        />
      </div>
    </div>
  )
}

export function ThemeEditor({ theme, onChange, locked = false }: ThemeEditorProps) {
  const update = (key: string, value: unknown) => {
    onChange({ ...theme, [key]: value })
  }

  const updateCategory = (cat: string, color: string) => {
    const existing = (theme.categoryColors as Record<string, string>) || {}
    onChange({ ...theme, categoryColors: { ...existing, [cat]: color } })
  }

  const cats = (theme.categoryColors as Record<string, string>) || {}

  return (
    <div className="space-y-5">
      {/* Colors section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Palette className="h-4 w-4 text-primary" />
          Colors
        </div>
        <div className="space-y-2.5 pl-6">
          <ColorField label="Primary" value={(theme.primaryColor as string) || "#6C63FF"} onChange={(v) => update("primaryColor", v)} />
          <ColorField label="Background" value={(theme.backgroundColor as string) || ""} onChange={(v) => update("backgroundColor", v)} disabled={locked} />
          <ColorField label="Card" value={(theme.cardColor as string) || ""} onChange={(v) => update("cardColor", v)} disabled={locked} />
          <ColorField label="Text" value={(theme.textColor as string) || ""} onChange={(v) => update("textColor", v)} disabled={locked} />
          <ColorField label="Muted text" value={(theme.mutedTextColor as string) || ""} onChange={(v) => update("mutedTextColor", v)} disabled={locked} />
          <ColorField label="Borders" value={(theme.borderColor as string) || ""} onChange={(v) => update("borderColor", v)} disabled={locked} />
        </div>
      </div>

      <Separator />

      {/* Category colors */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Palette className="h-4 w-4 text-primary" />
          Category Colors
          {locked && <Lock className="h-3 w-3 text-muted-foreground" />}
        </div>
        <div className="space-y-2 pl-6">
          {["added", "fixed", "changed", "removed", "deprecated", "security", "performance", "breaking"].map((cat) => (
            <ColorField
              key={cat}
              label={cat.charAt(0).toUpperCase() + cat.slice(1)}
              value={cats[cat] || ""}
              onChange={(v) => updateCategory(cat, v)}
              disabled={locked}
            />
          ))}
        </div>
      </div>

      <Separator />

      {/* Typography */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Type className="h-4 w-4 text-primary" />
          Typography
          {locked && <Lock className="h-3 w-3 text-muted-foreground" />}
        </div>
        <div className="space-y-2.5 pl-6">
          <div className="flex items-center justify-between gap-3">
            <label className="text-sm text-muted-foreground">Font family</label>
            <select
              value={(theme.fontFamily as string) || ""}
              onChange={(e) => update("fontFamily", e.target.value)}
              disabled={locked}
              className="h-7 w-40 border border-border bg-background px-2 text-xs outline-none"
            >
              <option value="">System default</option>
              <option value="Inter, sans-serif">Inter</option>
              <option value="'IBM Plex Sans', sans-serif">IBM Plex Sans</option>
              <option value="'Source Sans 3', sans-serif">Source Sans</option>
              <option value="Georgia, serif">Georgia (serif)</option>
              <option value="'JetBrains Mono', monospace">JetBrains Mono</option>
            </select>
          </div>
          <div className="flex items-center justify-between gap-3">
            <label className="text-sm text-muted-foreground">Font size</label>
            <Input
              type="number"
              value={(theme.fontSize as number) || 14}
              onChange={(e) => update("fontSize", parseInt(e.target.value) || 14)}
              disabled={locked}
              className="h-7 w-20 text-xs"
              min={10}
              max={20}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Layout */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Layout className="h-4 w-4 text-primary" />
          Layout
          {locked && <Lock className="h-3 w-3 text-muted-foreground" />}
        </div>
        <div className="space-y-2.5 pl-6">
          <div className="flex items-center justify-between gap-3">
            <label className="text-sm text-muted-foreground">Border radius</label>
            <Input
              type="number"
              value={(theme.borderRadius as number) || 8}
              onChange={(e) => update("borderRadius", parseInt(e.target.value) || 0)}
              disabled={locked}
              className="h-7 w-20 text-xs"
              min={0}
              max={24}
            />
          </div>
          <div className="flex items-center justify-between gap-3">
            <label className="text-sm text-muted-foreground">Entry spacing</label>
            <Input
              type="number"
              value={(theme.entrySpacing as number) || 8}
              onChange={(e) => update("entrySpacing", parseInt(e.target.value) || 8)}
              disabled={locked}
              className="h-7 w-20 text-xs"
              min={2}
              max={24}
            />
          </div>
        </div>
      </div>

      {locked && (
        <>
          <Separator />
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Lock className="h-3 w-3" />
            Upgrade to Pro to unlock full widget customization
          </p>
        </>
      )}
    </div>
  )
}
