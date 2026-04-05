import { prisma } from "../prisma"

export function findUnprocessedByRepo(repositoryId: string, limit = 200) {
  return prisma.changeRecord.findMany({
    where: { repositoryId, processedAt: null },
    orderBy: { timestamp: "asc" },
    take: limit,
  })
}

export function findUnprocessedByWorkspace(workspaceId: string, limit = 200) {
  return prisma.changeRecord.findMany({
    where: {
      repository: { workspaceId },
      processedAt: null,
    },
    orderBy: { timestamp: "asc" },
    take: limit,
  })
}

export function countUnprocessed(repositoryId?: string, workspaceId?: string) {
  return prisma.changeRecord.count({
    where: {
      processedAt: null,
      ...(repositoryId ? { repositoryId } : {}),
      ...(workspaceId ? { repository: { workspaceId } } : {}),
    },
  })
}

export function markAsProcessed(ids: string[]) {
  return prisma.changeRecord.updateMany({
    where: { id: { in: ids } },
    data: { processedAt: new Date() },
  })
}
