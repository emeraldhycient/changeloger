import type { Metadata } from "next"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Shield } from "lucide-react"

export const metadata: Metadata = {
  title: "Privacy Policy - Changeloger",
  description:
    "Changeloger's privacy policy. Learn how we collect, use, and protect your data.",
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function Section({
  id,
  title,
  children,
}: {
  id: string
  title: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <div className="mt-4 space-y-4 text-muted-foreground leading-relaxed">
        {children}
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function PrivacyPage() {
  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-6 sm:px-8">
        {/* Header */}
        <div className="text-center">
          <Badge variant="outline" className="mb-4">
            <Shield className="mr-1.5 h-3 w-3" />
            Legal
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Privacy Policy
          </h1>
          <p className="mt-4 text-sm text-muted-foreground">
            Effective: March 2026
          </p>
        </div>

        <Separator className="my-12" />

        <div className="space-y-12">
          {/* Intro */}
          <p className="text-muted-foreground leading-relaxed">
            Changeloger (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;)
            operates the changeloger.dev website and the Changeloger platform.
            This Privacy Policy explains how we collect, use, disclose, and
            safeguard your information when you use our service. Please read
            this policy carefully. If you do not agree with the terms of this
            policy, please do not access the service.
          </p>

          <Section id="information-we-collect" title="1. Information We Collect">
            <p>
              We collect information you provide directly to us when you create
              an account, connect a GitHub repository, configure your workspace,
              or contact us for support. This may include your name, email
              address, GitHub username, organisation name, and any other
              information you choose to provide.
            </p>
            <p>
              When you connect your GitHub account, we receive access tokens and
              repository metadata necessary to detect and generate changelogs.
              We do not store your source code. We only process commit messages,
              pull request titles, descriptions, and release tags.
            </p>
            <p>
              We automatically collect certain technical information when you
              visit our website, including your IP address, browser type,
              operating system, referring URLs, and pages viewed. We use cookies
              and similar tracking technologies to collect this information.
            </p>
          </Section>

          <Section id="how-we-use" title="2. How We Use Your Information">
            <p>We use the information we collect to:</p>
            <ul className="list-disc space-y-1 pl-6">
              <li>Provide, maintain, and improve the Changeloger service</li>
              <li>
                Generate changelogs from your repository commit history and pull
                requests
              </li>
              <li>
                Send you technical notices, updates, security alerts, and
                administrative messages
              </li>
              <li>Respond to your support requests and inquiries</li>
              <li>
                Monitor and analyse trends, usage, and activity to improve user
                experience
              </li>
              <li>
                Detect, investigate, and prevent fraudulent transactions and
                other illegal activities
              </li>
            </ul>
          </Section>

          <Section id="data-storage" title="3. Data Storage and Security">
            <p>
              Your data is stored on servers hosted by reputable cloud
              infrastructure providers in the United States. We implement
              industry-standard security measures including encryption in
              transit (TLS 1.3) and at rest (AES-256), regular security audits,
              and strict access controls.
            </p>
            <p>
              While we strive to use commercially acceptable means to protect
              your personal information, no method of transmission over the
              internet or method of electronic storage is 100% secure. We cannot
              guarantee absolute security.
            </p>
          </Section>

          <Section id="third-party" title="4. Third-Party Services">
            <p>
              We use third-party services that may collect information about
              you. These include:
            </p>
            <ul className="list-disc space-y-1 pl-6">
              <li>
                <span className="font-medium text-foreground">GitHub</span> --
                for authentication, repository access, and webhook delivery
              </li>
              <li>
                <span className="font-medium text-foreground">Google</span> --
                for OAuth authentication
              </li>
              <li>
                <span className="font-medium text-foreground">Stripe</span> --
                for payment processing (we do not store your payment card
                details)
              </li>
              <li>
                <span className="font-medium text-foreground">
                  Analytics providers
                </span>{" "}
                -- for website usage analysis
              </li>
            </ul>
            <p>
              Each third-party service has its own privacy policy. We encourage
              you to review their policies to understand how they handle your
              data.
            </p>
          </Section>

          <Section id="your-rights" title="5. Your Rights">
            <p>
              Depending on your location, you may have certain rights regarding
              your personal information, including:
            </p>
            <ul className="list-disc space-y-1 pl-6">
              <li>
                The right to access the personal information we hold about you
              </li>
              <li>
                The right to request correction of inaccurate personal
                information
              </li>
              <li>
                The right to request deletion of your personal information
              </li>
              <li>
                The right to object to or restrict the processing of your
                personal information
              </li>
              <li>The right to data portability</li>
              <li>
                The right to withdraw consent where processing is based on
                consent
              </li>
            </ul>
            <p>
              To exercise any of these rights, please contact us at{" "}
              <a
                href="mailto:privacy@changeloger.dev"
                className="text-violet-400 hover:underline"
              >
                privacy@changeloger.dev
              </a>
              . We will respond to your request within 30 days.
            </p>
          </Section>

          <Section id="contact" title="6. Contact Us">
            <p>
              If you have any questions about this Privacy Policy, please
              contact us at:
            </p>
            <p>
              <a
                href="mailto:privacy@changeloger.dev"
                className="text-violet-400 hover:underline"
              >
                privacy@changeloger.dev
              </a>
            </p>
            <p>
              We may update this Privacy Policy from time to time. We will
              notify you of any changes by posting the new policy on this page
              and updating the &quot;Effective&quot; date at the top. You are
              advised to review this page periodically for any changes.
            </p>
          </Section>
        </div>
      </div>
    </div>
  )
}
