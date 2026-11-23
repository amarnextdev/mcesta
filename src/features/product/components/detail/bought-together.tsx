"use client"

import Image from "next/image"
import Link from "next/link"
import { Fragment, useState } from "react"
import { CheckIcon, PlusIcon, TruckIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useAddToCart } from "@/features/cart/hooks"
import { formatMoney } from "@/lib/format"
import type { ProductCard } from "@/lib/shopify/types"
import { cn } from "@/lib/utils"

/** Free US shipping threshold (keep in line with the announcement bar and policies). */
const FREE_SHIPPING = 50

/**
 * "Frequently bought together" (design): this product + up to two add-ons with checkboxes,
 * and a summary card with the total. The first item is always the current product.
 */
export function BoughtTogether({ items }: { items: ProductCard[] }) {
  const [off, setOff] = useState<Set<string>>(new Set())
  const add = useAddToCart()
  const picked = items.filter((p) => !off.has(p.id))
  const currency = items[0]?.price.currencyCode ?? "USD"
  const total = picked.reduce((sum, p) => sum + p.price.amount, 0)

  const toggle = (id: string) =>
    setOff((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const cta = picked.length === items.length ? `Add all ${items.length} to cart` : `Add ${picked.length} to cart`

  return (
    <section aria-labelledby="fbt-h" className="container-shop pb-14">
      <div className="mb-5 flex flex-col gap-1">
        <h2 id="fbt-h" className="text-[1.375rem] leading-[1.15] md:text-[1.625rem]">
          Frequently bought together
        </h2>
        <p className="text-[0.9375rem] text-slate">Complete the set in one order. Untick anything you don&apos;t need.</p>
      </div>

      <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-7">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] sm:gap-2.5">
          {items.map((p, i) => {
            const on = !off.has(p.id)
            return (
              <Fragment key={p.id}>
                {i > 0 && (
                  <span aria-hidden="true" className="grid size-8 flex-none place-items-center rounded-full bg-sand text-slate">
                    <PlusIcon className="size-4" />
                  </span>
                )}
                <div
                  className={cn(
                    "flex min-w-[150px] flex-1 flex-col gap-2.5 rounded-2xl border-2 p-2.5 transition-[border-color,background-color,opacity]",
                    on ? "border-teal bg-teal-tint" : "border-line bg-white opacity-60"
                  )}
                >
                  <div className="relative aspect-square overflow-hidden rounded-xl bg-sand">
                    {p.image && <Image src={p.image.url} alt="" fill sizes="(min-width: 1024px) 240px, 40vw" className="object-cover" />}
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={on}
                      aria-label={`Include ${p.title}`}
                      onClick={() => toggle(p.id)}
                      className={cn(
                        "absolute top-2 left-2 grid size-6 place-items-center rounded-[7px] border-2 border-teal transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                        on ? "bg-teal text-cream" : "bg-white text-transparent"
                      )}
                    >
                      <CheckIcon className="size-3.5" strokeWidth={3} />
                    </button>
                    {i === 0 && (
                      <span className="absolute bottom-2 left-2 rounded-full bg-ink px-2 py-[3px] text-[0.625rem] font-bold tracking-[0.05em] text-cream uppercase">
                        This item
                      </span>
                    )}
                  </div>
                  {i === 0 ? (
                    <span className="line-clamp-2 min-h-[2.6em] text-sm leading-[1.3] font-semibold">{p.title}</span>
                  ) : (
                    <Link href={`/products/${p.handle}`} className="line-clamp-2 min-h-[2.6em] text-sm leading-[1.3] font-semibold hover:text-teal">
                      {p.title}
                    </Link>
                  )}
                  <span className="text-base font-bold tabular-nums">{formatMoney(p.price)}</span>
                </div>
              </Fragment>
            )
          })}
        </div>

        <div className="flex flex-col gap-3.5 rounded-2xl bg-sand p-[22px]">
          <span className="text-sm text-slate">
            {picked.length} of {items.length} items selected
          </span>
          <ul className="flex flex-col gap-1.5 text-sm">
            {picked.map((p) => (
              <li key={p.id} className="flex justify-between gap-3">
                <span className="line-clamp-1">{p.title}</span>
                <span className="font-semibold tabular-nums">{formatMoney(p.price)}</span>
              </li>
            ))}
          </ul>
          <div className="flex items-baseline justify-between border-t border-dashed border-line-strong pt-3">
            <span className="text-[0.9375rem] font-bold">Total</span>
            <span className="text-[1.875rem] leading-none font-bold tabular-nums">{formatMoney({ amount: total, currencyCode: currency })}</span>
          </div>
          {total >= FREE_SHIPPING && (
            <span className="inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold text-success">
              <TruckIcon aria-hidden="true" className="size-4" />
              Free US shipping on this order
            </span>
          )}
          <Button
            size="lg"
            disabled={picked.length === 0 || add.isPending}
            onClick={() =>
              add.mutate(picked.flatMap((p) => (p.variantId ? [{ merchandiseId: p.variantId, quantity: 1 }] : [])))
            }
            className="mt-auto h-[3.125rem] rounded-xl text-[0.9375rem] font-bold"
          >
            {add.isPending ? "Adding…" : picked.length === 0 ? "Select an item" : cta}
          </Button>
        </div>
      </div>
    </section>
  )
}
