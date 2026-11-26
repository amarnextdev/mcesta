# Roadmap: one step at a time

Each step ends with a **check**. We move on only when it passes.
🧑 = you · 🤖 = Claude

## Step 1 — Reviews working end to end
- 🧑 Put the Supabase secret key in `.env.local` (`SUPABASE_SERVICE_ROLE_KEY=sb_secret_...`), restart `pnpm dev`
- 🧑 Submit a review on a product page
- 🤖 Approve it in Supabase, confirm it shows on the page (stars, bars, list)
- **Check:** review visible on the product page; duplicate review from the same email is refused

## Step 2 — First test order
- 🧑 Product → cart → checkout → pay with "Testing order"
- 🤖 Confirm the order in Shopify; fix anything that breaks (cart, checkout redirect, shipping)
- **Check:** order in Shopify admin; not paid in CJ

## Step 3 — Search page (`/search`)
- 🤖 Search box → results page with filters/sort (Storefront `search`), predictive suggestions, empty state (canvas: Search, SearchEmpty)
- **Check:** searching "collar" finds the collar; no-results page looks right

## Step 4 — Policy pages (`/policies/...`)
- 🧑 Shopify → Settings → Policies: generate/edit Refund, Privacy, Terms, Shipping
- 🤖 Pages that read them from Shopify (canvas: PolicyShipping, PolicyReturns, PolicyPrivacy)
- **Check:** every footer policy link opens a real page

## Step 5 — Track order (`/track`)
- 🤖 Order number + email → status and tracking (canvas: TrackOrder)
- **Check:** the test order from step 2 can be looked up

## Step 6 — Homepage from real data
- 🤖 Replace hard-coded links: hero/deals/featured point at real categories, shelves show real products
- **Check:** no homepage link leads to a missing page

## Step 7 — Help/FAQ, About, 404
- 🤖 Simple, on-brand pages
- **Check:** footer and header links all work

## Step 8 — Customer login
- 🧑 Headless → Customer Account API: client ID + URL in `.env.local`; ngrok for dev
- 🤖 Login/logout, My orders, Order details with real data
- **Check:** log in, see the test order, log out

## Step 9 — Wishlist sync + ratings on cards
- 🤖 Wishlist saved to Supabase per customer; stars on product cards
- **Check:** wishlist the same on two browsers after login

## Step 10 — Launch
- 🧑 Domain, PayPal Business + Payoneer/Razorpay approved, store name "Mcesta", shipping rates, taxes
- 🤖 Vercel deploy, DNS (site + checkout subdomain), webhooks, analytics, sitemap/robots
- 🧑 Remove "Testing order" + store password, switch payments live
- **Check:** a real order on the live domain

## Alongside (any time)
- 🧑 List products from CJ (tell Claude the product first → categories + tags)
- 🧑 Apply for PayPal Business and Payoneer/Razorpay now (approval takes days)
