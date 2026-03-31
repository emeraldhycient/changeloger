import { v4 as uuid } from "uuid"
import { prisma } from "@/lib/db/prisma"
import { setSessionCookies } from "./session"

interface OAuthUserInfo {
  provider: "google" | "github"
  providerUserId: string
  email: string
  name: string | null
  avatarUrl: string | null
  accessToken: string
  refreshToken?: string
}

export async function handleOAuthCallback(userInfo: OAuthUserInfo): Promise<string> {
  const { provider, providerUserId, email, name, avatarUrl, accessToken, refreshToken } = userInfo

  // Find or create user by email
  let user = await prisma.user.findUnique({ where: { email } })

  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        name,
        avatarUrl,
      },
    })

    // Create default workspace for new users
    const slug = email.split("@")[0].toLowerCase().replace(/[^a-z0-9-]/g, "-")
    const workspace = await prisma.workspace.create({
      data: {
        name: `${name || email.split("@")[0]}'s Workspace`,
        slug: `${slug}-${uuid().slice(0, 8)}`,
        ownerId: user.id,
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14-day trial
      },
    })

    // Add owner as workspace member
    await prisma.workspaceMember.create({
      data: {
        workspaceId: workspace.id,
        userId: user.id,
        role: "owner",
      },
    })
  }

  // Upsert OAuth account
  await prisma.oAuthAccount.upsert({
    where: {
      provider_providerUserId: { provider, providerUserId },
    },
    update: {
      accessToken,
      refreshToken,
    },
    create: {
      userId: user.id,
      provider,
      providerUserId,
      accessToken,
      refreshToken,
    },
  })

  // Create session
  const sessionId = uuid()
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

  await prisma.session.create({
    data: {
      id: sessionId,
      userId: user.id,
      tokenHash: sessionId, // simplified for now
      expiresAt,
    },
  })

  // Set cookies
  await setSessionCookies({
    userId: user.id,
    email: user.email,
    sessionId,
  })

  return user.id
}

export function getGoogleAuthUrl(): string {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const redirectUri = process.env.GOOGLE_CALLBACK_URL
  const params = new URLSearchParams({
    client_id: clientId!,
    redirect_uri: redirectUri!,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "consent",
  })
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`
}

export function getGitHubAuthUrl(): string {
  const clientId = process.env.GITHUB_CLIENT_ID
  const redirectUri = process.env.GITHUB_CALLBACK_URL
  const params = new URLSearchParams({
    client_id: clientId!,
    redirect_uri: redirectUri!,
    scope: "user:email read:user",
  })
  return `https://github.com/login/oauth/authorize?${params}`
}

export async function exchangeGoogleCode(code: string): Promise<OAuthUserInfo> {
  // Exchange code for tokens
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: process.env.GOOGLE_CALLBACK_URL!,
      grant_type: "authorization_code",
    }),
  })

  const tokens = await tokenRes.json()

  // Fetch user info
  const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  })
  const profile = await userRes.json()

  return {
    provider: "google",
    providerUserId: profile.id,
    email: profile.email,
    name: profile.name,
    avatarUrl: profile.picture,
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
  }
}

export async function exchangeGitHubCode(code: string): Promise<OAuthUserInfo> {
  // Exchange code for tokens
  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
    }),
  })

  const tokens = await tokenRes.json()

  // Fetch user profile
  const userRes = await fetch("https://api.github.com/user", {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  })
  const profile = await userRes.json()

  // Fetch primary email
  const emailsRes = await fetch("https://api.github.com/user/emails", {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  })
  const emails = await emailsRes.json()
  const primaryEmail = emails.find(
    (e: { primary: boolean; verified: boolean }) => e.primary && e.verified,
  )

  return {
    provider: "github",
    providerUserId: String(profile.id),
    email: primaryEmail?.email || profile.email,
    name: profile.name || profile.login,
    avatarUrl: profile.avatar_url,
    accessToken: tokens.access_token,
  }
}
