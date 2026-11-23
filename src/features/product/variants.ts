import type { ProductCard, ProductDetail, ProductVariant } from "@/lib/shopify/types"

/**
 * Variant selection.
 * The URL holds the chosen options, like Shopify themes: /products/lamp?Color=Oak&Size=Large
 * so a link opens the same variant and the back button works.
 */

export type Selection = Record<string, string>

export function matches(variant: ProductVariant, selection: Selection) {
  return Object.entries(selection).every(([name, value]) => variant.options[name] === value)
}

/** First variant that fits the selection; prefers in-stock ones. */
export function findVariant(product: ProductDetail, selection: Selection): ProductVariant | null {
  const fitting = product.variants.filter((v) => matches(v, selection))
  return fitting.find((v) => v.available) ?? fitting[0] ?? null
}

/** Default: first in-stock variant (or the first one when nothing is in stock). */
export function defaultVariant(product: ProductDetail): ProductVariant | null {
  return product.variants.find((v) => v.available) ?? product.variants[0] ?? null
}

/** Options from the URL; unknown names / values are ignored. Missing ones come from the default variant. */
export function selectionFromSearch(product: ProductDetail, search: URLSearchParams): Selection {
  const base = defaultVariant(product)?.options ?? {}
  const selection: Selection = { ...base }
  for (const option of product.options) {
    const value = search.get(option.name)
    if (value && option.values.includes(value)) selection[option.name] = value
  }
  // The combination might not exist (e.g. a removed variant): fall back to the default.
  return findVariant(product, selection) ? selection : base
}

export function searchFromSelection(product: ProductDetail, selection: Selection): string {
  const search = new URLSearchParams()
  for (const option of product.options) {
    const value = selection[option.name]
    if (value) search.set(option.name, value)
  }
  const qs = search.toString()
  return qs ? `?${qs}` : ""
}

/** What happens if the shopper picks `value` for `name`, keeping the other choices. */
export function optionState(product: ProductDetail, selection: Selection, name: string, value: string) {
  const next = { ...selection, [name]: value }
  const exact = product.variants.find((v) => matches(v, next))
  // If that exact combination doesn't exist, jump to any variant with this value.
  const fallback = exact ?? product.variants.find((v) => v.options[name] === value) ?? null
  return {
    variant: fallback,
    selection: fallback ? { ...fallback.options } : next,
    exists: Boolean(exact),
    available: Boolean(fallback?.available),
  }
}

/** Options shown as photo swatches (finish, colour, material); the rest are cards. */
export function isVisualOption(name: string) {
  return /colou?r|finish|material|pattern|style|wood/i.test(name)
}

/** The product as a card (default variant), e.g. for "Recently viewed" or "Bought together". */
export function productToCard(product: ProductDetail): ProductCard | null {
  const variant = defaultVariant(product)
  if (!variant) return null
  return {
    id: product.id,
    handle: product.handle,
    title: product.title,
    vendor: product.vendor,
    available: variant.available,
    tags: product.tags,
    image: variant.image ?? product.images[0] ?? null,
    price: variant.price,
    compareAtPrice: variant.compareAtPrice,
    discountPercent: variant.compareAtPrice ? Math.round((1 - variant.price.amount / variant.compareAtPrice.amount) * 100) : null,
    variantId: variant.id,
    hasOptions: product.variants.length > 1,
  }
}
