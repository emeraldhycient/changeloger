"use client"

import { useState, type FormEvent } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Mail, Clock, CalendarDays, Send } from "lucide-react"

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    // placeholder -- would POST to an API route
    setSubmitted(true)
  }

  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="outline" className="mb-4">
            Contact
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Get in touch
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Have a question, need help, or want to learn how Changeloger can
            work for your team? We&apos;d love to hear from you.
          </p>
        </div>

        {/* Two columns */}
        <div className="mt-16 grid gap-12 lg:grid-cols-2">
          {/* Left -- Form */}
          <Card>
            <CardHeader>
              <CardTitle>Send us a message</CardTitle>
              <CardDescription>
                Fill out the form below and we&apos;ll get back to you within
                one business day.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {submitted ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 mb-4">
                    <Send className="h-5 w-5 text-emerald-400" />
                  </div>
                  <p className="text-lg font-semibold">Message sent!</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    We&apos;ll be in touch shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="name"
                        className="mb-1.5 block text-sm font-medium"
                      >
                        Name
                      </label>
                      <Input
                        id="name"
                        name="name"
                        required
                        placeholder="Jane Smith"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="email"
                        className="mb-1.5 block text-sm font-medium"
                      >
                        Email
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        placeholder="jane@company.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="company"
                      className="mb-1.5 block text-sm font-medium"
                    >
                      Company{" "}
                      <span className="text-muted-foreground">(optional)</span>
                    </label>
                    <Input
                      id="company"
                      name="company"
                      placeholder="Acme Inc."
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="mb-1.5 block text-sm font-medium"
                    >
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={5}
                      placeholder="Tell us how we can help..."
                      className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>

                  <Button type="submit" className="w-full sm:w-auto">
                    Send message
                    <Send className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Right -- Info */}
          <div className="space-y-8 lg:pl-8">
            {/* Email */}
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-500/10">
                <Mail className="h-5 w-5 text-violet-400" />
              </div>
              <div>
                <h3 className="font-semibold">Email us</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  For general inquiries and support, reach us at{" "}
                  <a
                    href="mailto:hello@changeloger.dev"
                    className="text-violet-400 hover:underline"
                  >
                    hello@changeloger.dev
                  </a>
                </p>
              </div>
            </div>

            {/* Response time */}
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-500/10">
                <Clock className="h-5 w-5 text-violet-400" />
              </div>
              <div>
                <h3 className="font-semibold">Response time</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  We respond to every message within one business day. Most
                  inquiries are answered within a few hours during US business
                  hours.
                </p>
              </div>
            </div>

            <Separator />

            {/* Book a demo */}
            <Card className="border-violet-500/30">
              <CardHeader>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10 mb-2">
                  <CalendarDays className="h-5 w-5 text-violet-400" />
                </div>
                <CardTitle>Book a demo</CardTitle>
                <CardDescription>
                  Want a walkthrough of Changeloger for your team? Schedule a
                  30-minute call with us and we&apos;ll show you how it works
                  with your repos.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full">
                  <Link href="#">
                    Schedule a call
                    <CalendarDays className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
