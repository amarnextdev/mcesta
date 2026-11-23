"use client"

import Link from "next/link"
import { ShoppingBagIcon } from "lucide-react"

import { cartDrawer } from "../drawer-store"
import { useCart } from "../hooks"

/**
 * Header cart icon with the live item count. Opens the cart drawer; still a real link to /cart
 * (new tab, no JavaScript, or when already on the cart page).
 */
export function CartLink({ className }: { className?: string }) {
  const { data: cart } = useCart()
  const count = cart?.totalQuantity ?? 0

  return (
    <Link
      href="/cart"
      aria-label={`Cart, ${count} ${count === 1 ? "item" : "items"}`}
      aria-haspopup="dialog"
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0 || window.location.pathname === "/cart") return
        e.preventDefault()
        cartDrawer.open()
      }}
      className={className}
    >
      <ShoppingBagIcon className="size-[22px]" strokeWidth={1.8} />
      {count > 0 && (
        <span
          aria-hidden="true"
          className="absolute top-1 right-0.5 h-[1.125rem] min-w-[18px] rounded-full bg-teal px-1 text-center text-[0.6875rem] leading-[1.125rem] font-bold text-cream"
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  )
}
