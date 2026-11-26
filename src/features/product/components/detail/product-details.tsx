"use client"

import { useState } from "react"
import {
  BatteryChargingIcon,
  BluetoothIcon,
  CheckIcon,
  ChevronDownIcon,
  CupSodaIcon,
  DropletsIcon,
  GemIcon,
  LayersIcon,
  MinusIcon,
  PackageOpenIcon,
  PaletteIcon,
  PawPrintIcon,
  PlusIcon,
  RulerIcon,
  ShieldCheckIcon,
  SparklesIcon,
  TimerIcon,
  UsersIcon,
  WeightIcon,
  ZapIcon,
  type LucideIcon,
} from "lucide-react"

import type { ProductDetail } from "@/lib/shopify/types"
import { cn } from "@/lib/utils"

type Tab = "Description" | "Care" | "Shipping" | "Damage policy"

/** Rich text from the Shopify product editor, styled to match the site. */
const prose =
  "text-[0.9375rem] leading-[1.7] text-ink [&_a]:text-teal [&_a]:underline [&_h2]:mt-4 [&_h2]:mb-2 [&_h2]:text-lg [&_h3]:mt-4 [&_h3]:mb-1.5 [&_h3]:font-sans [&_h3]:text-base [&_h3]:font-bold [&_li]:mb-1 [&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-3 [&_table]:w-full [&_td]:border-b [&_td]:border-line-soft [&_td]:py-2 [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-5"

function Section({ title, open, onToggle, children }: { title: string; open: boolean; onToggle: () => void; children: React.ReactNode }) {
  const id = `pdp-${title.toLowerCase().replace(/\W+/g, "-")}`
  return (
    <div className="border-t border-line">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={onToggle}
        className="flex w-full items-center justify-between py-[18px] text-left text-[1.0625rem] font-bold"
      >
        {title}
        <span aria-hidden="true" className="grid size-8 place-items-center rounded-lg bg-sand">
          {open ? <MinusIcon className="size-4" /> : <PlusIcon className="size-4" />}
        </span>
      </button>
      {open && (
        <div id={id} className="pb-5">
          {children}
        </div>
      )}
    </div>
  )
}

type Row = { label: string; values: { label: string; color: string | null }[] }


/**
 * Specification rows, most specific first: Shopify category, category metafields (Color, Material…),
 * then specs from the description. A label shows once (the category metafield wins).
 */
function highlightRows(product: ProductDetail): Row[] {
  const rows: Row[] = []
  const seen = new Set<string>()
  const push = (row: Row) => {
    const key = row.label.toLowerCase()
    if (seen.has(key) || row.values.length === 0) return
    seen.add(key)
    rows.push(row)
  }
  const text = (value: string) => [{ label: value, color: null }]

  if (product.category) push({ label: "Category", values: text(product.category) })
  else if (product.productType) push({ label: "Type", values: text(product.productType) })
  product.attributes.forEach((a) => push({ label: a.label, values: a.values }))
  product.specs.forEach((h) => push({ label: h.label, values: text(h.value) }))
  return rows
}

function RowValue({ values }: { values: Row["values"] }) {
  if (!values.some((v) => v.color)) return <>{values.map((v) => v.label).join(", ")}</>
  return (
    <span className="flex flex-wrap gap-x-3 gap-y-1">
      {values.map((v) => (
        <span key={v.label} className="inline-flex items-center gap-1.5">
          {v.color && <span aria-hidden="true" className="size-3 rounded-full ring-1 ring-black/15" style={{ backgroundColor: v.color }} />}
          {v.label}
        </span>
      ))}
    </span>
  )
}

/** Icon by keyword in a highlight line; anything else gets a check mark. */
const ICONS: [RegExp, LucideIcon][] = [
  [/battery|charg/i, BatteryChargingIcon],
  [/bluetooth|wireless|wi-?fi|connect/i, BluetoothIcon],
  [/timer|schedul|automatic|hour|minute/i, TimerIcon],
  [/waterproof|water|liquid/i, DropletsIcon],
  [/colou?r|pattern/i, PaletteIcon],
  [/material|steel|plastic|silicone|nylon|cotton|wood|fabric|leather/i, LayersIcon],
  [/size|cm|mm|inch|dimension/i, RulerIcon],
  [/capacity|litre|liter|\bml\b|\bl\b|cup/i, CupSodaIcon],
  [/weight|\bkg\b|\bg\b|light/i, WeightIcon],
  [/power|watt|volt|usb/i, ZapIcon],
  [/pet|dog|cat|paw/i, PawPrintIcon],
  [/kids|family|adult|unisex/i, UsersIcon],
  [/safe|durable|warranty|protect|non-?slip/i, ShieldCheckIcon],
  [/box|package|includes/i, PackageOpenIcon],
  [/style|design|premium|elegant/i, GemIcon],
  [/feature|smart/i, SparklesIcon],
]

function iconFor(text: string): LucideIcon {
  return ICONS.find(([re]) => re.test(text))?.[1] ?? CheckIcon
}

