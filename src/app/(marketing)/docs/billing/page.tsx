import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export const metadata = {
  title: "Billing & Plans - Changeloger Docs",
}

export default function BillingPage() {
  return (
    <article className="space-y-10">
      <header>
        <Badge variant="outline" className="mb-4">
          Billing &amp; Plans
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Plans &amp; Pricing
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Changeloger offers four plans to fit teams of every size. All plans
          include the core detection engines, editor, and widget system.
          Higher tiers unlock more repositories, team members, and AI
          generation capacity.
        </p>
      </header>

      <Separator />

      {/* Plan Comparison */}
      <section id="plan-comparison">
        <h2 className="text-2xl font-bold">Plan Comparison</h2>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="pb-3 pr-6 font-semibold">Feature</th>
                <th className="pb-3 pr-6 font-semibold">Free</th>
                <th className="pb-3 pr-6 font-semibold">Pro</th>
                <th className="pb-3 pr-6 font-semibold">Team</th>
                <th className="pb-3 font-semibold">Enterprise</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              <tr className="border-b">
                <td className="py-2 pr-6 font-medium text-foreground">Monthly price</td>
                <td className="py-2 pr-6">$0</td>
                <td className="py-2 pr-6">$19/mo</td>
                <td className="py-2 pr-6">$49/mo</td>
                <td className="py-2">Custom</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-6 font-medium text-foreground">Repositories</td>
                <td className="py-2 pr-6">3</td>
                <td className="py-2 pr-6">20</td>
                <td className="py-2 pr-6">Unlimited</td>
                <td className="py-2">Unlimited</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-6 font-medium text-foreground">Team members</td>
                <td className="py-2 pr-6">1</td>
                <td className="py-2 pr-6">5</td>
                <td className="py-2 pr-6">25</td>
                <td className="py-2">Unlimited</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-6 font-medium text-foreground">AI generations / month</td>
                <td className="py-2 pr-6">50</td>
                <td className="py-2 pr-6">500</td>
                <td className="py-2 pr-6">2,000</td>
                <td className="py-2">Unlimited</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-6 font-medium text-foreground">Widgets per repo</td>
                <td className="py-2 pr-6">1</td>
                <td className="py-2 pr-6">5</td>
                <td className="py-2 pr-6">Unlimited</td>
                <td className="py-2">Unlimited</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-6 font-medium text-foreground">Release history</td>
                <td className="py-2 pr-6">30 days</td>
                <td className="py-2 pr-6">1 year</td>
                <td className="py-2 pr-6">Unlimited</td>
                <td className="py-2">Unlimited</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-6 font-medium text-foreground">Widget analytics</td>
                <td className="py-2 pr-6">7 days</td>
                <td className="py-2 pr-6">90 days</td>
                <td className="py-2 pr-6">1 year</td>
                <td className="py-2">Unlimited</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-6 font-medium text-foreground">Custom widget branding</td>
                <td className="py-2 pr-6">No</td>
                <td className="py-2 pr-6">Yes</td>
                <td className="py-2 pr-6">Yes</td>
                <td className="py-2">Yes</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-6 font-medium text-foreground">Per-repo access control</td>
                <td className="py-2 pr-6">No</td>
                <td className="py-2 pr-6">No</td>
                <td className="py-2 pr-6">Yes</td>
                <td className="py-2">Yes</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-6 font-medium text-foreground">Audit log</td>
                <td className="py-2 pr-6">No</td>
                <td className="py-2 pr-6">No</td>
                <td className="py-2 pr-6">Yes</td>
                <td className="py-2">Yes</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-6 font-medium text-foreground">Priority support</td>
                <td className="py-2 pr-6">No</td>
                <td className="py-2 pr-6">Email</td>
                <td className="py-2 pr-6">Email + Chat</td>
                <td className="py-2">Dedicated CSM</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-6 font-medium text-foreground">SSO / SAML</td>
                <td className="py-2 pr-6">No</td>
                <td className="py-2 pr-6">No</td>
                <td className="py-2 pr-6">No</td>
                <td className="py-2">Yes</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <Separator />

      {/* Polar Integration */}
      <section id="polar-integration">
        <h2 className="text-2xl font-bold">Polar Integration</h2>
        <p className="mt-3 text-muted-foreground">
          Changeloger uses Polar for subscription billing and payment
          processing. Polar handles checkout sessions, subscription lifecycle
          management, invoicing, and customer portal access. All payment data
          is processed securely by Polar -- Changeloger never stores credit
          card information.
        </p>
        <p className="mt-3 text-muted-foreground">
          The integration uses three environment variables:{" "}
          <code className="bg-muted px-1.5 py-0.5 font-mono text-sm">POLAR_ACCESS_TOKEN</code>,{" "}
          <code className="bg-muted px-1.5 py-0.5 font-mono text-sm">POLAR_WEBHOOK_SECRET</code>, and{" "}
          <code className="bg-muted px-1.5 py-0.5 font-mono text-sm">POLAR_ORGANIZATION_ID</code>. Billing
          variables are only required if you enable paid plans; the application
          functions on the free tier without them.
        </p>
      </section>

      <Separator />

      {/* Checkout Flow */}
      <section id="upgrading">
        <h2 className="text-2xl font-bold">Checkout Flow</h2>
        <p className="mt-3 text-muted-foreground">
          Upgrading your workspace follows this process:
        </p>

        <ol className="mt-4 space-y-3 text-muted-foreground">
          <li className="flex gap-3">
            <span className="font-bold text-foreground">1.</span>
            <span>
              Navigate to Workspace Settings &gt; Billing and select the plan
              you want. Only workspace owners can manage billing.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="font-bold text-foreground">2.</span>
            <span>
              Click <strong className="text-foreground">Upgrade</strong>. The API
              creates a Polar checkout session and redirects you to the Polar
              hosted checkout page.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="font-bold text-foreground">3.</span>
            <span>
              Complete payment on the Polar checkout page. Polar accepts credit
              cards and other payment methods.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="font-bold text-foreground">4.</span>
            <span>
              After payment, Polar sends a webhook to{" "}
              <code className="bg-muted px-1.5 py-0.5 font-mono text-sm">/api/webhooks/polar</code>. The
              webhook handler updates the workspace plan, stores the Polar
              customer and subscription IDs, and activates the new plan limits
              immediately.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="font-bold text-foreground">5.</span>
            <span>
              You are redirected back to the Changeloger dashboard with the new
              plan active.
            </span>
          </li>
        </ol>
      </section>

      <Separator />

      {/* Customer Portal */}
      <section id="customer-portal">
        <h2 className="text-2xl font-bold">Customer Portal</h2>
        <p className="mt-3 text-muted-foreground">
          Workspace owners can access the Polar customer portal to manage their
          subscription. From the portal you can update payment methods, view
          invoices and receipts, change billing details, and cancel your
          subscription. Access the portal from Workspace Settings &gt; Billing
          &gt; Manage Subscription.
        </p>
      </section>

      <Separator />

      {/* Trial */}
      <section id="trial-management">
        <h2 className="text-2xl font-bold">Trial Management</h2>
        <p className="mt-3 text-muted-foreground">
          Every new workspace receives a 14-day free trial of the Pro plan.
          During the trial, all Pro features are unlocked including 20
          repositories, 5 team members, 500 AI generations per month, and
          custom widget branding.
        </p>
        <p className="mt-3 text-muted-foreground">
          The trial expiration date is stored on the workspace record
          (<code className="bg-muted px-1.5 py-0.5 font-mono text-sm">trial_ends_at</code>). A scheduled
          job checks for expired trials daily and downgrades workspaces to the
          Free plan when the trial period ends. Admins receive a notification
          email 3 days before trial expiration.
        </p>
      </section>

      <Separator />

      {/* Annual Billing */}
      <section id="annual-billing">
        <h2 className="text-2xl font-bold">Annual Billing</h2>
        <p className="mt-3 text-muted-foreground">
          All paid plans are available with annual billing at a 20% discount.
          Annual plans are billed once per year, and the full amount is charged
          upfront. Switch between monthly and annual billing from the customer
          portal at any time. When switching from monthly to annual, a prorated
          credit is applied for the remaining days in the current billing cycle.
        </p>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="pb-3 pr-6 font-semibold">Plan</th>
                <th className="pb-3 pr-6 font-semibold">Monthly</th>
                <th className="pb-3 pr-6 font-semibold">Annual (per month)</th>
                <th className="pb-3 font-semibold">Annual (billed)</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              <tr className="border-b">
                <td className="py-2 pr-6 font-medium text-foreground">Pro</td>
                <td className="py-2 pr-6">$19/mo</td>
                <td className="py-2 pr-6">$15.20/mo</td>
                <td className="py-2">$182.40/yr</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-6 font-medium text-foreground">Team</td>
                <td className="py-2 pr-6">$49/mo</td>
                <td className="py-2 pr-6">$39.20/mo</td>
                <td className="py-2">$470.40/yr</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-6 font-medium text-foreground">Enterprise</td>
                <td className="py-2 pr-6" colSpan={3}>
                  Custom pricing -- contact sales
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <Separator />

      {/* Usage Metering */}
      <section id="usage-metering">
        <h2 className="text-2xl font-bold">Usage Metering</h2>
        <p className="mt-3 text-muted-foreground">
          AI generation usage is metered per workspace per billing cycle. The{" "}
          <code className="bg-muted px-1.5 py-0.5 font-mono text-sm">ai_generations_used</code> counter
          on each workspace is incremented before each AI API call and reset
          monthly by a scheduled BullMQ job.
        </p>
        <p className="mt-3 text-muted-foreground">
          Admins receive a notification email when usage reaches 80% of the
          plan&apos;s limit. You can monitor current usage from Workspace
          Settings &gt; Billing &gt; Usage.
        </p>
      </section>

      <Separator />

      {/* Limits */}
      <section id="invoices-and-receipts">
        <h2 className="text-2xl font-bold">When Limits Are Reached</h2>
        <p className="mt-3 text-muted-foreground">
          When a plan limit is reached, the system degrades gracefully rather
          than blocking all access:
        </p>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="pb-3 pr-4 font-semibold">Limit</th>
                <th className="pb-3 font-semibold">What Happens</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              <tr className="border-b">
                <td className="py-2 pr-4 font-medium text-foreground">AI generations exhausted</td>
                <td className="py-2">
                  New AI generations are paused. The detection engines still run
                  and produce entries using rule-based summarization. Existing
                  changelogs remain accessible and publishable. A banner in the
                  editor indicates reduced quality mode. The API returns a 402
                  with an upgrade prompt.
                </td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4 font-medium text-foreground">Repository limit reached</td>
                <td className="py-2">
                  Existing repositories continue to receive webhooks and
                  generate changelogs. New repositories cannot be connected
                  until you upgrade or disconnect an existing one.
                </td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4 font-medium text-foreground">Member limit reached</td>
                <td className="py-2">
                  Existing members retain access. New invitations cannot be sent
                  until you upgrade or remove an existing member.
                </td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4 font-medium text-foreground">Widget limit reached</td>
                <td className="py-2">
                  Existing widgets continue to serve content. New widgets cannot
                  be created until you upgrade or delete an existing one.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </article>
  )
}
