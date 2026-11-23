/**
 * Store navigation and URL structure.
 *
 *   /                          For You (homepage)
 *   /{department}              e.g. /electronics            → department landing (banners + category tiles)
 *   /{department}/all          e.g. /electronics/all        → every product in the department (filters)
 *   /{department}/{category}   e.g. /electronics/smart-home → category products (filters)
 *   /collections/{handle}      promo / seasonal collections that aren't in the menu
 *   /products/{handle}         product page (one URL per product, whatever the category)
 *
 * Every department and category is backed by a Shopify collection. Its handle defaults to the
 * slug; set `collection` when the Shopify handle is different. Old `/collections/{handle}`
 * links to a department or category redirect to the new URL (see next.config.ts).
 * Later this can come from Shopify (Online Store → Navigation) via the Storefront `menu` query.
 */

export type NavLink = { label: string; href: string }

/** Icon keys for the category bar. Mapped to lucide icons in `category-icons.tsx`. */
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
  | "track"
  | "help"

export type Category = {
  label: string
  /** URL part: /{department}/{slug}. */
  slug: string
  /** Shopify collection handle, when it differs from the slug. */
  collection?: string
}

export type CategoryGroup = { title: string; categories: Category[] }

export type Department = {
  label: string
  /** URL part: /{slug}. */
  slug: string
  /** Shopify collection handle, when it differs from the slug. */
  collection?: string
  icon: CategoryIcon
  /** Seasonal focus (e.g. Gifts): terracotta icon. */
  highlight?: boolean
  /** Sub-categories, grouped (e.g. "Shop by type", "Shop by room"). */
  groups: CategoryGroup[]
  /** Quick links (bestsellers, new in, promos). Not categories, so no own URL level. */
  popular: NavLink[]
}

