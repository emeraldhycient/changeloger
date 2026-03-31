import type { Metadata } from "next"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Card,
  CardHeader,
  CardContent,
} from "@/components/ui/card"
import { ArrowRight, Heart } from "lucide-react"

export const metadata: Metadata = {
  title: "About - Changeloger",
  description:
    "Learn about the team behind Changeloger and why we're building the best changelog automation platform.",
}

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

interface TeamMember {
  name: string
  role: string
  initials: string
  color: string
}

const team: TeamMember[] = [
  {
    name: "Sarah Chen",
    role: "Co-founder & CEO",
    initials: "SC",
    color: "bg-violet-500/20 text-violet-400",
  },
  {
    name: "Marcus Oliveira",
    role: "Co-founder & CTO",
    initials: "MO",
    color: "bg-sky-500/20 text-sky-400",
  },
  {
    name: "Priya Patel",
    role: "Lead Engineer",
    initials: "PP",
    color: "bg-emerald-500/20 text-emerald-400",
  },
]

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AboutPage() {
  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        {/* Mission */}
        <div className="mx-auto max-w-3xl text-center">
          <Badge variant="outline" className="mb-4">
            <Heart className="mr-1.5 h-3 w-3" />
            Our Mission
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Making software updates visible to everyone
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            We believe every team shipping software deserves a frictionless way
            to communicate what changed and why. Changeloger exists to close the
            gap between engineering work and user-facing release notes.
          </p>
        </div>

        <Separator className="my-16" />

        {/* Why we built this */}
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-semibold tracking-tight">
            Why we built Changeloger
          </h2>

          <div className="mt-6 space-y-5 text-muted-foreground leading-relaxed">
            <p>
              We spent years working on developer tools and saw the same problem
              everywhere: teams ship dozens of releases a week, but nobody
              outside engineering knows what actually changed. Support agents
              scramble through Slack threads, product managers piece together
              Jira tickets, and customers are left wondering if the bug they
              reported was ever fixed.
            </p>
            <p>
              Existing changelog tools fell into two camps. Some required
              developers to write notes manually for every PR, which meant they
              were always out of date. Others auto-generated walls of commit
              hashes that nobody wanted to read. Neither approach worked for
              teams that care about clear communication.
            </p>
            <p>
              Changeloger takes a different approach. We connect directly to your
              GitHub repos, analyse commits and pull requests with AI, and
              produce concise, well-categorised changelogs that you can review
              and publish in minutes. The result is a living document that keeps
              your whole organisation and your users on the same page.
            </p>
          </div>
        </div>

        <Separator className="my-16" />

        {/* Team */}
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-semibold tracking-tight">
            Meet the team
          </h2>
          <p className="mt-2 text-muted-foreground">
            A small, focused team obsessed with developer experience.
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-3xl gap-6 sm:grid-cols-3">
          {team.map((member) => (
            <Card key={member.name} className="text-center">
              <CardHeader className="items-center pb-2">
                <div
                  className={`flex h-16 w-16 items-center justify-center rounded-full text-lg font-semibold ${member.color}`}
                >
                  {member.initials}
                </div>
              </CardHeader>
              <CardContent>
                <p className="font-semibold">{member.name}</p>
                <p className="text-sm text-muted-foreground">{member.role}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Separator className="my-16" />

        {/* Join us CTA */}
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-2xl font-semibold tracking-tight">
            Join us
          </h2>
          <p className="mt-2 text-muted-foreground">
            We&apos;re always looking for talented people who care about great
            developer tools. If that sounds like you, we&apos;d love to hear
            from you.
          </p>
          <Button asChild className="mt-6">
            <Link href="/contact">
              Get in touch
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
