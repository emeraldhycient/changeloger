import { NextRequest } from "next/server"
import { createHmac, timingSafeEqual } from "crypto"
import { handleSubscriptionEvent } from "@/lib/billing/polar"

export async function POST(request: NextRequest) {
  const secret = process.env.POLAR_WEBHOOK_SECRET
  if (!secret) {
    return Response.json({ error: "Webhook secret not configured" }, { status: 500 })
  }

  const body = await request.text()
  const signature = request.headers.get("x-polar-signature")

  if (!verifyPolarSignature(body, signature, secret)) {
    return Response.json({ error: "Invalid signature" }, { status: 401 })
  }

  try {
    const payload = JSON.parse(body)
    const eventType = payload.type as string
    const data = payload.data as Record<string, unknown>

    await handleSubscriptionEvent(eventType, data)

    return Response.json({ received: true })
  } catch (error) {
    console.error("Polar webhook error:", error)
    return Response.json({ error: "Processing failed" }, { status: 500 })
  }
}

function verifyPolarSignature(payload: string, signature: string | null, secret: string): boolean {
  if (!signature) return false
  const expected = createHmac("sha256", secret).update(payload).digest("hex")
  try {
    return timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  } catch {
    return false
  }
}
