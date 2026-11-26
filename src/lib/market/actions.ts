"use server"

import { cookies } from "next/headers"
import { z } from "zod"

import { setCartCountry } from "@/features/cart/cart.server"

import { COUNTRY_COOKIE, COUNTRY_COOKIE_MAX_AGE } from "./countries"
import { isAvailableCountry } from "./market.server"

const countryInput = z.string().regex(/^[A-Z]{2}$/)

/** Shopper picked a country: remember it and move their cart there (prices + currency follow). */
export async function setCountryAction(code: string) {
  const parsed = countryInput.safeParse(code)
  if (!parsed.success || !(await isAvailableCountry(parsed.data))) {
    return { ok: false as const, error: "We don't ship to that country yet." }
  }

  ;(await cookies()).set(COUNTRY_COOKIE, parsed.data, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COUNTRY_COOKIE_MAX_AGE,
  })

  try {
    await setCartCountry(parsed.data)
  } catch (error) {
    // The country still changes; the cart catches up on checkout.
    console.error("[market] cart country update failed", error)
  }
  return { ok: true as const }
}
