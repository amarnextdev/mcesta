import type { Metadata } from "next"
import Link from "next/link"
import { MailCheckIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

export const metadata: Metadata = { title: "Log in", robots: { index: false } }

/**
 * Placeholder until Shopify customer accounts are connected. Then this becomes a route that
 * starts Shopify's login (email + 6-digit code) and returns to /account/orders.
 */
export default function LoginPage() {
  return (
    <div className="container-shop flex flex-col items-center gap-4 py-20 text-center">
      <span aria-hidden="true" className="grid size-16 place-items-center rounded-full bg-teal-soft text-teal">
        <MailCheckIcon className="size-8" strokeWidth={1.6} />
      </span>
      <h1 className="text-[1.625rem] leading-tight md:text-[2rem]">Login is almost here</h1>
      <p className="max-w-md text-[0.9375rem] text-slate">
        You&apos;ll log in with your email and a 6-digit code, no password needed. In the meantime you can track any order
        with your order number and email.
      </p>
      <div className="mt-1 flex flex-wrap justify-center gap-2.5">
        <Button asChild size="lg">
          <Link href="/track">Track an order</Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="border-[1.5px] border-ink bg-transparent">
          <Link href="/">Continue shopping</Link>
        </Button>
      </div>
    </div>
  )
}
