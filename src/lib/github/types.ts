// ─── GitHub Webhook Event Types ─────────────────────────────────────────────

export interface GitHubWebhookHeaders {
  "x-github-event": string
  "x-hub-signature-256": string
  "x-github-delivery": string
}

export type GitHubEventType =
  | "push"
  | "create"
  | "release"
  | "installation"
  | "installation_repositories"

// ─── Push Event ─────────────────────────────────────────────────────────────

export interface PushEventCommit {
  id: string
  tree_id: string
  distinct: boolean
  message: string
  timestamp: string
  url: string
  author: {
    name: string
    email: string
    username?: string
  }
  committer: {
    name: string
    email: string
    username?: string
  }
  added: string[]
  removed: string[]
  modified: string[]
}

export interface PushEventPayload {
  ref: string
  before: string
  after: string
  created: boolean
  deleted: boolean
  forced: boolean
  compare: string
  commits: PushEventCommit[]
  head_commit: PushEventCommit | null
  repository: GitHubRepository
  sender: GitHubUser
  installation?: { id: number }
}

// ─── Create Event (tag/branch creation) ─────────────────────────────────────

export interface CreateEventPayload {
  ref: string
  ref_type: "tag" | "branch"
  master_branch: string
  description: string | null
  pusher_type: string
  repository: GitHubRepository
  sender: GitHubUser
  installation?: { id: number }
}

// ─── Release Event ──────────────────────────────────────────────────────────

export interface ReleaseEventPayload {
  action:
    | "published"
    | "unpublished"
    | "created"
    | "edited"
    | "deleted"
    | "prereleased"
    | "released"
  release: GitHubRelease
  repository: GitHubRepository
  sender: GitHubUser
  installation?: { id: number }
}

export interface GitHubRelease {
  id: number
  tag_name: string
  target_commitish: string
  name: string | null
  body: string | null
  draft: boolean
  prerelease: boolean
  created_at: string
  published_at: string | null
  author: GitHubUser
  html_url: string
}

// ─── Installation Events ────────────────────────────────────────────────────

export interface InstallationEventPayload {
  action: "created" | "deleted" | "suspend" | "unsuspend" | "new_permissions_accepted"
  installation: GitHubInstallationData
  repositories?: GitHubRepositoryShort[]
  sender: GitHubUser
}

export interface InstallationRepositoriesEventPayload {
  action: "added" | "removed"
  installation: GitHubInstallationData
  repositories_added: GitHubRepositoryShort[]
  repositories_removed: GitHubRepositoryShort[]
  sender: GitHubUser
}

// ─── Shared Types ───────────────────────────────────────────────────────────

export interface GitHubUser {
  login: string
  id: number
  avatar_url: string
  type: string
}

export interface GitHubRepository {
  id: number
  name: string
  full_name: string
  private: boolean
  owner: GitHubUser
  html_url: string
  description: string | null
  fork: boolean
  default_branch: string
  language: string | null
  pushed_at: string | null
  created_at: string
  updated_at: string
}

export interface GitHubRepositoryShort {
  id: number
  name: string
  full_name: string
  private: boolean
}

export interface GitHubInstallationData {
  id: number
  account: GitHubUser
  app_id: number
  target_type: string
  permissions: Record<string, string>
  events: string[]
  created_at: string
  updated_at: string
}

// ─── GitHub API Response Types ──────────────────────────────────────────────

export interface GitHubCommitResponse {
  sha: string
  commit: {
    author: {
      name: string
      email: string
      date: string
    }
    committer: {
      name: string
      email: string
      date: string
    }
    message: string
    tree: { sha: string }
  }
  author: GitHubUser | null
  committer: GitHubUser | null
  html_url: string
  files?: GitHubCommitFile[]
}

export interface GitHubCommitFile {
  sha: string
  filename: string
  status: "added" | "removed" | "modified" | "renamed" | "copied" | "changed" | "unchanged"
  additions: number
  deletions: number
  changes: number
  patch?: string
}

export interface GitHubCompareResponse {
  url: string
  status: "ahead" | "behind" | "diverged" | "identical"
  ahead_by: number
  behind_by: number
  total_commits: number
  commits: GitHubCommitResponse[]
  files: GitHubCommitFile[]
}

export interface GitHubFileContent {
  name: string
  path: string
  sha: string
  size: number
  type: "file" | "dir"
  content: string
  encoding: string
  html_url: string
}

// ─── Installation Token Types ───────────────────────────────────────────────

export interface InstallationAccessToken {
  token: string
  expires_at: string
  permissions: Record<string, string>
}

// ─── Repository Config ──────────────────────────────────────────────────────

export interface RepositoryConfig {
  monitoredBranches: string[]
  ignorePaths: string[]
  aiEnabled: boolean
  autoDetectVersionBumps: boolean
}

export const DEFAULT_REPOSITORY_CONFIG: RepositoryConfig = {
  monitoredBranches: [],
  ignorePaths: [
    "*.lock",
    "*.log",
    "node_modules/**",
    "dist/**",
    "build/**",
    ".next/**",
  ],
  aiEnabled: true,
  autoDetectVersionBumps: true,
}

// ─── Webhook Handler Payload Types ─────────────────────────────────────────

export interface InstallationPayload {
  action: string
  installation: {
    id: number
    account: { login: string; type?: string }
    target_type?: string
  }
  repositories?: Array<{
    id: number
    name: string
    full_name: string
    private: boolean
  }>
  sender: { login: string; id: number }
}

export interface InstallationReposPayload {
  action: string
  installation: {
    id: number
    account: { login: string }
    target_type?: string
  }
  repository_selection: string
  repositories_added: Array<{
    id: number
    name: string
    full_name: string
    private: boolean
    default_branch?: string
    language?: string | null
  }>
  repositories_removed: Array<{
    id: number
    name: string
    full_name: string
  }>
  sender: { login: string; id: number }
}
