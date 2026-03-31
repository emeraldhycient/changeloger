import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export const metadata = {
  title: "Detection Engines - Changeloger Docs",
}

export default function DetectionEnginesPage() {
  return (
    <article className="space-y-10">
      <header>
        <Badge variant="outline" className="mb-4">
          Detection Engines
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Three-Engine Architecture
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Changeloger uses three complementary detection engines that run in
          sequence against incoming GitHub events. Each engine specializes in a
          different signal source, and their results are merged, deduplicated,
          and optionally polished by an AI provider before landing as draft
          changelog entries.
        </p>
      </header>

      <Separator />

      {/* Overview */}
      <section id="conventional-commits">
        <h2 className="text-2xl font-bold">
          Engine 1: Git Commit Analysis
        </h2>
        <p className="mt-3 text-muted-foreground">
          The commit analyzer parses commit messages following the Conventional
          Commits v1.0.0 specification. Well-formatted conventional commits
          receive a high confidence score of 0.95, while non-conventional
          commits are still processed with a lower confidence of 0.6.
        </p>

        <h3 className="mt-6 text-lg font-semibold">
          Conventional Commit Format
        </h3>
        <pre className="mt-3 overflow-x-auto bg-muted p-4 font-mono text-sm">
{`<type>[optional scope][optional !]: <subject>

[optional body]

[optional footer(s)]`}
        </pre>
        <p className="mt-3 text-sm text-muted-foreground">
          The parser uses this regular expression for the first line:
        </p>
        <pre className="mt-2 overflow-x-auto bg-muted p-4 font-mono text-sm">
{`/^(?<type>[a-z]+)(?:\\((?<scope>[^)]+)\\))?(?<breaking>!)?:\\s*(?<subject>.+)$/`}
        </pre>

        <h3 className="mt-8 text-lg font-semibold">
          Recognized Commit Types
        </h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="pb-3 pr-4 font-semibold">Type</th>
                <th className="pb-3 pr-4 font-semibold">Category</th>
                <th className="pb-3 pr-4 font-semibold">Semver Impact</th>
                <th className="pb-3 font-semibold">Description</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              <tr className="border-b">
                <td className="py-2 pr-4 font-mono">feat</td>
                <td className="py-2 pr-4">added</td>
                <td className="py-2 pr-4">minor</td>
                <td className="py-2">A new feature</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4 font-mono">fix</td>
                <td className="py-2 pr-4">fixed</td>
                <td className="py-2 pr-4">patch</td>
                <td className="py-2">A bug fix</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4 font-mono">perf</td>
                <td className="py-2 pr-4">performance</td>
                <td className="py-2 pr-4">patch</td>
                <td className="py-2">A performance improvement</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4 font-mono">refactor</td>
                <td className="py-2 pr-4">changed</td>
                <td className="py-2 pr-4">none</td>
                <td className="py-2">Code restructuring without behavior change</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4 font-mono">docs</td>
                <td className="py-2 pr-4">documentation</td>
                <td className="py-2 pr-4">none</td>
                <td className="py-2">Documentation changes</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4 font-mono">chore</td>
                <td className="py-2 pr-4">maintenance</td>
                <td className="py-2 pr-4">none</td>
                <td className="py-2">Routine tasks and maintenance</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4 font-mono">build</td>
                <td className="py-2 pr-4">maintenance</td>
                <td className="py-2 pr-4">none</td>
                <td className="py-2">Build system or dependency changes</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4 font-mono">ci</td>
                <td className="py-2 pr-4">maintenance</td>
                <td className="py-2 pr-4">none</td>
                <td className="py-2">CI/CD configuration changes</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4 font-mono">style</td>
                <td className="py-2 pr-4">maintenance</td>
                <td className="py-2 pr-4">none</td>
                <td className="py-2">Code formatting (no logic changes)</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4 font-mono">test</td>
                <td className="py-2 pr-4">maintenance</td>
                <td className="py-2 pr-4">none</td>
                <td className="py-2">Adding or modifying tests</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4 font-mono">revert</td>
                <td className="py-2 pr-4">changed</td>
                <td className="py-2 pr-4">patch</td>
                <td className="py-2">Reverting a previous commit</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="mt-8 text-lg font-semibold">
          Breaking Change Detection
        </h3>
        <p className="mt-2 text-muted-foreground">
          A commit is marked as a breaking change if any of these conditions
          hold:
        </p>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          <li className="flex gap-2">
            <span className="text-foreground">--</span>
            The <code className="bg-muted px-1.5 py-0.5 font-mono text-sm">!</code> character appears
            immediately before the colon (e.g.,{" "}
            <code className="bg-muted px-1.5 py-0.5 font-mono text-sm">feat(api)!: remove legacy endpoints</code>
            ).
          </li>
          <li className="flex gap-2">
            <span className="text-foreground">--</span>A{" "}
            <code className="bg-muted px-1.5 py-0.5 font-mono text-sm">BREAKING CHANGE</code> footer is
            present in the commit body.
          </li>
          <li className="flex gap-2">
            <span className="text-foreground">--</span>A{" "}
            <code className="bg-muted px-1.5 py-0.5 font-mono text-sm">BREAKING-CHANGE</code> footer
            (hyphenated variant) is present in the commit body.
          </li>
        </ul>

        <h3 className="mt-8 text-lg font-semibold">
          Co-authored-by Parsing
        </h3>
        <p className="mt-2 text-muted-foreground">
          <code className="bg-muted px-1.5 py-0.5 font-mono text-sm">Co-authored-by: Name &lt;email&gt;</code>{" "}
          trailers anywhere in the commit message are parsed using a
          case-insensitive regex. Each co-author is added to the entry&apos;s
          author list alongside the primary author, and authors are deduplicated
          by email across grouped commits.
        </p>

        <h3 className="mt-8 text-lg font-semibold">Commit Grouping</h3>
        <p className="mt-2 text-muted-foreground">
          After individual commits are parsed, related commits are clustered
          into groups through three sequential passes:
        </p>
        <div className="mt-4 space-y-3">
          <Card className="rounded-none">
            <CardContent className="pt-4">
              <p className="text-sm">
                <strong>Pass 1 -- Scope-based grouping:</strong>{" "}
                <span className="text-muted-foreground">
                  Commits sharing the same non-null scope are collected. If a
                  scope has two or more commits, they form a single group.
                </span>
              </p>
            </CardContent>
          </Card>
          <Card className="rounded-none">
            <CardContent className="pt-4">
              <p className="text-sm">
                <strong>Pass 2 -- File overlap grouping:</strong>{" "}
                <span className="text-muted-foreground">
                  Among ungrouped commits, if two commits modified at least one
                  common file path, they are placed in the same group.
                </span>
              </p>
            </CardContent>
          </Card>
          <Card className="rounded-none">
            <CardContent className="pt-4">
              <p className="text-sm">
                <strong>Pass 3 -- Singleton grouping:</strong>{" "}
                <span className="text-muted-foreground">
                  Any remaining commits become singleton groups (one commit per
                  group).
                </span>
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <Separator />

      {/* Engine 2 */}
      <section id="ai-classification">
        <h2 className="text-2xl font-bold">
          Engine 2: Diff-Based Detection
        </h2>
        <p className="mt-3 text-muted-foreground">
          The diff detector analyzes file-level diffs from the GitHub Compare
          API to identify structural code changes that may not be described in
          commit messages. This engine is especially valuable for teams that do
          not follow conventional commit conventions.
        </p>

        <h3 className="mt-6 text-lg font-semibold">
          Structural Change Detection
        </h3>
        <p className="mt-2 text-muted-foreground">
          The engine identifies changes at seven entity levels:
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="pb-3 pr-4 font-semibold">Entity Type</th>
                <th className="pb-3 pr-4 font-semibold">Detection Method</th>
                <th className="pb-3 font-semibold">Examples</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              <tr className="border-b">
                <td className="py-2 pr-4 font-mono">file</td>
                <td className="py-2 pr-4">File status in GitHub diff</td>
                <td className="py-2">New module file, deleted legacy code</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4 font-mono">function</td>
                <td className="py-2 pr-4">AST parsing of function declarations</td>
                <td className="py-2">New exported function, removed handler</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4 font-mono">class</td>
                <td className="py-2 pr-4">AST parsing of class declarations</td>
                <td className="py-2">New service class, removed data model</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4 font-mono">endpoint</td>
                <td className="py-2 pr-4">Route file pattern matching</td>
                <td className="py-2">New POST handler, new Flask route</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4 font-mono">migration</td>
                <td className="py-2 pr-4">File path pattern matching</td>
                <td className="py-2">New Prisma migration, new SQL file</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4 font-mono">config</td>
                <td className="py-2 pr-4">Known config file detection</td>
                <td className="py-2">Modified tsconfig.json, updated next.config</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4 font-mono">dependency</td>
                <td className="py-2 pr-4">Manifest file diff parsing</td>
                <td className="py-2">New package, bumped version</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="mt-8 text-lg font-semibold">
          Supported Languages for AST Parsing
        </h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="pb-3 pr-4 font-semibold">Language</th>
                <th className="pb-3 pr-4 font-semibold">Extensions</th>
                <th className="pb-3 font-semibold">Detected Entities</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              <tr className="border-b">
                <td className="py-2 pr-4">JavaScript / TypeScript</td>
                <td className="py-2 pr-4 font-mono">.js, .jsx, .ts, .tsx</td>
                <td className="py-2">
                  Functions, arrow functions, classes, interfaces, React
                  components, API route handlers, named exports
                </td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4">Python</td>
                <td className="py-2 pr-4 font-mono">.py</td>
                <td className="py-2">
                  Functions (def), classes, FastAPI/Flask route decorators
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          Additional languages (Go, Rust, Java, Ruby) receive file-level
          detection only. New language parsers can be added by implementing a
          parser module in{" "}
          <code className="bg-muted px-1.5 py-0.5 font-mono text-sm">src/lib/engines/parsers/</code>.
        </p>

        <h3 className="mt-8 text-lg font-semibold">Noise Filtering</h3>
        <p className="mt-2 text-muted-foreground">
          The diff detector excludes non-meaningful changes from the output:
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="pb-3 pr-4 font-semibold">Filter</th>
                <th className="pb-3 pr-4 font-semibold">Excluded Patterns</th>
                <th className="pb-3 font-semibold">Rationale</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              <tr className="border-b">
                <td className="py-2 pr-4">Lock files</td>
                <td className="py-2 pr-4 font-mono text-xs">*.lock, package-lock.json, yarn.lock</td>
                <td className="py-2">Auto-generated, not user-authored</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4">Build output</td>
                <td className="py-2 pr-4 font-mono text-xs">dist/**, build/**, .next/**</td>
                <td className="py-2">Generated build artifacts</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4">Formatting-only</td>
                <td className="py-2 pr-4">Whitespace-only diffs</td>
                <td className="py-2">No functional impact</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4">Auto-generated</td>
                <td className="py-2 pr-4 font-mono text-xs">.generated.*, *.gen.*</td>
                <td className="py-2">Machine-generated code</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4">Vendored code</td>
                <td className="py-2 pr-4 font-mono text-xs">vendor/**, third_party/**</td>
                <td className="py-2">External dependencies</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4">OS files</td>
                <td className="py-2 pr-4 font-mono text-xs">.DS_Store, Thumbs.db</td>
                <td className="py-2">Operating system metadata</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="mt-8 text-lg font-semibold">
          Impact Classification Matrix
        </h3>
        <p className="mt-2 text-muted-foreground">
          Each structural change is assigned an impact level based on the entity
          type and change type. Deletions are rated higher because removing a
          public API endpoint or migration is more likely to be breaking.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="pb-3 pr-4 font-semibold">Entity</th>
                <th className="pb-3 pr-4 font-semibold">Added</th>
                <th className="pb-3 pr-4 font-semibold">Modified</th>
                <th className="pb-3 pr-4 font-semibold">Deleted</th>
                <th className="pb-3 font-semibold">Renamed</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              <tr className="border-b">
                <td className="py-2 pr-4 font-mono">endpoint</td>
                <td className="py-2 pr-4">High</td>
                <td className="py-2 pr-4">High</td>
                <td className="py-2 pr-4">Critical</td>
                <td className="py-2">Medium</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4 font-mono">migration</td>
                <td className="py-2 pr-4">High</td>
                <td className="py-2 pr-4">Critical</td>
                <td className="py-2 pr-4">Critical</td>
                <td className="py-2">Low</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4 font-mono">class</td>
                <td className="py-2 pr-4">Medium</td>
                <td className="py-2 pr-4">Medium</td>
                <td className="py-2 pr-4">High</td>
                <td className="py-2">Low</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4 font-mono">function</td>
                <td className="py-2 pr-4">Medium</td>
                <td className="py-2 pr-4">Low</td>
                <td className="py-2 pr-4">Medium</td>
                <td className="py-2">Low</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4 font-mono">config</td>
                <td className="py-2 pr-4">Medium</td>
                <td className="py-2 pr-4">Medium</td>
                <td className="py-2 pr-4">High</td>
                <td className="py-2">Low</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4 font-mono">dependency</td>
                <td className="py-2 pr-4">Medium</td>
                <td className="py-2 pr-4">Low</td>
                <td className="py-2 pr-4">High</td>
                <td className="py-2">Low</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4 font-mono">file</td>
                <td className="py-2 pr-4">Low</td>
                <td className="py-2 pr-4">Low</td>
                <td className="py-2 pr-4">Medium</td>
                <td className="py-2">Negligible</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <Separator />

      {/* Engine 3 */}
      <section id="custom-rules">
        <h2 className="text-2xl font-bold">
          Engine 3: Semantic Versioning
        </h2>
        <p className="mt-3 text-muted-foreground">
          The version watcher monitors manifest files for version bumps and
          correlates them with Git tags to identify release boundaries. It
          ensures that version changes are captured even when the commit message
          does not mention the version.
        </p>

        <h3 className="mt-6 text-lg font-semibold">
          Monitored Manifest Files
        </h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="pb-3 pr-4 font-semibold">File</th>
                <th className="pb-3 pr-4 font-semibold">Ecosystem</th>
                <th className="pb-3 font-semibold">Version Field</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              <tr className="border-b">
                <td className="py-2 pr-4 font-mono">package.json</td>
                <td className="py-2 pr-4">Node.js / npm</td>
                <td className="py-2 font-mono text-xs">&quot;version&quot;: &quot;x.y.z&quot;</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4 font-mono">pyproject.toml</td>
                <td className="py-2 pr-4">Python (PEP 621 / Poetry)</td>
                <td className="py-2 font-mono text-xs">[project].version</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4 font-mono">Cargo.toml</td>
                <td className="py-2 pr-4">Rust</td>
                <td className="py-2 font-mono text-xs">[package].version</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4 font-mono">go.mod</td>
                <td className="py-2 pr-4">Go</td>
                <td className="py-2">Module version via Git tags</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4 font-mono">build.gradle(.kts)</td>
                <td className="py-2 pr-4">Java / Kotlin (Gradle)</td>
                <td className="py-2 font-mono text-xs">version property</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4 font-mono">pom.xml</td>
                <td className="py-2 pr-4">Java (Maven)</td>
                <td className="py-2 font-mono text-xs">&lt;version&gt; element</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4 font-mono">*.gemspec</td>
                <td className="py-2 pr-4">Ruby</td>
                <td className="py-2 font-mono text-xs">spec.version</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4 font-mono">setup.py / setup.cfg</td>
                <td className="py-2 pr-4">Python (legacy)</td>
                <td className="py-2 font-mono text-xs">version parameter</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4 font-mono">*.csproj</td>
                <td className="py-2 pr-4">.NET</td>
                <td className="py-2 font-mono text-xs">&lt;Version&gt; element</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4 font-mono">.version / VERSION</td>
                <td className="py-2 pr-4">Generic</td>
                <td className="py-2">File contents</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="mt-8 text-lg font-semibold">Tag Correlation Patterns</h3>
        <p className="mt-2 text-muted-foreground">
          The engine recognizes these Git tag formats and matches them with
          detected version bumps:
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="pb-3 pr-4 font-semibold">Pattern</th>
                <th className="pb-3 pr-4 font-semibold">Example</th>
                <th className="pb-3 font-semibold">Usage</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              <tr className="border-b">
                <td className="py-2 pr-4 font-mono">v&#123;version&#125;</td>
                <td className="py-2 pr-4 font-mono">v1.3.0</td>
                <td className="py-2">Most common convention</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4 font-mono">&#123;version&#125;</td>
                <td className="py-2 pr-4 font-mono">1.3.0</td>
                <td className="py-2">Bare version number</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4 font-mono">&#123;package&#125;@&#123;version&#125;</td>
                <td className="py-2 pr-4 font-mono">@scope/pkg@1.3.0</td>
                <td className="py-2">npm/pnpm monorepo convention</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4 font-mono">&#123;package&#125;-v&#123;version&#125;</td>
                <td className="py-2 pr-4 font-mono">my-lib-v1.3.0</td>
                <td className="py-2">Alternative monorepo convention</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="mt-8 text-lg font-semibold">
          Semver Validation and Bump Classification
        </h3>
        <p className="mt-2 text-muted-foreground">
          When a push event includes changes to a monitored manifest file, the
          engine fetches the diff, extracts previous and new version strings,
          validates both against the semver specification, and classifies the
          bump as major, minor, or patch. It also cross-checks consistency --
          if a breaking change is detected but only a patch bump was applied,
          the engine emits a warning recommending a major bump.
        </p>
        <p className="mt-3 text-muted-foreground">
          Pre-release versions (e.g., 1.3.0-beta.1) create draft releases but
          are not automatically published. Sequential pre-release bumps
          accumulate changes rather than creating separate releases. Build
          metadata (e.g., 1.2.0+build.42) is recognized but does not affect
          version ordering.
        </p>
      </section>
    </article>
  )
}
