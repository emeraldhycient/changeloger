import { prisma } from "../prisma"
import type { ChangeCategory, ImpactLevel } from "@prisma/client"

export function findEntriesByRelease(releaseId: string) {
  return prisma.changelogEntry.findMany({
    where: { releaseId },
    orderBy: { position: "asc" },
  })
}

export function createEntry(data: {
  releaseId: string
  category: ChangeCategory
  title: string
  description?: string
  impact?: ImpactLevel
  breaking?: boolean
  authors?: unknown
  sourceRecordIds?: string[]
  position?: number
}) {
  return prisma.changelogEntry.create({ data: { ...data, authors: data.authors ?? [] } })
}

export function updateEntry(id: string, data: Partial<{
  category: ChangeCategory
  title: string
  description: string | null
  impact: ImpactLevel
  breaking: boolean
  reviewed: boolean
  position: number
}>) {
  return prisma.changelogEntry.update({ where: { id }, data })
}

export function deleteEntry(id: string) {
  return prisma.changelogEntry.delete({ where: { id } })
}

export async function reorderEntries(releaseId: string, orderedIds: string[]) {
  const updates = orderedIds.map((id, index) =>
    prisma.changelogEntry.update({ where: { id }, data: { position: index } }),
  )
  return prisma.$transaction(updates)
}
