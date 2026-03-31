"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  Check,
  Minus,
  Zap,
  Shield,
  Users,
  BarChart3,
  Headphones,
  ArrowRight,
  Building2,
  Lock,
  UserCog,
  FileText,
  Globe,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion"

/* -------------------------------------------------------------------------- */
/*  Data                                                                      */
/* -------------------------------------------------------------------------- */

const plans = [
  {
    name: "Free",
    description: "For individuals and side projects getting started.",
    monthlyPrice: 0,
    annualPrice: 0,
    features: [
      "1 repository",
      "1 team member",
      "50 AI generations / mo",
      "Last 5 versions retained",
      "Page widget only",
      "Basic analytics",
      "Community support",
    ],
    cta: "Get Started Free",
    ctaVariant: "outline" as const,
    href: "/signup",
    highlighted: false,
  },
  {
    name: "Pro",
    description: "For growing teams that need more power and flexibility.",
    monthlyPrice: 15,
    annualPrice: 12,
    features: [
      "5 repositories",
      "3 team members",
      "500 AI generations / mo",
      "Last 50 versions retained",
      "All widget types",
      "Full analytics dashboard",
      "Email support",
    ],
    cta: "Start Free Trial",
    ctaVariant: "default" as const,
    href: "/signup?plan=pro",
    highlighted: true,
  },
  {
    name: "Team",
    description: "For organizations that need advanced control and scale.",
    monthlyPrice: 40,
    annualPrice: 32,
    features: [
      "Unlimited repositories",
      "Unlimited team members",
      "2,000 AI generations / mo",
      "Unlimited version history",
      "All widgets + custom domain",
      "Full analytics + CSV export",
      "Per-repo access controls",
      "Audit log",
      "Priority support",
    ],
    cta: "Start Free Trial",
    ctaVariant: "outline" as const,
    href: "/signup?plan=team",
    highlighted: false,
  },
]

interface ComparisonCategory {
  category: string
  rows: {
    feature: string
    free: boolean | string
    pro: boolean | string
    team: boolean | string
  }[]
}

const comparisonData: ComparisonCategory[] = [
  {
    category: "Core Features",
    rows: [
      { feature: "Repositories", free: "1", pro: "5", team: "Unlimited" },
      {
        feature: "AI generations / mo",
        free: "50",
        pro: "500",
        team: "2,000",
      },
      {
        feature: "Version history",
        free: "Last 5",
        pro: "Last 50",
        team: "Unlimited",
      },
      { feature: "Git commit analysis", free: true, pro: true, team: true },
      {
        feature: "Diff-based detection",
        free: true,
        pro: true,
        team: true,
      },
      {
        feature: "Semantic versioning",
        free: false,
        pro: true,
        team: true,
      },
      {
        feature: "Changelog editor",
        free: "Basic",
        pro: "Full",
        team: "Full",
      },
    ],
  },
  {
    category: "Collaboration",
    rows: [
      { feature: "Team members", free: "1", pro: "3", team: "Unlimited" },
      { feature: "Role-based access", free: false, pro: false, team: true },
      {
        feature: "Real-time editing",
        free: false,
        pro: true,
        team: true,
      },
      { feature: "Per-repo permissions", free: false, pro: false, team: true },
      { feature: "Audit log", free: false, pro: false, team: true },
    ],
  },
  {
    category: "Analytics",
    rows: [
      { feature: "Basic analytics", free: true, pro: true, team: true },
      {
        feature: "Full analytics dashboard",
        free: false,
        pro: true,
        team: true,
      },
      { feature: "Traffic sources", free: false, pro: true, team: true },
      { feature: "CSV export", free: false, pro: false, team: true },
    ],
  },
  {
    category: "Support",
    rows: [
      { feature: "Community forum", free: true, pro: true, team: true },
      { feature: "Email support", free: false, pro: true, team: true },
      {
        feature: "Priority support",
        free: false,
        pro: false,
        team: true,
      },
      {
        feature: "Dedicated CSM",
        free: false,
        pro: false,
        team: false,
      },
    ],
  },
  {
    category: "Security",
    rows: [
      { feature: "SSL encryption", free: true, pro: true, team: true },
      { feature: "SSO / SAML", free: false, pro: false, team: false },
      {
        feature: "Custom domain",
        free: false,
        pro: false,
        team: true,
      },
      { feature: "SCIM provisioning", free: false, pro: false, team: false },
    ],
  },
]

const enterpriseFeatures = [
  {
    icon: Lock,
    title: "SSO & SAML",
    description: "Single sign-on with your identity provider.",
  },
  {
    icon: UserCog,
    title: "SCIM Provisioning",
    description: "Automated user lifecycle management.",
  },
  {
    icon: FileText,
    title: "Custom Contracts",
    description: "Tailored agreements to meet compliance needs.",
  },
  {
    icon: Shield,
    title: "SLA Guarantee",
    description: "99.99% uptime with contractual SLA.",
  },
  {
    icon: Headphones,
    title: "Dedicated CSM",
    description: "A named success manager for your account.",
  },
  {
    icon: Globe,
    title: "Custom Integrations",
    description: "Bespoke integrations with your toolchain.",
  },
]

