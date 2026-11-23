import Link from "next/link"
import { ArrowRightIcon, TruckIcon } from "lucide-react"

/** Two promo tiles next to the hero slider. */
export function HeroSideCards() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1 lg:grid-rows-2">
      <Link
        href="/gifts/under-50"
        className="group relative flex min-h-[11.375rem] flex-col justify-between overflow-hidden rounded-[20px] bg-[#e8dccb] p-6 text-ink"
      >
        <span aria-hidden="true" className="absolute -right-10 -bottom-10 size-[150px] rounded-full bg-sand transition-transform duration-500 group-hover:scale-110" />
        <span className="relative flex flex-col gap-1.5">
          <span className="text-xs font-semibold tracking-[0.08em] text-terra-text uppercase">Deals</span>
          <span className="font-heading text-[1.375rem] leading-[1.1]">Gifts under $50</span>
          <span className="text-sm text-slate">Desk, decor and bar finds from $24</span>
        </span>
        <span className="relative inline-flex items-center gap-1.5 text-[0.9375rem] font-semibold text-teal">
          Shop deals
          <ArrowRightIcon aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </Link>
      <Link
        href="/policies/shipping"
        className="group relative flex min-h-[11.375rem] flex-col justify-between overflow-hidden rounded-[20px] bg-teal-soft p-6 text-ink"
      >
        <TruckIcon aria-hidden="true" className="absolute top-5 right-5 size-14 text-teal/15" strokeWidth={1.4} />
        <span className="relative flex flex-col gap-1.5">
          <span className="text-xs font-semibold tracking-[0.08em] text-teal uppercase">Shipping</span>
          <span className="font-heading text-[1.375rem] leading-[1.1]">Free US shipping over $50</span>
          <span className="text-sm text-slate">Delivered in 3–7 days from US warehouses</span>
        </span>
        <span className="relative inline-flex items-center gap-1.5 text-[0.9375rem] font-semibold text-teal">
          How shipping works
          <ArrowRightIcon aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </Link>
    </div>
  )
}
