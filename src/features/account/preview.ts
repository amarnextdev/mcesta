import type { Customer, Order } from "./types"

/**
 * Development-only sample data so the logged-in pages can be designed and tested before
 * Shopify customer accounts are connected. Never shown in production (see the account pages).
 */
export const previewCustomer: Customer = { firstName: "Sam", email: "sam@example.com" }

const usd = (amount: number) => ({ amount, currencyCode: "USD" })
const address = { name: "Sam Carter", lines: ["742 Evergreen Terrace", "Springfield, OR 97403", "United States"], phone: "+1 (541) 555-0134" }

/** Delivered "now minus 1 hour", so the 48-hour damage window is open while testing. */
function hoursAgo(hours: number) {
  return new Date(Date.now() - hours * 3_600_000).toISOString()
}

export function getPreviewOrders(): Order[] {
  return [
    {
      id: "preview-1048",
      name: "#1048",
      placedAt: "2026-11-11T09:12:00",
      total: usd(110),
      shipTo: "Sam Carter",
      kind: "transit",
      stage: 2,
      status: "Arriving Tue, Nov 17",
      detail: "Shipped with USPS · in transit",
      latest: "In transit to the next facility · Columbus, OH · Nov 13, 6:42 PM",
      trackingUrl: "https://tools.usps.com/go/TrackConfirmAction",
      statusUrl: null,
      deliveredAt: null,
      carrier: "USPS",
      events: [
        { title: "In transit to the next facility", at: "2026-11-13T18:42:00", location: "Columbus, OH" },
        { title: "Shipped", at: "2026-11-12T15:05:00", location: "US warehouse" },
        { title: "Packed", at: "2026-11-12T09:30:00" },
        { title: "Order placed", at: "2026-11-11T09:12:00" },
      ],
      shippingAddress: address,
      prices: { subtotal: usd(110), discount: null, shipping: usd(0), tax: usd(8.25) },
      payment: "Visa ending 4242",
      lines: [
        { title: "The Barrel Decanter Set", variantTitle: "Clear", quantity: 1, price: usd(59), compareAtPrice: usd(79), image: null, variantId: null, handle: null },
        { title: "Whiskey Stones Gift Box", variantTitle: "Set of 9", quantity: 1, price: usd(29), compareAtPrice: null, image: null, variantId: null, handle: null },
        { title: "Leather Coaster Set", variantTitle: "Cognac", quantity: 1, price: usd(22), compareAtPrice: null, image: null, variantId: null, handle: null },
      ],
    },
    {
      id: "preview-1041",
      name: "#1041",
      placedAt: "2026-11-09T14:20:00",
      total: usd(68),
      shipTo: "Sam Carter",
      kind: "delivered",
      stage: 4,
      status: "Delivered",
      detail: "Left at front door",
      latest: "Delivered · Left at front door",
      trackingUrl: "https://tools.usps.com/go/TrackConfirmAction",
      statusUrl: null,
      deliveredAt: hoursAgo(1),
      carrier: "USPS",
      events: [
        { title: "Delivered · Left at front door", at: hoursAgo(1), location: "Springfield, OR" },
        { title: "Out for delivery", at: hoursAgo(6), location: "Springfield, OR" },
        { title: "Shipped", at: "2026-11-10T11:00:00", location: "US warehouse" },
        { title: "Order placed", at: "2026-11-09T14:20:00" },
      ],
      shippingAddress: address,
      prices: { subtotal: usd(68), discount: usd(0), shipping: usd(0), tax: usd(5.1) },
      payment: "PayPal",
      lines: [
        { title: "Linen Throw Blanket", variantTitle: "Oat", quantity: 1, price: usd(39), compareAtPrice: usd(52), image: null, variantId: null, handle: null },
        { title: "Ceramic Bud Vase Trio", variantTitle: "Sand", quantity: 1, price: usd(29), compareAtPrice: null, image: null, variantId: null, handle: null },
      ],
    },
    {
      id: "preview-1029",
      name: "#1029",
      placedAt: "2026-10-24T10:00:00",
      total: usd(59),
      shipTo: "Sam Carter",
      kind: "cancelled",
      stage: -1,
      status: "Cancelled",
      detail: "Cancelled on Oct 24",
      latest: null,
      trackingUrl: null,
      statusUrl: null,
      deliveredAt: null,
      carrier: null,
      events: [
        { title: "Cancelled · refund sent", at: "2026-10-24T12:30:00" },
        { title: "Order placed", at: "2026-10-24T10:00:00" },
      ],
      shippingAddress: address,
      prices: { subtotal: usd(59), discount: null, shipping: usd(0), tax: null },
      payment: "Visa ending 4242",
      lines: [
        { title: "Orthopedic Dog Bed", variantTitle: "Medium", quantity: 1, price: usd(59), compareAtPrice: null, image: null, variantId: null, handle: null },
      ],
    },
  ]
}
