import { NextResponse, type NextRequest } from "next/server"

import { prepareCheckout } from "@/features/cart/cart.server"

/**
 * /checkout → Shopify's hosted checkout for the shopper's cart.
 * The cart is synced to their current country first, so checkout opens in the right currency.
 * Nothing to check out (empty, expired or a sold-out item) → back to the cart page.
 */
export async function GET(request: NextRequest) {
  const cart = await prepareCheckout().catch((error) => {
    console.error("[checkout]", error)
    return null
  })
  const target = cart ? cart.checkoutUrl : new URL("/cart", request.url)
  // 303: always a fresh GET; no-store so a cached redirect never opens an old cart.
  const response = NextResponse.redirect(target, 303)
  response.headers.set("Cache-Control", "no-store")
  return response
}
