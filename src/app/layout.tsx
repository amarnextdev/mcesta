import type { Metadata, Viewport } from "next"
import { Figtree, Young_Serif } from "next/font/google"

import { Toaster } from "@/components/ui/sonner"
import { siteConfig } from "@/lib/config/site"
import { QueryProvider } from "@/providers/query-provider"

import "./globals.css"

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
  display: "swap",
})

const youngSerif = Young_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-young-serif",
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} · ${siteConfig.tagline}`,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
}

export const viewport: Viewport = {
  themeColor: "#1f5c5a",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${figtree.variable} ${youngSerif.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <QueryProvider>{children}</QueryProvider>
        <Toaster position="top-right" theme="light" offset={{ top: 112 }} />
      </body>
    </html>
  )
}
