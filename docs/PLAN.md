# Mcesta build plan

Headless Shopify store. Next.js 16 (App Router, Cache Components) + TanStack Query + shadcn/ui (Radix, Nova) + Tailwind v4.
Each step ends with a manual test. Do not start the next step until the current one passes.

| Step | Scope | Manual test | Status |
|---|---|---|---|
| 1 | Project setup and packages | `pnpm dev`, localhost:3000 opens | Done |
| 2 | Design system: tokens, fonts, shadcn theme, logo, favicon | `/` looks like the design (`/design` style guide removed in cleanup) | Done |
| 3 | Data layer: env (zod), Shopify Storefront client (mock.shop), TanStack Query provider | Demo products list renders | Done |
| 4 | Shared UI: product card, price, rating, skeletons | Cards + skeleton states | Done |
| 5 | Layout: announcement bar, header, search, mega menu, footer, trust strip | Menu hover, mobile header | Done |
| 6 | Homepage sections + loading skeletons | Full homepage (6a hero + categories, 6b product rows, 6c collections + bundle, 6d Finn + promise, 6e newsletter) | Done |
| 7 | Collection page: filters, sort, tabs, pagination | 7a layout + tabs + sort (design), 7c filters + mobile filter sheet, 7d pagination | Done |
| 8 | Product page: gallery, variants, offers, delivery, FAQ, recommendations | Variant change updates price | 8a page + buy box done · 8b bought together, reviews, FAQ in review |
| 9 | Cart: server actions, cookie, drawer, cart page, checkout link | Add, qty, remove, checkout | 9a cart page done · 9b cart drawer in review |
| 10 | Search + no results | Search and empty state | |
| Later | Real Shopify store, Customer Account login, Supabase, webhooks | | |
