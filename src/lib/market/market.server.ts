import "server-only"

import { cacheLife, cacheTag } from "next/cache"
import { cookies, headers } from "next/headers"

import { storefrontServerFetch } from "@/lib/shopify/client.server"
import { LOCALIZATION_QUERY } from "@/lib/shopify/queries"

import { COUNTRY_COOKIE, DEFAULT_COUNTRY, isCountryCode, type Country, type CountryCode } from "./countries"

type LocalizationData = {
  localization: {
    availableCountries: { isoCode: string; name: string; currency: { isoCode: string; symbol: string } }[]
  }
}

const FALLBACK: Country[] = [{ code: DEFAULT_COUNTRY, name: "United States", currency: "USD", symbol: "$" }]

/** Countries the store sells to (from Shopify Markets), A–Z. Cached: markets rarely change. */
export async function getAvailableCountries(): Promise<Country[]> {
  "use cache"
  cacheLife("hours")
  cacheTag("localization")

  try {
    const data = await storefrontServerFetch<LocalizationData>({ query: LOCALIZATION_QUERY })
    const list = data.localization.availableCountries
      .map((c) => ({ code: c.isoCode, name: c.name, currency: c.currency.isoCode, symbol: c.currency.symbol }))
      .sort((a, b) => a.name.localeCompare(b.name))
    return list.length ? list : FALLBACK
  } catch (error) {
    console.error("[market] couldn't load countries", error)
    return FALLBACK
  }
}

/** Country from the visitor's IP, as set by the host (Vercel, Cloudflare, CloudFront). */
async function detectedCountry(): Promise<string | null> {
  const h = await headers()
  return h.get("x-vercel-ip-country") ?? h.get("cf-ipcountry") ?? h.get("cloudfront-viewer-country")
}

/**
 * The shopper's country: their own choice (cookie) → their IP's country → US.
 * Only countries the store sells to count. Reads the request, so call it inside Suspense.
 */
export async function getCountry(): Promise<CountryCode> {
  const [jar, detected, countries] = await Promise.all([cookies(), detectedCountry(), getAvailableCountries()])
  const allowed = new Set(countries.map((c) => c.code))
  const pick = (value: string | null | undefined) => {
    const code = value?.toUpperCase()
    return isCountryCode(code) && allowed.has(code) ? code : null
  }
  return pick(jar.get(COUNTRY_COOKIE)?.value) ?? pick(detected) ?? pick(DEFAULT_COUNTRY) ?? countries[0].code
}

/** Is this a country the store sells to? */
export async function isAvailableCountry(code: string) {
  return (await getAvailableCountries()).some((c) => c.code === code)
}
