import { Suspense } from "react"
import { UserRoundIcon } from "lucide-react"

import { hasSession } from "@/features/account/customer-auth.server"
import { getCustomer } from "@/features/account/session.server"

import { AccountMenu } from "./account-menu"

const pill =
  "group inline-flex h-10 items-center gap-2 rounded-full text-sm font-bold transition-all focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"

/** Guests: a clear, filled "Log in" button (a round icon button on small phones). */
function LoginButton() {
  return (
    // Plain <a>: login hands over to Shopify's own page, so a full page load is wanted.
    <a
      href="/account/login?returnTo=/account/orders"
      aria-label="Log in or sign up"
      className={`${pill} w-10 justify-center bg-teal text-cream shadow-[0_6px_14px_-8px_rgba(31,92,90,0.7)] hover:-translate-y-px hover:bg-teal/90 hover:shadow-[0_10px_18px_-10px_rgba(31,92,90,0.8)] sm:w-auto sm:pr-4 sm:pl-1.5`}
    >
      <span aria-hidden="true" className="grid size-7 place-items-center rounded-full bg-cream/15">
        <UserRoundIcon className="size-4" strokeWidth={2.2} />
      </span>
      <span className="hidden sm:inline">Log in</span>
    </a>
  )
}

async function AccountLinkData() {
  if (!(await hasSession())) return <LoginButton />
  const customer = await getCustomer()
  return <AccountMenu firstName={customer?.firstName ?? null} email={customer?.email ?? null} />
}

/**
 * Header account control: "Log in" for guests, an avatar with a menu once logged in.
 * Streamed in so the rest of the header stays prerendered.
 */
export function AccountLink() {
  return (
    <Suspense fallback={<LoginButton />}>
      <AccountLinkData />
    </Suspense>
  )
}
