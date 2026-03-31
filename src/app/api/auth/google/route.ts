import { NextResponse } from "next/server"
import { getGoogleAuthUrl } from "@/lib/auth/oauth"

export async function GET() {
  const url = getGoogleAuthUrl()
  return NextResponse.redirect(url)
}
