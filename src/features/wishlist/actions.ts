"use server"

import { z } from "zod"

import type { WishItem } from "./types"
import { addToWishlist, listWishlist, removeFromWishlist } from "./wishlist.server"

const productId = z.string().regex(/^gid:\/\/shopify\/Product\/\d+$/)

const addInput = z.object({
  productId,
  handle: z.string().regex(/^[a-z0-9-]{1,255}$/),
  price: z.object({ amount: z.number().nonnegative().max(1_000_000), currencyCode: z.string().length(3) }),
})

export async function getWishlistAction(): Promise<WishItem[]> {
  try {
    return await listWishlist()
  } catch (error) {
    console.error("[wishlist] list", error)
    return []
  }
}

/** Throws on failure so the client can roll back its optimistic update. */
export async function addWishlistAction(input: z.input<typeof addInput>): Promise<void> {
  const parsed = addInput.parse(input)
  await addToWishlist(parsed)
}

export async function removeWishlistAction(id: string): Promise<void> {
  await removeFromWishlist(productId.parse(id))
}
