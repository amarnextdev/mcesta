/** Raw Storefront API shapes (only the fields we query) and the app's normalised shapes. */

export type ShopifyMoney = { amount: string; currencyCode: string }
export type ShopifyImage = {
  url: string
  altText: string | null
  width: number | null
  height: number | null
}

export type ShopifyProductCard = {
  id: string
  handle: string
  title: string
  vendor: string
  availableForSale: boolean
  tags: string[]
  featuredImage: ShopifyImage | null
  priceRange: { minVariantPrice: ShopifyMoney }
  compareAtPriceRange: { minVariantPrice: ShopifyMoney }
  variants: { nodes: { id: string; availableForSale: boolean }[] }
}

// ---- App shapes (what components use) ----

export type Money = { amount: number; currencyCode: string }
export type Image = { url: string; alt: string; width: number; height: number }

export type ProductCard = {
  id: string
  handle: string
  title: string
  vendor: string
  available: boolean
  tags: string[]
  image: Image | null
  price: Money
  /** Original price, only when it is higher than `price`. */
  compareAtPrice: Money | null
  /** Whole-number discount, e.g. 20 for 20% off. */
  discountPercent: number | null
  /** Variant the card's "Add to cart" adds. */
  variantId: string | null
  /** More than one variant: the card links to the product to choose options. */
  hasOptions: boolean
}

export type ProductSortKey = "RELEVANCE" | "BEST_SELLING" | "CREATED_AT" | "PRICE" | "TITLE"

export type ShopifyPageInfo = {
  hasNextPage: boolean
  hasPreviousPage: boolean
  startCursor: string | null
  endCursor: string | null
}

export type ShopifyCollection = {
  id: string
  handle: string
  title: string
  description: string
  seo: { title: string | null; description: string | null }
  image: ShopifyImage | null
}

/** Sort keys for products inside a collection (differs from ProductSortKeys). */
export type ProductCollectionSortKey = "COLLECTION_DEFAULT" | "BEST_SELLING" | "CREATED" | "PRICE" | "TITLE" | "RELEVANCE"

export type PageInfo = ShopifyPageInfo

/** Storefront filter (configured in the Shopify Search & Discovery app). `input` is a JSON string. */
export type ShopifyFilter = {
  id: string
  label: string
  type: "LIST" | "PRICE_RANGE" | "BOOLEAN"
  values: { id: string; label: string; count: number; input: string }[]
}

export type ShopifyProductDetail = {
  id: string
  handle: string
  title: string
  vendor: string
  productType: string
  description: string
  descriptionHtml: string
  tags: string[]
  availableForSale: boolean
  seo: { title: string | null; description: string | null }
  images: { nodes: ShopifyImage[] }
  options: { name: string; values: string[] }[]
  variants: {
    nodes: {
      id: string
      title: string
      availableForSale: boolean
      selectedOptions: { name: string; value: string }[]
      price: ShopifyMoney
      compareAtPrice: ShopifyMoney | null
      image: ShopifyImage | null
    }[]
  }
  collections: { nodes: { handle: string; title: string }[] }
  category: { name: string } | null
  attributes: ({
    key: string
    value: string
    type: string
    references: { nodes: { label?: { value: string } | null; color?: { value: string } | null }[] } | null
  } | null)[]
  care: { value: string } | null
  customSpecs: { value: string } | null
  inTheBox: { value: string } | null
  warranty: { value: string } | null
  highlights: { value: string } | null
  faq: { value: string } | null
  rating: { value: string } | null
  ratingCount: { value: string } | null
}

export type ProductOption = { name: string; values: string[] }

export type ProductVariant = {
  id: string
  title: string
  available: boolean
  /** Option name → value, e.g. { Color: "Oak", Size: "Large" }. */
  options: Record<string, string>
  price: Money
  compareAtPrice: Money | null
  image: Image | null
}

export type ProductAttribute = {
  key: string
  label: string
  values: { label: string; color: string | null }[]
}

export type ProductDetail = {
  id: string
  handle: string
  title: string
  vendor: string
  productType: string
  description: string
  descriptionHtml: string
  tags: string[]
  available: boolean
  seoTitle: string
  seoDescription: string
  images: Image[]
  /** Only options the shopper can choose (Shopify's single "Default Title" option is dropped). */
  options: ProductOption[]
  variants: ProductVariant[]
  collections: { handle: string; title: string }[]
  /** Shopify taxonomy category name, e.g. "Automatic Feeders". */
  category: string | null
  /** Category metafields (Color, Material, Animal type…), values as shown in the admin. */
  attributes: ProductAttribute[]
  /** custom.care_instructions metafield. */
  care: string | null
  /** Short selling points you write in Shopify (custom.highlights metafield). */
  highlights: string[]
  /**
   * Spec rows: your custom.specs lines first, then "Key: Value" specs found in the supplier
   * description (a label you set replaces the description's), then warranty and what's in the box.
   */
  specs: { label: string; value: string }[]
  /** Product-specific questions (custom.faq metafield). */
  faq: { q: string; a: string }[]
  /** From a review app's standard metafields; null until the product has reviews. */
  rating: { value: number; count: number } | null
}
