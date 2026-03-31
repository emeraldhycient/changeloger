import { getSessionFromCookies } from "@/lib/auth/session"
import { findUserWithOAuthAccounts } from "@/lib/db/queries/users"
import { AuthError, handleApiError } from "@/lib/utils/errors"

export async function GET() {
  try {
    const session = await getSessionFromCookies()
    if (!session) {
      throw new AuthError()
    }

    const user = await findUserWithOAuthAccounts(session.userId)
    if (!user) {
      throw new AuthError("User not found")
    }

    return Response.json({
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      providers: user.oauthAccounts.map((a: { provider: string }) => a.provider),
    })
  } catch (error) {
    return handleApiError(error)
  }
}
