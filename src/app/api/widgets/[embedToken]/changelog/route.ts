import { NextRequest } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { handleApiError, NotFoundError } from "@/lib/utils/errors"
import { resolveTheme, type WidgetTheme } from "@/lib/widgets/theme"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ embedToken: string }> },
) {
  try {
    const { embedToken } = await params

    const widget = await prisma.widget.findUnique({
      where: { embedToken },
      include: {
        workspace: { select: { name: true, slug: true, widgetTheme: true } },
      },
    })

    if (!widget) throw new NotFoundError("Widget not found")

    // Fetch published releases — from repo if bound, otherwise from workspace
    const whereClause = widget.repositoryId
      ? { repositoryId: widget.repositoryId, status: "published" as const }
      : { workspaceId: widget.workspaceId, status: "published" as const }

    const releases = await prisma.release.findMany({
      where: whereClause,
      include: {
        entries: { orderBy: { position: "asc" } },
        repository: { select: { name: true, fullName: true } },
      },
      orderBy: { publishedAt: "desc" },
      take: 10,
    })

    const formattedReleases = releases.map((r) => ({
      version: r.version,
      date: r.publishedAt,
      repository: r.repository ? { name: r.repository.name, fullName: r.repository.fullName } : null,
      entries: r.entries.map((e) => ({
        id: e.id,
        category: e.category,
        title: e.title,
        description: e.description,
        breaking: e.breaking,
      })),
    }))

    // Resolve theme: workspace defaults + widget config overrides
    const workspaceTheme = (widget.workspace.widgetTheme || {}) as Partial<WidgetTheme>
    const widgetConfig = (widget.config || {}) as Record<string, unknown>
    const theme = resolveTheme(workspaceTheme, widgetConfig)

    return Response.json({
      config: widget.config,
      theme,
      type: widget.type,
      workspace: { name: widget.workspace.name, slug: widget.workspace.slug },
      releases: formattedReleases,
    }, {
      headers: {
        "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function OPTIONS() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}
