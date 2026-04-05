export interface WidgetTheme {
  // Mode
  mode: "light" | "dark" | "auto"

  // Colors
  backgroundColor: string
  cardColor: string
  textColor: string
  mutedTextColor: string
  borderColor: string
  primaryColor: string

  // Category colors (optional overrides)
  categoryColors?: {
    added?: string
    fixed?: string
    changed?: string
    removed?: string
    deprecated?: string
    security?: string
    performance?: string
    breaking?: string
  }

  // Layout
  borderRadius: number // in px
  fontFamily: string
  fontSize: number // base size in px
  entrySpacing: number // gap between entries in px

  // Modal specific
  triggerText?: string
  triggerPosition?: "bottom-right" | "bottom-left"
}

export const DEFAULT_LIGHT_THEME: WidgetTheme = {
  mode: "light",
  backgroundColor: "#FFFFFF",
  cardColor: "#F9FAFB",
  textColor: "#1E293B",
  mutedTextColor: "#64748B",
  borderColor: "#E2E8F0",
  primaryColor: "#6C63FF",
  categoryColors: {
    added: "#10B981",
    fixed: "#3B82F6",
    changed: "#F59E0B",
    removed: "#EF4444",
    deprecated: "#9CA3AF",
    security: "#8B5CF6",
    performance: "#06B6D4",
    breaking: "#DC2626",
  },
  borderRadius: 8,
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  fontSize: 14,
  entrySpacing: 8,
  triggerText: "What's New",
  triggerPosition: "bottom-right",
}

export const DEFAULT_DARK_THEME: WidgetTheme = {
  ...DEFAULT_LIGHT_THEME,
  mode: "dark",
  backgroundColor: "#1A1A2E",
  cardColor: "#16213E",
  textColor: "#E2E8F0",
  mutedTextColor: "#94A3B8",
  borderColor: "#334155",
}

/**
 * Merge a base theme with partial overrides.
 * Only non-undefined values from overrides are applied.
 */
export function mergeTheme(base: WidgetTheme, overrides: Partial<WidgetTheme>): WidgetTheme {
  const merged = { ...base }
  for (const [key, value] of Object.entries(overrides)) {
    if (value !== undefined && value !== null && value !== "") {
      if (key === "categoryColors" && typeof value === "object") {
        merged.categoryColors = { ...merged.categoryColors, ...(value as Record<string, string>) }
      } else {
        (merged as Record<string, unknown>)[key] = value
      }
    }
  }
  return merged
}

/**
 * Resolve the final theme from workspace defaults + widget config + data attributes.
 * Priority: data attributes > widget config > workspace defaults > built-in defaults
 */
export function resolveTheme(
  workspaceTheme: Partial<WidgetTheme> | null,
  widgetConfig: Record<string, unknown> | null,
): WidgetTheme {
  // Start with the right base theme
  const mode = (widgetConfig?.mode || widgetConfig?.theme || workspaceTheme?.mode || "auto") as string
  const isDark = mode === "dark"
  const base = isDark ? DEFAULT_DARK_THEME : DEFAULT_LIGHT_THEME

  // Apply workspace defaults
  let theme = workspaceTheme ? mergeTheme(base, workspaceTheme) : base

  // Apply widget-specific overrides
  if (widgetConfig) {
    const widgetOverrides: Partial<WidgetTheme> = {}
    // Map old config format to new theme format
    if (widgetConfig.primaryColor) widgetOverrides.primaryColor = widgetConfig.primaryColor as string
    if (widgetConfig.backgroundColor) widgetOverrides.backgroundColor = widgetConfig.backgroundColor as string
    if (widgetConfig.cardColor) widgetOverrides.cardColor = widgetConfig.cardColor as string
    if (widgetConfig.textColor) widgetOverrides.textColor = widgetConfig.textColor as string
    if (widgetConfig.mutedTextColor) widgetOverrides.mutedTextColor = widgetConfig.mutedTextColor as string
    if (widgetConfig.borderColor) widgetOverrides.borderColor = widgetConfig.borderColor as string
    if (widgetConfig.borderRadius !== undefined) widgetOverrides.borderRadius = widgetConfig.borderRadius as number
    if (widgetConfig.fontFamily) widgetOverrides.fontFamily = widgetConfig.fontFamily as string
    if (widgetConfig.fontSize) widgetOverrides.fontSize = widgetConfig.fontSize as number
    if (widgetConfig.entrySpacing) widgetOverrides.entrySpacing = widgetConfig.entrySpacing as number
    if (widgetConfig.categoryColors) widgetOverrides.categoryColors = widgetConfig.categoryColors as WidgetTheme["categoryColors"]
    if (widgetConfig.triggerText) widgetOverrides.triggerText = widgetConfig.triggerText as string
    if (widgetConfig.triggerPosition) widgetOverrides.triggerPosition = widgetConfig.triggerPosition as WidgetTheme["triggerPosition"]

    theme = mergeTheme(theme, widgetOverrides)
  }

  // Ensure mode is set correctly
  theme.mode = mode as WidgetTheme["mode"]

  return theme
}
