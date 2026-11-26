import { NextResponse } from "next/server"

import { logoutUrl } from "@/features/account/customer-auth.server"

/** Sign out here and at Shopify, then back to the homepage. */
export async function GET() {
  return NextResponse.redirect(await logoutUrl())
}
