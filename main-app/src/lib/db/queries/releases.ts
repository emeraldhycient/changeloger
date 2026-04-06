import { prisma } from "../prisma"
import type { ReleaseStatus } from "@prisma/client"

// ─── Workspace-level queries (primary) ──────────────────────────────────────

export function findReleasesByWorkspace(workspaceId: string, status?: ReleaseStatus) {
  return prisma.release.findMany({
    where: { workspaceId, ...(status ? { status } : {}) },
    include: {
      _count: { select: { entries: true } },
      repository: { select: { id: true, name: true, fullName: true } },
    },
    orderBy: { createdAt: "desc" },
  })
}

export function findReleaseById(id: string) {
  return prisma.release.findUnique({
    where: { id },
    include: {
      entries: { orderBy: { position: "asc" } },
      publisher: { select: { id: true, name: true, avatarUrl: true } },
      repository: { select: { id: true, name: true, fullName: true } },
    },
  })
}

export function createDraftRelease(data: {
  workspaceId: string
  version: string
  summary?: string
  repositoryId?: string
}) {
  return prisma.release.create({
    data: { ...data, status: "draft" },
  })
}

export function updateRelease(id: string, data: { version?: string; summary?: string; repositoryId?: string | null }) {
  return prisma.release.update({
    where: { id },
    data,
  })
}

// ─── Repository-level queries (backward compat) ────────────────────────────

export function findReleasesByRepository(repositoryId: string, status?: ReleaseStatus) {
  return prisma.release.findMany({
    where: { repositoryId, ...(status ? { status } : {}) },
    include: { _count: { select: { entries: true } } },
    orderBy: { createdAt: "desc" },
  })
}

export function findReleaseByVersion(workspaceId: string, version: string) {
  return prisma.release.findUnique({
    where: { workspaceId_version: { workspaceId, version } },
    include: {
      entries: { orderBy: { position: "asc" } },
      publisher: { select: { id: true, name: true, avatarUrl: true } },
      repository: { select: { id: true, name: true, fullName: true } },
    },
  })
}

// ─── Publishing ─────────────────────────────────────────────────────────────

export function publishReleaseRecord(id: string, userId: string) {
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
