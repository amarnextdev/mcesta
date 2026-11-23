import type { Image, Money } from "@/lib/shopify/types"

/** Where an order is, simplified for shoppers. */
export type OrderKind = "processing" | "transit" | "delivered" | "cancelled"

/** Progress steps shown in the tracker. */
export const orderSteps = ["Ordered", "Packed", "Shipped", "Out for delivery", "Delivered"] as const

export type OrderLine = {
  title: string
  variantTitle: string
  quantity: number
  price: Money
  /** Original price per item, when it was on sale. */
  compareAtPrice: Money | null
  image: Image | null
  /** For "Buy it again". Null when the product no longer exists. */
  variantId: string | null
  handle: string | null
}

export type Order = {
  id: string
  /** Shopify order name, e.g. "#1042". */
  name: string
  placedAt: string
  total: Money
  shipTo: string
  kind: OrderKind
  /** 0–4 = index in orderSteps; -1 for cancelled. */
  stage: number
  /** Headline, e.g. "Arriving Tue, Nov 17". */
  status: string
  /** Second line, e.g. "Shipped with USPS · in transit". */
  detail: string
  /** Latest tracking event, if known. */
  latest: string | null
  trackingUrl: string | null
  /** Shopify's order status page (receipt, tracking, invoice). */
  statusUrl: string | null
  deliveredAt: string | null
  lines: OrderLine[]
  /** Carrier name for "Tracking on USPS". */
  carrier: string | null
  /** Shipment updates, newest first. */
  events: { title: string; at: string; location?: string }[]
  shippingAddress: { name: string; lines: string[]; phone: string | null } | null
  prices: { subtotal: Money; discount: Money | null; shipping: Money | null; tax: Money | null }
  /** e.g. "Visa ending 4242", or "PayPal". */
  payment: string | null
}

export type Customer = {
  firstName: string
  email: string
}