const faqs = [
  {
    q: "How does the 14-day free trial work?",
    a: "When you sign up for a Pro or Team plan, you get full access to all features for 14 days. No credit card is required to start. If you choose not to continue, your account will automatically switch to the Free plan.",
  },
  {
    q: "Can I switch between monthly and annual billing?",
    a: "Yes. You can switch from monthly to annual billing at any time and receive the discounted rate immediately. Switching from annual to monthly will take effect at the end of your current billing cycle.",
  },
  {
    q: "What happens if I exceed my AI generation limit?",
    a: "You will receive a notification when you reach 80% of your limit. Once the limit is reached, AI-powered features pause until the next billing cycle. You can upgrade your plan at any time to increase your limit immediately.",
  },
  {
    q: "What is the difference between Pro and Team?",
    a: "Pro is designed for small teams of up to 3 members working across 5 repositories. Team removes all limits and adds enterprise-grade features like per-repo access controls, audit logging, custom domains, and priority support.",
  },
  {
    q: "Can I cancel my subscription at any time?",
    a: "Absolutely. There are no long-term contracts. You can cancel from your account settings and will retain access to paid features until the end of your current billing period. Your data remains accessible on the Free plan.",
  },
  {
    q: "Who owns the generated changelogs?",
    a: "You do. All content generated through Changeloger, including AI summaries, belongs to you. You retain full intellectual property rights over your changelogs and can export them at any time.",
  },
  {
    q: "Is there a discount for open-source projects?",
    a: "Yes. We offer a free Pro plan for qualifying open-source projects. Reach out to our team with a link to your public repository and we will review your application within 48 hours.",
  },
  {
    q: "How do I migrate from another changelog tool?",
    a: "We provide an import tool that supports standard formats including Keep a Changelog and Conventional Changelog. Connect your repository, and Changeloger will automatically detect and import your existing changelog entries.",
  },
]

/* -------------------------------------------------------------------------- */
/*  Helper                                                                    */
/* -------------------------------------------------------------------------- */

