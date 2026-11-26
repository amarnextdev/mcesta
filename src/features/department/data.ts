import { categoryHref, departmentAllHref, type Department, type NavLink } from "@/lib/navigation"
import type { Image } from "@/lib/shopify/types"

/**
 * Department landing content. Category tiles come from the Shopify menu;
 * banners are generated, with hand-written ones for some departments (later a Shopify
 * metaobject `department_page` per department).
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

/** Hand-written banners per department slug. Departments without one get sensible defaults. */
const customBanners: Record<string, Omit<DepartmentBanner, "theme">[]> = {}

export type DepartmentTile = NavLink & { image: Image | null }

/** One tile per category: /{department}/{category}. */
export function departmentTiles(department: Department): DepartmentTile[] {
  return department.categories.map((c) => ({ label: c.label, href: categoryHref(department, c), image: c.image }))
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
