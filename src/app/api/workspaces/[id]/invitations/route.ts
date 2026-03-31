import { NextRequest } from "next/server"
import { z } from "zod"
import { requireWorkspaceRole } from "@/lib/auth/middleware"
import { prisma } from "@/lib/db/prisma"
import { handleApiError, ValidationError } from "@/lib/utils/errors"

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(["viewer", "editor", "admin"]),
})

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    await requireWorkspaceRole(id, "admin")

    const invitations = await prisma.invitation.findMany({
      where: { workspaceId: id, acceptedAt: null },
      orderBy: { createdAt: "desc" },
    })

    return Response.json(invitations)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const { session } = await requireWorkspaceRole(id, "admin")

    const body = await request.json()
    const parsed = inviteSchema.safeParse(body)
    if (!parsed.success) {
      throw new ValidationError("Invalid input", parsed.error.format())
    }

    const invitation = await prisma.invitation.create({
      data: {
        workspaceId: id,
        email: parsed.data.email,
        role: parsed.data.role,
        invitedById: session.userId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    })

    return Response.json(invitation, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
