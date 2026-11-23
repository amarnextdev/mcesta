import "server-only"

import type { Customer, Order } from "./types"

/*
 * Shopper login uses Shopify's Customer Account API (email + 6-digit code, no passwords):
 * OAuth 2.0 with PKCE against the store's customer account URL, tokens in httpOnly cookies.
 * It needs a real store (mock.shop has no customer accounts), so it's wired up when the store
 * is connected. Until then nobody is logged in, and the pages show their logged-out state.
 *
 * Env (later): SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID, SHOPIFY_CUSTOMER_ACCOUNT_URL (from Shopify admin →
 * Settings → Customer accounts → Headless / Customer Account API).
 */

export const accountLoginAvailable = Boolean(
  process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID && process.env.SHOPIFY_CUSTOMER_ACCOUNT_URL
)

/** The logged-in shopper, or null. */
export async function getCustomer(): Promise<Customer | null> {
  return null
}

/** The logged-in shopper's orders, newest first. */
export async function getOrders(): Promise<Order[]> {
  return []
}

/** One of the logged-in shopper's orders (null if it isn't theirs or doesn't exist). */
export async function getOrder(id: string): Promise<Order | null> {
  return (await getOrders()).find((o) => o.id === id) ?? null
}

/**
 * Development only: show sample orders while customer accounts aren't connected.
 * On by default in dev; add ?preview=0 to see the logged-out page. Never in production.
 */
export function isPreviewMode(param: string | string[] | undefined) {
  return process.env.NODE_ENV !== "production" && param !== "0"
}
