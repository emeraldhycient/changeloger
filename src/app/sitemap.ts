import type { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://changeloger.dev"

  const routes = [
    "",
    "/about",
    "/blog",
    "/changelog",
    "/contact",
    "/features",
    "/pricing",
    "/privacy",
    "/terms",
    "/sign-in",
    "/sign-up",
    "/docs",
    "/docs/getting-started",
    "/docs/github-app",
    "/docs/changelog-editor",
    "/docs/detection-engines",
    "/docs/embeddable-widgets",
    "/docs/team-management",
    "/docs/billing",
    "/docs/api-reference",
  ]

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.8,
  }))
}
