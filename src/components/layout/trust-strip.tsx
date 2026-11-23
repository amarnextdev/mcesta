import { GiftIcon, LockIcon, ShieldCheckIcon, TruckIcon } from "lucide-react"

import { trustItems } from "@/lib/config/site"

const icons = { truck: TruckIcon, shield: ShieldCheckIcon, lock: LockIcon, gift: GiftIcon } as const

/** Four store promises shown above the footer on every page. Text lives in siteConfig. */
export function TrustStrip() {
  return (
    <section aria-label="Why shop with Mcesta" className="border-t border-line">
      <ul className="container-shop grid grid-cols-1 gap-x-6 gap-y-5 py-7 sm:grid-cols-2 lg:grid-cols-4">
        {trustItems.map((item) => {
          const Icon = icons[item.icon]
          return (
            <li key={item.title} className="flex min-w-0 items-center gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-teal-soft text-teal">
                <Icon aria-hidden="true" className="size-5" strokeWidth={1.8} />
              </span>
              <span className="flex flex-col leading-tight">
                <span className="text-[0.9375rem] font-semibold">{item.title}</span>
                <span className="text-[0.8125rem] text-slate">{item.text}</span>
              </span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
