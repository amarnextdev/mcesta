import "server-only"

import { cacheLife, cacheTag } from "next/cache"

import { storefrontServerFetch } from "@/lib/shopify/client.server"
import { toImage } from "@/lib/shopify/mappers"

import type { Category, CategoryIcon, Department, FooterColumn, Navigation, NavLink, Subcategory } from "./types"
import { collectionHref, menuHrefForCollection } from "./urls"

/*
 * Navigation comes from Shopify (Online Store → Navigation), so the team edits it without a deploy:
 *
 *   storefront-main      level 1  department     → a collection       (Home Decor)
 *                        level 2  category       → a collection       (Lighting)
 *                        level 3  sub-category   → a collection       (Night lights)
 *                        level 2  popular link   → a non-collection link without children (e.g. /home-decor/all?sort=newest)
 *   storefront-footer    level 1  column title, level 2 its links
 *
 * Department icon and highlight: collection metafields `custom.nav_icon` / `custom.nav_highlight`.
 *
 * Empty collections are hidden (HIDE_EMPTY): a sub-category appears once it has a product, a
 * category once it or a sub-category has one, a department once anything in it has one.
 * Tiles use the collection image, or the photo of the collection's first product.
 */
export const MAIN_MENU_HANDLE = "storefront-main"
export const FOOTER_MENU_HANDLE = "storefront-footer"
/** Hide departments and categories that have no products yet. */
const HIDE_EMPTY = true

const ICONS: CategoryIcon[] = ["gifts", "decor", "furniture", "kitchen", "electronics", "fashion", "beauty", "sports", "pets", "books", "car", "for-you"]

type ShopifyImage = { url: string; altText: string | null; width: number | null; height: number | null }

type ShopifyMenuItem = {
  title: string
  type: string
  url: string | null
  resource: {
    __typename: string
    handle?: string
    image?: ShopifyImage | null
    products?: { nodes: { featuredImage: ShopifyImage | null }[] }
    icon?: { value: string } | null
    highlight?: { value: string } | null
  } | null
  items?: ShopifyMenuItem[]
}

type NavigationData = {
  main: { items: ShopifyMenuItem[] } | null
  footer: { items: ShopifyMenuItem[] } | null
}

const LINK_FIELDS = /* GraphQL */ `
  title
  type
  url
  resource {
    __typename
    ... on Collection {
      handle
      image { url altText width height }
      products(first: 1) { nodes { featuredImage { url altText width height } } }
      icon: metafield(namespace: "custom", key: "nav_icon") { value }
      highlight: metafield(namespace: "custom", key: "nav_highlight") { value }
    }
  }
`

const NAVIGATION_QUERY = /* GraphQL */ `
  query Navigation($main: String!, $footer: String!) {
    main: menu(handle: $main) {
      items { ${LINK_FIELDS} items { ${LINK_FIELDS} items { ${LINK_FIELDS} } } }
    }
    footer: menu(handle: $footer) {
      items { ${LINK_FIELDS} items { ${LINK_FIELDS} } }
    }
  }
`

const collectionOf = (item: ShopifyMenuItem) =>
  item.resource?.__typename === "Collection" && item.resource.handle ? item.resource : null

type MenuCollection = NonNullable<ReturnType<typeof collectionOf>>

const hasProducts = (c: MenuCollection) => (c.products?.nodes.length ?? 0) > 0

function imageOf(c: MenuCollection, label: string) {
  return toImage(c.image ?? c.products?.nodes[0]?.featuredImage ?? null, label)
}

/** Shopify menu URLs are absolute (store domain). Keep only the path, so links stay on this site. */
function toPath(url: string | null): string | null {
  if (!url || url === "#") return null
  try {
    const u = new URL(url, "https://store.local")
    return `${u.pathname}${u.search}${u.hash}`
  } catch {
    return null
  }
}

