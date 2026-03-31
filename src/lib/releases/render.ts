import type { ChangelogEntry } from "@prisma/client"

const CATEGORY_LABELS: Record<string, string> = {
  added: "Added",
  fixed: "Fixed",
  changed: "Changed",
  removed: "Removed",
  deprecated: "Deprecated",
  security: "Security",
  performance: "Performance",
  documentation: "Documentation",
  maintenance: "Maintenance",
  breaking: "Breaking Changes",
}

export function renderMarkdown(version: string, date: Date, entries: ChangelogEntry[]): string {
  const dateStr = date.toISOString().split("T")[0]
  const lines = [`## [${version}] - ${dateStr}`, ""]

  const grouped = groupByCategory(entries)

  for (const [category, catEntries] of grouped) {
    lines.push(`### ${CATEGORY_LABELS[category] || category}`, "")
    for (const entry of catEntries) {
      lines.push(`- ${entry.title}${entry.breaking ? " **[BREAKING]**" : ""}`)
      if (entry.description) {
        lines.push(`  ${entry.description}`)
      }
    }
    lines.push("")
  }

  return lines.join("\n")
}

export function renderHTML(version: string, date: Date, entries: ChangelogEntry[]): string {
  const dateStr = date.toISOString().split("T")[0]
  const grouped = groupByCategory(entries)

  let html = `<article class="changelog-release">\n`
  html += `  <header><h2>${version}</h2><time datetime="${dateStr}">${dateStr}</time></header>\n`

  for (const [category, catEntries] of grouped) {
    html += `  <section class="changelog-category changelog-${category}">\n`
    html += `    <h3>${CATEGORY_LABELS[category] || category}</h3>\n`
    html += `    <ul>\n`
    for (const entry of catEntries) {
      html += `      <li${entry.breaking ? ' class="breaking"' : ""}>${escapeHtml(entry.title)}`
      if (entry.description) {
        html += `<p>${escapeHtml(entry.description)}</p>`
      }
      html += `</li>\n`
    }
    html += `    </ul>\n  </section>\n`
  }

  html += `</article>`
  return html
}

export function renderJSON(version: string, date: Date, entries: ChangelogEntry[]) {
  return {
    version,
    date: date.toISOString(),
    entries: entries.map((e) => ({
      id: e.id,
      category: e.category,
      title: e.title,
      description: e.description,
      impact: e.impact,
      breaking: e.breaking,
    })),
  }
}

function groupByCategory(entries: ChangelogEntry[]): [string, ChangelogEntry[]][] {
  const map = new Map<string, ChangelogEntry[]>()
  // Show breaking changes first
  const order = ["breaking", "added", "fixed", "changed", "removed", "deprecated", "security", "performance", "documentation", "maintenance"]

  for (const entry of entries) {
    const cat = entry.breaking ? "breaking" : entry.category
    const list = map.get(cat) || []
    list.push(entry)
    map.set(cat, list)
  }

  return order.filter((c) => map.has(c)).map((c) => [c, map.get(c)!])
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
}
