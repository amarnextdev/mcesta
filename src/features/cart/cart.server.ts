import "server-only"

import { cookies, headers } from "next/headers"

import {
  CART_CREATE,
  CART_DISCOUNT_CODES_UPDATE,
  CART_LINES_ADD,
  CART_LINES_REMOVE,
  CART_LINES_UPDATE,
  CART_NOTE_UPDATE,
  CART_QUERY,
  toCart,
  type Cart,
  type CartUserError,
  type ShopifyCart,
} from "@/lib/shopify/cart"
import { storefrontServerFetch } from "@/lib/shopify/client.server"

/** Only the cart id is stored on our side, in an httpOnly cookie (JS can't read or steal it). */
const COOKIE = "mcesta_cart"
const MAX_AGE = 60 * 60 * 24 * 30 // 30 days, like Shopify's own cart

type Payload = { cart: ShopifyCart | null; userErrors: CartUserError[] }

/** Storefront call made for a shopper: passes their IP, as Shopify asks for private-token requests. */
async function run<T>(query: string, variables: Record<string, unknown>) {
  const forwarded = (await headers()).get("x-forwarded-for")
  const buyerIp = forwarded?.split(",")[0]?.trim() || undefined
  return storefrontServerFetch<T>({ query, variables, buyerIp })
}

export async function readCartId() {
  return (await cookies()).get(COOKIE)?.value ?? null
}

async function saveCartId(id: string) {
  ;(await cookies()).set(COOKIE, id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  })
}

async function clearCartId() {
  ;(await cookies()).delete(COOKIE)
}

export class CartError extends Error {}

function unwrap(payload: Payload): Cart {
  if (payload.userErrors.length) throw new CartError(payload.userErrors.map((e) => e.message).join(" "))
  if (!payload.cart) throw new CartError("Cart not found")
  return toCart(payload.cart)
}

/** The shopper's cart, or null when they don't have one (or it expired). */
export async function getCart(): Promise<Cart | null> {
  const id = await readCartId()
  if (!id) return null
  const data = await run<{ cart: ShopifyCart | null }>(CART_QUERY, { cartId: id })
  return data.cart ? toCart(data.cart) : null
}

type LineInput = { merchandiseId: string; quantity: number }

/** New cart with these lines. `remember` = store it as the shopper's cart (not for "Buy now"). */
export async function createCart(lines: LineInput[], remember = true): Promise<Cart> {
  const data = await run<{ cartCreate: Payload }>(CART_CREATE, {
    input: { lines, buyerIdentity: { countryCode: "US" } },
  })
  const cart = unwrap(data.cartCreate)
  if (remember) await saveCartId(cart.id)
  return cart
}

export async function addLines(lines: LineInput[]): Promise<Cart> {
  const id = await readCartId()
  if (!id) return createCart(lines)
  try {
    const data = await run<{ cartLinesAdd: Payload }>(CART_LINES_ADD, { cartId: id, lines })
    return unwrap(data.cartLinesAdd)
  } catch (error) {
    // Expired or completed cart (e.g. after checkout): start a fresh one.
    if (error instanceof CartError && /not found|does not exist/i.test(error.message)) {
      await clearCartId()
      return createCart(lines)
    }
    throw error
  }
}

async function requireCartId() {
  const id = await readCartId()
  if (!id) throw new CartError("Cart not found")
  return id
}

export async function updateLine(lineId: string, quantity: number): Promise<Cart> {
  const cartId = await requireCartId()
  const data = await run<{ cartLinesUpdate: Payload }>(CART_LINES_UPDATE, { cartId, lines: [{ id: lineId, quantity }] })
  return unwrap(data.cartLinesUpdate)
}

export async function removeLine(lineId: string): Promise<Cart> {
  const cartId = await requireCartId()
  const data = await run<{ cartLinesRemove: Payload }>(CART_LINES_REMOVE, { cartId, lineIds: [lineId] })
  return unwrap(data.cartLinesRemove)
}

export async function setDiscountCodes(codes: string[]): Promise<Cart> {
  const cartId = await requireCartId()
  const data = await run<{ cartDiscountCodesUpdate: Payload }>(CART_DISCOUNT_CODES_UPDATE, { cartId, discountCodes: codes })
  return unwrap(data.cartDiscountCodesUpdate)
}

export async function setNote(note: string): Promise<Cart> {
  const cartId = await requireCartId()
  const data = await run<{ cartNoteUpdate: Payload }>(CART_NOTE_UPDATE, { cartId, note })
  return unwrap(data.cartNoteUpdate)
}
