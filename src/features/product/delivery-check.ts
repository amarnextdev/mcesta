/** Postal-code delivery check: shared types and per-country rules (browser + server). */

export type DeliveryOption = { title: string; cost: { amount: number; currencyCode: string } }

export type DeliveryCheck =
  /** Shopify has shipping rates to this address. Cheapest first. */
  | { status: "ok"; code: string; place: string | null; options: DeliveryOption[] }
  /** Real address, but no shipping zone/profile covers it for this item. */
  | { status: "unavailable"; code: string; place: string | null }
  | { status: "invalid"; message: string }
  | { status: "error"; message: string }

type PostalRule = { label: string; placeholder: string; pattern: RegExp; hint: string }

const RULES: Record<string, PostalRule> = {
  US: { label: "ZIP code", placeholder: "e.g. 10001", pattern: /^\d{5}$/, hint: "Enter a 5-digit ZIP code." },
  IN: { label: "PIN code", placeholder: "e.g. 400001", pattern: /^[1-9]\d{5}$/, hint: "Enter a 6-digit PIN code." },
  GB: {
    label: "postcode",
    placeholder: "e.g. SW1A 1AA",
    pattern: /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/,
    hint: "Enter a full UK postcode, like SW1A 1AA.",
  },
  CA: { label: "postal code", placeholder: "e.g. M5V 2T6", pattern: /^[A-Z]\d[A-Z] ?\d[A-Z]\d$/, hint: "Enter a postal code like M5V 2T6." },
}

const FALLBACK: PostalRule = {
  label: "postal code",
  placeholder: "Postal code",
  pattern: /^[A-Z0-9][A-Z0-9 -]{1,9}$/,
  hint: "Enter a valid postal code.",
}

export function postalRule(country: string): PostalRule {
  return RULES[country] ?? FALLBACK
}

/** Upper-cased, single spaces, trimmed: "sw1a  1aa " → "SW1A 1AA". */
export function normalizePostal(value: string) {
  return value.toUpperCase().replace(/\s+/g, " ").trim()
}
