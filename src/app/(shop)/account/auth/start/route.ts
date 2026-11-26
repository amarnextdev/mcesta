import { NextResponse, type NextRequest } from "next/server"

import { customerLoginConfigured, loginUrl, refreshSession, safeReturnTo } from "@/features/account/customer-auth.server"

/** /account/auth/start?returnTo=/account/orders → silent refresh if possible, else Shopify's login page. */
export async function GET(request: NextRequest) {
  const returnTo = safeReturnTo(request.nextUrl.searchParams.get("returnTo"))
  if (!customerLoginConfigured) return NextResponse.redirect(new URL("/account/login", request.url))
  if (await refreshSession()) return NextResponse.redirect(new URL(returnTo, request.url))
  try {
    return NextResponse.redirect(await loginUrl(returnTo))
  } catch (error) {
    console.error("[account] login start", error)
    return NextResponse.redirect(new URL("/account/login?error=1", request.url))
  }
}
