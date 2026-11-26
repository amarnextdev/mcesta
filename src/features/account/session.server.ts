import "server-only"

import { getSavedVariants } from "@/features/cart/cart.server"

import { customerFetch, customerLoginConfigured } from "./customer-auth.server"
import type { Customer, Order, OrderKind } from "./types"

/*
 * Logged-in shopper data from Shopify's Customer Account API (login: customer-auth.server.ts).
 * Not logged in, or login not configured → null / [] and the pages show their logged-out state.
 */

export const accountLoginAvailable = customerLoginConfigured

const MONEY = "amount currencyCode"
const IMAGE = "url altText width height"

const ORDER_FIELDS = /* GraphQL */ `
  id
  name
  processedAt
  cancelledAt
  statusPageUrl
  financialStatus
  fulfillmentStatus
  totalPrice { ${MONEY} }
  subtotal { ${MONEY} }
  totalShipping { ${MONEY} }
  totalTax { ${MONEY} }
  shippingAddress {
    name
    city
    formatted(withName: false)
    phoneNumber
  }
  lineItems(first: 50) {
    nodes {
      name
      variantTitle
      quantity
      variantId
      price { ${MONEY} }
      image { ${IMAGE} }
    }
  }
  fulfillments(first: 5, sortKey: CREATED_AT, reverse: true) {
    nodes {
      status
      latestShipmentStatus
      estimatedDeliveryAt
      trackingInformation { company number url }
      events(first: 20, sortKey: HAPPENED_AT, reverse: true) {
        nodes { status happenedAt }
      }
    }
  }
`

type RawMoney = { amount: string; currencyCode: string }
type RawOrder = {
  id: string
  name: string
  processedAt: string
  cancelledAt: string | null
  statusPageUrl: string | null
  financialStatus: string | null
  fulfillmentStatus: string
  totalPrice: RawMoney
  subtotal: RawMoney | null
  totalShipping: RawMoney | null
  totalTax: RawMoney | null
  shippingAddress: { name: string | null; city: string | null; formatted: string[]; phoneNumber: string | null } | null
  lineItems: {
    nodes: {
      name: string
      variantTitle: string | null
      quantity: number
      variantId: string | null
      price: RawMoney | null
      image: { url: string; altText: string | null; width: number | null; height: number | null } | null
    }[]
  }
  fulfillments: {
    nodes: {
      status: string | null
      latestShipmentStatus: string | null
      estimatedDeliveryAt: string | null
      trackingInformation: { company: string | null; number: string | null; url: string | null }[]
      events: { nodes: { status: string; happenedAt: string }[] }
    }[]
  }
}

const money = (m: RawMoney) => ({ amount: Number(m.amount), currencyCode: m.currencyCode })
const day = (iso: string) => new Date(iso).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" })

const EVENT_TITLES: Record<string, string> = {
  CONFIRMED: "Order confirmed",
  LABEL_PURCHASED: "Shipping label created",
  LABEL_PRINTED: "Packed and labelled",
  CARRIER_PICKED_UP: "Picked up by the carrier",
  IN_TRANSIT: "In transit",
  OUT_FOR_DELIVERY: "Out for delivery",
  ATTEMPTED_DELIVERY: "Delivery attempted",
  DELAYED: "Delayed",
  DELIVERED: "Delivered",
  FAILURE: "Delivery problem",
  READY_FOR_PICKUP: "Ready for pickup",
  PICKED_UP: "Picked up",
}

