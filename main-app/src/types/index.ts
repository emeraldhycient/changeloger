export type {
  User,
  Workspace,
  WorkspaceMember,
  Repository,
  Release,
  ChangelogEntry,
  ChangeRecord,
  Widget,
  Invitation,
  OAuthAccount,
  Session,
  GithubInstallation,
  ReleaseRevision,
  AnalyticsEvent,
  AnalyticsDaily,
} from "@prisma/client"

export type {
  OAuthProvider,
  WorkspaceRole,
  WorkspacePlan,
  ReleaseStatus,
  WidgetType,
  ChangeSource,
  EventType,
  ImpactLevel,
  ChangeCategory,
} from "@prisma/client"

export interface ApiErrorResponse {
  error: string
  code: string
  details?: unknown
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

export interface SessionPayload {
  userId: string
  email: string
  sessionId: string
}

export type {
  Repository as RepositoryModel,
  ChangeRecord as ChangeRecordModel,
  Widget as WidgetModel,
  DashboardStats,
  AnalyticsSummary,
  GenerateResult,
  RepoListResponse,
} from "./models"
