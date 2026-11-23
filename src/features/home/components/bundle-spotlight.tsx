import Link from "next/link"
import { CheckIcon } from "lucide-react"

import { SectionHeader } from "@/components/shared/section-header"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import type { BundleSpotlight as BundleData } from "../data"
import { AddBundleButton } from "./add-bundle-button"

/** "Gift sets" feature: photo collage on the left, what's inside + price on the right. */
export function BundleSpotlight({ bundle, className }: { bundle: BundleData; className?: string }) {
  const [hero, ...rest] = bundle.items

  return (
    <section id="gift-sets" aria-labelledby="bundle-h" className={cn("container-shop", className)}>
      <SectionHeader id="bundle-h" title="Gift sets" action={{ label: "Shop all gift sets", href: "/gifts/gift-sets-and-bundles" }} />
      <div className="grid grid-cols-1 items-center gap-6 md:gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-12">
        <div className="relative grid grid-cols-2 gap-2.5 sm:h-[21.25rem] sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] sm:grid-rows-2 sm:gap-3 md:h-[25rem]">
          {hero && (
            <div className="col-span-2 flex aspect-[4/3] min-w-0 items-end rounded-2xl p-2.5 sm:col-span-1 sm:row-span-2 sm:aspect-auto sm:p-3" style={{ background: hero.photoBg }}>
              <span className="max-w-full truncate rounded-full bg-white px-2 py-1 text-[0.6875rem] font-semibold sm:px-2.5 sm:py-[5px] sm:text-xs">{hero.name}</span>
            </div>
          )}
          {rest.map((item) => (
            <div key={item.name} className="flex aspect-square min-w-0 items-end rounded-2xl p-2 sm:aspect-auto sm:p-3" style={{ background: item.photoBg }}>
              <span className="max-w-full truncate rounded-full bg-white px-2 py-1 text-[0.6875rem] font-semibold sm:px-2.5 sm:py-[5px] sm:text-xs">{item.name}</span>
            </div>
          ))}
          <span className="absolute top-2.5 left-2.5 rounded-full bg-terra px-2.5 py-1 text-xs font-bold text-white sm:top-3.5 sm:left-3.5 sm:px-3 sm:py-1.5 sm:text-[0.8125rem]">
            Save {bundle.saving}
          </span>
        </div>

        <div className="flex flex-col gap-[18px]">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold tracking-[0.08em] text-terra-text uppercase">{bundle.eyebrow}</span>
            <h3 className="text-[1.5rem] leading-[1.08] md:text-[2rem]">{bundle.title}</h3>
            <p className="max-w-[30em] text-base text-slate">{bundle.description}</p>
          </div>
          <ul className="flex flex-col gap-2.5">
            {bundle.items.map((item) => (
              <li key={item.name} className="flex items-center gap-2.5 text-[0.9375rem]">
                <CheckIcon aria-hidden="true" className="size-[18px] shrink-0 text-teal" strokeWidth={2.2} />
                <span className="min-w-0 flex-1">{item.name}</span>
                <span className="text-[0.8125rem] text-slate">worth {item.worth}</span>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2 pt-1">
            <span className="text-[1.875rem] leading-none font-bold md:text-[2.125rem]">{bundle.price}</span>
            <span className="text-base text-slate line-through">{bundle.compareAtPrice}</span>
            <span className="rounded-full bg-success-soft px-2 py-[3px] text-[0.8125rem] font-bold text-success">
              You save {bundle.saving}
            </span>
          </div>
          <div className="grid grid-cols-1 gap-2.5 sm:flex sm:flex-wrap">
            <AddBundleButton title={bundle.title} />
            <Button asChild size="lg" variant="outline" className="h-[3.25rem] w-full border-[1.5px] border-ink bg-transparent sm:w-auto">
              <Link href={bundle.href}>View details</Link>
            </Button>
          </div>
          <span className="text-[0.8125rem] text-slate">{bundle.note}</span>
        </div>
      </div>
    </section>
  )
}