/** Shopify order → the simplified order the account pages show. */
function toOrder(o: RawOrder, handles: Map<string, string>): Order {
  const f = o.fulfillments.nodes[0]
  const tracking = f?.trackingInformation[0] ?? null
  const events = (f?.events.nodes ?? []).map((e) => ({ title: EVENT_TITLES[e.status] ?? e.status, at: e.happenedAt }))
  const delivered = f?.events.nodes.find((e) => e.status === "DELIVERED")?.happenedAt ?? null
  const shipment = f?.latestShipmentStatus ?? null
  const carrier = tracking?.company ?? null

  let kind: OrderKind = "processing"
  let stage = o.fulfillmentStatus === "IN_PROGRESS" ? 1 : 0
  let status = "Preparing your order"
  let detail = "We'll email you a tracking link as soon as it ships."
  if (o.cancelledAt) {
    kind = "cancelled"
    stage = -1
    status = "Cancelled"
    detail = `Cancelled on ${day(o.cancelledAt)}. Any payment goes back to your original method.`
  } else if (shipment === "DELIVERED" || delivered) {
    kind = "delivered"
    stage = 4
    status = delivered ? `Delivered ${day(delivered)}` : "Delivered"
    detail = carrier ? `Delivered by ${carrier}` : "Your order has been delivered."
  } else if (f) {
    kind = "transit"
    stage = shipment === "OUT_FOR_DELIVERY" ? 3 : 2
    status = shipment === "OUT_FOR_DELIVERY" ? "Out for delivery" : f.estimatedDeliveryAt ? `Arriving ${day(f.estimatedDeliveryAt)}` : "On its way"
    detail = [carrier && `Shipped with ${carrier}`, shipment && (EVENT_TITLES[shipment] ?? shipment).toLowerCase()].filter(Boolean).join(" · ") || "Shipped"
  }

  const address = o.shippingAddress
  return {
    id: o.id.split("/").pop() ?? o.id,
    name: o.name,
    placedAt: o.processedAt,
    total: money(o.totalPrice),
    shipTo: address ? [address.name, address.city].filter(Boolean).join(", ") : "",
    kind,
    stage,
    status,
    detail,
    latest: events[0]?.title ?? null,
    trackingUrl: tracking?.url ?? null,
    statusUrl: o.statusPageUrl,
    deliveredAt: delivered,
    lines: o.lineItems.nodes.map((l) => {
      const variantTitle = l.variantTitle && l.variantTitle !== "Default Title" ? l.variantTitle : ""
      return {
        title: variantTitle && l.name.endsWith(` - ${variantTitle}`) ? l.name.slice(0, -(variantTitle.length + 3)) : l.name,
        variantTitle,
        quantity: l.quantity,
        price: l.price ? money(l.price) : money(o.totalPrice),
        compareAtPrice: null,
        image: l.image ? { url: l.image.url, alt: l.image.altText ?? l.name, width: l.image.width ?? 800, height: l.image.height ?? 800 } : null,
        variantId: l.variantId && handles.has(l.variantId) ? l.variantId : null,
        handle: (l.variantId && handles.get(l.variantId)) ?? null,
      }
    }),
    carrier,
    events,
    shippingAddress: address ? { name: address.name ?? "", lines: address.formatted, phone: address.phoneNumber } : null,
    prices: {
      subtotal: money(o.subtotal ?? o.totalPrice),
      discount: null,
      shipping: o.totalShipping ? money(o.totalShipping) : null,
      tax: o.totalTax && Number(o.totalTax.amount) > 0 ? money(o.totalTax) : null,
    },
    payment: null,
  }
}

/** Product handles for "Buy it again" / product links (variants that still exist). */
async function variantHandles(orders: RawOrder[]) {
  const ids = [...new Set(orders.flatMap((o) => o.lineItems.nodes.flatMap((l) => (l.variantId ? [l.variantId] : []))))].slice(0, 50)
  try {
    const variants = await getSavedVariants(ids)
    return new Map(variants.map((v) => [v.variantId, v.handle]))
  } catch {
    return new Map<string, string>()
  }
}

/** The logged-in shopper, or null. */
export async function getCustomer(): Promise<Customer | null> {
  if (!customerLoginConfigured) return null
  try {
    const data = await customerFetch<{ customer: { firstName: string | null; emailAddress: { emailAddress: string } | null } }>(
      `query Customer { customer { firstName emailAddress { emailAddress } } }`
    )
    if (!data) return null
    const email = data.customer.emailAddress?.emailAddress ?? ""
    return { firstName: data.customer.firstName || email.split("@")[0] || "there", email }
  } catch (error) {
    console.error("[account] customer", error)
    return null
  }
}

/** The logged-in shopper's orders, newest first. */
export async function getOrders(): Promise<Order[]> {
  if (!customerLoginConfigured) return []
  const data = await customerFetch<{ customer: { orders: { nodes: RawOrder[] } } }>(
    `query Orders { customer { orders(first: 30, sortKey: PROCESSED_AT, reverse: true) { nodes { ${ORDER_FIELDS} } } } }`
  )
  if (!data) return []
  const raw = data.customer.orders.nodes
  const handles = await variantHandles(raw)
  return raw.map((o) => toOrder(o, handles))
}

