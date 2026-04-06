import { prisma } from "@/lib/db/prisma"
import type { WorkspacePlan } from "@prisma/client"

const POLAR_API_URL = "https://api.polar.sh/v1"
const POLAR_ACCESS_TOKEN = process.env.POLAR_ACCESS_TOKEN

async function polarFetch(path: string, options: RequestInit = {}) {
  const response = await fetch(`${POLAR_API_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${POLAR_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  })
  if (!response.ok) {
    throw new Error(`Polar API error: ${response.status} ${await response.text()}`)
  }
  return response.json()
}

export async function createCheckoutSession(workspaceId: string, priceId: string, successUrl: string) {
  const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } })
  if (!workspace) throw new Error("Workspace not found")

  return polarFetch("/checkouts", {
    method: "POST",
    body: JSON.stringify({
      price_id: priceId,
      success_url: successUrl,
      metadata: { workspace_id: workspaceId },
      customer_email: undefined, // will be set if workspace has email
    }),
  })
}

export async function getCustomerPortalUrl(customerId: string) {
  const data = await polarFetch(`/customers/${customerId}/portal`)
  return data.url as string
}

export function mapPolarPlanToWorkspacePlan(productName: string): WorkspacePlan {
  const lower = productName.toLowerCase()
  if (lower.includes("enterprise")) return "enterprise"
  if (lower.includes("team")) return "team"
  if (lower.includes("pro")) return "pro"
  return "free"
}

export async function handleSubscriptionEvent(
  eventType: string,
  data: Record<string, unknown>,
) {
  const metadata = (data.metadata as Record<string, string>) || {}
  const workspaceId = metadata.workspace_id

  if (!workspaceId) return

  switch (eventType) {
    case "subscription.created":
    case "subscription.updated": {
      const plan = mapPolarPlanToWorkspacePlan(data.product_name as string || "")
      await prisma.workspace.update({
        where: { id: workspaceId },
        data: {
          plan,
          polarCustomerId: data.customer_id as string,
          polarSubscriptionId: data.id as string,
        },
      })
      break
    }
    case "subscription.canceled": {
      await prisma.workspace.update({
        where: { id: workspaceId },
        data: { plan: "free", polarSubscriptionId: null },
      })
      break
    }
  }
}
