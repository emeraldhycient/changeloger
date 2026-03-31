import { NextRequest } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/db/prisma"
import { handleApiError, NotFoundError, ValidationError } from "@/lib/utils/errors"

const eventSchema = z.object({
  events: z.array(z.object({
    eventType: z.enum(["page_view", "entry_click", "scroll_depth", "session_end"]),
    entryId: z.string().uuid().nullable().optional(),
    visitorHash: z.string().min(1),
    referrer: z.string().nullable().optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
    timestamp: z.string().optional(),
  })),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ embedToken: string }> },
) {
  try {
    const { embedToken } = await params

    const widget = await prisma.widget.findUnique({ where: { embedToken } })
    if (!widget) throw new NotFoundError("Widget not found")

    const body = await request.json()
    const parsed = eventSchema.safeParse(body)
    if (!parsed.success) throw new ValidationError("Invalid events", parsed.error.format())

    await prisma.analyticsEvent.createMany({
      data: parsed.data.events.map((e) => ({
        widgetId: widget.id,
        eventType: e.eventType,
        entryId: e.entryId || null,
        visitorHash: e.visitorHash,
        referrer: e.referrer || null,
        metadata: (e.metadata || {}) as object,
        timestamp: e.timestamp ? new Date(e.timestamp) : new Date(),
      })),
    })

    return Response.json({ received: parsed.data.events.length }, {
      headers: { "Access-Control-Allow-Origin": "*" },
    })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function OPTIONS() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}
