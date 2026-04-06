import { NextRequest } from "next/server"
import { requireWorkspaceRole } from "@/lib/auth/middleware"
import { findWorkspaceMembers } from "@/lib/db/queries/workspaces"
import { handleApiError } from "@/lib/utils/errors"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    await requireWorkspaceRole(id, "viewer")
    const members = await findWorkspaceMembers(id)
    return Response.json(members)
  } catch (error) {
    return handleApiError(error)
  }
}
