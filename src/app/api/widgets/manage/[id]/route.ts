import { NextRequest } from "next/server"
import { z } from "zod"
import { requireWidgetAccess } from "@/lib/auth/middleware"
import { prisma } from "@/lib/db/prisma"
import { handleApiError, NotFoundError, ValidationError } from "@/lib/utils/errors"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    await requireWidgetAccess(id)
    const widget = await prisma.widget.findUnique({ where: { id } })
    if (!widget) throw new NotFoundError("Widget not found")
    return Response.json(widget)
  } catch (error) {
    return handleApiError(error)
  }
}

const updateSchema = z.object({
  config: z.record(z.string(), z.unknown()).optional().refine((v) => !v || JSON.stringify(v).length < 10000, "Config too large"),
  domains: z.array(z.string()).optional(),
  repositoryId: z.string().uuid().nullable().optional(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    await requireWidgetAccess(id, "editor")
    const body = await request.json()
    const parsed = updateSchema.safeParse(body)
    if (!parsed.success) throw new ValidationError("Invalid input", parsed.error.format())

    const existing = await prisma.widget.findUnique({ where: { id } })
    if (!existing) throw new NotFoundError("Widget not found")

    const data: Record<string, unknown> = {}
    if (parsed.data.config !== undefined) data.config = parsed.data.config as object
    if (parsed.data.domains !== undefined) data.domains = parsed.data.domains
    if (parsed.data.repositoryId !== undefined) data.repositoryId = parsed.data.repositoryId

    const widget = await prisma.widget.update({ where: { id }, data })
    return Response.json(widget)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    await requireWidgetAccess(id, "admin")
    const existing = await prisma.widget.findUnique({ where: { id } })
    if (!existing) throw new NotFoundError("Widget not found")
    await prisma.widget.delete({ where: { id } })
    return Response.json({ deleted: true })
  } catch (error) {
    return handleApiError(error)
  }
}
