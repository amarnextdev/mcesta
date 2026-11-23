# Folder structure

```
src/
  app/                    routes only (thin): pages, layouts, loading.tsx, route handlers
    (shop)/               customer pages sharing header + footer
    account/              login, orders, wishlist (later)
    api/                  webhooks, cron (later)
  components/
    ui/                   shadcn primitives, themed to Mcesta (do not put business logic here)
    brand/                logo
    layout/               header, mega menu, footer, trust strip
    shared/               small reusable pieces: container, price, rating, empty state
    skeletons/            loading placeholders that mirror real components
  features/<name>/        one folder per feature: components, queries (queryOptions), hooks, actions, types
  lib/
    shopify/              Storefront client, fragments, queries, mutations, types, mappers
    query/                TanStack QueryClient factory and shared helpers
    config/               site config, env validation
    utils.ts              cn and small helpers
  providers/              client providers (QueryProvider)
public/brand/             logo files
```

Rules
- Routes stay thin. Data fetching lives in `features/*/queries.ts` or `lib/shopify`.
- Server and client share one `queryOptions` per query so keys always match.
- Every route that fetches data has a `loading.tsx` or a `<Suspense>` with a skeleton.
- Secrets never use the `NEXT_PUBLIC_` prefix. Server-only modules import `server-only`.

## URL structure

| URL | Page | Source |
|---|---|---|
| `/` | For You (homepage) | `app/(shop)/page.tsx` |
| `/{department}` | Department landing: banners + category tiles. Opened from the homepage. e.g. `/electronics` | `app/(shop)/[department]/page.tsx` |
| `/{department}/all` | Every product in the department, with filters. The header opens this when you're already browsing products | `app/(shop)/[department]/all` |
| `/{department}/{category}` | Category products. e.g. `/electronics/smart-home` | `app/(shop)/[department]/[category]` |
| `/collections` | Every collection | `app/(shop)/collections/page.tsx` |
| `/collections/all` | Every product | `app/(shop)/collections/[handle]` |
| `/collections/{handle}` | Promo / seasonal collections not in the menu. e.g. `/collections/tech-gifts` | `app/(shop)/collections/[handle]` |
| `/products/{handle}` | Product page (Step 8). One URL per product, whatever category it's in | — |
| `/search`, `/cart`, `/track`, `/help`, `/policies/{handle}`, `/account/*` | Later steps | — |

- Departments and categories are defined once in `lib/config/navigation.ts` (slug + Shopify collection handle).
  Everything else (category bar, mobile menu, tiles, breadcrumbs, redirects, static params) is generated from it.
- Old `/collections/{handle}` links to a menu collection redirect (308) to the clean URL — see `next.config.ts`.
- Sort, tab and paging live in the query string (`?sort=price-asc&tab=sale`). The canonical URL never includes them.
- Unknown department or category slugs return a 404. `all` is reserved (never a category slug).
- On product-list pages the header is compact (no offer bar, no icons), its department links go to `/{department}/all`, and hovering a department (desktop) shows a dropdown with its categories. Page type comes from a hidden `<PageType>` marker in each route layout + CSS variants (`listing-page:`, `product-page:`, `header-compact:` in globals.css), so the header never calls usePathname for layout.
