import "server-only"

import { createHash, randomBytes } from "node:crypto"
import { cookies, headers } from "next/headers"

import { publicEnv } from "@/lib/config/env"

/*
 * Shopify Customer Account API login: OAuth 2.0 + PKCE (public client), passwordless
 * (email + 6-digit code on Shopify's page). Tokens live in an httpOnly cookie; the browser's
 * JavaScript never sees them.
 *
 * Env: SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID (Shopify admin → Sales channels → Headless →
 * Customer Account API → Client ID). Callback URL to register: {your site}/account/authorize
 */

const CLIENT_ID = process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID?.trim() || ""
const SESSION_COOKIE = "mcesta_customer"
const FLOW_COOKIE = "mcesta_customer_flow"
const SCOPES = "openid email customer-account-api:full"

export const customerLoginConfigured = Boolean(CLIENT_ID)

type Session = { accessToken: string; refreshToken: string; expiresAt: number; idToken: string | null }
type Flow = { state: string; nonce: string; verifier: string; returnTo: string }

type Endpoints = { authorize: string; token: string; logout: string; graphql: string }

let endpoints: Promise<Endpoints> | null = null

/** Shopify's login URLs for this store, from its discovery documents (cached per server). */
function discover(): Promise<Endpoints> {
  endpoints ??= (async () => {
    const base = `https://${publicEnv.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN}`
    const [openid, api] = await Promise.all([
      fetch(`${base}/.well-known/openid-configuration`).then((r) => r.json()),
      fetch(`${base}/.well-known/customer-account-api`).then((r) => r.json()),
    ])
    return {
      authorize: openid.authorization_endpoint as string,
      token: openid.token_endpoint as string,
      logout: openid.end_session_endpoint as string,
      graphql: api.graphql_api as string,
    }
  })().catch((error) => {
    endpoints = null
    throw error
  })
  return endpoints
}

const base64url = (buf: Buffer) => buf.toString("base64url")

/**
 * This site's origin, used for the login redirect URLs (they must match Shopify's settings exactly).
 * NEXT_PUBLIC_SITE_URL wins when set (production: one fixed URL, whatever Vercel URL was used);
 * otherwise the request's host (local tunnels).
 */
export async function siteOrigin() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "")
  if (configured && !configured.includes("localhost")) return configured
  const h = await headers()
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000"
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https")
  return `${proto}://${host}`
}

const cookieOptions = (maxAge: number) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge,
})

/** Only same-site paths after login (no open redirects). */
export function safeReturnTo(value: string | null | undefined) {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : "/account/orders"
}

/** Login failure with a short reason code (shown on the login page to help debugging). */
export class LoginError extends Error {
  constructor(
    readonly reason: "shopify" | "cookie" | "state" | "token",
    message: string
  ) {
    super(message)
  }
}

// ---- Session ----

async function readSession(): Promise<Session | null> {
  const raw = (await cookies()).get(SESSION_COOKIE)?.value
  if (!raw) return null
  try {
    return JSON.parse(raw) as Session
  } catch {
    return null
  }
}

async function saveSession(session: Session) {
  ;(await cookies()).set(SESSION_COOKIE, JSON.stringify(session), cookieOptions(60 * 60 * 24 * 30))
}

/** Valid access token, or null (logged out / expired; pages then show "Log in"). */
export async function accessToken(): Promise<string | null> {
  const session = await readSession()
  if (!session) return null
  return session.expiresAt > Date.now() + 30_000 ? session.accessToken : null
}

// ---- Login flow (route handlers only: they set cookies) ----

type TokenResponse = { access_token: string; refresh_token: string; expires_in: number; id_token?: string }

async function tokenRequest(body: Record<string, string>): Promise<TokenResponse> {
  const { token } = await discover()
  const res = await fetch(token, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Origin: await siteOrigin(),
      "User-Agent": "Mcesta storefront",
    },
    body: new URLSearchParams({ client_id: CLIENT_ID, ...body }),
  })
  if (!res.ok) throw new LoginError("token", `Token request failed: ${res.status} ${await res.text()}`)
  return res.json()
}

