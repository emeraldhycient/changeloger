import { Octokit } from "octokit"
import type {
  GitHubCommitResponse,
  GitHubCompareResponse,
  GitHubFileContent,
  GitHubRepository,
} from "./types"

export function createGitHubClient(token: string) {
  const octokit = new Octokit({ auth: token })

  return {
    async getRepos(installationId?: number) {
      if (installationId) {
        const { data } = await octokit.rest.apps.listReposAccessibleToInstallation({
          per_page: 100,
        })
        return data.repositories as unknown as GitHubRepository[]
      }
      const { data } = await octokit.rest.repos.listForAuthenticatedUser({ per_page: 100 })
      return data as unknown as GitHubRepository[]
    },

    async getCommits(owner: string, repo: string, options: { sha?: string; since?: string; per_page?: number } = {}) {
      const { data } = await octokit.rest.repos.listCommits({
        owner,
        repo,
        sha: options.sha,
        since: options.since,
        per_page: options.per_page || 50,
      })
      return data as unknown as GitHubCommitResponse[]
    },

    async compareRefs(owner: string, repo: string, base: string, head: string) {
      const { data } = await octokit.rest.repos.compareCommits({
        owner,
        repo,
        base,
        head,
      })
      return data as unknown as GitHubCompareResponse
    },

    async getFileContent(owner: string, repo: string, path: string, ref?: string) {
      const { data } = await octokit.rest.repos.getContent({
        owner,
        repo,
        path,
        ref,
      })
      return data as unknown as GitHubFileContent
    },

    async getTags(owner: string, repo: string) {
      const { data } = await octokit.rest.repos.listTags({ owner, repo, per_page: 50 })
      return data
    },

    async getRepo(owner: string, repo: string) {
      const { data } = await octokit.rest.repos.get({ owner, repo })
      return data as unknown as GitHubRepository
    },
  }
}

export type GitHubClient = ReturnType<typeof createGitHubClient>
