import type { ShopifyFilter } from "@/lib/shopify/types"

/**
 * Filters.
 *
 * A filter is one Storefront `ProductFilter` object, e.g. `{ available: true }`,
 * `{ price: { min: 25, max: 50 } }`, `{ productVendor: "Acme" }`, `{ tag: "gift-ready" }`.
 *
 * URL format (same as Shopify Hydrogen), one param per filter:
 *   ?filter.available=true&filter.price={"min":25,"max":50}&filter.tag="gift-ready"
 */

export type FilterInput = Record<string, unknown>

export type FilterValue = { id: string; label: string; count: number | null; input: FilterInput }

export type FilterGroup = {
  id: string
  label: string
  type: "LIST" | "PRICE_RANGE" | "BOOLEAN"
  values: FilterValue[]
}

const PREFIX = "filter."

/** Price slider stops (USD). The last one means "and up" (no upper limit). */
export const priceStops = [0, 10, 25, 50, 75, 100, 150, 200, 300, 500] as const

/** Stable identity of a filter, used for equality and React keys. */
export const filterKey = (input: FilterInput) => JSON.stringify(input)

export const sameFilter = (a: FilterInput, b: FilterInput) => filterKey(a) === filterKey(b)

export const isPriceFilter = (input: FilterInput) => "price" in input

export function priceOf(filters: FilterInput[]): { min?: number; max?: number } | null {
  const found = filters.find(isPriceFilter)
  return found ? (found.price as { min?: number; max?: number }) : null
}

/** Add the filter if missing, remove it if present. */
export function toggleFilter(filters: FilterInput[], input: FilterInput): FilterInput[] {
  return filters.some((f) => sameFilter(f, input)) ? filters.filter((f) => !sameFilter(f, input)) : [...filters, input]
}

/** Only one price range at a time. `null` clears it. */
export function setPrice(filters: FilterInput[], range: { min?: number; max?: number } | null): FilterInput[] {
  const rest = filters.filter((f) => !isPriceFilter(f))
  if (!range || (range.min === undefined && range.max === undefined)) return rest
  const price: { min?: number; max?: number } = {}
  if (range.min !== undefined) price.min = range.min
  if (range.max !== undefined) price.max = range.max
  return [...rest, { price }]
}

// ---- URL ----

/** Reads every `filter.*` param. Bad JSON is ignored, so a broken link never breaks the page. */
export function parseFilters(search: URLSearchParams): FilterInput[] {
  const out: FilterInput[] = []
  for (const [name, raw] of search.entries()) {
    if (!name.startsWith(PREFIX)) continue
    try {
      out.push({ [name.slice(PREFIX.length)]: JSON.parse(raw) })
    } catch {
      // ignore
    }
  }
  return sortFilters(out)
}

export function writeFilters(search: URLSearchParams, filters: FilterInput[]) {
  for (const input of sortFilters(filters)) {
    const [name, value] = Object.entries(input)[0] ?? []
    if (name) search.append(PREFIX + name, JSON.stringify(value))
  }
}

/** Same filters in any order → same URL and same cache key. */
export function sortFilters(filters: FilterInput[]): FilterInput[] {
  return [...filters].sort((a, b) => filterKey(a).localeCompare(filterKey(b)))
}

// ---- Shopify ----

export function toFilterGroups(filters: ShopifyFilter[]): FilterGroup[] {
  return filters.map((f) => ({
    id: f.id,
    label: f.label,
    type: f.type,
    values: f.values.flatMap((v) => {
      try {
        return [{ id: v.id, label: v.label, count: v.count, input: JSON.parse(v.input) as FilterInput }]
      } catch {
        return []
      }
    }),
  }))
}

/**
 * Filters for `/collections/all`, which uses the products query (no filter list from Shopify).
 * Translated to search syntax by `toSearchQuery`.
 */
export const allProductsFilterGroups: FilterGroup[] = [
  {
    id: "filter.v.availability",
    label: "Availability",
    type: "LIST",
    values: [{ id: "filter.v.availability.1", label: "In stock", count: null, input: { available: true } }],
  },
  { id: "filter.v.price", label: "Price", type: "PRICE_RANGE", values: [] },
]

const quote = (v: unknown) => `"${String(v).replace(/"/g, '\\"')}"`

/** ProductFilter objects → Shopify search syntax (for the products query). Unknown ones are skipped. */
export function toSearchQuery(filters: FilterInput[]): string {
  const parts: string[] = []
  for (const f of filters) {
    if ("available" in f) parts.push(`available_for_sale:${f.available ? "true" : "false"}`)
    else if ("tag" in f) parts.push(`tag:${quote(f.tag)}`)
    else if ("productType" in f) parts.push(`product_type:${quote(f.productType)}`)
    else if ("productVendor" in f) parts.push(`vendor:${quote(f.productVendor)}`)
    else if ("price" in f) {
      const { min, max } = f.price as { min?: number; max?: number }
      if (min !== undefined) parts.push(`variants.price:>=${min}`)
      if (max !== undefined) parts.push(`variants.price:<=${max}`)
    }
  }
  return parts.join(" AND ")
}

/** Human label for an active filter chip. */
export function filterLabel(input: FilterInput, groups: FilterGroup[]): string {
  if (isPriceFilter(input)) {
    const { min, max } = input.price as { min?: number; max?: number }
    if (min !== undefined && max !== undefined) return `$${min} – $${max}`
    if (min !== undefined) return `$${min}+`
    return `Under $${max}`
  }
  for (const group of groups) {
    const value = group.values.find((v) => sameFilter(v.input, input))
    if (value) return group.label === "Availability" ? value.label : `${group.label}: ${value.label}`
  }
  const [name, value] = Object.entries(input)[0] ?? ["", ""]
  return typeof value === "string" ? value : `${name}`
}