function toSession(t: TokenResponse, previous?: Session | null): Session {
  return {
    accessToken: t.access_token,
    refreshToken: t.refresh_token,
    expiresAt: Date.now() + t.expires_in * 1000,
    idToken: t.id_token ?? previous?.idToken ?? null,
  }
}

/** Silent re-login with the refresh token. True when the shopper is logged in again. */
export async function refreshSession(): Promise<boolean> {
  const session = await readSession()
  if (!session?.refreshToken) return false
  try {
    const t = await tokenRequest({ grant_type: "refresh_token", refresh_token: session.refreshToken })
    await saveSession(toSession(t, session))
    return true
  } catch {
    return false
  }
}

/** Start: remember state + PKCE verifier, then send the shopper to Shopify's login page. */
export async function loginUrl(returnTo: string): Promise<string> {
  const { authorize } = await discover()
  const verifier = base64url(randomBytes(32))
  const flow: Flow = {
    state: base64url(randomBytes(16)),
    nonce: base64url(randomBytes(16)),
    verifier,
    returnTo: safeReturnTo(returnTo),
  }
  ;(await cookies()).set(FLOW_COOKIE, JSON.stringify(flow), cookieOptions(60 * 10))

  const url = new URL(authorize)
  url.search = new URLSearchParams({
    client_id: CLIENT_ID,
    scope: SCOPES,
    response_type: "code",
    redirect_uri: `${await siteOrigin()}/account/authorize`,
    state: flow.state,
    nonce: flow.nonce,
    code_challenge: base64url(createHash("sha256").update(verifier).digest()),
    code_challenge_method: "S256",
  }).toString()
  return url.toString()
}

/** Callback: check state, swap the code for tokens, save the session. Returns where to go next. */
export async function completeLogin(params: URLSearchParams): Promise<string> {
  const jar = await cookies()
  const raw = jar.get(FLOW_COOKIE)?.value
  jar.delete(FLOW_COOKIE)
  const flow = raw ? (JSON.parse(raw) as Flow) : null
  const code = params.get("code")
  if (params.get("error")) throw new LoginError("shopify", `${params.get("error")}: ${params.get("error_description") ?? ""}`)
  if (!flow) throw new LoginError("cookie", "Login cookie missing (blocked, expired, or a different domain)")
  if (!code || params.get("state") !== flow.state) throw new LoginError("state", "State mismatch or no code")

  const t = await tokenRequest({
    grant_type: "authorization_code",
    redirect_uri: `${await siteOrigin()}/account/authorize`,
    code,
    code_verifier: flow.verifier,
  })
  await saveSession(toSession(t))
  return flow.returnTo
}

/** Log out here, then at Shopify (so the next login asks for the code again). */
export async function logoutUrl(): Promise<string> {
  const session = await readSession()
  ;(await cookies()).delete(SESSION_COOKIE)
  const home = `${await siteOrigin()}/`
  if (!session?.idToken) return home
  try {
    const { logout } = await discover()
    const url = new URL(logout)
    url.search = new URLSearchParams({ id_token_hint: session.idToken, post_logout_redirect_uri: home }).toString()
    return url.toString()
  } catch {
    return home
  }
}

// ---- API ----

/** Customer Account GraphQL request for the logged-in shopper. null = not logged in. */
export async function customerFetch<T>(query: string, variables: Record<string, unknown> = {}): Promise<T | null> {
  const token = await accessToken()
  if (!token) return null
  const { graphql } = await discover()
  const res = await fetch(graphql, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: token },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  })
  if (res.status === 401) return null
  if (!res.ok) throw new Error(`Customer Account API ${res.status}`)
  const json = (await res.json()) as { data?: T; errors?: { message: string }[] }
  if (json.errors?.length) throw new Error(json.errors.map((e) => e.message).join("; "))
  return json.data ?? null
}

/** Has this browser logged in (even if the access token needs a refresh)? Cheap: cookie only. */
export async function hasSession(): Promise<boolean> {
  return customerLoginConfigured && Boolean((await readSession())?.refreshToken)
}
