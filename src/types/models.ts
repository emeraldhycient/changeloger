// Shared model types used across the frontend

export interface Repository {
  id: string
  name: string
  fullName: string
  language: string | null
  isActive: boolean
  defaultBranch: string
  config?: Record<string, unknown>
  createdAt: string
  updatedAt?: string
  githubInstallation?: { accountLogin: string; accountType?: string; installationId?: number }
  workspace?: { id: string; name: string }
  _count?: { releases: number; changeRecords: number }
}

export interface ChangeRecord {
  id: string
  source: string
  type: string | null
  scope: string | null
  subject: string
  body: string | null
  commitSha: string | null
  timestamp: string
  breaking: boolean
  processedAt: string | null
  repositoryId: string
  confidence: number
  impact: string
}

export interface Widget {
  id: string
  type: "page" | "modal" | "badge"
  embedToken: string
  workspaceId: string
  repositoryId: string | null
  config: Record<string, unknown>
  domains: string[]
  createdAt: string
  repository?: { id: string; name: string; fullName: string } | null
}

export interface DashboardStats {
  repos: number
  activeRepos: number
  drafts: number
  published: number
  archived: number
  members: number
  widgets: number
  unprocessedChanges: number
  totalChanges: number
  processedChanges: number
  totalEntries: number
  unreviewedEntries: number
  reviewedEntries: number
  breakingEntries: number
  recentEvents24h: number
  recentDrafts: Array<{
    id: string
    version: string
    repository: { name: string; fullName: string } | null
    totalEntries: number
    unreviewedEntries: number
    updatedAt: string
  }>
}

export interface AnalyticsSummary {
  totalViews: number
  totalVisitors: number
  totalClicks: number
  avgReadDepth: number
  totalEvents: number
  recentEvents24h: number
  dailyData: Array<{
    date: string
    pageViews: number
    uniqueVisitors: number
    clicks: number
  }>
  topEntries: Array<{ entryId: string; clicks: number; title: string; category: string }>
  trafficSources: Array<{ source: string; count: number; percentage: number }>
  scrollDepthDistribution: { 25: number; 50: number; 75: number; 100: number }
  widgetBreakdown: Array<{ widgetId: string; type: string; views: number }>
}

export interface GenerateResult {
  entries: Array<{ id: string; category: string; title: string }>
  processedCount: number
  method: "ai" | "rule-based"
}

export interface RepoListResponse {
  repositories: Repository[]
  pagination: { page: number; limit: number; total: number; totalPages: number }
  filters: { languages: string[] }
}
