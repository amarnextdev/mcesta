"use client"

import { useState } from "react"
import { MinusIcon, PlusIcon } from "lucide-react"

import type { ProductDetail } from "@/lib/shopify/types"
import { cn } from "@/lib/utils"

const tabs = ["Description", "Shipping", "Damage policy"] as const
type Tab = (typeof tabs)[number]

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

/** "Product highlights" and "All details" (design accordions). */
export function ProductDetails({ product }: { product: ProductDetail }) {
  const [highlightsOpen, setHighlightsOpen] = useState(true)
  const [detailsOpen, setDetailsOpen] = useState(true)
  const [tab, setTab] = useState<Tab>("Description")

  const highlights = [
    { k: "Brand", v: product.vendor },
    { k: "Type", v: product.productType },
    { k: "Ships from", v: "US warehouse" },
    { k: "Delivery", v: "3–7 business days, tracked" },
  ].filter((h) => h.v)

  return (
    <div className="flex flex-col border-b border-line">
      <Section title="Product highlights" open={highlightsOpen} onToggle={() => setHighlightsOpen(!highlightsOpen)}>
        <dl className="grid grid-cols-2 gap-x-6">
          {highlights.map((h) => (
            <div key={h.k} className="border-b border-line-soft py-2.5">
              <dt className="text-[0.8125rem] text-slate">{h.k}</dt>
              <dd className="text-[0.9375rem] font-semibold">{h.v}</dd>
            </div>
          ))}
        </dl>
      </Section>

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
          {tab === "Shipping" && (
            <div className={prose}>
              <p>Ships from our US warehouse within 1–2 business days and arrives in 3–7 business days with tracking.</p>
              <p>Free US shipping on orders over $50. We also ship to Canada; costs are shown at checkout.</p>
            </div>
          )}
          {tab === "Damage policy" && (
            <div className={prose}>
              <p>If your order arrives damaged, email us a photo within 48 hours of delivery and we&apos;ll send a replacement or a refund.</p>
            </div>
          )}
        </div>
      </Section>
    </div>
  )
}
