import "server-only"

import { cacheLife, cacheTag } from "next/cache"
import { cookies } from "next/headers"

import { getCountry } from "@/lib/market/market.server"
import { storefrontServerFetch } from "@/lib/shopify/client.server"
import { toProductCard } from "@/lib/shopify/mappers"
import { PRODUCTS_BY_ID_QUERY } from "@/lib/shopify/queries"
import type { Money, ProductCard, ShopifyProductCard } from "@/lib/shopify/types"
import { supabaseAdmin, supabaseConfigured } from "@/lib/supabase/admin"

import type { WishItem } from "./types"

/*
 * Wishlist, stored in Supabase (table wishlist_items).
 * Guests are identified by a random id in an httpOnly cookie, so the list survives reloads and
 * browser restarts. When customer login is added, the owner becomes the customer and the guest
 * rows are merged into the account (one place to change: ownerKey()).
 */

const COOKIE = "mcesta_wishlist"
const MAX_AGE = 60 * 60 * 24 * 365 // 1 year
export const MAX_ITEMS = 100

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** The current owner, e.g. "guest:<uuid>". With `create`, a guest id is issued when missing. */
async function ownerKey(create: boolean): Promise<string | null> {
  const jar = await cookies()
  const existing = jar.get(COOKIE)?.value
  if (existing && UUID.test(existing)) return `guest:${existing}`
  if (!create) return null
  const id = crypto.randomUUID()
  jar.set(COOKIE, id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  })
  return `guest:${id}`
}

/** Live card data for products (price, stock, image). Cached a few minutes, shared by all shoppers. */
async function getProductsById(ids: string[], country: string): Promise<(ProductCard | null)[]> {
  "use cache"
  cacheLife("minutes")
  cacheTag("products")

  const data = await storefrontServerFetch<{ nodes: (ShopifyProductCard | null)[] }>({
    query: PRODUCTS_BY_ID_QUERY,
    variables: { ids, country },
  })
  // nodes() returns {} for ids that aren't products, null for deleted ones.
  return data.nodes.map((n) => (n && "handle" in n ? toProductCard(n) : null))
}

/** The shopper's wishlist, newest first, with live prices. Deleted products are left out. */
export async function listWishlist(): Promise<WishItem[]> {
  if (!supabaseConfigured) return []
  const owner = await ownerKey(false)
  if (!owner) return []

  const { data, error } = await supabaseAdmin()
    .from("wishlist_items")
    .select("product_id, saved_price, saved_currency, created_at")
    .eq("owner_key", owner)
    .order("created_at", { ascending: false })
    .limit(MAX_ITEMS)
  if (error) throw new Error(error.message)
  if (!data.length) return []

  const cards = await getProductsById([...new Set(data.map((r) => r.product_id))].sort(), await getCountry())
  const byId = new Map(cards.flatMap((c) => (c ? [[c.id, c] as const] : [])))

  return data.flatMap((row) => {
    const card = byId.get(row.product_id)
    if (!card) return []
    const savedPrice: Money = { amount: Number(row.saved_price), currencyCode: row.saved_currency }
    return [{ ...card, savedAt: row.created_at, savedPrice }]
  })
}

/** Saves a product (no-op if it's already saved). */
export async function addToWishlist(input: { productId: string; handle: string; price: Money }) {
  const owner = await ownerKey(true)
  if (!owner) throw new Error("No wishlist owner")
  const db = supabaseAdmin()

  const { count } = await db.from("wishlist_items").select("id", { count: "exact", head: true }).eq("owner_key", owner)
  if ((count ?? 0) >= MAX_ITEMS) throw new Error("Wishlist is full")

  const { error } = await db.from("wishlist_items").upsert(
    {
      owner_key: owner,
      product_id: input.productId,
      product_handle: input.handle,
      saved_price: input.price.amount,
      saved_currency: input.price.currencyCode,
    },
    { onConflict: "owner_key,product_id", ignoreDuplicates: true }
  )
  if (error) throw new Error(error.message)
}

export async function removeFromWishlist(productId: string) {
  const owner = await ownerKey(false)
  if (!owner) return
  const { error } = await supabaseAdmin()
    .from("wishlist_items")
    .delete()
    .eq("owner_key", owner)
    .eq("product_id", productId)
  if (error) throw new Error(error.message)
}
