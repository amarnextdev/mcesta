import type {
  Image,
  Money,
  ProductCard,
  ProductDetail,
  ShopifyCollection,
  ShopifyImage,
  ShopifyMoney,
  ShopifyProductCard,
  ShopifyProductDetail,
} from "./types"

export function toMoney(m: ShopifyMoney): Money {
  return { amount: Number.parseFloat(m.amount), currencyCode: m.currencyCode }
}

/** Raw Storefront product → card shape used across the UI. */
export function toProductCard(p: ShopifyProductCard): ProductCard {
  const price = toMoney(p.priceRange.minVariantPrice)
  const compare = toMoney(p.compareAtPriceRange.minVariantPrice)
  const onSale = compare.amount > price.amount

  return {
    id: p.id,
    handle: p.handle,
    title: p.title,
    vendor: p.vendor,
    available: p.availableForSale,
    tags: p.tags,
    image: p.featuredImage
      ? {
          url: p.featuredImage.url,
          alt: p.featuredImage.altText ?? p.title,
          width: p.featuredImage.width ?? 1000,
          height: p.featuredImage.height ?? 1000,
        }
      : null,
    price,
    compareAtPrice: onSale ? compare : null,
    discountPercent: onSale ? Math.round((1 - price.amount / compare.amount) * 100) : null,
    variantId: (p.variants.nodes.find((v) => v.availableForSale) ?? p.variants.nodes[0])?.id ?? null,
    hasOptions: p.variants.nodes.length > 1,
  }
}

export function toImage(img: ShopifyImage | null, fallbackAlt: string): Image | null {
  if (!img) return null
  return { url: img.url, alt: img.altText ?? fallbackAlt, width: img.width ?? 1000, height: img.height ?? 1000 }
}

export type CollectionInfo = {
  handle: string
  title: string
  description: string
  seoTitle: string
  seoDescription: string
  image: Image | null
}

export function toCollectionInfo(c: ShopifyCollection): CollectionInfo {
  return {
    handle: c.handle,
    title: c.title,
    description: c.description,
    seoTitle: c.seo.title || c.title,
    seoDescription: c.seo.description || c.description,
    image: toImage(c.image, c.title),
  }
}

/** Raw Storefront product → product page shape. */
export function toProductDetail(p: ShopifyProductDetail): ProductDetail {
  const images = p.images.nodes.map((img) => toImage(img, p.title)).filter((img): img is Image => img !== null)
  const options = p.options.filter((o) => !(o.values.length === 1 && o.values[0] === "Default Title"))

  return {
    id: p.id,
    handle: p.handle,
    title: p.title,
    vendor: p.vendor,
    productType: p.productType,
    description: p.description,
    descriptionHtml: p.descriptionHtml,
    tags: p.tags,
    available: p.availableForSale,
    seoTitle: p.seo.title || p.title,
    seoDescription: p.seo.description || p.description.slice(0, 160),
    images,
    options,
    variants: p.variants.nodes.map((v) => {
      const price = toMoney(v.price)
      const compare = v.compareAtPrice ? toMoney(v.compareAtPrice) : null
      return {
        id: v.id,
        title: v.title,
        available: v.availableForSale,
        options: Object.fromEntries(v.selectedOptions.map((o) => [o.name, o.value])),
        price,
        compareAtPrice: compare && compare.amount > price.amount ? compare : null,
        image: toImage(v.image, p.title),
      }
    }),
    collections: p.collections.nodes,
    faq: parseFaq(p.faq?.value),
    rating: parseRating(p.rating?.value, p.ratingCount?.value),
  }
}

function parseFaq(raw: string | undefined): { q: string; a: string }[] {
  if (!raw) return []
  try {
    const list = JSON.parse(raw) as unknown
    if (!Array.isArray(list)) return []
    return list.flatMap((item) =>
      item && typeof item.q === "string" && typeof item.a === "string" ? [{ q: item.q, a: item.a }] : []
    )
  } catch {
    return []
  }
}

/** Shopify rating metafield: {"value":"4.6","scale_min":"1.0","scale_max":"5.0"}. */
function parseRating(raw: string | undefined, rawCount: string | undefined) {
  if (!raw || !rawCount) return null
  try {
    const value = Number.parseFloat((JSON.parse(raw) as { value: string }).value)
    const count = Number.parseInt(rawCount, 10)
    return Number.isFinite(value) && count > 0 ? { value, count } : null
  } catch {
    return null
  }
}
