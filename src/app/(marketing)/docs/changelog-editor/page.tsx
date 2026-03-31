import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export const metadata = {
  title: "Changelog Editor - Changeloger Docs",
}

export default function ChangelogEditorPage() {
  return (
    <article className="space-y-10">
      <header>
        <Badge variant="outline" className="mb-4">
          Changelog Editor
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Visual Changelog Editor
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          The changelog editor lets you curate, rewrite, and organize
          AI-generated entries before publishing. Every change is tracked with
          revision history so you can compare and revert at any time.
        </p>
      </header>

      <Separator />

      {/* Draft Management */}
      <section id="editor-overview">
        <h2 className="text-2xl font-bold">Draft Management</h2>
        <p className="mt-3 text-muted-foreground">
          When the detection engines process incoming changes, they create or
          update a draft release with generated changelog entries. Each
          repository can have multiple draft releases, one per detected version.
          Drafts are accessible from the repository dashboard and remain
          editable until published.
        </p>
        <p className="mt-3 text-muted-foreground">
          You can also create drafts manually by clicking &quot;New Release&quot;
          and specifying a version number. Manual drafts start empty and allow
          you to add entries by hand.
        </p>
      </section>

      <Separator />

      {/* Entry Cards */}
      <section id="entry-cards">
        <h2 className="text-2xl font-bold">Entry Cards</h2>
        <p className="mt-3 text-muted-foreground">
          Each changelog entry is displayed as a card in the editor. Cards show
          all the metadata needed to review and curate the entry at a glance.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Card className="rounded-none">
            <CardContent className="pt-6">
              <h3 className="font-semibold">Category</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                The type of change: added, fixed, changed, removed, deprecated,
                security, performance, documentation, maintenance, or breaking.
                Displayed as a colored badge on each card. Click the badge to
                change the category.
              </p>
            </CardContent>
          </Card>
          <Card className="rounded-none">
            <CardContent className="pt-6">
              <h3 className="font-semibold">Title</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                A one-line summary of the change. AI-generated titles start with
                a past-tense verb (Added, Fixed, Improved, Removed, Updated).
                Click to edit inline.
              </p>
            </CardContent>
          </Card>
          <Card className="rounded-none">
            <CardContent className="pt-6">
              <h3 className="font-semibold">Description</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                An optional extended description supporting Markdown formatting.
                Useful for providing context about why a change was made or how
                it affects users.
              </p>
            </CardContent>
          </Card>
          <Card className="rounded-none">
            <CardContent className="pt-6">
              <h3 className="font-semibold">Impact &amp; Confidence</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Impact level (critical, high, medium, low, negligible) and
                confidence score (0.0 to 1.0) from the detection engine. Entries
                with low confidence are flagged for manual review.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <Separator />

      {/* Inline Editing */}
      <section id="inline-editing">
        <h2 className="text-2xl font-bold">Inline Editing</h2>
        <p className="mt-3 text-muted-foreground">
          All entry fields are editable directly in the card view. Click any
          text field to enter edit mode. Changes are saved automatically as you
          type. The editor supports:
        </p>
        <ul className="mt-4 space-y-2 text-muted-foreground">
          <li className="flex gap-2">
            <span className="text-foreground">--</span>
            Editing titles and descriptions inline with immediate save
          </li>
          <li className="flex gap-2">
            <span className="text-foreground">--</span>
            Changing the category via a dropdown selector on the badge
          </li>
          <li className="flex gap-2">
            <span className="text-foreground">--</span>
            Toggling the breaking change flag
          </li>
          <li className="flex gap-2">
            <span className="text-foreground">--</span>
            Adjusting impact level via a dropdown
          </li>
          <li className="flex gap-2">
            <span className="text-foreground">--</span>
            Marking entries as &quot;reviewed&quot; to track curation progress
          </li>
          <li className="flex gap-2">
            <span className="text-foreground">--</span>
            Deleting entries that are not relevant to the release
          </li>
        </ul>
      </section>

      <Separator />

      {/* Drag and Drop */}
      <section id="drag-and-drop">
        <h2 className="text-2xl font-bold">Drag-and-Drop Reorder</h2>
        <p className="mt-3 text-muted-foreground">
          Entries can be reordered by dragging and dropping cards within the
          editor. The position field on each entry controls the display order in
          the published changelog. When you reorder entries, a bulk reorder API
          call updates all positions in a single transaction.
        </p>
        <p className="mt-3 text-muted-foreground">
          Entries are typically grouped by category (all &quot;Added&quot;
          entries together, all &quot;Fixed&quot; entries together) but you can
          freely rearrange them to tell the best story for your release.
        </p>
      </section>

      <Separator />

      {/* Publish Flow */}
      <section id="publish-flow">
        <h2 className="text-2xl font-bold">Publish Flow</h2>
        <p className="mt-3 text-muted-foreground">
          When you are ready to publish, click the Publish button. The system
          performs these steps:
        </p>

        <ol className="mt-4 space-y-3 text-muted-foreground">
          <li className="flex gap-3">
            <span className="font-bold text-foreground">1.</span>
            <span>
              <strong className="text-foreground">Validation</strong> -- Ensures
              all entries have non-empty titles. If any entry fails validation,
              the publish is blocked and the invalid entries are highlighted.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="font-bold text-foreground">2.</span>
            <span>
              <strong className="text-foreground">Rendering</strong> -- Generates
              the changelog in three output formats: Markdown (for GitHub
              releases and documentation), HTML (for web embedding), and JSON
              (for programmatic consumption).
            </span>
          </li>
          <li className="flex gap-3">
            <span className="font-bold text-foreground">3.</span>
            <span>
              <strong className="text-foreground">Revision snapshot</strong> --
              Creates an immutable revision record containing the complete state
              of all entries at publish time.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="font-bold text-foreground">4.</span>
            <span>
              <strong className="text-foreground">Status update</strong> --
              Transitions the release from &quot;draft&quot; to
              &quot;published&quot; and records the publication timestamp and the
              user who published it.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="font-bold text-foreground">5.</span>
            <span>
              <strong className="text-foreground">Widget cache invalidation</strong>{" "}
              -- Clears the edge-cached widget data so that embedded widgets
              fetch the new release on their next load.
            </span>
          </li>
        </ol>
      </section>

      <Separator />

      {/* Revision History */}
      <section id="markdown-shortcuts">
        <h2 className="text-2xl font-bold">Revision History</h2>
        <p className="mt-3 text-muted-foreground">
          Every time entries are saved in the editor, an immutable revision
          snapshot is created. Revisions store the complete serialized state of
          all entries including their categories, titles, descriptions, impact
          levels, positions, and review status.
        </p>
        <p className="mt-3 text-muted-foreground">
          You can view the revision timeline, compare any two revisions
          side-by-side, and revert to a previous state. Each revision records
          who made the change and when, providing a complete audit trail for
          compliance and accountability.
        </p>
      </section>
    </article>
  )
}
