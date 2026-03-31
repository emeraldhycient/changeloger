import { Octokit } from "octokit"
import { prisma } from "@/lib/db/prisma"
import { createGitHubClient } from "./client"
import type { InstallationAccessToken } from "./types"

const APP_ID = process.env.GITHUB_APP_ID
const PRIVATE_KEY = process.env.GITHUB_APP_PRIVATE_KEY

// getAppOctokit is reserved for future use with @octokit/auth-app
// For now, installation tokens are fetched via REST API in getInstallationToken

export async function getInstallationToken(installationId: number): Promise<string> {
  // Check DB for cached token
  const installation = await prisma.githubInstallation.findUnique({
    where: { installationId },
  })

  if (installation?.accessToken && installation.tokenExpiresAt) {
    const expiresAt = new Date(installation.tokenExpiresAt)
    // Refresh if less than 5 minutes remaining
    if (expiresAt.getTime() - Date.now() > 5 * 60 * 1000) {
      return installation.accessToken
    }
  }

  // Fetch new token
  const response = await fetch(
    `https://api.github.com/app/installations/${installationId}/access_tokens`,
    {
      method: "POST",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${await generateAppJWT()}`,
      },
    },
  )

  if (!response.ok) {
    throw new Error(`Failed to get installation token: ${response.status}`)
  }

  const tokenData: InstallationAccessToken = await response.json()

  // Cache in DB
  if (installation) {
    await prisma.githubInstallation.update({
      where: { installationId },
      data: {
        accessToken: tokenData.token,
        tokenExpiresAt: new Date(tokenData.expires_at),
      },
    })
  }

  return tokenData.token
}

export async function getInstallationClient(installationId: number) {
  const token = await getInstallationToken(installationId)
  return createGitHubClient(token)
}

export async function syncInstallationRepos(installationId: number, workspaceId: string) {
  const client = await getInstallationClient(installationId)
  const repos = await client.getRepos(installationId)

  const installation = await prisma.githubInstallation.findUnique({
    where: { installationId },
  })

  if (!installation) throw new Error("Installation not found")

  for (const repo of repos) {
    await prisma.repository.upsert({
      where: {
        workspaceId_githubRepoId: {
          workspaceId,
          githubRepoId: repo.id,
        },
      },
      update: {
        name: repo.name,
        fullName: repo.full_name,
        defaultBranch: repo.default_branch,
        language: repo.language,
      },
      create: {
        workspaceId,
        githubInstallationId: installation.id,
        githubRepoId: repo.id,
        name: repo.name,
        fullName: repo.full_name,
        defaultBranch: repo.default_branch,
        language: repo.language,
      },
    })
  }

  return repos
}

async function generateAppJWT(): Promise<string> {
  // Simple JWT generation for GitHub App authentication
  const jwt = await import("jsonwebtoken")
  const now = Math.floor(Date.now() / 1000)
  return jwt.default.sign(
    { iat: now - 60, exp: now + 10 * 60, iss: APP_ID },
    PRIVATE_KEY!.replace(/\\n/g, "\n"),
    { algorithm: "RS256" },
  )
}
