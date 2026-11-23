import Link from "next/link"
import { HeartIcon, LogOutIcon, MapPinIcon, PackageIcon, UserRoundIcon } from "lucide-react"

import { cn } from "@/lib/utils"

import type { Customer } from "../types"

const links = [
  { href: "/account/orders", label: "My orders", icon: PackageIcon },
  { href: "/account/wishlist", label: "Wishlist", icon: HeartIcon },
  { href: "/account/addresses", label: "Addresses", icon: MapPinIcon },
  { href: "/account/details", label: "Account details", icon: UserRoundIcon },
]

/** Left column of the account pages: greeting with order counts, then the account menu. */
export function AccountSidebar({
  customer,
  current,
  stats,
}: {
  customer: Customer
  current: string
  stats: { orders: number; onTheWay: number }
}) {
  return (
    <aside aria-label="Account" className="flex flex-col gap-3.5 lg:sticky lg:top-24">
      <div className="flex items-center gap-3 rounded-[18px] border border-line bg-white p-3.5">
        <span aria-hidden="true" className="grid size-[46px] flex-none place-items-center rounded-full bg-teal font-heading text-xl text-cream">
          {customer.firstName[0] ?? "?"}
        </span>
        <span className="flex min-w-0 flex-col leading-snug">
          <span className="truncate text-base font-bold">Hi, {customer.firstName}</span>
          <span className="text-[0.8125rem] text-slate">
            {stats.orders} {stats.orders === 1 ? "order" : "orders"}
            {stats.onTheWay > 0 ? ` · ${stats.onTheWay} on the way` : ""}
          </span>
        </span>
      </div>

      <nav aria-label="Account menu" className="flex flex-col gap-0.5 rounded-[18px] border border-line bg-white p-1.5">
        {links.map(({ href, label, icon: Icon }) => {
          const on = href === current
          return (
            <Link
              key={href}
              href={href}
              aria-current={on ? "page" : undefined}
              className={cn(
                "flex h-[2.875rem] items-center gap-3 rounded-xl px-3.5 text-[0.9375rem] transition-colors",
                on ? "bg-teal-soft font-bold text-teal" : "text-ink hover:bg-sand"
              )}
            >
              <Icon aria-hidden="true" className="size-[18px]" />
              {label}
            </Link>
          )
        })}
        <Link href="/account/logout" prefetch={false} className="flex h-[2.875rem] items-center gap-3 rounded-xl px-3.5 text-[0.9375rem] text-slate hover:bg-sand hover:text-ink">
          <LogOutIcon aria-hidden="true" className="size-[18px]" />
          Sign out
        </Link>
      </nav>
    </aside>
  )
}
