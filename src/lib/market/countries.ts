/** Country (Shopify market) the shopper is browsing in. Safe to import anywhere. */

/** Two-letter ISO code, e.g. "US", "IN", "GB". */
export type CountryCode = string

export type Country = {
  code: CountryCode
  name: string
  currency: string
  symbol: string
}

/** Remembers the shopper's choice for a year. */
export const COUNTRY_COOKIE = "mcesta_country"
export const COUNTRY_COOKIE_MAX_AGE = 60 * 60 * 24 * 365

/** Used when we can't tell where the shopper is and they haven't picked a country. */
export const DEFAULT_COUNTRY: CountryCode = "US"

export function isCountryCode(value: unknown): value is CountryCode {
  return typeof value === "string" && /^[A-Z]{2}$/.test(value)
}

/** Small flag image (flagcdn.com). Emoji flags don't render on Windows. */
export function flagUrl(code: CountryCode, width: 20 | 40 | 80 = 40) {
  return `https://flagcdn.com/w${width}/${code.toLowerCase()}.png`
}