/** Where a menu link goes on this site: menu collections use their clean URL. */
function linkHref(item: ShopifyMenuItem, departments: Department[]): string | null {
  const collection = collectionOf(item)
  if (collection?.handle) return menuHrefForCollection(departments, collection.handle) ?? collectionHref(collection.handle)
  return toPath(item.url)
}

function toSubcategory(item: ShopifyMenuItem): Subcategory | null {
  const c = collectionOf(item)
  if (!c?.handle || (HIDE_EMPTY && !hasProducts(c))) return null
  return { label: item.title, slug: c.handle, image: imageOf(c, item.title) }
}

function toCategory(item: ShopifyMenuItem): Category | null {
  const c = collectionOf(item)
  if (!c?.handle) return null
  const subcategories = (item.items ?? []).map(toSubcategory).filter((x): x is Subcategory => x !== null)
  if (HIDE_EMPTY && !hasProducts(c) && subcategories.length === 0) return null
  const image = imageOf(c, item.title) ?? subcategories.find((x) => x.image)?.image ?? null
  return { label: item.title, slug: c.handle, image, subcategories }
}

function toDepartments(items: ShopifyMenuItem[]): Department[] {
  const departments: Department[] = []
  const pendingPopular: { department: Department; items: ShopifyMenuItem[] }[] = []

  for (const item of items) {
    const collection = collectionOf(item)
    if (!collection?.handle) continue // level 1 must be a collection
    const categories: Category[] = []
    const popular: ShopifyMenuItem[] = []

    for (const child of item.items ?? []) {
      if (collectionOf(child)) {
        const category = toCategory(child)
        if (category) categories.push(category)
      } else if (child.items?.length) {
        // A plain heading with collection links under it: treat those as categories.
        for (const x of child.items) {
          const category = toCategory(x)
          if (category) categories.push(category)
        }
      } else {
        popular.push(child)
      }
    }

    // Nothing to sell in this department yet: leave it out of the menu.
    if (HIDE_EMPTY && !hasProducts(collection) && categories.length === 0) continue

    const department: Department = {
      label: item.title,
      slug: collection.handle,
      icon: ICONS.find((i) => i === collection.icon?.value) ?? "for-you",
      highlight: collection.highlight?.value === "true",
      categories,
      popular: [],
    }
    departments.push(department)
    pendingPopular.push({ department, items: popular })
  }

  // Popular links can point at other menu collections, so resolve them once all departments exist.
  for (const { department, items: links } of pendingPopular) {
    department.popular = links.flatMap((l) => {
      const c = collectionOf(l)
      if (HIDE_EMPTY && c && !hasProducts(c)) return [] // promo collection with nothing in it yet
      const href = linkHref(l, departments)
      return href ? [{ label: l.title, href }] : []
    })
  }
  return departments
}

function toFooter(items: ShopifyMenuItem[], departments: Department[]): FooterColumn[] {
  return items.map((column) => ({
    title: column.title,
    links: (column.items ?? []).flatMap((l): NavLink[] => {
      const href = linkHref(l, departments)
      return href ? [{ label: l.title, href }] : []
    }),
  }))
}

/**
 * The store menu and footer, cached for a few minutes. Revalidate with the `navigation` tag
 * (Shopify webhook later).
 * A missing menu gives an empty list, so the site still renders.
 */
export async function getNavigation(): Promise<Navigation> {
  "use cache"
  // Short, so new categories show soon after their first product (instant once webhooks are in).
  cacheLife("minutes")
  cacheTag("navigation")

  const data = await storefrontServerFetch<NavigationData>({
    query: NAVIGATION_QUERY,
    variables: { main: MAIN_MENU_HANDLE, footer: FOOTER_MENU_HANDLE },
  })
  const departments = toDepartments(data.main?.items ?? [])
  return { departments, footer: toFooter(data.footer?.items ?? [], departments) }
}

/** Just the departments (most pages only need these). */
export async function getDepartments(): Promise<Department[]> {
  return (await getNavigation()).departments
}
