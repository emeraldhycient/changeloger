import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export const metadata = {
  title: "GitHub App Setup - Changeloger Docs",
}

export default function GitHubAppPage() {
  return (
    <article className="space-y-10">
      <header>
        <Badge variant="outline" className="mb-4">
          GitHub App Setup
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          GitHub App Installation
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          The Changeloger GitHub App connects your repositories to the platform.
          It listens for webhook events, reads commit and diff data, and
          triggers the changelog generation pipeline.
        </p>
      </header>

      <Separator />

      {/* What is the GitHub App */}
      <section id="installation">
        <h2 className="text-2xl font-bold">What is the GitHub App?</h2>
        <p className="mt-3 text-muted-foreground">
          Changeloger uses a GitHub App (not an OAuth App) for repository
          integration. GitHub Apps provide granular, repository-scoped
          permissions and use installation access tokens that expire after one
          hour. This is more secure than a personal access token because the app
          only requests the minimum permissions it needs, and tokens are
          automatically rotated.
        </p>
        <p className="mt-3 text-muted-foreground">
          Each installation is linked to a Changeloger workspace. A single
          GitHub organization or user account can have the app installed once,
          and that installation can be associated with one workspace.
        </p>
      </section>

      <Separator />

      {/* Permissions */}
      <section id="permissions-explained">
        <h2 className="text-2xl font-bold">Required Permissions</h2>
        <p className="mt-3 text-muted-foreground">
          The GitHub App requests the absolute minimum permissions needed to
          detect changes and receive events. No write access to your code is
          ever requested.
        </p>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="pb-3 pr-4 font-semibold">Permission</th>
                <th className="pb-3 pr-4 font-semibold">Access Level</th>
                <th className="pb-3 font-semibold">Why It Is Needed</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              <tr className="border-b">
                <td className="py-3 pr-4 font-mono text-sm">Contents</td>
                <td className="py-3 pr-4">
                  <Badge variant="secondary" className="rounded-none">Read-only</Badge>
                </td>
                <td className="py-3">
                  Required to fetch file diffs via the GitHub Compare API. The
                  diff detector analyzes code changes to identify structural
                  modifications like new functions, classes, and API endpoints.
                </td>
              </tr>
              <tr className="border-b">
                <td className="py-3 pr-4 font-mono text-sm">Metadata</td>
                <td className="py-3 pr-4">
                  <Badge variant="secondary" className="rounded-none">Read-only</Badge>
                </td>
                <td className="py-3">
                  Required to read repository metadata including the repository
                  name, default branch, primary language, and tag list. This
                  information is used during version detection and repository
                  configuration.
                </td>
              </tr>
              <tr className="border-b">
                <td className="py-3 pr-4 font-mono text-sm">Webhooks</td>
                <td className="py-3 pr-4">
                  <Badge variant="secondary" className="rounded-none">Read &amp; Write</Badge>
                </td>
                <td className="py-3">
                  Required to register and manage webhook subscriptions. The app
                  subscribes to push, create, and release events to trigger
                  changelog generation automatically.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-sm text-muted-foreground">
          No organization permissions or account permissions are required. The
          app never writes to your repository contents, issues, pull requests,
          or any other resource.
        </p>
      </section>

      <Separator />

      {/* Installation Flow */}
      <section id="installation-flow">
        <h2 className="text-2xl font-bold">Installation Flow</h2>
        <p className="mt-3 text-muted-foreground">
          Follow these steps to install the GitHub App and connect your
          repositories to Changeloger.
        </p>

        <ol className="mt-6 space-y-4 text-muted-foreground">
          <li className="flex gap-3">
            <span className="font-bold text-foreground">1.</span>
            <span>
              Navigate to your Changeloger dashboard and click{" "}
              <strong className="text-foreground">Connect Repository</strong>.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="font-bold text-foreground">2.</span>
            <span>
              You will be redirected to GitHub&apos;s App installation page.
              Select the account (personal or organization) where you want to
              install the app.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="font-bold text-foreground">3.</span>
            <span>
              Choose whether to grant access to all repositories or select
              specific ones. You can change this later in GitHub&apos;s settings.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="font-bold text-foreground">4.</span>
            <span>
              Click <strong className="text-foreground">Install</strong>. GitHub
              redirects you back to Changeloger&apos;s installation callback at{" "}
              <code className="bg-muted px-1.5 py-0.5 font-mono text-sm">/api/github/installation</code>.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="font-bold text-foreground">5.</span>
            <span>
              Changeloger stores the installation record, syncs the list of
              accessible repositories, and redirects you to the dashboard with a
              confirmation message.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="font-bold text-foreground">6.</span>
            <span>
              Select which repositories to enable for changelog monitoring.
              Toggle them on in the repository settings page.
            </span>
          </li>
        </ol>
      </section>

      <Separator />

      {/* Webhook Events */}
      <section id="webhook-events">
        <h2 className="text-2xl font-bold">Webhook Events</h2>
        <p className="mt-3 text-muted-foreground">
          The GitHub App subscribes to three webhook events. Each event triggers
          a different part of the changelog generation pipeline.
        </p>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="pb-3 pr-4 font-semibold">Event</th>
                <th className="pb-3 pr-4 font-semibold">Trigger</th>
                <th className="pb-3 font-semibold">Action in Changeloger</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              <tr className="border-b">
                <td className="py-3 pr-4 font-mono text-sm">push</td>
                <td className="py-3 pr-4">
                  Commits pushed to any monitored branch
                </td>
                <td className="py-3">
                  Enqueues an analysis job that runs the commit analyzer and
                  diff detector against the pushed commits. Checks for version
                  bumps in manifest files.
                </td>
              </tr>
              <tr className="border-b">
                <td className="py-3 pr-4 font-mono text-sm">create</td>
                <td className="py-3 pr-4">
                  A new tag or branch is created
                </td>
                <td className="py-3">
                  Triggers the version watcher to correlate the new tag with any
                  detected version bumps. If a matching version is found, the
                  release is updated with the tag reference.
                </td>
              </tr>
              <tr className="border-b">
                <td className="py-3 pr-4 font-mono text-sm">release</td>
                <td className="py-3 pr-4">
                  A release is published on GitHub
                </td>
                <td className="py-3">
                  Correlates with existing draft releases in Changeloger. If a
                  matching draft exists, it may trigger automatic publication
                  depending on repository configuration.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-sm text-muted-foreground">
          All webhook payloads are verified using HMAC-SHA256 signatures with
          the <code className="bg-muted px-1.5 py-0.5 font-mono text-sm">GITHUB_APP_WEBHOOK_SECRET</code>{" "}
          environment variable. Invalid signatures are rejected with a 401
          response.
        </p>
      </section>

      <Separator />

      {/* Troubleshooting */}
      <section id="troubleshooting">
        <h2 className="text-2xl font-bold">Troubleshooting</h2>

        <div className="mt-6 space-y-6">
          <div>
            <h3 className="font-semibold">
              Repositories not appearing after installation
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Ensure the GitHub App has access to the specific repositories you
              want to monitor. Go to GitHub Settings &gt; Applications &gt;
              Changeloger &gt; Configure and verify the repository access list.
              If you selected &quot;Only select repositories,&quot; make sure
              the desired repos are checked.
            </p>
          </div>

          <div>
            <h3 className="font-semibold">
              Webhooks not triggering analysis
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Check that the webhook URL is correctly configured and reachable.
              In your GitHub App settings, verify the webhook URL matches your
              deployed domain:{" "}
              <code className="bg-muted px-1.5 py-0.5 font-mono text-sm">
                https://your-domain.com/api/webhooks/github
              </code>
              . Review the webhook delivery log in GitHub for failed deliveries
              or signature mismatches.
            </p>
          </div>

          <div>
            <h3 className="font-semibold">
              Signature verification failures (401 errors)
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              The <code className="bg-muted px-1.5 py-0.5 font-mono text-sm">GITHUB_APP_WEBHOOK_SECRET</code>{" "}
              environment variable must exactly match the webhook secret
              configured in your GitHub App settings. Regenerate the secret if
              necessary and update both locations.
            </p>
          </div>

          <div>
            <h3 className="font-semibold">
              Installation access token expired
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Installation tokens expire after one hour. Changeloger
              automatically refreshes them before each API call. If you see
              token-related errors, verify that the{" "}
              <code className="bg-muted px-1.5 py-0.5 font-mono text-sm">GITHUB_APP_PRIVATE_KEY</code>{" "}
              environment variable contains the correct PEM-formatted private
              key with newlines properly escaped.
            </p>
          </div>
        </div>
      </section>
    </article>
  )
}
