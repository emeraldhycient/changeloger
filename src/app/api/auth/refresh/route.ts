import { getSessionFromCookies } from "@/lib/auth/session"

export async function POST() {
  // getSessionFromCookies already handles refresh token rotation:
  // if access token is expired but refresh token is valid,
  // it re-issues a new access token cookie automatically
  const session = await getSessionFromCookies()

  if (!session) {
    return Response.json({ error: "Session expired" }, { status: 401 })
  }

  return Response.json({ userId: session.userId, email: session.email })
}
