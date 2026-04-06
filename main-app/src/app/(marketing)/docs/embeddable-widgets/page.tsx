import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export const metadata = {
  title: "Embeddable Widgets - Changeloger Docs",
}

export default function EmbeddableWidgetsPage() {
  return (
    <article className="space-y-10">
      <header>
        <Badge variant="outline" className="mb-4">
          Embeddable Widgets
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Changelog Widgets
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Changeloger provides three types of embeddable widgets that surface
          changelogs directly inside your product, documentation site, or any
          web page. All widgets load asynchronously and are fully themeable.
        </p>
      </header>

      <Separator />

      {/* Page Widget */}
      <section id="quick-embed">
        <h2 className="text-2xl font-bold">Widget Types</h2>

        <div className="mt-6 space-y-8">
          <div>
            <h3 className="text-lg font-semibold">Page Widget</h3>
            <p className="mt-2 text-muted-foreground">
              A full-page changelog rendered into a target container element.
              Ideal for documentation sites, standalone changelog pages, or
              footer links.
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
            <p className="mt-2 text-muted-foreground">
              A floating button that opens a modal overlay with changelog
              content. Ideal for in-app &quot;What&apos;s New&quot; experiences.
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
            <p className="mt-2 text-muted-foreground">
              A minimal notification indicator (dot or count) that attaches to
              any element. Shows when new changes are available.
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

      <Separator />

      {/* Data Attributes */}
      <section id="theming">
        <h2 className="text-2xl font-bold">Configuration</h2>
        <p className="mt-3 text-muted-foreground">
          All widgets are configured via data attributes on the script tag or
          through the dashboard UI under Settings &gt; Widgets.
        </p>

        <h3 className="mt-6 text-lg font-semibold">Data Attributes</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="pb-3 pr-4 font-semibold">Attribute</th>
                <th className="pb-3 pr-4 font-semibold">Values</th>
                <th className="pb-3 font-semibold">Description</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              <tr className="border-b">
                <td className="py-2 pr-4 font-mono text-xs">data-token</td>
                <td className="py-2 pr-4">UUID</td>
                <td className="py-2">Required. Your widget embed token.</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4 font-mono text-xs">data-type</td>
                <td className="py-2 pr-4 font-mono text-xs">page, modal, badge</td>
                <td className="py-2">Widget display type.</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4 font-mono text-xs">data-target</td>
                <td className="py-2 pr-4">CSS selector</td>
                <td className="py-2">Target element (page and badge types).</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4 font-mono text-xs">data-theme</td>
                <td className="py-2 pr-4 font-mono text-xs">light, dark, auto</td>
                <td className="py-2">Color scheme. Default: auto.</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4 font-mono text-xs">data-primary-color</td>
                <td className="py-2 pr-4">Hex color</td>
                <td className="py-2">Primary brand color for the widget.</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4 font-mono text-xs">data-position</td>
                <td className="py-2 pr-4 font-mono text-xs">bottom-right, bottom-left</td>
                <td className="py-2">Modal trigger button position.</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4 font-mono text-xs">data-trigger-text</td>
                <td className="py-2 pr-4">String</td>
                <td className="py-2">Modal button label text.</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4 font-mono text-xs">data-style</td>
                <td className="py-2 pr-4 font-mono text-xs">dot, count</td>
                <td className="py-2">Badge indicator style.</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4 font-mono text-xs">data-analytics</td>
                <td className="py-2 pr-4 font-mono text-xs">true, false</td>
                <td className="py-2">Enable or disable analytics. Default: true.</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4 font-mono text-xs">data-no-analytics</td>
                <td className="py-2 pr-4">(presence)</td>
                <td className="py-2">Opt out of all analytics (GDPR compliance).</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <Separator />

      {/* Performance */}
      <section id="performance">
        <h2 className="text-2xl font-bold">Performance</h2>
        <p className="mt-3 text-muted-foreground">
          The widget is designed to have minimal impact on your page load time
          and runtime performance.
        </p>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="pb-3 pr-4 font-semibold">Metric</th>
                <th className="pb-3 font-semibold">Value</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              <tr className="border-b">
                <td className="py-2 pr-4">Bundle size</td>
                <td className="py-2">Less than 30 KB gzipped</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4">Initial render</td>
                <td className="py-2">Under 200 ms</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4">Loading strategy</td>
                <td className="py-2">Async script (does not block host page)</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4">Data caching</td>
                <td className="py-2">Edge-cached with 60-second TTL</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4">Cache invalidation</td>
                <td className="py-2">Automatic on publish</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <Separator />

      {/* Analytics */}
      <section id="analytics">
        <h2 className="text-2xl font-bold">Analytics Events</h2>
        <p className="mt-3 text-muted-foreground">
          When analytics are enabled, widgets fire events that are batched and
          sent every 5 seconds to minimize network overhead.
        </p>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="pb-3 pr-4 font-semibold">Event</th>
                <th className="pb-3 pr-4 font-semibold">Trigger</th>
                <th className="pb-3 font-semibold">Data</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              <tr className="border-b">
                <td className="py-2 pr-4 font-mono text-xs">page_view</td>
                <td className="py-2 pr-4">Widget loads</td>
                <td className="py-2">Widget type, referrer, visitor hash</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4 font-mono text-xs">entry_click</td>
                <td className="py-2 pr-4">User clicks/expands an entry</td>
                <td className="py-2">Entry ID, version</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4 font-mono text-xs">scroll_depth</td>
                <td className="py-2 pr-4">Scroll milestones (25/50/75/100%)</td>
                <td className="py-2">Depth percentage</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4 font-mono text-xs">session_end</td>
                <td className="py-2 pr-4">Page unload</td>
                <td className="py-2">Session duration</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <Separator />

      {/* GDPR */}
      <section id="gdpr">
        <h2 className="text-2xl font-bold">GDPR Opt-Out</h2>
        <p className="mt-3 text-muted-foreground">
          Add the <code className="bg-muted px-1.5 py-0.5 font-mono text-sm">data-no-analytics</code>{" "}
          attribute to the script tag to disable all analytics collection:
        </p>
        <pre className="mt-3 overflow-x-auto bg-muted p-4 font-mono text-sm">
{`<script
  async
  src="https://cdn.changeloger.com/widget.js"
  data-token="YOUR_TOKEN"
  data-type="page"
  data-no-analytics
></script>`}
        </pre>
        <p className="mt-3 text-sm text-muted-foreground">
          No cookies are used. Visitor identification relies on an anonymized
          hash of user agent, screen resolution, and timezone. No personally
          identifiable information is collected or stored.
        </p>
      </section>

      <Separator />

      {/* Auto-Update */}
      <section id="framework-guides">
        <h2 className="text-2xl font-bold">Auto-Update Behavior</h2>
        <p className="mt-3 text-muted-foreground">
          When a new changelog version is published:
        </p>
        <ul className="mt-4 space-y-2 text-muted-foreground">
          <li className="flex gap-2">
            <span className="text-foreground">--</span>
            Widgets on next page load fetch fresh content automatically.
          </li>
          <li className="flex gap-2">
            <span className="text-foreground">--</span>
            Open modals display a &quot;New version available&quot; notification.
          </li>
          <li className="flex gap-2">
            <span className="text-foreground">--</span>
            No redeployment of the host application is required.
          </li>
        </ul>

        <h3 className="mt-6 text-lg font-semibold">Domain Whitelisting</h3>
        <p className="mt-2 text-muted-foreground">
          For security, restrict which domains can use your embed token.
          Configure this in the dashboard under Widget Settings &gt; Allowed
          Domains. Requests from non-whitelisted domains receive a 403 response.
        </p>
      </section>
    </article>
  )
}
