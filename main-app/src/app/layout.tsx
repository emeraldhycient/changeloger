import type { Metadata } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { QueryProvider } from "@/components/providers"
import { cn } from "@/lib/utils"

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  metadataBase: new URL("https://changeloger.dev"),
  title: {
    default: "Changeloger - Automated Changelog Generation",
    template: "%s | Changeloger",
  },
  description:
    "Automatically generate beautiful changelogs from your Git commits. AI-powered, collaborative, and embeddable.",
  keywords: [
    "changelog",
    "automated changelog generator",
    "git changelog",
    "release notes",
    "AI changelog",
  ],
  authors: [{ name: "Changeloger" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Changeloger",
    title: "Changeloger - Automated Changelog Generation",
    description:
      "Automatically generate beautiful changelogs from your Git commits. AI-powered, collaborative, and embeddable.",
    images: ["/screenshots/dashboard.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Changeloger - Automated Changelog Generation",
    description:
      "Automatically generate beautiful changelogs from your Git commits.",
    images: ["/screenshots/dashboard.png"],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontSans.variable, fontMono.variable)}
    >
      <body className="font-sans">
        <ThemeProvider>
          <QueryProvider>{children}</QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
