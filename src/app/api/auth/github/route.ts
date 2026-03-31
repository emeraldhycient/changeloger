import { NextResponse } from "next/server"
import { getGitHubAuthUrl } from "@/lib/auth/oauth"

export async function GET() {
  const url = getGitHubAuthUrl()
  return NextResponse.redirect(url)
}
