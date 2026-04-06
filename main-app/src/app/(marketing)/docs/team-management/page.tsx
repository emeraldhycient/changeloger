import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export const metadata = {
  title: "Team Management - Changeloger Docs",
}

export default function TeamManagementPage() {
  return (
    <article className="space-y-10">
      <header>
        <Badge variant="outline" className="mb-4">
          Team Management
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Workspace Roles &amp; Permissions
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Changeloger uses a workspace-scoped role-based access control system.
          Invite team members, assign roles, and control who can view, edit,
          and publish changelogs.
        </p>
      </header>

      <Separator />

      {/* Roles */}
      <section id="roles-and-permissions">
        <h2 className="text-2xl font-bold">Workspace Roles</h2>
        <p className="mt-3 text-muted-foreground">
          Each workspace member is assigned one of four roles. Roles are
          hierarchical -- higher roles inherit all permissions of lower roles.
        </p>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="pb-3 pr-4 font-semibold">Permission</th>
                <th className="pb-3 pr-4 text-center font-semibold">Owner</th>
                <th className="pb-3 pr-4 text-center font-semibold">Admin</th>
                <th className="pb-3 pr-4 text-center font-semibold">Editor</th>
                <th className="pb-3 text-center font-semibold">Viewer</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              <tr className="border-b">
                <td className="py-2 pr-4">View changelogs and releases</td>
                <td className="py-2 pr-4 text-center">Yes</td>
                <td className="py-2 pr-4 text-center">Yes</td>
                <td className="py-2 pr-4 text-center">Yes</td>
                <td className="py-2 text-center">Yes</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4">View analytics dashboard</td>
                <td className="py-2 pr-4 text-center">Yes</td>
                <td className="py-2 pr-4 text-center">Yes</td>
                <td className="py-2 pr-4 text-center">Yes</td>
                <td className="py-2 text-center">Yes</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4">Edit changelog entries</td>
                <td className="py-2 pr-4 text-center">Yes</td>
                <td className="py-2 pr-4 text-center">Yes</td>
                <td className="py-2 pr-4 text-center">Yes</td>
                <td className="py-2 text-center">No</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4">Create and delete entries</td>
                <td className="py-2 pr-4 text-center">Yes</td>
                <td className="py-2 pr-4 text-center">Yes</td>
                <td className="py-2 pr-4 text-center">Yes</td>
                <td className="py-2 text-center">No</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4">Publish releases</td>
                <td className="py-2 pr-4 text-center">Yes</td>
                <td className="py-2 pr-4 text-center">Yes</td>
                <td className="py-2 pr-4 text-center">Yes</td>
                <td className="py-2 text-center">No</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4">Invite members</td>
                <td className="py-2 pr-4 text-center">Yes</td>
                <td className="py-2 pr-4 text-center">Yes</td>
                <td className="py-2 pr-4 text-center">No</td>
                <td className="py-2 text-center">No</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4">Manage member roles</td>
                <td className="py-2 pr-4 text-center">Yes</td>
                <td className="py-2 pr-4 text-center">Yes</td>
                <td className="py-2 pr-4 text-center">No</td>
                <td className="py-2 text-center">No</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4">Connect / disconnect repositories</td>
                <td className="py-2 pr-4 text-center">Yes</td>
                <td className="py-2 pr-4 text-center">Yes</td>
                <td className="py-2 pr-4 text-center">No</td>
                <td className="py-2 text-center">No</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4">Manage widget settings</td>
                <td className="py-2 pr-4 text-center">Yes</td>
                <td className="py-2 pr-4 text-center">Yes</td>
                <td className="py-2 pr-4 text-center">No</td>
                <td className="py-2 text-center">No</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4">Manage billing and subscription</td>
                <td className="py-2 pr-4 text-center">Yes</td>
                <td className="py-2 pr-4 text-center">No</td>
                <td className="py-2 pr-4 text-center">No</td>
                <td className="py-2 text-center">No</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4">Delete workspace</td>
                <td className="py-2 pr-4 text-center">Yes</td>
                <td className="py-2 pr-4 text-center">No</td>
                <td className="py-2 pr-4 text-center">No</td>
                <td className="py-2 text-center">No</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4">Transfer ownership</td>
                <td className="py-2 pr-4 text-center">Yes</td>
                <td className="py-2 pr-4 text-center">No</td>
                <td className="py-2 pr-4 text-center">No</td>
                <td className="py-2 text-center">No</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <Separator />

      {/* Invitations */}
      <section id="inviting-members">
        <h2 className="text-2xl font-bold">Email Invitation Flow</h2>
        <p className="mt-3 text-muted-foreground">
          Admins and owners can invite new members to the workspace by email.
          The invitation process works as follows:
        </p>

        <ol className="mt-4 space-y-3 text-muted-foreground">
          <li className="flex gap-3">
            <span className="font-bold text-foreground">1.</span>
            <span>
              Navigate to Workspace Settings &gt; Members and click{" "}
              <strong className="text-foreground">Invite Member</strong>.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="font-bold text-foreground">2.</span>
            <span>
              Enter the invitee&apos;s email address and select the role to
              assign (viewer, editor, or admin). Only owners and admins can send
              invitations.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="font-bold text-foreground">3.</span>
            <span>
              The system generates a unique invitation token and sends an email
              with an acceptance link. Invitations expire after 7 days.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="font-bold text-foreground">4.</span>
            <span>
              When the invitee clicks the link, they are prompted to sign in
              (or sign up) via OAuth. After authentication, the invitation is
              accepted and a workspace membership is created with the assigned
              role.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="font-bold text-foreground">5.</span>
            <span>
              Pending invitations can be revoked by admins from the Members
              page before they are accepted.
            </span>
          </li>
        </ol>
      </section>

      <Separator />

      {/* Role Assignment */}
      <section id="role-assignment">
        <h2 className="text-2xl font-bold">Role Assignment</h2>
        <p className="mt-3 text-muted-foreground">
          Admins and owners can change a member&apos;s role at any time from the
          Members page. Select the member, choose a new role from the dropdown,
          and confirm. Role changes take effect immediately -- the member&apos;s
          next API request will be evaluated against their new permissions.
        </p>
        <p className="mt-3 text-muted-foreground">
          A user cannot be a member of the same workspace twice. This is
          enforced at the database level with a unique constraint on the
          workspace-user combination. Each workspace has exactly one owner, and
          ownership can only be transferred by the current owner.
        </p>
      </section>

      <Separator />

      {/* Per-Repo Access */}
      <section id="per-repo-access">
        <h2 className="text-2xl font-bold">
          Per-Repository Access Restrictions
        </h2>
        <p className="mt-3 text-muted-foreground">
          On the Team and Enterprise plans, workspace admins can restrict which
          repositories each member can access. This is useful for large
          organizations where different teams own different repositories and
          should only see their own changelogs.
        </p>
        <p className="mt-3 text-muted-foreground">
          When per-repo access is configured, members only see the repositories
          assigned to them in the dashboard. They cannot view releases, entries,
          or analytics for repositories outside their scope. Admins and owners
          always have access to all repositories.
        </p>
      </section>

      <Separator />

      {/* Audit Log */}
      <section id="sso-configuration">
        <h2 className="text-2xl font-bold">Audit Log</h2>
        <p className="mt-3 text-muted-foreground">
          All significant actions within a workspace are recorded in the audit
          log. This includes member invitations, role changes, release
          publications, repository connections, and configuration changes. The
          audit log is accessible to admins and owners from Workspace Settings.
        </p>
        <p className="mt-3 text-muted-foreground">
          Each audit entry records the action type, the user who performed the
          action, the timestamp, and any relevant metadata. Audit logs are
          retained for the duration of the workspace&apos;s subscription and
          cannot be modified or deleted.
        </p>
      </section>
    </article>
  )
}
