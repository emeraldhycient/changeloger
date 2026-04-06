"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

const ERROR_MESSAGES: Record<string, string> = {
  missing_code: "Authentication was cancelled or failed. Please try again.",
  invalid_state: "Security validation failed. Please try again.",
  invalid_provider: "Unsupported authentication provider.",
  auth_failed: "Authentication failed. Please try again.",
  google_not_configured: "Google sign-in is not configured yet.",
  github_not_configured: "GitHub sign-in is not configured yet.",
  access_denied: "You denied access. Please try again if this was a mistake.",
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84Z" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53Z" />
    </svg>
  )
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  )
}

function SignInContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")
  const redirect = searchParams.get("redirect")

  // Append redirect param to OAuth URLs so we can redirect back after auth
  const googleUrl = redirect
    ? `/api/auth/google?redirect=${encodeURIComponent(redirect)}`
    : "/api/auth/google"
  const githubUrl = redirect
    ? `/api/auth/github?redirect=${encodeURIComponent(redirect)}`
    : "/api/auth/github"

  return (
    <section className="flex min-h-[calc(100vh-8rem)] items-center justify-center py-16">
      <div className="mx-auto w-full max-w-md px-6 sm:px-8">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome back</CardTitle>
            <CardDescription>
              Sign in to your Changeloger account to continue.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {error && (
              <div className="border border-destructive/50 bg-destructive/10 p-3 text-center text-sm text-destructive">
                {ERROR_MESSAGES[error] || "An error occurred. Please try again."}
              </div>
            )}

            <Button
              variant="outline"
              className="w-full justify-center gap-3"
              asChild
            >
              <a href={googleUrl}>
                <GoogleIcon className="h-5 w-5" />
                Continue with Google
              </a>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-center gap-3"
              asChild
            >
              <a href={githubUrl}>
                <GitHubIcon className="h-5 w-5" />
                Continue with GitHub
              </a>
            </Button>

            <div className="relative py-2">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-muted-foreground">
                or
              </span>
            </div>

            <p className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link
                href="/sign-up"
                className="font-medium text-primary hover:underline"
              >
                Create one
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[calc(100vh-8rem)] items-center justify-center">Loading...</div>}>
      <SignInContent />
    </Suspense>
  )
}
