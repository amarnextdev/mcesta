import { NextResponse, type NextRequest } from "next/server"

/*
 * Keeps a logged-in shopper logged in: when their Shopify access token is about to expire,
 * swap the refresh token for a new one before the page renders (pages and the header can read
 * cookies but not write them, so this has to happen here).
 * Same cookie and format as src/features/account/customer-auth.server.ts.
 */

const SESSION_COOKIE = "mcesta_customer"
const CLIENT_ID = process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID?.trim() || ""
const STORE_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN?.trim() || ""
const REFRESH_EARLY = 2 * 60_000

type Session = { accessToken: string; refreshToken: string; expiresAt: number; idToken: string | null }

let tokenEndpoint: Promise<string> | null = null
function getTokenEndpoint() {
  tokenEndpoint ??= fetch(`https://${STORE_DOMAIN}/.well-known/openid-configuration`)
    .then((r) => r.json())
    .then((c: { token_endpoint: string }) => c.token_endpoint)
    .catch((error) => {
      tokenEndpoint = null
      throw error
    })
  return tokenEndpoint
}

function siteOrigin(request: NextRequest) {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "")
  return configured && !configured.includes("localhost") ? configured : request.nextUrl.origin
}

/** New session, null when Shopify says the refresh token is no longer valid, undefined on a network hiccup. */
async function refresh(session: Session, origin: string): Promise<Session | null | undefined> {
  try {
    const res = await fetch(await getTokenEndpoint(), {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", Origin: origin, "User-Agent": "Mcesta storefront" },
      body: new URLSearchParams({ client_id: CLIENT_ID, grant_type: "refresh_token", refresh_token: session.refreshToken }),
    })
    if (res.status === 400 || res.status === 401) return null
    if (!res.ok) return undefined
    const t = (await res.json()) as { access_token: string; refresh_token: string; expires_in: number; id_token?: string }
    return {
      accessToken: t.access_token,
      refreshToken: t.refresh_token,
      expiresAt: Date.now() + t.expires_in * 1000,
      idToken: t.id_token ?? session.idToken,
    }
  } catch {
    return undefined
  }
}

export async function proxy(request: NextRequest) {
  const raw = request.cookies.get(SESSION_COOKIE)?.value
  if (!raw || !CLIENT_ID) return NextResponse.next()

  let session: Session
  try {
    session = JSON.parse(raw) as Session
  } catch {
    return NextResponse.next()
  }
  if (!session.refreshToken || session.expiresAt > Date.now() + REFRESH_EARLY) return NextResponse.next()

  const fresh = await refresh(session, siteOrigin(request))
  if (fresh === undefined) return NextResponse.next()

  if (fresh === null) {
    // Logged out at Shopify (or refresh token expired): drop the stale session.
    request.cookies.delete(SESSION_COOKIE)
    const res = NextResponse.next({ request: { headers: request.headers } })
    res.cookies.delete(SESSION_COOKIE)
    return res
  }

  const value = JSON.stringify(fresh)
  // Visible to this render (request) and saved in the browser (response).
  request.cookies.set(SESSION_COOKIE, value)
  const res = NextResponse.next({ request: { headers: request.headers } })
  res.cookies.set(SESSION_COOKIE, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  })
  return res
}

export const config = {
  // Pages only: skip Next internals, API routes, static files and the login routes themselves.
  matcher: ["/((?!_next/|api/|account/auth|account/authorize|account/logout|.*\\..*).*)"],
}
