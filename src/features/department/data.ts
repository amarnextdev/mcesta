import {
  allCategories,
  categoryHref,
  collectionHandle,
  departmentAllHref,
  type Category,
  type Department,
  type NavLink,
} from "@/lib/config/navigation"

/**
 * Department landing content (banners + "shop for" tiles).
 * Hardcoded for now; later a Shopify metaobject `department_page` per department.
 */

export type DepartmentBanner = {
  eyebrow: string
  title: string
  subtitle: string
  cta: string
  href: string
  /** Wide photo (about 16:7). Leave empty for the coloured placeholder. */
  imageUrl?: string
  theme: { bg: string; fg: string; accent: string }
}

const themes: DepartmentBanner["theme"][] = [
  { bg: "#F3EEE6", fg: "#1F2A2E", accent: "#A84B26" },
  { bg: "#B4532C", fg: "#FAF7F2", accent: "#F7E3D8" },
  { bg: "#E3EFEC", fg: "#1F2A2E", accent: "#1F5C5A" },
  { bg: "#1F2A2E", fg: "#F3EEE6", accent: "#E79A76" },
]

/** Categories shown as large photo tiles (Flipkart-style Men / Women / Kids), by category slug. */
const shopFor: Record<string, string[]> = {
  fashion: ["men", "women", "kids"],
}

/** Hand-written banners per department. Departments without one get sensible defaults. */
const customBanners: Record<string, Omit<DepartmentBanner, "theme">[]> = {
  fashion: [
    { eyebrow: "Autumn Winter '26", title: "Layer up in style", subtitle: "Scarves, hats and cozy accessories", cta: "Shop the edit", href: "/fashion/scarves-and-hats" },
    { eyebrow: "Don't miss out", title: "Watches and jewelry", subtitle: "Gift-ready pieces under $50", cta: "Shop now", href: "/fashion/watches" },
    { eyebrow: "Shining deals", title: "Bags and wallets", subtitle: "Everyday carry, made to last", cta: "Explore", href: "/fashion/bags-and-wallets" },
  ],
}

export type DepartmentTile = NavLink & { /** Shopify collection, for its photo. */ collection: string }

function toTile(department: Department, c: Category): DepartmentTile {
  return { label: c.label, href: categoryHref(department, c), collection: collectionHandle(c) }
}

/** Sub-categories as small tiles: /{department}/{category}. Large "shop for" ones are left out. */
export function departmentTiles(department: Department): DepartmentTile[] {
  const big = shopFor[department.slug] ?? []
  return allCategories(department)
    .filter((c) => !big.includes(c.slug))
    .map((c) => toTile(department, c))
}

export function departmentShopFor(department: Department): DepartmentTile[] {
  const big = shopFor[department.slug] ?? []
  return allCategories(department)
    .filter((c) => big.includes(c.slug))
    .map((c) => toTile(department, c))
}

export function departmentBanners(department: Department): DepartmentBanner[] {
  const custom = customBanners[department.slug]
  const base = departmentAllHref(department)
  const find = (word: string) =>
    [...department.popular, ...departmentTiles(department)].find((l) => l.href.includes(word))?.href

  const list =
    custom ??
    [
      {
        eyebrow: "Just landed",
        title: `New in ${department.label}`,
        subtitle: "Fresh finds added this month",
        cta: "Shop new arrivals",
        href: `${base}?sort=newest`,
      },
      {
        eyebrow: "Customer favourites",
        title: `${department.label} bestsellers`,
        subtitle: "The pieces everyone's adding to cart",
        cta: "Shop bestsellers",
        href: `${base}?tab=bestsellers`,
      },
      {
        eyebrow: "Great value",
        title: "Under $50",
        subtitle: "Thoughtful finds that don't stretch the budget",
        cta: "Shop deals",
        href: find("under-50") ?? `${base}?tab=sale`,
      },
    ]

  return list.map((b, i) => ({ ...b, theme: themes[i % themes.length] }))
}
