"use client"

import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Globe,
  Code,
  Bell,
  Copy,
  Check,
  Plus,
  Trash2,
  Lock,
  Calendar,
  GitBranch,
  Layers,
  Palette,
  Sun,
  Moon,
  Monitor,
  FileText,
  AlertCircle,
  Pencil,
  Loader2,
  X,
} from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { apiClient } from "@/lib/api/client"
import { useWorkspaceStore } from "@/stores/workspace-store"
import { useWorkspaces } from "@/hooks/use-workspaces"
import { useReleases, type Release } from "@/hooks/use-releases"

// ─── Constants ──────────────────────────────────────────────────────────────

const WIDGET_TYPES = [
  {
    type: "page" as const,
    title: "Changelog Page",
    description:
      "Full-page changelog rendered into a target div. Perfect for docs sites and standalone changelog pages.",
    icon: Globe,
    freePlan: true,
  },
  {
    type: "modal" as const,
    title: "Changelog Modal",
    description:
      'Floating button + modal overlay with changelog content. Ideal for in-app "What\'s New" experiences.',
    icon: Code,
    freePlan: false,
  },
  {
    type: "badge" as const,
    title: "Changelog Badge",
    description:
      "Minimal notification indicator (dot or count) on any element. Shows when new changes are available.",
    icon: Bell,
    freePlan: false,
  },
] as const

type WidgetType = (typeof WIDGET_TYPES)[number]["type"]

const THEMES = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "auto", label: "Auto", icon: Monitor },
] as const

type ThemeValue = (typeof THEMES)[number]["value"]

// ─── Types ──────────────────────────────────────────────────────────────────

interface Widget {
  id: string
  type: WidgetType
  embedToken: string
  workspaceId: string
  repositoryId: string | null
  config: Record<string, unknown>
  domains: string[]
  createdAt: string
  repository: { id: string; name: string; fullName: string } | null
}

