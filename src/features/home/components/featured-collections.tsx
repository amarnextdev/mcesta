import Image from "next/image"
import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"

import { cn } from "@/lib/utils"

import type { FeaturedTile } from "../data"

/** Three wide tiles that link to curated collections. */
export function FeaturedCollections({ tiles, className }: { tiles: FeaturedTile[]; className?: string }) {
  return (
    <section aria-label="Featured collections" className={cn("container-shop", className)}>
      <ul className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {tiles.map((tile) => (
          <li key={tile.href}>
            <Link
              href={tile.href}
              className="group flex min-h-[12.5rem] items-stretch gap-4 overflow-hidden rounded-2xl p-[22px] text-ink"
              style={{ background: tile.bg }}
            >
              <span className="flex min-w-0 flex-[1_1_55%] flex-col justify-between gap-3">
                <span className="flex flex-col gap-1.5">
                  <span
                    className={cn(
                      "text-xs font-semibold tracking-[0.08em] uppercase",
                      tile.eyebrowTone === "terra" ? "text-terra-text" : "text-teal"
                    )}
                  >
                    {tile.eyebrow}
                  </span>
                  <span className="font-heading text-[1.375rem] leading-[1.12] text-balance">{tile.title}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 text-[0.9375rem] font-semibold text-teal">
                  Shop now
                  <ArrowRightIcon aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </span>
              <span
                className="relative flex flex-[0_0_42%] items-end overflow-hidden rounded-xl p-2"
                style={{ background: tile.photoBg }}
              >
                {tile.imageUrl ? (
                  <Image
                    src={tile.imageUrl}
                    alt=""
                    fill
                    sizes="(min-width: 768px) 14vw, 40vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <span className="rounded-md bg-white px-[7px] py-[3px] text-[0.6875rem] text-slate">{tile.imageLabel}</span>
                )}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