/** Flipkart-style highlights: one short line per point, with an icon. */
function HighlightList({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-3">
      {items.map((item) => {
        const Icon = iconFor(item)
        return (
          <li key={item} className="flex items-center gap-3.5">
            <span aria-hidden="true" className="grid size-10 flex-none place-items-center rounded-[10px] bg-teal-soft text-teal">
              <Icon className="size-[18px]" strokeWidth={1.8} />
            </span>
            <span className="text-[0.9375rem] leading-snug text-ink">{item}</span>
          </li>
        )
      })}
    </ul>
  )
}

/** Rows shown before "Show all": enough to scan, short enough to keep the buy box in view. */
const SPEC_PREVIEW = 6

/**
 * Specification table (label | value), the pattern shoppers know from big marketplaces.
 * Scales from 2 to 30+ facts: the first few show, the rest open with "Show all".
 */
function SpecTable({ rows }: { rows: Row[] }) {
  const [all, setAll] = useState(false)
  const visible = all ? rows : rows.slice(0, SPEC_PREVIEW)
  const hidden = rows.length - SPEC_PREVIEW

  return (
    <div className="flex flex-col gap-3">
      <dl className="overflow-hidden rounded-xl border border-line-soft bg-white">
        {visible.map((row, i) => (
          <div
            key={row.label}
            className={cn("grid grid-cols-[minmax(7.5rem,36%)_1fr]", i > 0 && "border-t border-line-soft")}
          >
            <dt className="bg-cream/70 px-4 py-3 text-[0.8125rem] leading-snug font-medium text-slate">{row.label}</dt>
            <dd className="px-4 py-3 text-[0.875rem] leading-snug text-ink">
              <RowValue values={row.values} />
            </dd>
          </div>
        ))}
      </dl>
      {hidden > 0 && (
        <button
          type="button"
          aria-expanded={all}
          onClick={() => setAll(!all)}
          className="inline-flex items-center gap-1.5 self-start text-sm font-semibold text-teal hover:underline"
        >
          {all ? "Show fewer" : `Show all ${rows.length} specifications`}
          <ChevronDownIcon aria-hidden="true" className={cn("size-4 transition-transform", all && "rotate-180")} />
        </button>
      )}
    </div>
  )
}

/** "Product highlights" and "All details" (design accordions). */
export function ProductDetails({ product }: { product: ProductDetail }) {
  const [highlightsOpen, setHighlightsOpen] = useState(true)
  const [specsOpen, setSpecsOpen] = useState(true)
  const [detailsOpen, setDetailsOpen] = useState(true)
  const tabs: Tab[] = product.care ? ["Description", "Care", "Shipping", "Damage policy"] : ["Description", "Shipping", "Damage policy"]
  const [tab, setTab] = useState<Tab>("Description")
  const rows = highlightRows(product)

  return (
    <div className="flex flex-col border-b border-line">
      {product.highlights.length > 0 && (
        <Section title="Product highlights" open={highlightsOpen} onToggle={() => setHighlightsOpen(!highlightsOpen)}>
          <HighlightList items={product.highlights} />
        </Section>
      )}

      {rows.length > 0 && (
        <Section title="Specifications" open={specsOpen} onToggle={() => setSpecsOpen(!specsOpen)}>
          <SpecTable rows={rows} />
        </Section>
      )}

      <Section title="All details" open={detailsOpen} onToggle={() => setDetailsOpen(!detailsOpen)}>
        <div role="tablist" aria-label="Product details" className="mb-4 flex flex-wrap gap-2">
          {tabs.map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={t === tab}
              onClick={() => setTab(t)}
              className={cn(
                "h-[2.375rem] rounded-full border-[1.5px] px-3.5 text-sm font-semibold transition-colors",
                t === tab ? "border-ink bg-ink text-cream" : "border-line-strong bg-white text-ink hover:border-ink"
              )}
            >
              {t}
            </button>
          ))}
        </div>
        <div role="tabpanel">
          {tab === "Description" &&
            (product.descriptionHtml ? (
              // Merchant-written HTML from the Shopify admin.
              <div className={prose} dangerouslySetInnerHTML={{ __html: product.descriptionHtml }} />
            ) : (
              <p className="text-[0.9375rem] text-slate">No description yet.</p>
            ))}
          {tab === "Care" && product.care && (
            <div className={cn(prose, "whitespace-pre-line")}>
              <p>{product.care}</p>
            </div>
          )}
          {tab === "Shipping" && (
            <div className={prose}>
              <p>Orders are packed and shipped within 1–2 business days and usually arrive 3–7 business days later, with a tracking link sent by email.</p>
              <p>Enter your ZIP / PIN code in the delivery box above to see if we deliver to you and what shipping costs. Final options and costs are shown at checkout.</p>
            </div>
          )}
          {tab === "Damage policy" && (
            <div className={prose}>
              <p>Damaged, wrong or missing item? Send us a photo or video within 48 hours of delivery and we&apos;ll send a replacement or a refund.</p>
              <p>Parcels lost in transit are resent or refunded. Damage to the outer box only, with the product itself fine, isn&apos;t covered.</p>
            </div>
          )}
        </div>
      </Section>
    </div>
  )
}