function CellValue({ value }: { value: boolean | string }) {
  if (typeof value === "string") {
    return <span className="text-sm text-foreground">{value}</span>
  }
  return value ? (
    <Check className="size-4 text-primary" />
  ) : (
    <Minus className="size-4 text-muted-foreground/40" />
  )
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

export default function PricingPage() {
  const [annual, setAnnual] = useState(false)

  return (
    <div className="relative overflow-hidden">
      {/* ------------------------------------------------------------------ */}
      {/*  Gradient background                                               */}
      {/* ------------------------------------------------------------------ */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute top-0 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />
      </div>

      {/* ------------------------------------------------------------------ */}
      {/*  Hero + Toggle                                                     */}
      {/* ------------------------------------------------------------------ */}
      <section className="mx-auto max-w-7xl px-6 pt-24 pb-12 text-center sm:px-8 sm:pt-32 sm:pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Badge variant="secondary" className="mb-4">
            <Zap className="mr-1 size-3" />
            Simple, transparent pricing
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Plans for every team size
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Start free and scale as you grow. All plans include a 14-day
            free trial with no credit card required.
          </p>
        </motion.div>

        {/* Billing toggle */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mt-10 flex items-center justify-center gap-3"
        >
          <span
            className={`text-sm font-medium ${!annual ? "text-foreground" : "text-muted-foreground"}`}
          >
            Monthly
          </span>
          <Switch checked={annual} onCheckedChange={setAnnual} />
          <span
            className={`text-sm font-medium ${annual ? "text-foreground" : "text-muted-foreground"}`}
          >
            Annual
          </span>
          <AnimatePresence>
            {annual && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <Badge className="bg-emerald-500/10 text-emerald-500">
                  Save 20%
                </Badge>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*  Plan Cards                                                        */}
      {/* ------------------------------------------------------------------ */}
      <section className="mx-auto max-w-7xl px-6 pb-24 sm:px-8 sm:pb-32">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * i }}
              className={
                plan.highlighted
                  ? "relative scale-[1.02] md:scale-105"
                  : ""
              }
            >
              <Card
                className={`relative flex h-full flex-col ${
                  plan.highlighted
                    ? "ring-2 ring-primary shadow-lg shadow-primary/10"
                    : ""
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge>Most Popular</Badge>
                  </div>
                )}

                <CardHeader className="pt-6">
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>

                <CardContent className="flex flex-1 flex-col gap-6">
                  {/* Price */}
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold tracking-tight">
                      ${annual ? plan.annualPrice : plan.monthlyPrice}
                    </span>
                    {plan.monthlyPrice > 0 && (
                      <span className="text-sm text-muted-foreground">
                        / month
                      </span>
                    )}
                  </div>

                  {annual && plan.monthlyPrice > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Billed annually ($
                      {plan.annualPrice * 12}/year)
                    </p>
                  )}

                  {/* Feature list */}
                  <ul className="flex flex-col gap-3">
                    {plan.features.map((feat) => (
                      <li
                        key={feat}
                        className="flex items-start gap-2 text-sm"
                      >
                        <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <div className="mt-auto pt-4">
                    <Button
                      variant={plan.ctaVariant}
                      size="lg"
                      className="w-full"
                      asChild
                    >
                      <Link href={plan.href}>
                        {plan.cta}
                        <ArrowRight className="ml-1 size-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*  Enterprise                                                        */}
      {/* ------------------------------------------------------------------ */}
      <section className="mx-auto max-w-7xl px-6 pb-24 sm:px-8 sm:pb-32">
        <Card className="bg-muted/30">
          <CardContent className="py-10">
            <div className="flex flex-col items-center gap-8 lg:flex-row lg:gap-16">
              <div className="flex-1 text-center lg:text-left">
                <div className="mb-4 inline-flex items-center gap-2">
                  <Building2 className="size-5 text-primary" />
                  <span className="text-sm font-semibold uppercase tracking-wider text-primary">
                    Enterprise
                  </span>
                </div>
                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  Built for enterprise scale
                </h2>
                <p className="mt-3 max-w-xl text-muted-foreground">
                  Everything in Team, plus enterprise-grade security,
                  compliance, and dedicated support tailored to your
                  organization.
                </p>
                <div className="mt-6">
                  <Button size="lg" asChild>
                    <Link href="/contact-sales">
                      Contact Sales
                      <ArrowRight className="ml-1 size-4" />
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="grid w-full max-w-lg grid-cols-1 gap-4 sm:grid-cols-2">
                {enterpriseFeatures.map((ef) => (
                  <div key={ef.title} className="flex gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <ef.icon className="size-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{ef.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {ef.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*  Feature Comparison Matrix                                         */}
      {/* ------------------------------------------------------------------ */}
      <section className="mx-auto max-w-7xl px-6 py-24 sm:px-8 sm:py-32">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Compare plans in detail
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Every feature across every plan, so you can choose with
            confidence.
          </p>
        </div>

        {/* Desktop table */}
        <div className="mt-12 hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[280px] text-sm">Feature</TableHead>
                <TableHead className="text-center text-sm">Free</TableHead>
                <TableHead className="text-center text-sm font-semibold text-primary">
                  Pro
                </TableHead>
                <TableHead className="text-center text-sm">Team</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {comparisonData.map((cat) => (
                <>
                  <TableRow key={cat.category}>
                    <TableCell
                      colSpan={4}
                      className="bg-muted/40 pt-6 pb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                    >
                      {cat.category}
                    </TableCell>
                  </TableRow>
                  {cat.rows.map((row) => (
                    <TableRow key={`${cat.category}-${row.feature}`}>
                      <TableCell className="text-sm">
                        {row.feature}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center">
                          <CellValue value={row.free} />
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center">
                          <CellValue value={row.pro} />
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center">
                          <CellValue value={row.team} />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile tabs */}
        <div className="mt-12 md:hidden">
          <Tabs defaultValue="pro">
            <TabsList className="w-full">
              <TabsTrigger value="free" className="flex-1">
                Free
              </TabsTrigger>
              <TabsTrigger value="pro" className="flex-1">
                Pro
              </TabsTrigger>
              <TabsTrigger value="team" className="flex-1">
                Team
              </TabsTrigger>
            </TabsList>

            {(["free", "pro", "team"] as const).map((planKey) => (
              <TabsContent key={planKey} value={planKey} className="mt-6">
                <div className="flex flex-col gap-6">
                  {comparisonData.map((cat) => (
                    <div key={cat.category}>
                      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {cat.category}
                      </p>
                      <div className="flex flex-col divide-y divide-border">
                        {cat.rows.map((row) => (
                          <div
                            key={row.feature}
                            className="flex items-center justify-between py-3"
                          >
                            <span className="text-sm">{row.feature}</span>
                            <CellValue value={row[planKey]} />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*  FAQ                                                               */}
      {/* ------------------------------------------------------------------ */}
      <section className="mx-auto max-w-7xl px-6 py-24 sm:px-8 sm:py-32">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Frequently asked questions
            </h2>
            <p className="mt-3 text-muted-foreground">
              Everything you need to know about pricing and billing.
            </p>
          </div>

          <Accordion type="single" collapsible className="mt-12">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="text-sm font-medium">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {faq.a}
                  </p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*  Bottom CTA                                                        */}
      {/* ------------------------------------------------------------------ */}
      <section className="mx-auto max-w-7xl px-6 py-24 sm:px-8 sm:py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to automate your changelogs?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Join thousands of teams shipping better release notes with
            Changeloger.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/signup">
                Get Started Free
                <ArrowRight className="ml-1 size-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/contact-sales">Talk to Sales</Link>
            </Button>
          </div>
        </motion.div>
      </section>
    </div>
  )
}