interface Repository {
  id: string
  name: string
  fullName: string
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function getEmbedSnippet(token: string, type: string, theme: string = "auto") {
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  return `<script async src="${base}/widget/changeloger.js" data-token="${token}" data-type="${type}" data-theme="${theme}"></script>`
}

function getWidgetMeta(type: WidgetType) {
  return WIDGET_TYPES.find((w) => w.type === type)!
}

// ─── Page Component ─────────────────────────────────────────────────────────

export default function WidgetsPage() {
  const { currentWorkspaceId } = useWorkspaceStore()
  const queryClient = useQueryClient()

  // State
  const [createOpen, setCreateOpen] = useState(false)
  const [selectedType, setSelectedType] = useState<WidgetType>("page")
  const [selectedScope, setSelectedScope] = useState<string>("all") // "all" | repo ID
  const [selectedTheme, setSelectedTheme] = useState<ThemeValue>("auto")
  const [primaryColor, setPrimaryColor] = useState("#6366f1")
  const [copied, setCopied] = useState<string | null>(null)
  const [snippetWidget, setSnippetWidget] = useState<Widget | null>(null)
  const [detailWidget, setDetailWidget] = useState<Widget | null>(null)

  // ── Workspace plan ──────────────────────────────────────────────────────
  const { data: workspaces = [] } = useWorkspaces()
  const currentWorkspace = workspaces.find((w) => w.id === currentWorkspaceId)
  const isFreePlan = currentWorkspace?.plan === "free"
  const hasWorkspace = !!currentWorkspaceId

  // ── Queries ─────────────────────────────────────────────────────────────

  const { data: widgets = [], isLoading } = useQuery<Widget[]>({
    queryKey: ["widgets", currentWorkspaceId],
    queryFn: async () => {
      const { data } = await apiClient.get(
        `/api/widgets?workspaceId=${currentWorkspaceId}`,
      )
      return data
    },
    enabled: hasWorkspace,
  })

  const { data: repositories = [] } = useQuery<Repository[]>({
    queryKey: ["repositories", currentWorkspaceId],
    queryFn: async () => {
      const { data } = await apiClient.get(
        `/api/repositories?workspaceId=${currentWorkspaceId}`,
      )
      return data
    },
    enabled: hasWorkspace,
  })

  const { data: allReleases = [] } = useReleases(currentWorkspaceId, "published")

  const scopedReleases = selectedScope === "all"
    ? allReleases
    : allReleases.filter((r) => r.repositoryId === selectedScope)

  // ── Mutations ───────────────────────────────────────────────────────────

  const createWidget = useMutation({
    mutationFn: async ({
      type,
      repositoryId,
      config,
    }: {
      type: WidgetType
      repositoryId?: string
      config?: Record<string, unknown>
    }) => {
      if (!currentWorkspaceId) throw new Error("No workspace selected")
      const { data } = await apiClient.post("/api/widgets", {
        workspaceId: currentWorkspaceId,
        type,
        repositoryId: repositoryId || undefined,
        config,
      })
      return data as Widget
    },
    onSuccess: (widget) => {
      queryClient.invalidateQueries({ queryKey: ["widgets", currentWorkspaceId] })
      setCreateOpen(false)
      setSnippetWidget(widget)
      // Reset form
      setSelectedType("page")
      setSelectedScope("all")
      setSelectedTheme("auto")
      setPrimaryColor("#6366f1")
    },
  })

  // ── Edit state ──────────────────────────────────────────────────────────
  const [editTheme, setEditTheme] = useState<ThemeValue>("auto")
  const [editColor, setEditColor] = useState("#6366f1")
  const [editScope, setEditScope] = useState<string>("all")
  const [editDomains, setEditDomains] = useState<string[]>([])
  const [newDomain, setNewDomain] = useState("")

  const openEditSheet = (widget: Widget) => {
    setEditTheme((widget.config?.theme as ThemeValue) || "auto")
    setEditColor((widget.config?.primaryColor as string) || "#6366f1")
    setEditScope(widget.repositoryId || "all")
    setEditDomains(widget.domains || [])
    setNewDomain("")
    setDetailWidget(widget)
  }

  const updateWidget = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; config?: Record<string, unknown>; domains?: string[]; repositoryId?: string | null }) => {
      const { data } = await apiClient.patch(`/api/widgets/manage/${id}`, updates)
      return data as Widget
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["widgets", currentWorkspaceId] })
      setDetailWidget(null)
    },
  })

  const deleteWidget = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/api/widgets/manage/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["widgets", currentWorkspaceId] })
      setDetailWidget(null)
    },
  })

  // ── Handlers ────────────────────────────────────────────────────────────

  const handleSaveWidget = () => {
    if (!detailWidget) return
    updateWidget.mutate({
      id: detailWidget.id,
      config: { theme: editTheme, primaryColor: editColor },
      domains: editDomains,
      repositoryId: editScope !== "all" ? editScope : null,
    })
  }

  const handleDeleteWidget = () => {
    if (!detailWidget) return
    if (!confirm("Are you sure you want to delete this widget? This cannot be undone.")) return
    deleteWidget.mutate(detailWidget.id)
  }

  const handleAddDomain = () => {
    const d = newDomain.trim().toLowerCase()
    if (d && !editDomains.includes(d)) {
      setEditDomains([...editDomains, d])
      setNewDomain("")
    }
  }

  const handleRemoveDomain = (domain: string) => {
    setEditDomains(editDomains.filter((d) => d !== domain))
  }

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleCreate = () => {
    if (!hasWorkspace) return
    createWidget.mutate({
      type: selectedType,
      repositoryId: selectedScope !== "all" ? selectedScope : undefined,
      config: {
        theme: selectedTheme,
        primaryColor,
      },
    })
  }

  const handleOpenCreate = () => {
    setSelectedType("page")
    setSelectedScope("all")
    setSelectedTheme("auto")
    setPrimaryColor("#6366f1")
    setCreateOpen(true)
  }

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <TooltipProvider>
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Embeddable Widgets
            </h1>
            <p className="mt-1 text-muted-foreground">
              Copy-paste a snippet to embed your changelog anywhere
            </p>
          </div>
          <Button onClick={handleOpenCreate} disabled={!hasWorkspace}>
            <Plus className="mr-2 h-4 w-4" />
            Create Widget
          </Button>
        </div>

        {/* No workspace warning */}
        {!hasWorkspace && (
          <div className="mb-6 flex items-start gap-3 rounded border border-amber-500/20 bg-amber-500/5 p-4">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
            <div>
              <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                No workspace selected
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Select a workspace from the sidebar to manage your widgets.
              </p>
            </div>
          </div>
        )}

        {/* Widget list */}
        {isLoading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse bg-muted/50" />
            ))}
          </div>
        ) : widgets.length === 0 ? (
          <div className="flex flex-col items-center justify-center border border-dashed py-16">
            <div className="flex h-12 w-12 items-center justify-center bg-muted">
              <Code className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">No widgets yet</h3>
            <p className="mt-1 max-w-sm text-center text-sm text-muted-foreground">
              Create an embeddable widget to display your changelog on any
              website or app.
            </p>
            <Button variant="outline" className="mt-6" onClick={handleOpenCreate}>
              <Plus className="mr-2 h-3.5 w-3.5" />
              Create your first widget
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {widgets.map((widget) => {
              const meta = getWidgetMeta(widget.type)
              const Icon = meta.icon
              const theme =
                (widget.config?.theme as string) || "auto"

              return (
                <Card key={widget.id}>
                  <CardContent className="flex items-center justify-between p-4">
                    <button
                      type="button"
                      className="flex flex-1 items-center gap-4 text-left"
                      onClick={() => openEditSheet(widget)}
                    >
                      <div className="flex h-10 w-10 items-center justify-center bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-[10px] capitalize">
                            {widget.type}
                          </Badge>
                          {widget.repository ? (
                            <Badge variant="secondary" className="text-[10px]">
                              <GitBranch className="mr-1 h-3 w-3" />
                              {widget.repository.fullName}
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-[10px]">
                              <Layers className="mr-1 h-3 w-3" />
                              All Releases
                            </Badge>
                          )}
                        </div>
                        <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                          <code>{widget.embedToken.slice(0, 12)}...</code>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(widget.createdAt).toLocaleDateString()}
                          </span>
                          <span className="capitalize">{theme} theme</span>
                        </div>
                      </div>
                    </button>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1.5"
                        onClick={() =>
                          handleCopy(
                            getEmbedSnippet(widget.embedToken, widget.type, theme),
                            widget.id,
                          )
                        }
                      >
                        {copied === widget.id ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-green-500" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" />
                            Copy Snippet
                          </>
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditSheet(widget)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* ── Create Widget Dialog ──────────────────────────────────────── */}
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Widget</DialogTitle>
              <DialogDescription>
                Choose a widget type and configure it for your site.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-2">
              {/* Widget type selector */}
              <div>
                <label className="text-sm font-medium">Widget Type</label>
                <div className="mt-3 grid grid-cols-3 gap-3">
                  {WIDGET_TYPES.map((wt) => {
                    const locked = isFreePlan && !wt.freePlan
                    return (
                      <Tooltip key={wt.type}>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            disabled={locked}
                            onClick={() => setSelectedType(wt.type)}
                            className={cn(
                              "relative flex flex-col items-center gap-2.5 border p-4 text-center transition-colors",
                              selectedType === wt.type && !locked
                                ? "border-primary ring-2 ring-primary/20"
                                : "border-border hover:border-muted-foreground/30",
                              locked && "cursor-not-allowed opacity-50",
                            )}
                          >
                            {locked && (
                              <Lock className="absolute right-1.5 top-1.5 h-3 w-3 text-muted-foreground" />
                            )}
                            <wt.icon className="h-6 w-6 text-primary" />
                            <span className="text-xs font-medium">{wt.title}</span>
                          </button>
                        </TooltipTrigger>
                        {locked && (
                          <TooltipContent>Upgrade to Pro</TooltipContent>
                        )}
                      </Tooltip>
                    )
                  })}
                </div>
                <p className="mt-2.5 text-xs text-muted-foreground">
                  {WIDGET_TYPES.find((w) => w.type === selectedType)?.description}
                </p>
              </div>

              {/* Changelog scope selector */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Changelog Source</label>
                <select
                  value={selectedScope}
                  onChange={(e) => setSelectedScope(e.target.value)}
                  className="flex h-9 w-full items-center border border-border bg-background px-3 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring/50"
                >
                  <option value="all">
                    All published changelogs ({allReleases.length})
                  </option>
                  {repositories.length > 0 && (
                    <optgroup label="Filter by Repository">
                      {repositories.map((r) => {
                        const count = allReleases.filter((rel) => rel.repositoryId === r.id).length
                        return (
                          <option key={r.id} value={r.id}>
                            {r.fullName} ({count} {count === 1 ? "release" : "releases"})
                          </option>
                        )
                      })}
                    </optgroup>
                  )}
                </select>
                <p className="text-xs text-muted-foreground">
                  {selectedScope === "all"
                    ? "Widget will show all published changelogs in this workspace."
                    : `Widget will only show changelogs from ${repositories.find((r) => r.id === selectedScope)?.fullName ?? "this repository"}.`}
                </p>
              </div>

              {/* Published changelogs list */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Changelogs included ({scopedReleases.length})
                </label>
                {scopedReleases.length > 0 ? (
                  <div className="max-h-32 space-y-1 overflow-y-auto rounded border border-border p-2">
                    {scopedReleases.map((r) => (
                      <div
                        key={r.id}
                        className="flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="h-3 w-3 text-muted-foreground" />
                          <span className="font-medium">v{r.version}</span>
                          {r.repository && (
                            <span className="text-muted-foreground">
                              {r.repository.fullName}
                            </span>
                          )}
                          {!r.repository && (
                            <span className="text-muted-foreground">Manual</span>
                          )}
                        </div>
                        <span className="text-muted-foreground">
                          {r._count?.entries ?? 0} entries
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-start gap-2 rounded border border-amber-500/20 bg-amber-500/5 p-3">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                    <p className="text-xs text-amber-700 dark:text-amber-400">
                      No published changelogs yet. The widget will be empty until
                      you publish a changelog from the editor.
                    </p>
                  </div>
                )}
              </div>

              {/* Theme selector */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Theme</label>
                <div className="flex gap-3">
                  {THEMES.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setSelectedTheme(t.value)}
                      className={cn(
                        "flex items-center gap-2 border px-4 py-2 text-sm transition-colors",
                        selectedTheme === t.value
                          ? "border-primary ring-2 ring-primary/20"
                          : "border-border hover:border-muted-foreground/30",
                      )}
                    >
                      <t.icon className="h-4 w-4" />
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Primary color */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  <Palette className="mr-1.5 inline h-3.5 w-3.5" />
                  Primary Color
                </label>
                <div className="flex items-center gap-3">
                  <div
                    className="h-9 w-9 shrink-0 border border-border"
                    style={{ backgroundColor: primaryColor }}
                  />
                  <Input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    placeholder="#6366f1"
                    className="h-9 w-36 font-mono text-sm"
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button variant="ghost" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                disabled={createWidget.isPending || !hasWorkspace}
              >
                {createWidget.isPending ? "Creating..." : "Create Widget"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ── Embed Snippet Dialog ──────────────────────────────────────── */}
        <Dialog
          open={!!snippetWidget}
          onOpenChange={(open) => !open && setSnippetWidget(null)}
        >
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Widget Created</DialogTitle>
              <DialogDescription>
                Copy this snippet and paste it into your website.
              </DialogDescription>
            </DialogHeader>
            {snippetWidget && (
              <div className="space-y-4">
                <div className="rounded border border-border bg-muted/50 p-3">
                  <code className="block whitespace-pre-wrap break-all text-xs leading-relaxed">
                    {getEmbedSnippet(
                      snippetWidget.embedToken,
                      snippetWidget.type,
                      (snippetWidget.config?.theme as string) || "auto",
                    )}
                  </code>
                </div>
                <Button
                  className="w-full gap-2"
                  variant="outline"
                  onClick={() =>
                    handleCopy(
                      getEmbedSnippet(
                        snippetWidget.embedToken,
                        snippetWidget.type,
                        (snippetWidget.config?.theme as string) || "auto",
                      ),
                      `snippet-${snippetWidget.id}`,
                    )
                  }
                >
                  {copied === `snippet-${snippetWidget.id}` ? (
                    <>
                      <Check className="h-4 w-4 text-green-500" />
                      Copied to clipboard!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy Snippet
                    </>
                  )}
                </Button>
              </div>
            )}
            <DialogFooter>
              <Button variant="ghost" onClick={() => setSnippetWidget(null)}>
                Done
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ── Widget Edit Sheet ──────────────────────────────────────────── */}
        <Sheet
          open={!!detailWidget}
          onOpenChange={(open) => !open && setDetailWidget(null)}
        >
          <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
            {detailWidget && (
              <>
                <div className="border-b px-6 py-5">
                  <SheetHeader className="space-y-1.5">
                    <SheetTitle className="flex items-center gap-2">
                      <Badge variant="secondary" className="capitalize">
                        {detailWidget.type}
                      </Badge>
                      Edit Widget
                    </SheetTitle>
                    <SheetDescription>
                      Update configuration. Changes take effect after saving.
                    </SheetDescription>
                  </SheetHeader>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-6">
                  <div className="space-y-6">
                    {/* Embed snippet */}
                    <div className="space-y-3">
                      <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Embed Snippet
                      </label>
                      <div className="rounded border border-border bg-muted/50 p-3">
                        <code className="block whitespace-pre-wrap break-all text-[11px] leading-relaxed">
                          {getEmbedSnippet(detailWidget.embedToken, detailWidget.type, editTheme)}
                        </code>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full gap-2"
                        onClick={() =>
                          handleCopy(
                            getEmbedSnippet(detailWidget.embedToken, detailWidget.type, editTheme),
                            `detail-${detailWidget.id}`,
                          )
                        }
                      >
                        {copied === `detail-${detailWidget.id}` ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-green-500" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" />
                            Copy Snippet
                          </>
                        )}
                      </Button>
                    </div>

                    <Separator />

                    {/* Changelog source */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Changelog Source</label>
                      <select
                        value={editScope}
                        onChange={(e) => setEditScope(e.target.value)}
                        className="flex h-9 w-full items-center border border-border bg-background px-3 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring/50"
                      >
                        <option value="all">All workspace releases</option>
                        {repositories.length > 0 && (
                          <optgroup label="Filter by Repository">
                            {repositories.map((r) => (
                              <option key={r.id} value={r.id}>
                                {r.fullName}
                              </option>
                            ))}
                          </optgroup>
                        )}
                      </select>
                    </div>

                    {/* Theme */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Theme</label>
                      <div className="flex gap-2">
                        {THEMES.map((t) => (
                          <button
                            key={t.value}
                            type="button"
                            onClick={() => setEditTheme(t.value)}
                            className={cn(
                              "flex items-center gap-2 border px-3 py-2 text-xs transition-colors",
                              editTheme === t.value
                                ? "border-primary ring-2 ring-primary/20"
                                : "border-border hover:border-muted-foreground/30",
                            )}
                          >
                            <t.icon className="h-3.5 w-3.5" />
                            {t.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Primary color */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        <Palette className="mr-1.5 inline h-3.5 w-3.5" />
                        Primary Color
                      </label>
                      <div className="flex items-center gap-3">
                        <div
                          className="h-9 w-9 shrink-0 border border-border"
                          style={{ backgroundColor: editColor }}
                        />
                        <Input
                          type="text"
                          value={editColor}
                          onChange={(e) => setEditColor(e.target.value)}
                          placeholder="#6366f1"
                          className="h-9 w-32 font-mono text-xs"
                        />
                      </div>
                    </div>

                    {/* Domain whitelist */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Allowed Domains</label>
                      <p className="text-xs text-muted-foreground">
                        Restrict which domains can embed this widget. Leave empty to allow all.
                      </p>
                      <div className="flex gap-2">
                        <Input
                          type="text"
                          value={newDomain}
                          onChange={(e) => setNewDomain(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddDomain())}
                          placeholder="example.com"
                          className="h-9 flex-1 text-xs"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9"
                          onClick={handleAddDomain}
                          disabled={!newDomain.trim()}
                        >
                          Add
                        </Button>
                      </div>
                      {editDomains.length > 0 && (
                        <div className="space-y-1.5">
                          {editDomains.map((domain) => (
                            <div
                              key={domain}
                              className="flex items-center justify-between border border-border px-3 py-1.5 text-xs"
                            >
                              <span>{domain}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveDomain(domain)}
                                className="text-muted-foreground hover:text-destructive"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <Separator />

                    {/* Info */}
                    <div className="space-y-2 text-xs text-muted-foreground">
                      <div className="flex justify-between">
                        <span>Embed Token</span>
                        <code>{detailWidget.embedToken.slice(0, 16)}...</code>
                      </div>
                      <div className="flex justify-between">
                        <span>Created</span>
                        <span>{new Date(detailWidget.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Type</span>
                        <span className="capitalize">{detailWidget.type}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer actions */}
                <div className="space-y-2 border-t px-6 py-4">
                  <Button
                    className="w-full"
                    onClick={handleSaveWidget}
                    disabled={updateWidget.isPending}
                  >
                    {updateWidget.isPending ? (
                      <>
                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    onClick={handleDeleteWidget}
                    disabled={deleteWidget.isPending}
                  >
                    {deleteWidget.isPending ? (
                      <>
                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                        Delete Widget
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </TooltipProvider>
  )
}
