# Reviews and Q&A (Supabase)

Project: **mcesta** (Supabase, us-west-2). Tables live in `public`; only the Next.js server reads and
writes them, with the service-role key. RLS is on with no public policies, and `anon`/`authenticated`
have no grants, so the public API can't read emails or post reviews directly.

| Table / view | What |
|---|---|
| `reviews` | rating, title, body, author name, **private** email, verified buyer, photos, status |
| `questions` | question, private email, answer, status |
| `product_review_stats` | per product: count, average, 1–5 star counts (approved reviews only) |

## Flow
1. A shopper submits the form on the product page → row saved as **pending** (one review per email per product).
2. You moderate in Supabase → **Table Editor**:
   - review: set `status` to `approved` (or `rejected`).
   - question: write the `answer`, set `status` to `approved`.
3. The product page shows it within a few minutes (cached; tag `reviews:{productId}`).
   Rating, star bars, product JSON-LD (`aggregateRating`) and the rating next to the title use these numbers.

## Code
- `src/lib/supabase/admin.ts` — server-only client (service role), typed with the generated types.
- `src/lib/supabase/database.types.ts` — generated from the schema; **regenerate after every schema change** (Claude: Supabase MCP `generate_typescript_types`).
- `src/features/reviews/reviews.server.ts` — read (cached) and create.
- `src/features/product/actions.ts` — form actions (zod + honeypot).

## Env (`.env.local`, never commit)
```
NEXT_PUBLIC_SUPABASE_URL=https://oupaazlibvgursijgizf.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<Project Settings → API keys → service_role / secret key>
```

## Database changes
SQL migrations through the Supabase MCP / CLI (no ORM). Every table: RLS on, explicit grants, then run the security advisor.

## Later
- Verified buyer: check the email against Shopify orders (Admin API) when saving.
- Photos: Supabase Storage bucket, uploaded through the server.
- Ratings on product cards: sync the average into the Shopify `reviews.rating` metafield on approval.
- Admin moderation page instead of the Table Editor.

## Wishlist (`wishlist_items`)
- Owner: `guest:<uuid>` from the httpOnly cookie `mcesta_wishlist` (1 year). After customer login: `customer:<id>`, guest rows merged.
- Stores product id/handle and the price when saved; the list is returned with live Shopify prices ("Price dropped" badges).
- Code: `src/features/wishlist/wishlist.server.ts` (Supabase), `actions.ts`, `store.ts` (`useWishlist`, TanStack Query with optimistic updates).
- Max 100 items per owner.