export const departments: Department[] = [
  {
    label: "Gifts",
    slug: "gifts",
    icon: "gifts",
    highlight: true,
    groups: [
      {
        title: "Gifts by person",
        categories: [
          { label: "For him", slug: "for-him" },
          { label: "For her", slug: "for-her" },
          { label: "For the host", slug: "for-the-host" },
          { label: "For pet lovers", slug: "for-pet-lovers" },
          { label: "For the home office", slug: "for-the-home-office" },
          { label: "For new homeowners", slug: "for-new-homeowners" },
        ],
      },
      {
        title: "Gifts by price",
        categories: [
          { label: "Under $25", slug: "under-25" },
          { label: "Under $50", slug: "under-50" },
          { label: "Under $100", slug: "under-100" },
          { label: "Gift sets and bundles", slug: "gift-sets-and-bundles" },
          { label: "Personalized gifts", slug: "personalized-gifts" },
        ],
      },
    ],
    popular: [
    ],
  },
  {
    label: "Home Decor",
    slug: "home-decor",
    icon: "decor",
    groups: [
      {
        title: "Shop by type",
        categories: [
          { label: "Vases and planters", slug: "vases-and-planters" },
          { label: "Candles and scents", slug: "candles-and-scents" },
          { label: "Wall art", slug: "wall-art" },
          { label: "Mirrors", slug: "mirrors" },
          { label: "Throws and pillows", slug: "throws-and-pillows" },
          { label: "Lighting", slug: "lighting" },
        ],
      },
    ],
    popular: [
      { label: "New in decor", href: "/home-decor/all?sort=newest" },
      { label: "Bestsellers", href: "/home-decor/all?tab=bestsellers" },
      { label: "Decor under $50", href: "/collections/decor-under-50" },
    ],
  },
  {
    label: "Furniture",
    slug: "furniture",
    icon: "furniture",
    groups: [
      {
        title: "Shop by room",
        categories: [
          { label: "Living room", slug: "living-room" },
          { label: "Bedroom", slug: "bedroom" },
          { label: "Home office", slug: "home-office" },
          { label: "Bar carts", slug: "bar-carts" },
          { label: "Storage and shelves", slug: "storage-and-shelves" },
          { label: "Outdoor", slug: "outdoor" },
        ],
      },
    ],
    popular: [
      { label: "New in furniture", href: "/furniture/all?sort=newest" },
      { label: "Bestsellers", href: "/furniture/all?tab=bestsellers" },
      { label: "Small-space picks", href: "/collections/small-space-picks" },
    ],
  },
  {
    label: "Kitchen",
    slug: "kitchen",
    icon: "kitchen",
    groups: [
      {
        title: "Shop by type",
        categories: [
          { label: "Kitchen and Bar", slug: "kitchen-and-bar" },
          { label: "Glassware", slug: "glassware" },
          { label: "Serveware", slug: "serveware" },
          { label: "Cookware", slug: "cookware" },
          { label: "Coffee and tea", slug: "coffee-and-tea" },
          { label: "Kitchen storage", slug: "kitchen-storage" },
        ],
      },
    ],
    popular: [
      { label: "Bar gift sets", href: "/collections/bar-gift-sets" },
      { label: "Bestsellers", href: "/kitchen/all?tab=bestsellers" },
      { label: "Kitchen under $50", href: "/collections/kitchen-under-50" },
    ],
  },
  {
    label: "Electronics",
    slug: "electronics",
    icon: "electronics",
    groups: [
      {
        title: "Shop by type",
        categories: [
          { label: "Phone accessories", slug: "phone-accessories" },
          { label: "Chargers and power banks", slug: "chargers-and-power-banks" },
          { label: "Headphones and speakers", slug: "headphones-and-speakers" },
          { label: "Smart home", slug: "smart-home" },
          { label: "Desk tech", slug: "desk-tech" },
          { label: "Cables and adapters", slug: "cables-and-adapters" },
        ],
      },
    ],
    popular: [
      { label: "New in tech", href: "/electronics/all?sort=newest" },
      { label: "Tech gifts", href: "/collections/tech-gifts" },
      { label: "Tech under $50", href: "/collections/tech-under-50" },
    ],
  },
  {
    label: "Fashion",
    slug: "fashion",
    icon: "fashion",
    groups: [
      {
        title: "Shop for",
        categories: [
          { label: "Men", slug: "men", collection: "mens-fashion" },
          { label: "Women", slug: "women", collection: "womens-fashion" },
          { label: "Kids", slug: "kids", collection: "kids-fashion" },
        ],
      },
      {
        title: "Shop by type",
        categories: [
          { label: "Bags and wallets", slug: "bags-and-wallets" },
          { label: "Watches", slug: "watches" },
          { label: "Jewelry", slug: "jewelry" },
          { label: "Sunglasses", slug: "sunglasses" },
          { label: "Scarves and hats", slug: "scarves-and-hats" },
          { label: "Belts", slug: "belts" },
        ],
      },
    ],
    popular: [
      { label: "New in fashion", href: "/fashion/all?sort=newest" },
      { label: "Gifts for her", href: "/collections/gifts-for-her" },
      { label: "Gifts for him", href: "/collections/gifts-for-him" },
    ],
  },
  {
    label: "Beauty",
    slug: "beauty",
    icon: "beauty",
    groups: [
      {
        title: "Tools and accessories",
        categories: [
          { label: "Makeup bags", slug: "makeup-bags" },
          { label: "Hair tools", slug: "hair-tools" },
          { label: "Vanity mirrors", slug: "vanity-mirrors" },
          { label: "Brushes", slug: "brushes" },
          { label: "Organizers", slug: "organizers" },
          { label: "Nail tools", slug: "nail-tools" },
        ],
      },
    ],
    popular: [
      { label: "New in beauty", href: "/beauty/all?sort=newest" },
      { label: "Beauty gift sets", href: "/collections/beauty-gift-sets" },
    ],
  },
  {
    label: "Sports",
    slug: "sports",
    icon: "sports",
    groups: [
      {
        title: "Shop by type",
        categories: [
          { label: "Fitness", slug: "fitness" },
          { label: "Yoga", slug: "yoga" },
          { label: "Water bottles", slug: "water-bottles" },
          { label: "Camping", slug: "camping" },
          { label: "Travel gear", slug: "travel-gear" },
        ],
      },
    ],
    popular: [
      { label: "New in sports", href: "/sports/all?sort=newest" },
      { label: "Fitness gifts", href: "/collections/fitness-gifts" },
    ],
  },
  {
    label: "Pets",
    slug: "pets",
    icon: "pets",
    groups: [
      {
        title: "Shop by type",
        categories: [
          { label: "Beds and blankets", slug: "beds-and-blankets" },
          { label: "Bowls and feeders", slug: "bowls-and-feeders" },
          { label: "Toys", slug: "toys" },
          { label: "Walk and travel", slug: "walk-and-travel" },
        ],
      },
    ],
    popular: [
      { label: "New in pets", href: "/pets/all?sort=newest" },
      { label: "Gifts for pet lovers", href: "/collections/gifts-for-pet-lovers" },
    ],
  },
  {
    label: "Books",
    slug: "books",
    icon: "books",
    groups: [
      {
        title: "Shop by type",
        categories: [
          { label: "Journals and notebooks", slug: "journals-and-notebooks" },
          { label: "Planners", slug: "planners" },
          { label: "Pens", slug: "pens" },
          { label: "Coffee table books", slug: "coffee-table-books" },
          { label: "Bookends", slug: "bookends" },
          { label: "Desk accessories", slug: "desk-accessories" },
        ],
      },
    ],
    popular: [
      { label: "New in stationery", href: "/books/all?sort=newest" },
      { label: "Stationery gifts", href: "/collections/stationery-gifts" },
    ],
  },
]

