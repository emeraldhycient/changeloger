import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export const metadata = {
  title: "Getting Started - Changeloger Docs",
}

export default function GettingStartedPage() {
  return (
    <article className="space-y-10">
      <header>
        <Badge variant="outline" className="mb-4">
          Getting Started
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Quick Start Guide
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Go from zero to a published changelog in under five minutes. Follow
          these six steps to connect your GitHub repositories, generate
          AI-powered changelogs, and embed them anywhere.
        </p>
      </header>

      <Separator />

      {/* Step 1 */}
      <section id="quick-start-guide">
        <h2 className="text-2xl font-bold">Step-by-Step Setup</h2>
        <div className="mt-6 space-y-8">
          <div className="flex gap-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center bg-violet-500/10 text-sm font-bold text-violet-400">
              1
            </div>
            <div>
              <h3 className="text-lg font-semibold">Sign Up</h3>
              <p className="mt-1 text-muted-foreground">
                Create your Changeloger account using Google or GitHub OAuth.
                Navigate to the sign-in page and click either provider button.
                Your account is created automatically on first login -- no
                separate registration form required.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center bg-violet-500/10 text-sm font-bold text-violet-400">
              2
            </div>
            <div>
              <h3 className="text-lg font-semibold">
                Install the GitHub App
              </h3>
              <p className="mt-1 text-muted-foreground">
                From the dashboard, click &quot;Connect Repository&quot; to
                install the Changeloger GitHub App on your personal account or
                organization. The app requests read-only access to repository
                contents and metadata, plus webhook read/write permissions to
                receive push, tag, and release events.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center bg-violet-500/10 text-sm font-bold text-violet-400">
              3
            </div>
            <div>
              <h3 className="text-lg font-semibold">
                Configure Repositories
              </h3>
              <p className="mt-1 text-muted-foreground">
                After installation, select which repositories to monitor. You
                can enable or disable individual repos, set branch filters
                (e.g., only monitor <code className="bg-muted px-1.5 py-0.5 font-mono text-sm">main</code> and{" "}
                <code className="bg-muted px-1.5 py-0.5 font-mono text-sm">release/*</code>), configure
                ignore patterns for lock files and build output, and toggle AI
                summarization on or off per repository.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center bg-violet-500/10 text-sm font-bold text-violet-400">
              4
            </div>
            <div>
              <h3 className="text-lg font-semibold">
                Wait for Changes (or Trigger Manually)
              </h3>
              <p className="mt-1 text-muted-foreground">
                Push a commit, create a tag, or publish a GitHub release.
                Changeloger receives the webhook event, runs its three detection
                engines (commit analysis, diff detection, and version watching),
                and generates draft changelog entries. You can also manually
                trigger analysis from the dashboard by clicking &quot;Analyze
                Now&quot; on any repository.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center bg-violet-500/10 text-sm font-bold text-violet-400">
              5
            </div>
            <div>
              <h3 className="text-lg font-semibold">
                Review in the Editor
              </h3>
              <p className="mt-1 text-muted-foreground">
                Open the changelog editor to review AI-generated entries. Each
                entry card shows its category, title, description, impact level,
                and confidence score. You can edit text inline, drag and drop to
                reorder, change categories, and mark entries as reviewed. The
                editor auto-saves revisions so you never lose work.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center bg-violet-500/10 text-sm font-bold text-violet-400">
              6
            </div>
            <div>
              <h3 className="text-lg font-semibold">Publish and Embed</h3>
              <p className="mt-1 text-muted-foreground">
                When you are satisfied with the entries, hit Publish. The system
                validates all entries have titles, renders the changelog to
                Markdown, HTML, and JSON formats, and updates the widget cache.
                Embed the changelog on your site using the widget script tag.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Separator />

      {/* Core Concepts */}
      <section id="core-concepts">
        <h2 className="text-2xl font-bold">Core Concepts</h2>
        <p className="mt-3 text-muted-foreground">
          Understanding these key concepts will help you get the most out of
          Changeloger.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Card className="rounded-none">
            <CardContent className="pt-6">
              <h3 className="font-semibold">Workspaces</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Top-level organizational unit. All repositories, team members,
                and billing are scoped to a workspace. You can create multiple
                workspaces for different teams or projects.
              </p>
            </CardContent>
          </Card>
          <Card className="rounded-none">
            <CardContent className="pt-6">
              <h3 className="font-semibold">Detection Engines</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Three complementary engines -- commit analyzer, diff detector,
                and version watcher -- run in sequence to maximize coverage
                across teams with varying commit discipline.
              </p>
            </CardContent>
          </Card>
          <Card className="rounded-none">
            <CardContent className="pt-6">
              <h3 className="font-semibold">Releases</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Versioned collections of changelog entries. Releases progress
                through draft, published, and archived states. Each release is
                tied to a semantic version and optionally a Git tag.
              </p>
            </CardContent>
          </Card>
          <Card className="rounded-none">
            <CardContent className="pt-6">
              <h3 className="font-semibold">Widgets</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Embeddable components that surface your changelog inside your
                product, docs site, or any web page. Available as a full page,
                modal overlay, or notification badge.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <Separator />

      {/* Embed Widget */}
      <section id="your-first-changelog">
        <h2 className="text-2xl font-bold">Embedding Your Changelog</h2>
        <p className="mt-3 text-muted-foreground">
          Once you have published a release, embed the changelog on your site
          with a single script tag. Choose the widget type that fits your use
          case.
        </p>

        <div className="mt-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold">Page Widget</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Renders a full changelog into a target container element. Best for
              dedicated changelog pages.
            </p>
            <pre className="mt-3 overflow-x-auto bg-muted p-4 font-mono text-sm">
{`<div id="changeloger"></div>
<script
  async
  src="https://cdn.changeloger.com/widget.js"
  data-token="YOUR_EMBED_TOKEN"
  data-type="page"
  data-target="#changeloger"
></script>`}
            </pre>
          </div>

          <div>
            <h3 className="text-lg font-semibold">Modal Widget</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              A floating button that opens a modal overlay. Best for in-app
              &quot;What&apos;s New&quot; experiences.
            </p>
            <pre className="mt-3 overflow-x-auto bg-muted p-4 font-mono text-sm">
{`<script
  async
  src="https://cdn.changeloger.com/widget.js"
  data-token="YOUR_EMBED_TOKEN"
  data-type="modal"
  data-trigger-text="What's New"
  data-position="bottom-right"
></script>`}
            </pre>
          </div>

          <div>
            <h3 className="text-lg font-semibold">Badge Widget</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              A minimal notification indicator that attaches to any element.
              Shows when new changes are available.
            </p>
            <pre className="mt-3 overflow-x-auto bg-muted p-4 font-mono text-sm">
{`<button id="changelog-trigger">Updates</button>
<script
  async
  src="https://cdn.changeloger.com/widget.js"
  data-token="YOUR_EMBED_TOKEN"
  data-type="badge"
  data-target="#changelog-trigger"
  data-style="dot"
></script>`}
            </pre>
          </div>
        </div>
      </section>
    </article>
  )
}
