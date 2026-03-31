import { prisma } from "../prisma"
import type { ReleaseStatus } from "@prisma/client"

export function findReleasesByRepository(repositoryId: string, status?: ReleaseStatus) {
  return prisma.release.findMany({
    where: { repositoryId, ...(status ? { status } : {}) },
    include: { _count: { select: { entries: true } } },
    orderBy: { createdAt: "desc" },
  })
}

export function findReleaseByVersion(repositoryId: string, version: string) {
  return prisma.release.findUnique({
    where: { repositoryId_version: { repositoryId, version } },
    include: {
      entries: { orderBy: { position: "asc" } },
      publisher: { select: { id: true, name: true, avatarUrl: true } },
    },
  })
}

export function createDraftRelease(data: { repositoryId: string; version: string; summary?: string }) {
  return prisma.release.create({
    data: { ...data, status: "draft" },
  })
}

export function publishRelease(id: string, userId: string) {
  return prisma.release.update({
    where: { id },
    data: { status: "published", publishedAt: new Date(), publishedBy: userId },
  })
}

export function findReleaseRevisions(releaseId: string) {
  return prisma.releaseRevision.findMany({
    where: { releaseId },
    include: { creator: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  })
}
