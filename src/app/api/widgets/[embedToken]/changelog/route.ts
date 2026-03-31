import { NextRequest } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { handleApiError, NotFoundError } from "@/lib/utils/errors"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ embedToken: string }> },
) {
  try {
    const { embedToken } = await params

    const widget = await prisma.widget.findUnique({
      where: { embedToken },
      include: {
        repository: {
          include: {
            releases: {
              where: { status: "published" },
              include: { entries: { orderBy: { position: "asc" } } },
              orderBy: { publishedAt: "desc" },
              take: 10,
            },
          },
        },
      },
    })

    if (!widget) throw new NotFoundError("Widget not found")

    const releases = widget.repository.releases.map((r) => ({
      version: r.version,
      date: r.publishedAt,
      entries: r.entries.map((e) => ({
        id: e.id,
        category: e.category,
        title: e.title,
        description: e.description,
        breaking: e.breaking,
      })),
    }))

    return Response.json({
      config: widget.config,
      type: widget.type,
      releases,
    }, {
      headers: {
        "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
        "Access-Control-Allow-Origin": "*",
      },
    })
  } catch (error) {
    return handleApiError(error)
  }
}
