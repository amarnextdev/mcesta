import { Suspense } from "react"

import { getAvailableCountries, getCountry } from "@/lib/market/market.server"

import { CountryPicker } from "./country-picker"

async function CountrySelectorData() {
  const [countries, current] = await Promise.all([getAvailableCountries(), getCountry()])
  // One market only: nothing to choose.
  if (countries.length < 2) return null
  return <CountryPicker countries={countries} current={current} />
}

/**
 * Country / currency switcher in the header. Reads the shopper's cookie and IP, so it streams
 * in on its own and the rest of the header stays prerendered.
 */
export function CountrySelector() {
  return (
    <Suspense fallback={<span aria-hidden="true" className="inline-block h-11 w-11 md:w-[5.5rem]" />}>
      <CountrySelectorData />
    </Suspense>
  )
}
