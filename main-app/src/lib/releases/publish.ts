import { prisma } from "@/lib/db/prisma"
import { findEntriesByRelease } from "@/lib/db/queries/changelog-entries"
import { ValidationError } from "@/lib/utils/errors"
import { renderMarkdown, renderHTML, renderJSON } from "./render"

export async function publishRelease(releaseId: string, userId: string) {
  const release = await prisma.release.findUnique({
    where: { id: releaseId },
    include: { entries: { orderBy: { position: "asc" } } },
  })

  if (!release) throw new ValidationError("Release not found")
  if (release.status === "published") throw new ValidationError("Release is already published")

  // Validate all entries have titles
  const emptyTitles = release.entries.filter((e) => !e.title.trim())
  if (emptyTitles.length > 0) {
    throw new ValidationError(`${emptyTitles.length} entries are missing titles`)
  }

  const publishedAt = new Date()

  // Generate rendered outputs
  const markdown = renderMarkdown(release.version, publishedAt, release.entries)
  const html = renderHTML(release.version, publishedAt, release.entries)
  const json = renderJSON(release.version, publishedAt, release.entries)

  // Create revision snapshot
  await prisma.releaseRevision.create({
    data: {
      releaseId,
      snapshot: {
        version: release.version,
        entries: release.entries,
        markdown,
        html,
        json,
      },
      createdBy: userId,
    },
  })

  // Update release status
  const published = await prisma.release.update({
    where: { id: releaseId },
    data: {
      status: "published",
      publishedAt,
      publishedBy: userId,
      summary: markdown,
    },
    include: { entries: { orderBy: { position: "asc" } } },
  })

  return { release: published, markdown, html, json }
}
