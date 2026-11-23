"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import type { Cart } from "@/lib/shopify/cart"

import {
  addToCartAction,
  applyDiscountAction,
  buyNowAction,
  getCartAction,
  removeLineAction,
  updateLineAction,
  updateNoteAction,
  type CartResult,
} from "./actions"
import { cartDrawer } from "./drawer-store"
import { cartKey } from "./keys"



/** The shopper's cart (null = no cart yet). Shared by the header badge, drawer and cart page. */
export function useCart() {
  return useQuery({ queryKey: cartKey, queryFn: () => getCartAction(), staleTime: 30_000 })
}

/** Turns a CartResult into a cache update, or a thrown error for the mutation's onError. */
function useApply() {
  const queryClient = useQueryClient()
  return (result: CartResult) => {
    if (!result.ok) throw new Error(result.error)
    queryClient.setQueryData(cartKey, result.cart)
    return result.cart
  }
}

type AddInput = { merchandiseId: string; quantity: number; title?: string }

/**
 * Adds to the Shopify cart, then opens the cart drawer so the shopper sees it worked.
 * On the cart page itself (drawer would cover the same info) it just shows a short toast.
 */
export function useAddToCart() {
  const apply = useApply()
  return useMutation({
    mutationFn: async (lines: AddInput[]) =>
      apply(await addToCartAction(lines.map(({ merchandiseId, quantity }) => ({ merchandiseId, quantity })))),
    onSuccess: (_cart, lines) => {
      if (window.location.pathname !== "/cart") return cartDrawer.open()
      const count = lines.reduce((n, l) => n + l.quantity, 0)
      toast.success(lines.length === 1 && lines[0].title ? `${lines[0].title} added` : `${count} items added`)
    },
    onError: (error) => toast.error(error.message),
  })
}

/** Optimistic: the new quantity shows straight away and rolls back if Shopify says no. */
export function useUpdateLine() {
  const apply = useApply()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ lineId, quantity }: { lineId: string; quantity: number }) => apply(await updateLineAction(lineId, quantity)),
    onMutate: async ({ lineId, quantity }) => {
      await queryClient.cancelQueries({ queryKey: cartKey })
      const previous = queryClient.getQueryData<Cart | null>(cartKey)
      if (previous) {
        queryClient.setQueryData<Cart>(cartKey, {
          ...previous,
          lines: previous.lines
            .map((l) => (l.id === lineId ? { ...l, quantity, total: { ...l.total, amount: l.price.amount * quantity } } : l))
            .filter((l) => l.quantity > 0),
        })
      }
      return { previous }
    },
    onError: (error, _vars, context) => {
      if (context?.previous !== undefined) queryClient.setQueryData(cartKey, context.previous)
      toast.error(error.message)
    },
  })
}

export function useRemoveLine() {
  const apply = useApply()
  return useMutation({
    mutationFn: async (lineId: string) => apply(await removeLineAction(lineId)),
    onError: (error) => toast.error(error.message),
  })
}

export function useDiscountCodes() {
  const apply = useApply()
  return useMutation({ mutationFn: async (codes: string[]) => apply(await applyDiscountAction(codes)) })
}

export function useCartNote() {
  const apply = useApply()
  return useMutation({
    mutationFn: async (note: string) => apply(await updateNoteAction(note)),
    onError: (error) => toast.error(error.message),
  })
}

/** Straight to Shopify checkout with just these items (the cart is kept as it is). */
export function useBuyNow() {
  return useMutation({
    mutationFn: async (lines: { merchandiseId: string; quantity: number }[]) => {
      const result = await buyNowAction(lines)
      if (!result.ok) throw new Error(result.error)
      window.location.assign(result.checkoutUrl)
    },
    onError: (error) => toast.error(error.message),
  })
}
