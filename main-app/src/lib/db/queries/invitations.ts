import { prisma } from "../prisma"

export function findInvitationByToken(token: string) {
  return prisma.invitation.findUnique({
    where: { token },
    include: { workspace: { select: { id: true, name: true } } },
  })
}

export async function acceptInvitation(token: string, userId: string) {
  const invitation = await prisma.invitation.findUnique({ where: { token } })
  if (!invitation) throw new Error("Invitation not found")
  if (invitation.acceptedAt) throw new Error("Invitation already accepted")
  if (new Date() > invitation.expiresAt) throw new Error("Invitation expired")

  return prisma.$transaction([
    prisma.invitation.update({
      where: { token },
      data: { acceptedAt: new Date() },
    }),
    prisma.workspaceMember.create({
      data: {
        workspaceId: invitation.workspaceId,
        userId,
        role: invitation.role,
        invitedBy: invitation.invitedById,
      },
    }),
  ])
}