/** One of the logged-in shopper's orders (null if it isn't theirs or doesn't exist). */
export async function getOrder(id: string): Promise<Order | null> {
  if (!customerLoginConfigured || !/^\d+$/.test(id)) return null
  const data = await customerFetch<{ order: RawOrder | null }>(`query Order($id: ID!) { order(id: $id) { ${ORDER_FIELDS} } }`, {
    id: `gid://shopify/Order/${id}`,
  })
  if (!data?.order) return null
  return toOrder(data.order, await variantHandles([data.order]))
}

export type Profile = {
  firstName: string
  lastName: string
  email: string
  phone: string | null
  addresses: { id: string; lines: string[]; isDefault: boolean }[]
}

/** Profile + saved addresses for the settings page. null = not logged in. */
export async function getProfile(): Promise<Profile | null> {
  if (!customerLoginConfigured) return null
  type Raw = {
    customer: {
      firstName: string | null
      lastName: string | null
      emailAddress: { emailAddress: string } | null
      phoneNumber: { phoneNumber: string } | null
      defaultAddress: { id: string } | null
      addresses: { nodes: { id: string; formatted: string[] }[] }
    }
  }
  const data = await customerFetch<Raw>(/* GraphQL */ `
    query Profile {
      customer {
        firstName
        lastName
        emailAddress { emailAddress }
        phoneNumber { phoneNumber }
        defaultAddress { id }
        addresses(first: 10) { nodes { id formatted(withName: true) } }
      }
    }
  `)
  if (!data) return null
  const c = data.customer
  return {
    firstName: c.firstName ?? "",
    lastName: c.lastName ?? "",
    email: c.emailAddress?.emailAddress ?? "",
    phone: c.phoneNumber?.phoneNumber ?? null,
    addresses: c.addresses.nodes.map((a) => ({ id: a.id, lines: a.formatted, isDefault: a.id === c.defaultAddress?.id })),
  }
}

/** Change the shopper's name. Returns an error message, or null when saved. */
export async function updateName(firstName: string, lastName: string): Promise<string | null> {
  const data = await customerFetch<{ customerUpdate: { userErrors: { message: string }[] } }>(
    /* GraphQL */ `
      mutation UpdateName($input: CustomerUpdateInput!) {
        customerUpdate(input: $input) {
          userErrors { message }
        }
      }
    `,
    { input: { firstName, lastName } }
  )
  if (!data) return "Please log in again."
  return data.customerUpdate.userErrors[0]?.message ?? null
}

export type CustomerIdentity = { id: string; firstName: string; lastName: string; email: string }

/** Who is logged in (for reviews and questions). null = not logged in. */
export async function getCustomerIdentity(): Promise<CustomerIdentity | null> {
  if (!customerLoginConfigured) return null
  try {
    const data = await customerFetch<{
      customer: { id: string; firstName: string | null; lastName: string | null; emailAddress: { emailAddress: string } | null }
    }>(`query Identity { customer { id firstName lastName emailAddress { emailAddress } } }`)
    if (!data) return null
    const c = data.customer
    return { id: c.id, firstName: c.firstName ?? "", lastName: c.lastName ?? "", email: c.emailAddress?.emailAddress ?? "" }
  } catch (error) {
    console.error("[account] identity", error)
    return null
  }
}

/** Has the logged-in shopper ordered any of these variants? (For the "Verified buyer" badge.) */
export async function hasOrderedAny(variantIds: string[]): Promise<boolean> {
  if (!customerLoginConfigured || variantIds.length === 0) return false
  try {
    const data = await customerFetch<{ customer: { orders: { nodes: { cancelledAt: string | null; lineItems: { nodes: { variantId: string | null }[] } }[] } } }>(
      `query Bought { customer { orders(first: 50, sortKey: PROCESSED_AT, reverse: true) { nodes { cancelledAt lineItems(first: 50) { nodes { variantId } } } } } }`
    )
    const wanted = new Set(variantIds)
    return Boolean(
      data?.customer.orders.nodes.some((o) => !o.cancelledAt && o.lineItems.nodes.some((l) => l.variantId && wanted.has(l.variantId)))
    )
  } catch (error) {
    console.error("[account] purchase check", error)
    return false
  }
}

/** "Amarjeet S." – how a shopper's name shows on reviews. */
export function publicName(identity: Pick<CustomerIdentity, "firstName" | "lastName" | "email">) {
  const first = identity.firstName.trim() || identity.email.split("@")[0] || "Shopper"
  const last = identity.lastName.trim()
  return last ? `${first} ${last[0].toUpperCase()}.` : first
}
