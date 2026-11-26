import "server-only"

import { cookies, headers } from "next/headers"

import { accessToken } from "@/features/account/customer-auth.server"
import { getCountry } from "@/lib/market/market.server"
import {
  CART_BUYER_IDENTITY_UPDATE,
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
import { VARIANTS_BY_ID_QUERY } from "@/lib/shopify/queries"

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
    input: { lines, buyerIdentity: { countryCode: await getCountry() } },
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

/** Moves the shopper's cart (if any) to another country, so prices and currency follow. */
export async function setCartCountry(countryCode: string, customerAccessToken?: string | null): Promise<Cart | null> {
  const cartId = await readCartId()
  if (!cartId) return null
  const data = await run<{ cartBuyerIdentityUpdate: Payload }>(CART_BUYER_IDENTITY_UPDATE, {
    cartId,
    // A logged-in shopper's token signs them in at checkout too (saved addresses, order in their account).
    buyerIdentity: { countryCode, ...(customerAccessToken ? { customerAccessToken } : {}) },
  })
  return unwrap(data.cartBuyerIdentityUpdate)
}

/**
 * Last step before Shopify's checkout: makes sure the cart is in the shopper's current country
 * (they may have switched since it was made) and carries their login into checkout, then returns
 * it with a fresh checkout URL.
 * null = nothing to check out (no cart, empty cart, or a sold-out item still in it).
 */
export async function prepareCheckout(): Promise<Cart | null> {
  let cart: Cart | null
  try {
    cart = await setCartCountry(await getCountry(), await accessToken())
  } catch (error) {
    console.error("[checkout] country sync failed", error)
    cart = await getCart()
  }
  if (!cart || cart.lines.length === 0 || cart.lines.some((l) => !l.available)) return null
  return cart
}

export type SavedVariant = {
  variantId: string
  handle: string
  title: string
  variantTitle: string
  imageUrl: string | null
  price: { amount: number; currencyCode: string }
  available: boolean
}

type RawVariant = {
  id?: string
  title: string
  availableForSale: boolean
  price: { amount: string; currencyCode: string }
  image: { url: string } | null
  product: { handle: string; title: string; featuredImage: { url: string } | null }
}

/** Live data for saved variants in the shopper's country. Variants Shopify no longer has are left out. */
export async function getSavedVariants(ids: string[]): Promise<SavedVariant[]> {
  if (ids.length === 0) return []
  const data = await storefrontServerFetch<{ nodes: (RawVariant | null)[] }>({
    query: VARIANTS_BY_ID_QUERY,
    variables: { ids, country: await getCountry() },
  })
  return data.nodes.flatMap((v) =>
    v?.id
      ? [
          {
            variantId: v.id,
            handle: v.product.handle,
            title: v.product.title,
            variantTitle: v.title === "Default Title" ? "" : v.title,
            imageUrl: v.image?.url ?? v.product.featuredImage?.url ?? null,
            price: { amount: Number(v.price.amount), currencyCode: v.price.currencyCode },
            available: v.availableForSale,
          },
        ]
      : []
  )
}
