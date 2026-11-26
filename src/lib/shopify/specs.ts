/**
 * Product facts from data the product already has.
 * - Highlights: custom.highlights metafield, short lines you write in Shopify.
 * - Specs: the "Key: Value" spec lines suppliers (CJ) put in the description:
 *    "Material: Nylon <br>Size: 24 * 14 * 7.5cm <br>…". Only useful keys are kept, in a fixed order.
 */

export type Highlight = { label: string; value: string }

/** Keys worth showing, best first. Each entry: label to show + the description keys it matches. */
const SPEC_KEYS: { label: string; keys: string[] }[] = [
  { label: "Material", keys: ["material", "materials", "fabric", "material composition"] },
  { label: "Size", keys: ["size", "dimensions", "dimension", "product size", "item size"] },
  { label: "Capacity", keys: ["capacity", "volume"] },
  { label: "Weight", keys: ["weight", "net weight", "product weight"] },
  { label: "Power", keys: ["power", "power supply", "battery", "battery capacity", "voltage", "charging"] },
  { label: "Features", keys: ["features", "feature", "function", "functions"] },
  { label: "Style", keys: ["style"] },
  { label: "Suitable for", keys: ["applicable", "suitable for", "applicable people", "applicable pets"] },
  { label: "In the box", keys: ["packing list", "package content", "package contents", "package includes", "package list", "packing"] },
]

const MAX_VALUE = 70

function decode(text: string) {
  return text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
}

/** Description HTML → plain lines (one per <br> / paragraph). */
function toLines(html: string): string[] {
  return decode(
    html
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(p|div|li|h\d|tr)>/gi, "\n")
      .replace(/<[^>]+>/g, "")
  )
    .split("\n")
    .map((l) => l.replace(/\s+/g, " ").trim())
    .filter(Boolean)
}

function tidy(value: string) {
  const v = value.replace(/\s*\*\s*/g, " × ").replace(/\s+/g, " ").trim()
  const capped = v.length > MAX_VALUE ? `${v.slice(0, MAX_VALUE).replace(/[ ,;]+\S*$/, "")}…` : v
  return capped.charAt(0).toUpperCase() + capped.slice(1)
}

/** "Key: Value" pairs from a supplier description. A key with no value takes the next line. */
export function specsFromDescription(html: string): Highlight[] {
  const lines = toLines(html)
  const found = new Map<string, string>()

  lines.forEach((line, i) => {
    const match = /^([A-Za-z][A-Za-z /&()-]{1,32})\s*[:：]\s*(.*)$/.exec(line)
    if (!match) return
    const key = match[1].trim().toLowerCase()
    let value = match[2].trim()
    if (!value) {
      const next = lines[i + 1]
      if (next && !/[:：]/.test(next)) value = next
    }
    if (value && !found.has(key)) found.set(key, value)
  })

  return SPEC_KEYS.flatMap(({ label, keys }) => {
    const key = keys.find((k) => found.has(k))
    return key ? [{ label, value: tidy(found.get(key)!) }] : []
  })
}

/** custom.highlights metafield: JSON list of short lines ("Up to 30 hr battery life"). */
export function highlightsFromMetafield(raw: string | undefined): string[] {
  if (!raw) return []
  try {
    const list = JSON.parse(raw) as unknown
    if (!Array.isArray(list)) return []
    return list.flatMap((item) => (typeof item === "string" && item.trim() ? [item.trim()] : []))
  } catch {
    return []
  }
}

/** Parse a list metafield (JSON array of strings). */
export function stringList(raw: string | undefined): string[] {
  if (!raw) return []
  try {
    const list = JSON.parse(raw) as unknown
    return Array.isArray(list) ? list.flatMap((v) => (typeof v === "string" && v.trim() ? [v.trim()] : [])) : []
  } catch {
    return []
  }
}

/** "Label: Value" lines → rows. Lines without a colon are skipped. */
export function labelledLines(lines: string[]): Highlight[] {
  return lines.flatMap((line) => {
    const at = line.search(/[:：]/)
    if (at < 1) return []
    const label = line.slice(0, at).trim()
    const value = line.slice(at + 1).trim()
    return label && value ? [{ label, value }] : []
  })
}

/**
 * All spec rows for a product, one per label: your own rows, then the description's,
 * then warranty and what's in the box (yours replace the description's "In the box").
 */
export function buildSpecs(input: {
  custom: string | undefined
  descriptionHtml: string
  inTheBox: string | undefined
  warranty: string | undefined
}): Highlight[] {
  const rows: Highlight[] = []
  const seen = new Set<string>()
  const add = (row: Highlight) => {
    const key = row.label.toLowerCase()
    if (seen.has(key)) return
    seen.add(key)
    rows.push(row)
  }
  const box = stringList(input.inTheBox)
  if (box.length) seen.add("in the box")

  labelledLines(stringList(input.custom)).forEach(add)
  specsFromDescription(input.descriptionHtml).forEach(add)
  if (input.warranty?.trim()) add({ label: "Warranty", value: input.warranty.trim() })
  if (box.length) rows.push({ label: "In the box", value: box.join(", ") })
  return rows
}
