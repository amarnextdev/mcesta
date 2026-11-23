"use server"

import { z } from "zod"

import { getBoughtTogether } from "@/features/product/detail.server"
import type { Cart } from "@/lib/shopify/cart"
import type { ProductCard } from "@/lib/shopify/types"

import { addLines, CartError, createCart, getCart, removeLine, setDiscountCodes, setNote, updateLine } from "./cart.server"
import { MAX_QUANTITY } from "./config"

/*
 * Cart server actions. Every input is checked here (never trust the browser), and every result
 * is the full cart, so the client cache can simply be replaced with it.
 */

export type CartResult = { ok: true; cart: Cart | null } | { ok: false; error: string }

const gid = z.string().startsWith("gid://shopify/")
const lineInput = z.object({ merchandiseId: gid, quantity: z.number().int().min(1).max(MAX_QUANTITY) })

async function attempt(fn: () => Promise<Cart | null>): Promise<CartResult> {
  try {
    return { ok: true, cart: await fn() }
  } catch (error) {
    if (error instanceof CartError) return { ok: false, error: friendly(error.message) }
    if (error instanceof z.ZodError) return { ok: false, error: "That request didn't look right. Please refresh and try again." }
    console.error("[cart]", error)
    return { ok: false, error: "We couldn't update your cart. Please try again." }
  }
}

function friendly(message: string) {
  if (/not enough|inventory|sold out|stock/i.test(message)) return "Sorry, there isn't enough stock for that quantity."
  if (/not found/i.test(message)) return "Your cart expired. Please add the item again."
  return message
}

export async function getCartAction(): Promise<Cart | null> {
  try {
    return await getCart()
  } catch (error) {
    console.error("[cart] read failed", error)
    return null
  }
}

export async function addToCartAction(lines: { merchandiseId: string; quantity: number }[]) {
  return attempt(() => addLines(z.array(lineInput).min(1).max(10).parse(lines)))
}

export async function updateLineAction(lineId: string, quantity: number) {
  return attempt(() => {
    const id = gid.parse(lineId)
    const qty = z.number().int().min(0).max(MAX_QUANTITY).parse(quantity)
    return qty === 0 ? removeLine(id) : updateLine(id, qty)
  })
}

export async function removeLineAction(lineId: string) {
  return attempt(() => removeLine(gid.parse(lineId)))
}

export async function applyDiscountAction(codes: string[]) {
  return attempt(() => setDiscountCodes(z.array(z.string().trim().min(1).max(50)).max(5).parse(codes)))
}

export async function updateNoteAction(note: string) {
  return attempt(() => setNote(z.string().max(500).parse(note)))
}

/** "Buy now": a separate one-off cart straight to checkout. The shopper's cart is left alone. */
export async function buyNowAction(lines: { merchandiseId: string; quantity: number }[]) {
  try {
    const cart = await createCart(z.array(lineInput).min(1).max(10).parse(lines), false)
    return { ok: true as const, checkoutUrl: cart.checkoutUrl }
  } catch (error) {
    console.error("[cart] buy now failed", error)
    return { ok: false as const, error: "We couldn't start checkout. Please try again." }
  }
}

/** "Complete the set" in the cart drawer: add-ons for a product, minus what's already in the cart. */
export async function cartUpsellAction(productId: string, exclude: string[]): Promise<ProductCard | null> {
  try {
    const list = await getBoughtTogether(gid.parse(productId))
    return list.find((p) => !exclude.includes(p.id)) ?? null
  } catch {
    return null
  }
}
