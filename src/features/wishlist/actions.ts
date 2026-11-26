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
  try {
    await addToWishlist(addInput.parse(input))
  } catch (error) {
    // Shows in the server / Vercel logs; the browser only gets a generic failure.
    console.error("[wishlist] add", error)
    throw error
  }
}

export async function removeWishlistAction(id: string): Promise<void> {
  try {
    await removeFromWishlist(productId.parse(id))
  } catch (error) {
    console.error("[wishlist] remove", error)
    throw error
  }
}
