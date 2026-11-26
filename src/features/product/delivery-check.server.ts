import "server-only"

import { headers } from "next/headers"

import { getCountry } from "@/lib/market/market.server"
import { storefrontServerFetch } from "@/lib/shopify/client.server"

import { normalizePostal, postalRule, type DeliveryCheck } from "./delivery-check"

/**
 * Asks Shopify for real shipping rates to a postal code: builds a throwaway cart with this item
 * and the address, then reads its delivery options. No options = we don't ship there.
 */
const DELIVERY_ESTIMATE = /* GraphQL */ `
  mutation DeliveryEstimate($input: CartInput!, $country: CountryCode) @inContext(country: $country) {
    cartCreate(input: $input) {
      cart {
        deliveryGroups(first: 5, withCarrierRates: true) {
          nodes {
            deliveryOptions {
              handle
              title
              deliveryMethodType
              estimatedCost {
                amount
                currencyCode
              }
            }
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`

type EstimateData = {
  cartCreate: {
    cart: {
      deliveryGroups: {
        nodes: {
          deliveryOptions: {
            handle: string
            title: string | null
            deliveryMethodType: string
            estimatedCost: { amount: string; currencyCode: string }
          }[]
        }[]
      }
    } | null
    userErrors: { field: string[] | null; message: string }[]
  }
}

export type Place = { name: string; province: string | null; provinceCode: string | null }

/**
 * City and state for a postal code (Zippopotam, free and keyless). Also proves the code exists.
 * null = code not in its list; undefined = service unreachable. Either way we carry on without it.
 */
export async function lookupPlace(country: string, code: string): Promise<Place | null | undefined> {
  // UK and Canada are listed by the first part of the code only.
  const key = country === "GB" || country === "CA" ? code.split(" ")[0] ?? code : code
  try {
    const res = await fetch(`https://api.zippopotam.us/${country.toLowerCase()}/${encodeURIComponent(key)}`, {
      signal: AbortSignal.timeout(3000),
      next: { revalidate: 60 * 60 * 24 * 30 },
    })
    if (res.status === 404) return null
    if (!res.ok) return undefined
    const data = (await res.json()) as { places?: { "place name": string; state?: string; "state abbreviation"?: string }[] }
    const first = data.places?.[0]
    if (!first) return null
    return { name: first["place name"], province: first.state ?? null, provinceCode: first["state abbreviation"] ?? null }
  } catch {
    return undefined
  }
}

export async function checkDelivery(variantId: string, rawCode: string): Promise<DeliveryCheck> {
  const country = await getCountry()
  const rule = postalRule(country)
  const code = normalizePostal(rawCode)
  if (!rule.pattern.test(code)) return { status: "invalid", message: rule.hint }

  // The lookup's lists aren't complete (new PIN codes, rural areas), so an unknown code isn't
  // rejected here: Shopify's rates below have the final word.
  const place = (await lookupPlace(country, code)) ?? undefined
  const placeLabel = place ? [place.name, place.provinceCode ?? place.province].filter(Boolean).join(", ") : null

  const forwarded = (await headers()).get("x-forwarded-for")
  const buyerIp = forwarded?.split(",")[0]?.trim() || undefined

  const data = await storefrontServerFetch<EstimateData>({
    query: DELIVERY_ESTIMATE,
    buyerIp,
    variables: {
      country,
      input: {
        lines: [{ merchandiseId: variantId, quantity: 1 }],
        buyerIdentity: { countryCode: country },
        delivery: {
          addresses: [
            {
              selected: true,
              address: {
                deliveryAddress: {
                  countryCode: country,
                  zip: code,
                  ...(place?.name ? { city: place.name } : {}),
                  // Shopify wants a 2-letter state code where states matter (US, CA, IN…).
                  ...(place?.provinceCode && /^[A-Z]{2}$/.test(place.provinceCode) ? { provinceCode: place.provinceCode } : {}),
                },
              },
            },
          ],
        },
      },
    },
  })

  const { cart, userErrors } = data.cartCreate
  if (!cart) {
    console.error("[delivery check]", userErrors)
    return { status: "error", message: "We couldn't check delivery right now. Please try again." }
  }

  const options = cart.deliveryGroups.nodes
    .flatMap((g) => g.deliveryOptions)
    .filter((o) => o.deliveryMethodType === "SHIPPING")
    .map((o) => ({
      title: o.title || "Standard shipping",
      cost: { amount: Number(o.estimatedCost.amount), currencyCode: o.estimatedCost.currencyCode },
    }))
    .sort((a, b) => a.cost.amount - b.cost.amount)

  if (options.length === 0) return { status: "unavailable", code, place: placeLabel }
  return { status: "ok", code, place: placeLabel, options }
}
