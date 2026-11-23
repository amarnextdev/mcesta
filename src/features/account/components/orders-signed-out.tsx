import Link from "next/link"
import { MailCheckIcon, PackageSearchIcon, RotateCcwIcon, TruckIcon, ZapIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

const perks = [
  { icon: TruckIcon, title: "Live tracking", text: "Every order and shipment in one place." },
  { icon: RotateCcwIcon, title: "Buy it again", text: "Reorder your favourites in one tap." },
  { icon: ZapIcon, title: "Faster checkout", text: "Your address is filled in for you." },
]

/** My orders when logged out (design: OrdersOut). */
export function OrdersSignedOut({ loginAvailable }: { loginAvailable: boolean }) {
  return (
    <div className="mx-auto mt-6 flex max-w-[760px] flex-col items-center gap-6 text-center">
      <span aria-hidden="true" className="grid size-[72px] place-items-center rounded-full bg-teal-soft text-teal">
        <PackageSearchIcon className="size-9" strokeWidth={1.6} />
      </span>
      <div className="flex flex-col items-center gap-2.5">
        <h1 id="orders-h" className="text-[1.625rem] leading-tight md:text-[2.125rem]">
          Log in to see your orders
        </h1>
        <p className="max-w-[540px] text-base leading-relaxed text-slate md:text-[1.0625rem]">
          My orders shows every order you&apos;ve placed with this email, with live tracking and easy damage claims.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-2.5">
        <Button asChild size="lg" className="h-[3.25rem] rounded-xl px-7 text-base">
          <Link href="/account/login" prefetch={false}>
            Log in or create account
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="h-[3.25rem] rounded-xl border-[1.5px] border-ink bg-transparent px-6 text-base">
          <Link href="/">Continue shopping</Link>
        </Button>
      </div>
      <span className="inline-flex items-center gap-2 text-sm text-slate">
        <MailCheckIcon aria-hidden="true" className="size-4" />
        No password needed. We&apos;ll email you a 6-digit code.
      </span>
      {!loginAvailable && (
        <span className="rounded-full bg-terra-soft px-3 py-1 text-xs font-semibold text-terra-text">
          Login switches on once the Shopify store is connected.
        </span>
      )}

      <ul className="grid w-full gap-4 rounded-[18px] border border-line bg-white px-6 py-[22px] text-left sm:grid-cols-3">
        {perks.map(({ icon: Icon, title, text }) => (
          <li key={title} className="flex items-start gap-3">
            <span aria-hidden="true" className="grid size-[38px] flex-none place-items-center rounded-[11px] bg-teal text-cream">
              <Icon className="size-[18px]" />
            </span>
            <span className="flex flex-col gap-0.5 leading-snug">
              <span className="text-[0.9375rem] font-bold">{title}</span>
              <span className="text-[0.8125rem] text-slate">{text}</span>
            </span>
          </li>
        ))}
      </ul>

      <div className="flex w-full flex-col items-start gap-4 rounded-[18px] border border-line bg-white px-5 py-[18px] text-left sm:flex-row sm:items-center">
        <span aria-hidden="true" className="grid size-11 flex-none place-items-center rounded-xl bg-sand text-ink">
          <PackageSearchIcon className="size-5" />
        </span>
        <span className="flex flex-1 flex-col gap-0.5">
          <span className="text-base font-bold">Checked out as a guest?</span>
          <span className="text-sm text-slate">Track any order with your order number and email. No login needed.</span>
        </span>
        <Button asChild variant="outline" className="h-11 border-[1.5px] border-teal bg-white px-[18px] text-teal hover:bg-teal-soft">
          <Link href="/track">Track an order</Link>
        </Button>
      </div>
    </div>
  )
}
