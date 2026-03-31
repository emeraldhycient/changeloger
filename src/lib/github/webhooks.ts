import { createHmac, timingSafeEqual } from "crypto"

export function verifyWebhookSignature(
  payload: string,
  signature: string | null,
  secret: string,
): boolean {
  if (!signature) return false

  const expected = `sha256=${createHmac("sha256", secret).update(payload).digest("hex")}`

  try {
    return timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expected),
    )
  } catch {
    return false
  }
}

export function parseEventType(headers: Headers): string | null {
  return headers.get("x-github-event")
}

export function parseDeliveryId(headers: Headers): string | null {
  return headers.get("x-github-delivery")
}
