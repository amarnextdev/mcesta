import { ArrowUpRightIcon } from "lucide-react"

import { InstagramIcon } from "@/components/icons/social-icons"
import { siteConfig } from "@/lib/config/site"
import { cn } from "@/lib/utils"

import type { Reel } from "../data"
import { ReelCard } from "./reel-card"

type FindsByFinnProps = {
  name: string
  intro: string
  reels: Reel[]
  className?: string
}

/**
 * Short shoppable videos from the store's host, Finn.
 * Mobile: 2 full reels per view, swipe for more, Instagram button under the row.
 * Tablet: 3 per view. Desktop: all 5 in one row.
 */
export function FindsByFinn({ name, intro, reels, className }: FindsByFinnProps) {
  return (
    <section id="finn" aria-labelledby="finn-h" className={cn("container-shop", className)}>
      <div className="mb-4 flex items-end justify-between gap-4 md:mb-5">
        <div className="flex min-w-0 items-start gap-3 md:items-center md:gap-3.5">
          <span
            aria-hidden="true"
            className="mt-0.5 grid size-10 flex-none place-items-center rounded-full bg-teal font-heading text-lg text-cream shadow-[0_0_0_2px_var(--color-cream),0_0_0_4px_#e8875e] md:mt-0 md:size-14 md:text-2xl md:shadow-[0_0_0_3px_var(--color-cream),0_0_0_5px_#e8875e]"
          >
            {name[0]}
          </span>
          <div className="flex min-w-0 flex-col gap-1 md:gap-0.5">
            <h2 id="finn-h" className="text-[1.25rem] leading-[1.15] md:text-[1.75rem]">
              Finds by {name}
            </h2>
            <p className="text-sm leading-snug text-slate md:text-[0.9375rem]">{intro}</p>
          </div>
        </div>
        <a
          href={siteConfig.social.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="group hidden h-9 flex-none items-center gap-1.5 px-1 text-sm font-semibold text-ink hover:text-teal md:inline-flex"
        >
          Watch more on Instagram
          <ArrowUpRightIcon aria-hidden="true" className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </a>
      </div>

      <ul
        aria-label={`Videos by ${name}`}
        className="grid snap-x snap-mandatory auto-cols-[calc((100%-0.75rem)/2)] grid-flow-col gap-3 overflow-x-auto overscroll-x-contain pb-1 [scrollbar-width:none] sm:auto-cols-[calc((100%-1.5rem)/3)] lg:auto-cols-auto lg:grid-flow-row lg:grid-cols-5 lg:gap-4 lg:overflow-visible lg:pb-0 [&::-webkit-scrollbar]:hidden"
      >
        {reels.map((reel) => (
          <li key={reel.id} className="min-w-0 snap-start">
            <ReelCard reel={reel} host={name} />
          </li>
        ))}
      </ul>

      <a
        href={siteConfig.social.instagram}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 flex h-11 items-center justify-center gap-2 rounded-[10px] border-[1.5px] border-ink text-sm font-semibold text-ink transition-colors hover:bg-ink hover:text-cream md:hidden"
      >
        <InstagramIcon className="size-[18px]" />
        Watch more on Instagram
      </a>
    </section>
  )
}
