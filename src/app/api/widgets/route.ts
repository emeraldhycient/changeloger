import { z } from "zod"
import { requireAuth } from "@/lib/auth/middleware"
import { prisma } from "@/lib/db/prisma"
import { handleApiError, ValidationError } from "@/lib/utils/errors"

export async function GET(request: Request) {
  try {
    await requireAuth()
    const { searchParams } = new URL(request.url)
    const repositoryId = searchParams.get("repositoryId")
    if (!repositoryId) throw new ValidationError("repositoryId is required")

    const widgets = await prisma.widget.findMany({
      where: { repositoryId },
      orderBy: { createdAt: "desc" },
    })
    return Response.json(widgets)
  } catch (error) {
    return handleApiError(error)
  }
}

const createSchema = z.object({
  repositoryId: z.string().uuid(),
  type: z.enum(["page", "modal", "badge"]),
  config: z.record(z.string(), z.unknown()).optional(),
  domains: z.array(z.string()).optional(),
})

export async function POST(request: Request) {
  try {
    await requireAuth()
    const body = await request.json()
    const parsed = createSchema.safeParse(body)
    if (!parsed.success) throw new ValidationError("Invalid input", parsed.error.format())

    const { config, ...rest } = parsed.data
    const widget = await prisma.widget.create({
      data: { ...rest, config: (config ?? {}) as object },
    })
    return Response.json(widget, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