/** First item of the category bar: the homepage. */
export const forYouLink = { label: "For You", href: "/", icon: "for-you" as CategoryIcon }

// ---- URLs ----

export const departmentHref = (d: Department) => `/${d.slug}`
/** Product list of the whole department (filters + grid). */
export const departmentAllHref = (d: Department) => `/${d.slug}/all`
/** URL part reserved for the department product list. Don't use it as a category slug. */
export const ALL_SLUG = "all"
export const categoryHref = (d: Department, c: Category) => `/${d.slug}/${c.slug}`
export const collectionHref = (handle: string) => `/collections/${handle}`

/** Shopify collection behind a department or category. */
export const collectionHandle = (item: Department | Category) => item.collection ?? item.slug

export function getDepartment(slug: string): Department | null {
  return departments.find((d) => d.slug === slug) ?? null
}

export function getCategory(department: Department, slug: string): Category | null {
  return allCategories(department).find((c) => c.slug === slug) ?? null
}

/** All categories of a department, in menu order, without duplicates. */
export function allCategories(department: Department): Category[] {
  return department.groups
    .flatMap((g) => g.categories)
    .filter((c, i, all) => all.findIndex((x) => x.slug === c.slug) === i)
}

/**
 * Where a Shopify collection lives in the menu, as a URL.
 * Used to redirect old /collections/{handle} links to /{department}/{category}.
 */
export function menuHrefForCollection(handle: string): string | null {
  for (const d of departments) {
    if (collectionHandle(d) === handle) return departmentAllHref(d)
    const c = allCategories(d).find((x) => collectionHandle(x) === handle)
    if (c) return categoryHref(d, c)
  }
  return null
}

/** Department (and category) that a Shopify collection belongs to in the menu, if any. */
export function menuPlaceOfCollection(handle: string): { department: Department; category: Category | null } | null {
  for (const d of departments) {
    const c = allCategories(d).find((x) => collectionHandle(x) === handle)
    if (c) return { department: d, category: c }
  }
  for (const d of departments) if (collectionHandle(d) === handle) return { department: d, category: null }
  return null
}

export const utilityLinks: (NavLink & { icon: CategoryIcon })[] = [
  { label: "Track order", href: "/track", icon: "track" },
  { label: "Help", href: "/help", icon: "help" },
]

export const footerNav: { title: string; links: NavLink[] }[] = [
  {
    title: "Shop",
    links: [
      { label: "Gifts", href: "/gifts" },
      { label: "Home Decor", href: "/home-decor" },
      { label: "Furniture", href: "/furniture" },
      { label: "Kitchen", href: "/kitchen" },
      { label: "Pets", href: "/pets" },
      { label: "Gift sets", href: "/gifts/gift-sets-and-bundles" },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "Track your order", href: "/track" },
      { label: "Shipping", href: "/policies/shipping" },
      { label: "Returns and refunds", href: "/policies/returns" },
      { label: "FAQ", href: "/help" },
      { label: "Contact us", href: "/help#contact" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Our story", href: "/about" },
      { label: "Privacy policy", href: "/policies/privacy" },
      { label: "Terms of service", href: "/policies/terms" },
    ],
  },
]
