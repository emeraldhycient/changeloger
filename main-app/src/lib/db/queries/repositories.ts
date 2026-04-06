import { prisma } from "../prisma"

export function findRepositoriesByWorkspace(workspaceId: string) {
  return prisma.repository.findMany({
    where: { workspaceId },
    include: {
      githubInstallation: { select: { accountLogin: true, accountType: true } },
      _count: { select: { releases: true, changeRecords: true } },
    },
    orderBy: { createdAt: "desc" },
  })
}

export function findRepositoryById(id: string) {
  return prisma.repository.findUnique({
    where: { id },
    include: {
      githubInstallation: { select: { accountLogin: true, installationId: true } },
      workspace: { select: { id: true, name: true } },
    },
  })
}

export function updateRepositoryConfig(id: string, config: Record<string, unknown>) {
  return prisma.repository.update({ where: { id }, data: { config: config as object } })
}

export function toggleRepositoryActive(id: string, isActive: boolean) {
  return prisma.repository.update({ where: { id }, data: { isActive } })
}

export function deleteRepository(id: string) {
  return prisma.repository.delete({ where: { id } })
}
