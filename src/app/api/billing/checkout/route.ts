import { z } from "zod"
import { requireAuth } from "@/lib/auth/middleware"
import { createCheckoutSession } from "@/lib/billing/polar"
import { handleApiError, ValidationError } from "@/lib/utils/errors"

const checkoutSchema = z.object({
  workspaceId: z.string().uuid(),
  priceId: z.string().min(1),
})

export async function POST(request: Request) {
  try {
    await requireAuth()
    const body = await request.json()
    const parsed = checkoutSchema.safeParse(body)
    if (!parsed.success) throw new ValidationError("Invalid input", parsed.error.format())

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const successUrl = `${appUrl}/dashboard/settings?billing=success`

    const session = await createCheckoutSession(parsed.data.workspaceId, parsed.data.priceId, successUrl)
    return Response.json({ url: session.url })
  } catch (error) {
    return handleApiError(error)
  }
}
