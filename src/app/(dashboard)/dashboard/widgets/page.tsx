"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Code, Globe, Bell, Copy } from "lucide-react"

const WIDGET_TYPES = [
  {
    type: "page",
    title: "Changelog Page",
    description: "Full-page changelog rendered into a target div. Perfect for docs sites and standalone changelog pages.",
    icon: Globe,
  },
  {
    type: "modal",
    title: "Changelog Modal",
    description: "Floating button + modal overlay with changelog content. Ideal for in-app \"What's New\" experiences.",
    icon: Code,
  },
  {
    type: "badge",
    title: "Changelog Badge",
    description: "Minimal notification indicator (dot or count) on any element. Shows when new changes are available.",
    icon: Bell,
  },
]

export default function WidgetsPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Embeddable Widgets</h1>
        <p className="mt-1 text-muted-foreground">
          Copy-paste a snippet to embed your changelog anywhere
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {WIDGET_TYPES.map((widget) => (
          <Card key={widget.type}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <widget.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">{widget.title}</CardTitle>
                  <Badge variant="secondary" className="mt-1 text-xs">{widget.type}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-4">{widget.description}</CardDescription>
              <Button variant="outline" size="sm" className="w-full gap-2">
                <Copy className="h-3.5 w-3.5" />
                Create Widget
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Widgets</CardTitle>
          <CardDescription>No widgets created yet. Select a widget type above to get started.</CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}
