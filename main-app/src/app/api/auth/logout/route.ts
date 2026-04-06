import { clearSessionCookies, getSessionFromCookies } from "@/lib/auth/session"
import { prisma } from "@/lib/db/prisma"

export async function POST() {
  const session = await getSessionFromCookies()

  if (session) {
    await prisma.session.deleteMany({
      where: { id: session.sessionId },
    })
  }

  await clearSessionCookies()

  return Response.json({ success: true })
}
