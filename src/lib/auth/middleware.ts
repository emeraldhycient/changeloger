import { NextRequest } from "next/server"
import { getSessionFromCookies } from "./session"
import { prisma } from "@/lib/db/prisma"
import { AuthError, ForbiddenError } from "@/lib/utils/errors"
import type { SessionPayload } from "@/types"
import type { WorkspaceRole } from "@prisma/client"

const ROLE_HIERARCHY: Record<WorkspaceRole, number> = {
  owner: 4,
  admin: 3,
  editor: 2,
  viewer: 1,
}

export async function requireAuth(): Promise<SessionPayload> {
  const session = await getSessionFromCookies()
  if (!session) {
    throw new AuthError("Authentication required")
  }
  return session
}

export async function requireWorkspaceRole(
  workspaceId: string,
  minimumRole: WorkspaceRole,
): Promise<{ session: SessionPayload; memberRole: WorkspaceRole }> {
  const session = await requireAuth()

  const member = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId: session.userId,
      },
    },
  })

  if (!member) {
    throw new ForbiddenError("Not a member of this workspace")
  }

  if (ROLE_HIERARCHY[member.role] < ROLE_HIERARCHY[minimumRole]) {
    throw new ForbiddenError(
      `Requires ${minimumRole} role or higher`,
    )
  }

  return { session, memberRole: member.role }
}

export function getWorkspaceIdFromParams(
  request: NextRequest,
  paramName = "id",
): string {
  const url = new URL(request.url)
  const segments = url.pathname.split("/")
  const paramIndex = segments.indexOf("workspaces") + 1
  if (paramIndex === 0 || paramIndex >= segments.length) {
    throw new Error(`Could not extract workspace ${paramName} from URL`)
  }
  return segments[paramIndex]
}

/**
 * Verify the current user has access to a release's workspace.
 * Looks up the release → workspaceId, then checks membership.
 */
export async function requireReleaseAccess(
  releaseId: string,
  minimumRole: WorkspaceRole = "viewer",
) {
  const session = await requireAuth()
  const release = await prisma.release.findUnique({
    where: { id: releaseId },
    select: { workspaceId: true },
  })
  if (!release) throw new ForbiddenError("Release not found")

  const member = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: { workspaceId: release.workspaceId, userId: session.userId },
    },
  })
  if (!member || ROLE_HIERARCHY[member.role] < ROLE_HIERARCHY[minimumRole]) {
    throw new ForbiddenError("Not authorized for this release")
  }
  return { session, workspaceId: release.workspaceId }
}

/**
 * Verify the current user has access to a repository's workspace.
 */
export async function requireRepoAccess(
  repositoryId: string,
  minimumRole: WorkspaceRole = "viewer",
) {
  const session = await requireAuth()
  const repo = await prisma.repository.findUnique({
    where: { id: repositoryId },
    select: { workspaceId: true },
  })
  if (!repo) throw new ForbiddenError("Repository not found")

  const member = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: { workspaceId: repo.workspaceId, userId: session.userId },
    },
  })
  if (!member || ROLE_HIERARCHY[member.role] < ROLE_HIERARCHY[minimumRole]) {
    throw new ForbiddenError("Not authorized for this repository")
  }
  return { session, workspaceId: repo.workspaceId }
}

/**
 * Verify the current user has access to a widget's workspace.
 */
export async function requireWidgetAccess(
  widgetId: string,
  minimumRole: WorkspaceRole = "viewer",
) {
  const session = await requireAuth()
  const widget = await prisma.widget.findUnique({
    where: { id: widgetId },
    select: { workspaceId: true },
  })
  if (!widget) throw new ForbiddenError("Widget not found")

  const member = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: { workspaceId: widget.workspaceId, userId: session.userId },
    },
  })
  if (!member || ROLE_HIERARCHY[member.role] < ROLE_HIERARCHY[minimumRole]) {
    throw new ForbiddenError("Not authorized for this widget")
  }
  return { session, workspaceId: widget.workspaceId }
}
