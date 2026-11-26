import type { Image } from "@/lib/shopify/types"

/** Icon keys for the category bar. Mapped to lucide icons in `components/layout/category-icons.tsx`. */
export type CategoryIcon =
  | "for-you"
  | "gifts"
  | "decor"
  | "furniture"
  | "kitchen"
  | "electronics"
  | "fashion"
  | "beauty"
  | "sports"
  | "pets"
  | "books"
  | "car"
  | "track"
  | "help"

export type NavLink = { label: string; href: string }

/** Third level, e.g. Home Decor → Lighting → **Night lights**. URL: /{department}/{category}/{slug}. */
export type Subcategory = {
  label: string
  /** The Shopify collection handle, also the URL part. */
  slug: string
  /** Collection image, or the photo of its first product. */
  image: Image | null
}

/** Second level, e.g. Home Decor → **Lighting**. URL: /{department}/{slug}. */
export type Category = Subcategory & {
  subcategories: Subcategory[]
}

/** First level (the category bar), e.g. **Home Decor**. URL: /{slug}. */
export type Department = {
  label: string
  /** The Shopify collection handle, also the URL part. */
  slug: string
  icon: CategoryIcon
  /** Seasonal focus (e.g. Gifts): terracotta icon. */
  highlight: boolean
  categories: Category[]
  /** Quick links (bestsellers, new in, promos). Not categories, so no own URL level. */
  popular: NavLink[]
}

export type FooterColumn = { title: string; links: NavLink[] }

export type Navigation = {
  departments: Department[]
  footer: FooterColumn[]
}
