/** Our checkout entry point: syncs the cart, then redirects to Shopify's checkout (app/checkout/route.ts). */
export const CHECKOUT_PATH = "/checkout"

/** Most of one item per order line (dropship stock is limited). */
export const MAX_QUANTITY = 10

/**
 * Free-shipping threshold per cart currency (each market has its own).
 * Keep in line with the announcement bar, the shipping policy and Shopify's shipping rates.
 */
const FREE_SHIPPING_THRESHOLDS: Record<string, number> = {
  USD: 50,
  CAD: 70,
  GBP: 40,
  INR: 999,
}

/** Threshold for this currency, or null when that market has no free-shipping offer. */
export function freeShippingThreshold(currencyCode: string): number | null {
  return FREE_SHIPPING_THRESHOLDS[currencyCode] ?? null
}

/** Has this subtotal earned free shipping? */
export function hasFreeShipping(subtotal: { amount: number; currencyCode: string }) {
  const threshold = freeShippingThreshold(subtotal.currencyCode)
  return threshold !== null && subtotal.amount >= threshold
}
