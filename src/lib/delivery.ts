import { useEffect, useState } from "react"

/** Business days: order handling and carrier transit. Keep in line with the shipping policy. */
export const HANDLING_DAYS = [1, 2] as const
export const TRANSIT_DAYS = [3, 7] as const

export function addBusinessDays(from: Date, days: number) {
  const date = new Date(from)
  let left = days
  while (left > 0) {
    date.setDate(date.getDate() + 1)
    const day = date.getDay()
    if (day !== 0 && day !== 6) left--
  }
  return date
}

export const formatDay = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" })

export type DeliveryWindow = { today: string; ships: string; arrives: string }

export function deliveryWindow(today = new Date()): DeliveryWindow {
  const range = (a: number, b: number) => `${formatDay(addBusinessDays(today, a))}–${formatDay(addBusinessDays(today, b))}`
  return {
    today: formatDay(today),
    ships: range(HANDLING_DAYS[0], HANDLING_DAYS[1]),
    arrives: range(HANDLING_DAYS[0] + TRANSIT_DAYS[0], HANDLING_DAYS[1] + TRANSIT_DAYS[1]),
  }
}

/**
 * Delivery dates in the shopper's own time zone. null on the server and the first render,
 * so server HTML and hydration match; show a "3–7 business days" style fallback meanwhile.
 */
export function useDeliveryWindow(): DeliveryWindow | null {
  const [value, setValue] = useState<DeliveryWindow | null>(null)
  useEffect(() => setValue(deliveryWindow()), [])
  return value
}
