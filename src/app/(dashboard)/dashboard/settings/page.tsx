import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-muted-foreground">
          Manage your workspace and account settings
        </p>
      </div>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle>General</CardTitle>
          <CardDescription>
            Basic workspace information and preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Workspace Name</p>
              <p className="text-sm text-muted-foreground">My Workspace</p>
            </div>
            <Button variant="outline" size="sm">
              Edit
            </Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Workspace URL</p>
              <p className="text-sm text-muted-foreground">changeloger.dev/my-workspace</p>
            </div>
            <Button variant="outline" size="sm">
              Edit
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Integrations */}
      <Card>
        <CardHeader>
          <CardTitle>Integrations</CardTitle>
          <CardDescription>
            Manage your connected services and apps
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">GitHub</p>
              <p className="text-sm text-muted-foreground">Not connected</p>
            </div>
            <Button variant="outline" size="sm">
              Connect
            </Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Slack Notifications</p>
              <p className="text-sm text-muted-foreground">Not configured</p>
            </div>
            <Button variant="outline" size="sm">
              Configure
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible actions for your workspace
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Delete Workspace</p>
              <p className="text-sm text-muted-foreground">
                Permanently delete this workspace and all its data
              </p>
            </div>
            <Button variant="destructive" size="sm">
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
