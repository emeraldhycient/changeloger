import { prisma } from "../prisma"
import type { WorkspaceRole } from "@prisma/client"

export function findWorkspacesByUserId(userId: string) {
  return prisma.workspace.findMany({
    where: {
      members: { some: { userId } },
    },
    include: {
      _count: { select: { members: true, repositories: true } },
    },
    orderBy: { createdAt: "desc" },
  })
}

export function findWorkspaceById(id: string) {
  return prisma.workspace.findUnique({
    where: { id },
    include: {
      owner: { select: { id: true, name: true, email: true, avatarUrl: true } },
      _count: { select: { members: true, repositories: true } },
    },
  })
}

export function findWorkspaceMembers(workspaceId: string) {
  return prisma.workspaceMember.findMany({
    where: { workspaceId },
    include: {
      user: { select: { id: true, name: true, email: true, avatarUrl: true } },
    },
    orderBy: { joinedAt: "asc" },
  })
}

export function createWorkspace(data: {
  name: string
  slug: string
  ownerId: string
}) {
  return prisma.$transaction(async (tx) => {
    const workspace = await tx.workspace.create({ data })
    await tx.workspaceMember.create({
      data: {
        workspaceId: workspace.id,
        userId: data.ownerId,
        role: "owner",
      },
    })
    return workspace
  })
}

export function updateMemberRole(
  workspaceId: string,
  userId: string,
  role: WorkspaceRole,
) {
  return prisma.workspaceMember.update({
    where: { workspaceId_userId: { workspaceId, userId } },
    data: { role },
  })
}
