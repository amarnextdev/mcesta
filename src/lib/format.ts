import type { Money } from "@/lib/shopify/types"

const formatters = new Map<string, Intl.NumberFormat>()

/** "$59" for whole amounts, "$59.50" otherwise. */
export function formatMoney({ amount, currencyCode }: Money, locale = "en-US"): string {
  const whole = Number.isInteger(amount)
  const key = `${locale}|${currencyCode}|${whole}`
  let f = formatters.get(key)
  if (!f) {
    f = new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: whole ? 0 : 2,
      maximumFractionDigits: 2,
    })
    formatters.set(key, f)
  }
  return f.format(amount)
}
