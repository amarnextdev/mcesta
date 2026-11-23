"use client"

import Link from "next/link"
import { useState, type FormEvent } from "react"
import { CheckIcon, LockIcon, TagIcon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { formatMoney } from "@/lib/format"
import type { Cart } from "@/lib/shopify/cart"

import { FREE_SHIPPING_THRESHOLD } from "../config"
import { useDiscountCodes } from "../hooks"

/** Right-hand "Price details" card (design) with discount code and checkout. */
export function CartSummary({ cart }: { cart: Cart }) {
  const discount = useDiscountCodes()
  const [code, setCode] = useState("")
  const [error, setError] = useState<string | null>(null)

  const currency = cart.total.currencyCode
  const money = (amount: number) => formatMoney({ amount, currencyCode: currency })
  const sellingPrice = cart.lines.reduce((sum, l) => sum + (l.compareAtPrice ?? l.price).amount * l.quantity, 0)
  const saleSavings = sellingPrice - cart.subtotal.amount
  const totalSavings = saleSavings + cart.codeSavings.amount
  const freeShipping = cart.subtotal.amount >= FREE_SHIPPING_THRESHOLD
  const blocked = cart.lines.some((l) => !l.available)

  async function apply(event: FormEvent) {
    event.preventDefault()
    const value = code.trim().toUpperCase()
    if (!value) return
    setError(null)
    try {
      const next = await discount.mutateAsync([...cart.discountCodes.map((d) => d.code), value])
      const added = next?.discountCodes.find((d) => d.code.toUpperCase() === value)
      if (!added?.applicable) {
        setError("This code can't be used on this cart.")
        await discount.mutateAsync(cart.discountCodes.map((d) => d.code))
      } else setCode("")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't apply the code.")
    }
  }

  const removeCode = (c: string) => discount.mutate(cart.discountCodes.map((d) => d.code).filter((x) => x !== c))

  return (
    <aside aria-label="Price details" className="overflow-hidden rounded-2xl border-2 border-dashed border-teal bg-white lg:sticky lg:top-24">
      <h2 className="border-b border-dashed border-teal-line bg-teal-soft px-[22px] py-4 font-sans text-[0.8125rem] font-bold tracking-[0.08em] text-teal uppercase">
        Price details
      </h2>

      <dl className="flex flex-col gap-3.5 px-[22px] py-[18px] text-[0.9375rem]">
        <div className="flex justify-between">
          <dt>
            Selling price ({cart.totalQuantity} {cart.totalQuantity === 1 ? "item" : "items"})
          </dt>
          <dd className="tabular-nums">{money(sellingPrice)}</dd>
        </div>
        {saleSavings > 0.005 && (
          <div className="flex justify-between">
            <dt>Sale discount</dt>
            <dd className="font-semibold text-success tabular-nums">−{money(saleSavings)}</dd>
          </div>
        )}
        {cart.codeSavings.amount > 0 && (
          <div className="flex justify-between">
            <dt>Discount code</dt>
            <dd className="font-semibold text-success tabular-nums">−{money(cart.codeSavings.amount)}</dd>
          </div>
        )}
        <div className="flex flex-col gap-2 border-t border-dashed border-line pt-3">
          <div className="flex justify-between">
            <dt>Shipping</dt>
            <dd className={freeShipping ? "font-semibold text-success" : "text-slate"}>{freeShipping ? "Free (US)" : "At checkout"}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Estimated tax</dt>
            <dd className="text-slate">At checkout</dd>
          </div>
        </div>
        <div className="flex items-baseline justify-between border-t border-dashed border-line-strong pt-3.5">
          <dt className="text-[1.0625rem] font-bold">Total</dt>
          <dd className="text-[1.625rem] font-bold tabular-nums">{formatMoney(cart.total)}</dd>
        </div>
        {totalSavings > 0.005 && (
          <div className="flex items-center gap-2 rounded-[10px] bg-success-soft px-3 py-2.5 text-sm font-semibold text-success">
            <CheckIcon aria-hidden="true" className="size-4" strokeWidth={2.5} />
            You&apos;ll save {money(totalSavings)} on this order
          </div>
        )}
      </dl>

      <div className="flex flex-col gap-2 px-[22px] pb-[18px]">
        {cart.discountCodes
          .filter((d) => d.applicable)
          .map((d) => (
            <span key={d.code} className="inline-flex items-center gap-2 self-start rounded-full bg-teal-soft py-1 pr-1 pl-3 text-[0.8125rem] font-semibold text-teal">
              <TagIcon aria-hidden="true" className="size-3.5" />
              {d.code}
              <button
                type="button"
                aria-label={`Remove code ${d.code}`}
                onClick={() => removeCode(d.code)}
                className="grid size-6 place-items-center rounded-full hover:bg-teal hover:text-cream"
              >
                <XIcon className="size-3.5" />
              </button>
            </span>
          ))}
        <form onSubmit={apply} className="flex gap-2">
          <label className="flex-1">
            <span className="sr-only">Discount code</span>
            <input
              value={code}
              onChange={(e) => {
                setCode(e.target.value)
                setError(null)
              }}
              placeholder="Discount code"
              autoComplete="off"
              aria-invalid={error ? true : undefined}
              className="h-[2.625rem] w-full rounded-[10px] border-[1.5px] border-line-strong bg-white px-3 text-sm uppercase outline-none placeholder:normal-case focus-visible:border-teal focus-visible:ring-3 focus-visible:ring-ring/40 aria-invalid:border-[#a33a1f]"
            />
          </label>
          <Button type="submit" variant="outline" disabled={discount.isPending || !code.trim()} className="h-[2.625rem] border-[1.5px] border-ink bg-white">
            {discount.isPending ? "…" : "Apply"}
          </Button>
        </form>
        {error && (
          <span role="alert" className="text-[0.8125rem] text-terra-text">
            {error}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2.5 border-t border-dashed border-teal-line px-[22px] pt-4 pb-5">
        <Button asChild={!blocked} size="lg" disabled={blocked} className="h-[3.375rem] rounded-xl text-base font-bold">
          {blocked ? (
            <span>Remove sold-out items to check out</span>
          ) : (
            <a href={cart.checkoutUrl}>
              <LockIcon data-icon="inline-start" className="size-[18px]" />
              Checkout · {formatMoney(cart.total)}
            </a>
          )}
        </Button>
        <Link href="/" className="self-center text-sm font-semibold underline-offset-2 hover:underline">
          Continue shopping
        </Link>
        <span className="flex items-center justify-center gap-2 text-[0.8125rem] text-slate">
          <LockIcon aria-hidden="true" className="size-3.5" />
          Secure checkout by Shopify
        </span>
      </div>
    </aside>
  )
}
