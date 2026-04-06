import type { Metadata } from "next"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { FileText } from "lucide-react"

export const metadata: Metadata = {
  title: "Terms of Service - Changeloger",
  description:
    "Changeloger's terms of service. Read the agreement that governs your use of our platform.",
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

export default function TermsPage() {
  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-6 sm:px-8">
        {/* Header */}
        <div className="text-center">
          <Badge variant="outline" className="mb-4">
            <FileText className="mr-1.5 h-3 w-3" />
            Legal
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Terms of Service
          </h1>
          <p className="mt-4 text-sm text-muted-foreground">
            Effective: March 2026
          </p>
        </div>

        <Separator className="my-12" />

        <div className="space-y-12">
          {/* Intro */}
          <p className="text-muted-foreground leading-relaxed">
            These Terms of Service (&quot;Terms&quot;) govern your access to and
            use of the Changeloger platform, website, and services
            (collectively, the &quot;Service&quot;) operated by Changeloger
            (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;). By accessing
            or using the Service, you agree to be bound by these Terms. If you
            do not agree to these Terms, you may not use the Service.
          </p>

          <Section id="acceptance" title="1. Acceptance of Terms">
            <p>
              By creating an account or using the Service, you confirm that you
              are at least 18 years old and have the legal authority to enter
              into these Terms. If you are using the Service on behalf of an
              organisation, you represent that you have the authority to bind
              that organisation to these Terms.
            </p>
          </Section>

          <Section id="service-description" title="2. Service Description">
            <p>
              Changeloger is a software-as-a-service platform that connects to
              your GitHub repositories, analyses commit histories and pull
              requests, and generates human-readable changelogs. The Service
              includes a visual editor for curating changelog entries, an
              embeddable widget for publishing changelogs on your website, and a
              REST API for programmatic access.
            </p>
            <p>
              We reserve the right to modify, suspend, or discontinue any part
              of the Service at any time with reasonable notice. We will make
              commercially reasonable efforts to notify you of significant
              changes that affect your use of the Service.
            </p>
          </Section>

          <Section id="user-accounts" title="3. User Accounts">
            <p>
              You are responsible for maintaining the confidentiality of your
              account credentials and for all activities that occur under your
              account. You agree to notify us immediately of any unauthorised
              access to or use of your account.
            </p>
            <p>
              You may not share your account credentials with third parties or
              allow multiple individuals to use a single account unless your
              subscription plan explicitly permits it. We reserve the right to
              suspend or terminate accounts that violate these Terms.
            </p>
          </Section>

          <Section id="acceptable-use" title="4. Acceptable Use">
            <p>You agree not to:</p>
            <ul className="list-disc space-y-1 pl-6">
              <li>
                Use the Service to violate any applicable law, regulation, or
                third-party rights
              </li>
              <li>
                Attempt to gain unauthorised access to any part of the Service
                or its related systems
              </li>
              <li>
                Interfere with or disrupt the integrity or performance of the
                Service
              </li>
              <li>
                Use automated means to scrape, crawl, or extract data from the
                Service beyond what is permitted by the API
              </li>
              <li>
                Resell or redistribute the Service without our prior written
                consent
              </li>
              <li>
                Use the Service to transmit malware, viruses, or other harmful
                code
              </li>
            </ul>
          </Section>

          <Section id="intellectual-property" title="5. Intellectual Property">
            <p>
              The Service, including its original content, features, and
              functionality, is owned by Changeloger and is protected by
              international copyright, trademark, and other intellectual
              property laws.
            </p>
            <p>
              You retain all ownership rights in the content you provide to the
              Service, including your commit messages, pull request
              descriptions, and any text you write in the changelog editor. By
              using the Service, you grant us a limited, non-exclusive licence
              to process this content solely for the purpose of providing and
              improving the Service.
            </p>
          </Section>

          <Section
            id="limitation-of-liability"
            title="6. Limitation of Liability"
          >
            <p>
              To the fullest extent permitted by applicable law, Changeloger
              shall not be liable for any indirect, incidental, special,
              consequential, or punitive damages, or any loss of profits or
              revenues, whether incurred directly or indirectly, or any loss of
              data, use, goodwill, or other intangible losses resulting from
              your access to or use of the Service.
            </p>
            <p>
              Our total aggregate liability arising out of or related to these
              Terms shall not exceed the amount you paid to us in the twelve
              months preceding the event giving rise to the claim.
            </p>
          </Section>

          <Section id="termination" title="7. Termination">
            <p>
              You may terminate your account at any time by contacting us or
              using the account deletion feature in your workspace settings.
              Upon termination, your right to use the Service will immediately
              cease.
            </p>
            <p>
              We may suspend or terminate your access to the Service at any time
              for any reason, including if we reasonably believe you have
              violated these Terms. We will make commercially reasonable efforts
              to notify you before termination unless doing so would compromise
              the security of the Service or violate the law.
            </p>
          </Section>

          <Section id="changes" title="8. Changes to These Terms">
            <p>
              We reserve the right to modify these Terms at any time. If we make
              material changes, we will notify you by email or by posting a
              notice on the Service at least 30 days before the changes take
              effect. Your continued use of the Service after the effective date
              of the revised Terms constitutes your acceptance of the changes.
            </p>
          </Section>

          <Section id="contact" title="9. Contact">
            <p>
              If you have any questions about these Terms, please contact us at:
            </p>
            <p>
              <a
                href="mailto:legal@changeloger.dev"
                className="text-violet-400 hover:underline"
              >
                legal@changeloger.dev
              </a>
            </p>
          </Section>
        </div>
      </div>
    </div>
  )
}
