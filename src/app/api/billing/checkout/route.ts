import { z } from "zod"
import { requireAuth } from "@/lib/auth/middleware"
import { prisma } from "@/lib/db/prisma"
import { handleApiError, ValidationError } from "@/lib/utils/errors"

const POLAR_ACCESS_TOKEN = process.env.POLAR_ACCESS_TOKEN

// Map plan + interval to Polar price IDs from env
const PRICE_IDS: Record<string, string | undefined> = {
  "pro-monthly": process.env.POLAR_PRICE_ID_PRO_MONTHLY,
  "pro-annual": process.env.POLAR_PRICE_ID_PRO_ANNUAL,
  "team-monthly": process.env.POLAR_PRICE_ID_TEAM_MONTHLY,
  "team-annual": process.env.POLAR_PRICE_ID_TEAM_ANNUAL,
}

const checkoutSchema = z.object({
  workspaceId: z.string().uuid(),
  plan: z.enum(["free", "pro", "team"]),
  interval: z.enum(["monthly", "annual"]).default("monthly"),
})

export async function POST(request: Request) {
  try {
    await requireAuth()
    const body = await request.json()
    const parsed = checkoutSchema.safeParse(body)
    if (!parsed.success) throw new ValidationError("Invalid input", parsed.error.format())

    const { workspaceId, plan, interval } = parsed.data

    // Verify workspace exists
    const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } })
    if (!workspace) throw new ValidationError("Workspace not found")

    // Downgrade to free — no payment needed
    if (plan === "free") {
      await prisma.workspace.update({
        where: { id: workspaceId },
        data: { plan: "free", polarSubscriptionId: null },
      })
      return Response.json({ success: true, mock: false, plan: "free" })
    }

    // Check if Polar is configured
    const priceId = PRICE_IDS[`${plan}-${interval}`]

    if (POLAR_ACCESS_TOKEN && priceId) {
      // ── Polar checkout ──────────────────────────────────────────
      const { createCheckoutSession } = await import("@/lib/billing/polar")
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
      const successUrl = `${appUrl}/dashboard/settings?billing=success`
      const session = await createCheckoutSession(workspaceId, priceId, successUrl)
      return Response.json({ url: session.url })
    }

    // ── Mock mode (dev/testing) ─────────────────────────────────
    // Directly update the workspace plan in the database
    await prisma.workspace.update({
      where: { id: workspaceId },
      data: { plan },
    })

    return Response.json({
      success: true,
      mock: true,
      plan,
      message: `Workspace upgraded to ${plan} (mock mode — Polar not configured)`,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
