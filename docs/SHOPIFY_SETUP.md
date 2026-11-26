# Shopify connection plan

Headless Shopify + our Next.js frontend. Work one step at a time; tick a step only after its check passes.
**Who:** 🧑 = you in Shopify admin · 🤖 = Claude in code (or via the Shopify connector).

---

## Step 1 — API tokens ✅
- [x] 🧑 Install the Headless channel, create the "Mcesta Web" storefront
- [x] 🧑 Put the store domain + public/private tokens in `.env.local` (never in chat, never in git)
- [ ] 🧑 Storefront API permissions: products, collections, tags, inventory, cart (read/write), checkouts, metafields/metaobjects, customers (read)
- [ ] 🧑 Restart `pnpm dev`

**Check:** the site loads with no errors (empty pages are fine — the store has no products yet).

## Step 2 — Store basics
- [ ] 🧑 Settings → General: store name **Mcesta** (now "My Store 2"), store currency USD ✅
- [ ] 🧑 Settings → Store details: contact email, address, time zone
- [ ] 🧑 Settings → Markets: United States (primary, USD) + Canada (CAD)
- [ ] 🧑 Settings → Shipping: free US shipping over $50 (matches the site), standard rates below
- [ ] 🧑 Settings → Taxes and duties: turn on US + Canada tax collection
- [ ] 🧑 Settings → Payments: Shopify Payments (test mode for now) + PayPal
- [ ] 🧑 Settings → Policies: refund, privacy, terms, shipping (Shopify generates drafts)

**Check:** Settings has no red warnings.

## Step 3 — Collections (the menu)
- [x] 🧑 Sign in to the Shopify connector in Claude
- [x] 🤖 Start clean: Gifts → For new homeowners, Home Decor → Lighting → Night lights (others deleted; add as products arrive)
- [x] 🤖 Menus `storefront-main` and `storefront-footer`, menu icon metafields

### Category structure (3 levels)
Main category (header) → Category → Sub-category, e.g. **Home Decor → Lighting → Night lights**.
Start small and add categories as products come in. Empty ones are hidden automatically.

| Level | URL | Product tag (= collection handle) |
|---|---|---|
| Main category | `/pets` | `pets` |
| Category | `/pets/collars-and-leashes` | `collars-and-leashes` |
| Sub-category (only when needed) | `/pets/collars-and-leashes/airtag-collars` | `airtag-collars` |
| Listing tabs | `?tab=…` | `trending`, `bestseller`, `new`, `sale` |

**Tags are just the collection handles** (lowercase, words joined with `-`). No `dept:` / `cat:` prefixes:
the CJ listing screen drops everything before a `:`, so prefixed tags break.
Each collection is a smart collection with the rule "product tag is `<its handle>`".

**Adding a new category:** create a smart collection (condition: product tag is `<handle>`), publish it to the Headless channel, add it in Online Store → Navigation → storefront-main under its main category. Claude can do this through the Shopify connector.

### Navigation is managed in Shopify (no deploy needed)
Online Store → Navigation → **storefront-main**:
- Level 1 = main category (a collection, its handle is the URL).
- Level 2 = category (a collection). Level 3 under it = sub-categories (collections).
- Level 2 that is a plain link (not a collection, no children) = a "Popular" quick link.
- **storefront-footer**: level 1 = column title, level 2 = its links.
- Main category icon / highlight: collection → Metafields → **Menu icon** / **Menu highlight**.
- **Empty = hidden** (switch: `HIDE_EMPTY` in `src/lib/navigation/navigation.server.ts`).
- Tile photos: the collection image, or the photo of its first product.
- The site caches the menu for a few minutes (instant once the Shopify webhook is added in step 9).

## Step 4 — Products (CJ Dropshipping)
- [ ] 🧑 Install the CJdropshipping app, connect your CJ account
- [ ] 🧑 Set the pricing rule (e.g. CJ cost × 2–2.5) and import 10–15 products across departments
- [ ] 🧑 For each product: clean up the title, description, photos, product type and tags (`trending`, `bestseller`, `new`, `sale` drive the listing tabs)
- [ ] 🧑 Tag each product with its main category and category handles (see the table above)
- [ ] 🧑 Publish each product to the **Mcesta Web** channel

**Check:** products show on the home page shelves, listings, product page, and in search.

## Step 5 — Filters and custom data
- [ ] 🧑 Install **Search & Discovery** (free, by Shopify) → Filters: Availability, Price (+ Color/Size if you sell variants)
- [ ] 🧑 Settings → Custom data → Products → add `custom.faq` (JSON), with Storefront API access on
- [ ] 🧑 (Later, from the reviews app) `reviews.rating`, `reviews.rating_count` with Storefront API access on

**Check:** the listing filters show, and filtering by price changes the products.

## Step 6 — Code cleanup for the real store
- [x] 🤖 Remove the mock.shop-only code paths and the demo-data notes
- [ ] 🤖 Add `@inContext(country:)` to queries so Canadian shoppers see CAD
- [ ] 🤖 Set the checkout return URL and `NEXT_PUBLIC_SITE_URL`
- [ ] 🤖 Run `tsc` + a full click-through and fix whatever breaks with real data

**Check:** every page works on real data; no console errors.

## Step 7 — Test order end to end
- [ ] 🧑 Shopify Payments test mode (or the Bogus Gateway)
- [ ] 🧑🤖 Product → cart → checkout → pay with a test card
- [ ] 🧑 Order appears in Shopify admin **and** in the CJ app (auto-forward rule on)
- [ ] 🧑 Discount code works in the cart

**Check:** one full test order goes from our site to Shopify to CJ.

## Step 8 — Customer accounts
- [ ] 🧑 Headless → Customer Account API: copy the client ID and account URL into `.env.local`
- [ ] 🧑 Set up an https tunnel for dev (ngrok) and add its callback URL in Shopify
- [ ] 🤖 Build login/logout (OAuth + PKCE), and wire My orders, Order details and the account sidebar to real data

**Check:** log in, see the test order in My orders, open its details, log out.

## Step 9 — Analytics, SEO, launch
- [ ] 🤖 Shopify analytics events (`@shopify/hydrogen-react`) so Shopify reports fill in
- [ ] 🤖 Sitemap, robots.txt, product structured data
- [ ] 🤖 Remaining pages: Search, Track order, Policies (from Shopify), Help, About, 404
- [ ] 🧑 Custom domain on Vercel, plus `checkout.yourdomain.com` in Shopify
- [ ] 🧑 Remove the store password, switch payments to live

**Check:** a real order on the live domain.

## Countries, currency and the header country picker

- The picker lists the countries from **Shopify Markets** (Settings → Markets). Add a market there and it shows up in the header within an hour (cache `localization`).
- Which country a shopper sees: their own choice (cookie `mcesta_country`, 1 year) → their IP's country (`x-vercel-ip-country` on Vercel, `cf-ipcountry` on Cloudflare) → US. On `localhost` there is no IP header, so it starts at US; use the picker.
- Every catalog query runs with `@inContext(country:)`, so prices, currency and stock come from that market. The cart's `buyerIdentity.countryCode` is moved too when the shopper switches.
- A product only shows as in stock in a country when its shipping profile ships there from a location that has the stock (Settings → Shipping and delivery). Otherwise it shows as sold out in that country.
- Free-shipping thresholds per currency live in `src/features/cart/config.ts` (USD 50, CAD 70, GBP 40, INR 999). A currency that isn't listed gets no free-shipping bar. Keep them in line with your Shopify shipping rates.
- Currency conversion: Shopify converts automatically unless you set fixed prices per market (Markets → market → Products and pricing).
