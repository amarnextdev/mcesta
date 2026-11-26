import Link from "next/link"
import { Suspense } from "react"
import { LogInIcon, UserRoundCheckIcon } from "lucide-react"

import { customerLoginConfigured, hasSession } from "@/features/account/customer-auth.server"
import { cn } from "@/lib/utils"

/** Logged-out shoppers see a clear "Log in" button (icon only on small phones). */
function LoginButton() {
  return (
    // Plain <a>: the login hands over to Shopify's own page, so a full page load is wanted.
    <a
      href={customerLoginConfigured ? "/account/auth/start?returnTo=/account/orders" : "/account/login"}
      aria-label="Log in or sign up"
      className="inline-flex h-10 items-center gap-2 rounded-full border border-line-strong bg-white px-3 text-sm font-semibold text-ink transition-colors hover:border-teal hover:bg-teal-soft hover:text-teal focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none sm:px-4"
    >
      <LogInIcon aria-hidden="true" className="size-[18px]" strokeWidth={2} />
      <span className="hidden sm:inline">Log in</span>
    </a>
  )
}

async function AccountLinkData({ className }: { className: string }) {
  if (!(await hasSession())) return <LoginButton />
  return (
    <Link href="/account/orders" aria-label="My account: orders and wishlist" className={cn(className)}>
      <UserRoundCheckIcon className="size-[22px]" strokeWidth={1.8} />
      <span aria-hidden="true" className="absolute top-2 right-2 size-2 rounded-full bg-success ring-2 ring-white" />
    </Link>
  )
}

/**
 * Header account control: "Log in" button for guests, account icon (green dot) once logged in.
 * Reads only the session cookie, streamed in so the rest of the header stays prerendered.
 */
export function AccountLink({ className }: { className: string }) {
  return (
    <Suspense fallback={<LoginButton />}>
      <AccountLinkData className={className} />
    </Suspense>
  )
}
