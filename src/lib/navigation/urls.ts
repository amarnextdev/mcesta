import type { Category, Department, Subcategory } from "./types"

/*
 * URL structure (departments and categories come from the Shopify menu):
 *
 *   /                                      For You (homepage)
 *   /{department}                          /home-decor                    → landing (banners + category tiles)
 *   /{department}/all                      /home-decor/all                → every product in the department
 *   /{department}/{category}               /home-decor/lighting           → category products (filters)
 *   /{department}/{category}/{sub}         /home-decor/lighting/night-lights → sub-category products
 *   /collections/{handle}                  promo / seasonal collections that aren't in the menu
 *   /products/{handle}                     product page (one URL per product)
 *
 * Every level uses its Shopify collection handle as the URL part.
 */

/** URL part reserved for the department product list. Don't use it as a collection handle. */
export const ALL_SLUG = "all"

export const departmentHref = (d: Department) => `/${d.slug}`
/** Product list of the whole department (filters + grid). */
export const departmentAllHref = (d: Department) => `/${d.slug}/${ALL_SLUG}`
export const categoryHref = (d: Department, c: Category) => `/${d.slug}/${c.slug}`
export const subcategoryHref = (d: Department, c: Category, s: Subcategory) => `/${d.slug}/${c.slug}/${s.slug}`
export const collectionHref = (handle: string) => `/collections/${handle}`

export function getDepartment(departments: Department[], slug: string): Department | null {
  return departments.find((d) => d.slug === slug) ?? null
}

export function getCategory(department: Department, slug: string): Category | null {
  return department.categories.find((c) => c.slug === slug) ?? null
}

export function getSubcategory(category: Category, slug: string): Subcategory | null {
  return category.subcategories.find((s) => s.slug === slug) ?? null
}

export type MenuPlace = { department: Department; category: Category | null; subcategory: Subcategory | null }

/** Where a Shopify collection sits in the menu (deepest match first), if anywhere. */
export function menuPlaceOfCollection(departments: Department[], handle: string): MenuPlace | null {
  for (const department of departments) {
    for (const category of department.categories) {
      const subcategory = getSubcategory(category, handle)
      if (subcategory) return { department, category, subcategory }
    }
  }
  for (const department of departments) {
    const category = getCategory(department, handle)
    if (category) return { department, category, subcategory: null }
  }
  const department = getDepartment(departments, handle)
  return department ? { department, category: null, subcategory: null } : null
}

/** Menu URL of a collection at a place. */
export function placeHref({ department, category, subcategory }: MenuPlace): string {
  if (category && subcategory) return subcategoryHref(department, category, subcategory)
  if (category) return categoryHref(department, category)
  return departmentAllHref(department)
}

/** Menu URL of a Shopify collection, or null if it isn't in the menu. */
export function menuHrefForCollection(departments: Department[], handle: string): string | null {
  const place = menuPlaceOfCollection(departments, handle)
  return place ? placeHref(place) : null
}

/** Every collection handle that belongs to a department tab (itself, its categories and sub-categories). */
export function departmentHandles(department: Department): string[] {
  return [
    department.slug,
    ...department.categories.flatMap((c) => [c.slug, ...c.subcategories.map((s) => s.slug)]),
  ]
}
