import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { HeartIcon, MailIcon, PackageSearchIcon, ShieldCheckIcon, TriangleAlertIcon, ZapIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { accessToken, safeReturnTo } from "@/features/account/customer-auth.server"
import { accountLoginAvailable } from "@/features/account/session.server"

export const metadata: Metadata = { title: "Log in", robots: { index: false } }

type Props = PageProps<"/account/login">

const perks = [
  { icon: PackageSearchIcon, text: "Track every order in one place" },
  { icon: HeartIcon, text: "Keep your wishlist on all your devices" },
  { icon: ZapIcon, text: "Faster checkout with your saved address" },
]

/**
 * Log in / sign up. The login itself happens on Shopify's secure page (email + 6-digit code,
 * no password); a new email creates the account automatically.
 */
async function LoginContent({ searchParams }: Pick<Props, "searchParams">) {
  const params = await searchParams
  const failed = params.error !== undefined
  const returnTo = safeReturnTo(typeof params.returnTo === "string" ? params.returnTo : null)
  // Already logged in with a live token: nothing to do here. (An expired one refreshes via the button.)
  if (!failed && (await accessToken())) redirect(returnTo)
  const start = `/account/auth/start?returnTo=${encodeURIComponent(returnTo)}`
  // "Log in" goes straight to Shopify's login page; this card only shows after a failed
  // attempt, or while customer accounts aren't connected yet.
  if (!failed && accountLoginAvailable) redirect(start)

  return (
    <div className="container-shop flex justify-center py-12 md:py-16">
      <div className="flex w-full max-w-[440px] flex-col gap-6 rounded-[20px] border border-line bg-white p-6 shadow-[0_18px_44px_-28px_rgba(31,42,46,0.35)] sm:p-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <span
            aria-hidden="true"
            className={
              failed
                ? "grid size-14 place-items-center rounded-full bg-terra-soft text-terra-text"
                : "grid size-14 place-items-center rounded-full bg-teal-soft text-teal"
            }
          >
            {failed ? <TriangleAlertIcon className="size-7" strokeWidth={1.7} /> : <MailIcon className="size-7" strokeWidth={1.7} />}
          </span>
          <h1 className="text-[1.625rem] leading-tight">{failed ? "We couldn't log you in" : "Log in or sign up"}</h1>
          <p className="text-[0.9375rem] leading-relaxed text-slate">
            {failed
              ? "The code expired or something went wrong on the way back. Please try again."
              : "Enter your email and we'll send you a 6-digit code. No password needed, and a new email creates your account."}
          </p>
        </div>

        {accountLoginAvailable ? (
          <Button asChild size="lg" className="h-[3.25rem] rounded-xl text-base font-bold">
            <a href={start}>
              <MailIcon data-icon="inline-start" className="size-[18px]" />
              {failed ? "Try again" : "Continue with email"}
            </a>
          </Button>
        ) : (
          <p className="rounded-xl bg-terra-soft px-4 py-3 text-center text-sm font-semibold text-terra-text">
            Login switches on once customer accounts are connected.
          </p>
        )}

        <ul className="flex flex-col gap-2.5 border-t border-line-soft pt-5">
          {perks.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-3 text-sm">
              <span aria-hidden="true" className="grid size-8 flex-none place-items-center rounded-full bg-cream text-teal">
                <Icon className="size-4" />
              </span>
              {text}
            </li>
          ))}
        </ul>

        <p className="flex items-center justify-center gap-1.5 text-xs text-slate">
          <ShieldCheckIcon aria-hidden="true" className="size-3.5" />
          Secure login by Shopify ·{" "}
          <Link href="/" className="font-semibold text-ink hover:underline">
            Continue shopping
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage({ searchParams }: Props) {
  return (
    <Suspense fallback={<div className="min-h-[60vh]" />}>
      <LoginContent searchParams={searchParams} />
    </Suspense>
  )
}
