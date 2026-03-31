import { GitBranch, FileText, Share2, ArrowRight, FolderGit2, ScrollText, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const gettingStartedCards = [
  {
    title: "Connect Repository",
    description: "Install the GitHub App to start tracking your commits and generating changelogs.",
    icon: GitBranch,
    cta: "Connect GitHub",
  },
  {
    title: "Review Changelog",
    description: "AI will analyze your commits and generate your first changelog automatically.",
    icon: FileText,
    cta: "Learn More",
  },
  {
    title: "Share with Your Team",
    description: "Invite team members to collaborate on changelogs and manage releases together.",
    icon: Share2,
    cta: "Invite Team",
  },
]

const stats = [
  { label: "Total Repos", value: "0", icon: FolderGit2 },
  { label: "Draft Changelogs", value: "0", icon: ScrollText },
  { label: "Published Versions", value: "0", icon: FileText },
  { label: "Team Members", value: "1", icon: Users },
]

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome to Changeloger</h1>
        <p className="mt-2 text-muted-foreground">
          Get started by connecting your first repository
        </p>
      </div>

      {/* Getting Started Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {gettingStartedCards.map((card) => (
          <Card key={card.title} className="group relative overflow-hidden">
            <CardHeader>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <card.icon className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-lg">{card.title}</CardTitle>
              <CardDescription>{card.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" size="sm" className="group/btn">
                {card.cta}
                <ArrowRight className="ml-2 h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Stats Row */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">Overview</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <stat.icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
