import { Users } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function TeamPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Members</h1>
          <p className="mt-1 text-muted-foreground">
            Manage your workspace team and invitations
          </p>
        </div>
        <Button>
          <Users className="mr-2 h-4 w-4" />
          Invite Member
        </Button>
      </div>

      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Users className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">Just you for now</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Invite team members to collaborate on changelogs together.
        </p>
        <Button variant="outline" className="mt-6">
          Send Invitation
        </Button>
      </div>
    </div>
  )
}
