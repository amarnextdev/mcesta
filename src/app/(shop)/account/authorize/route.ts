import { NextResponse, type NextRequest } from "next/server"

import { completeLogin } from "@/features/account/customer-auth.server"

/** Shopify sends the shopper back here after login (register this URL in Shopify admin). */
export async function GET(request: NextRequest) {
  try {
    const returnTo = await completeLogin(request.nextUrl.searchParams)
    return NextResponse.redirect(new URL(returnTo, request.url))
  } catch (error) {
    console.error("[account] login callback", error)
    return NextResponse.redirect(new URL("/account/login?error=1", request.url))
  }
}
