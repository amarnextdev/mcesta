"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { addWishlistAction, getWishlistAction, removeWishlistAction } from "./actions"
import type { WishItem } from "./types"

export type { WishItem } from "./types"

const wishlistKey = ["wishlist"] as const

/**
 * The shopper's wishlist (saved in Supabase, see wishlist.server.ts). One shared query for the
 * header count, every heart button and the wishlist page; adding and removing update the UI
 * straight away and roll back if the server says no.
 */
export function useWishlist() {
  const queryClient = useQueryClient()
  const { data, isPending } = useQuery({
    queryKey: wishlistKey,
    queryFn: () => getWishlistAction(),
    staleTime: 60_000,
  })
  const items = data ?? []

  const optimistic = (update: (list: WishItem[]) => WishItem[]) => async () => {
    await queryClient.cancelQueries({ queryKey: wishlistKey })
    const previous = queryClient.getQueryData<WishItem[]>(wishlistKey)
    queryClient.setQueryData<WishItem[]>(wishlistKey, (list) => update(list ?? []))
    return { previous }
  }
  const rollback = (_e: unknown, _v: unknown, context?: { previous?: WishItem[] }) => {
    queryClient.setQueryData(wishlistKey, context?.previous)
    toast.error("Couldn't update your wishlist. Please try again.")
  }
  const settle = () => queryClient.invalidateQueries({ queryKey: wishlistKey })

  const addMutation = useMutation({
    mutationFn: (item: WishItem) => addWishlistAction({ productId: item.id, handle: item.handle, price: item.price }),
    onMutate: (item) => optimistic((list) => [item, ...list.filter((i) => i.id !== item.id)])(),
    onError: rollback,
    onSettled: settle,
  })

  const removeMutation = useMutation({
    mutationFn: (id: string) => removeWishlistAction(id),
    onMutate: (id) => optimistic((list) => list.filter((i) => i.id !== id))(),
    onError: rollback,
    onSettled: settle,
  })

  return {
    items,
    /** False until the wishlist has loaded (show a skeleton instead of "empty"). */
    ready: !isPending,
    add: (item: WishItem) => addMutation.mutate(item),
    /** Remove by product handle (what the cards know). */
    remove: (handle: string) => {
      const item = items.find((i) => i.handle === handle)
      if (item) removeMutation.mutate(item.id)
    },
  }
}
