"use client"

import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import { ZoomInIcon } from "lucide-react"

import { cn } from "@/lib/utils"

import { GalleryLightbox } from "./gallery-lightbox"
import type { Image as ImageData } from "@/lib/shopify/types"

type ProductGalleryProps = {
  title: string
  images: ImageData[]
  /** The chosen variant's photo; shown first. */
  activeImage: ImageData | null
  discountPercent: number | null
}

/** Photos shown before "+N more photos" on desktop. */
const FOLD = 6

/**
 * Product photos (design: 2-column grid on desktop, "+N more photos" on the 6th tile).
 * Phones get a swipeable full-width carousel with a counter.
 */
export function ProductGallery({ title, images, activeImage, discountPercent }: ProductGalleryProps) {
  const ordered = activeImage
    ? [activeImage, ...images.filter((img) => img.url !== activeImage.url)]
    : images
  const [slide, setSlide] = useState(0)
  /** Photo open in the full-screen viewer, or null. */
  const [viewing, setViewing] = useState<number | null>(null)
  const railRef = useRef<HTMLUListElement>(null)

  // New variant photo → back to the first slide on phones.
  useEffect(() => {
    railRef.current?.scrollTo({ left: 0, behavior: "smooth" })
  }, [activeImage?.url])

  if (ordered.length === 0) {
    return (
      <div className="grid aspect-square place-items-center rounded-2xl bg-sand text-sm text-slate">No photo yet</div>
    )
  }

  const visible = ordered.slice(0, FOLD)
  /** Photos not on the grid: the last tile shows "+N" and opens the full-screen gallery. */
  const moreCount = ordered.length - (FOLD - 1)

  const badge = discountPercent ? (
    <span className="absolute top-3 left-3 z-10 rounded-full bg-terra px-2.5 py-1 text-[0.8125rem] font-bold text-white">
      -{discountPercent}%
    </span>
  ) : null

  return (
    <div className="flex flex-col gap-3">
      {/* Phones and tablets */}
      <div className="relative lg:hidden">
        {badge}
        <ul
          ref={railRef}
          aria-label={`${title} photos`}
          onScroll={(e) => {
            const el = e.currentTarget
            setSlide(Math.round(el.scrollLeft / el.clientWidth))
          }}
          className="-mx-4 flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] md:mx-0 md:rounded-2xl [&::-webkit-scrollbar]:hidden"
        >
          {ordered.map((img, i) => (
            <li key={img.url} className="relative aspect-square w-full shrink-0 snap-center bg-sand">
              <button
                type="button"
                onClick={() => setViewing(i)}
                aria-label={`Open photo ${i + 1} of ${ordered.length} full screen`}
                className="absolute inset-0 z-[1]"
              />
              <Image
                src={img.url}
                alt={img.alt || title}
                fill
                preload={i === 0}
                sizes="(min-width: 768px) 90vw, 100vw"
                className="object-cover"
              />
            </li>
          ))}
        </ul>
        {ordered.length > 1 && (
          <span className="absolute right-3 bottom-3 rounded-full bg-ink/75 px-2.5 py-1 text-xs font-semibold text-cream">
            {slide + 1} / {ordered.length}
          </span>
        )}
      </div>

      {/* Desktop */}
      <ul className="hidden grid-cols-2 gap-3 lg:grid">
        {visible.map((img, i) => {
          const isMore = i === FOLD - 1 && ordered.length > FOLD
          return (
            <li key={img.url} className={cn("relative aspect-square overflow-hidden rounded-2xl bg-sand", i === 0 && ordered.length === 1 && "col-span-2")}>
              {i === 0 && badge}
              <button
                type="button"
                onClick={() => setViewing(i)}
                aria-label={isMore ? `See all ${ordered.length} photos` : `Open photo ${i + 1} of ${ordered.length} full screen`}
                className="group/photo absolute inset-0 cursor-zoom-in focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none focus-visible:ring-inset"
              >
                <Image
                  src={img.url}
                  alt={img.alt || title}
                  fill
                  preload={i < 2}
                  sizes="(min-width: 1440px) 380px, 28vw"
                  className="object-cover transition-transform duration-500 group-hover/photo:scale-[1.03]"
                />
                {isMore ? (
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-ink/55 text-cream transition-colors group-hover/photo:bg-ink/65"
                  >
                    <span className="text-[2rem] leading-none font-bold tabular-nums">+{moreCount}</span>
                    <span className="text-sm font-semibold">more photos</span>
                  </span>
                ) : (
                  <span
                    aria-hidden="true"
                    className="absolute right-3 bottom-3 grid size-9 place-items-center rounded-full bg-white/90 text-ink opacity-0 shadow-sm transition-opacity group-hover/photo:opacity-100"
                  >
                    <ZoomInIcon className="size-4" />
                  </span>
                )}
              </button>
            </li>
          )
        })}
      </ul>
      <GalleryLightbox title={title} images={ordered} index={viewing} onIndexChange={setViewing} />
    </div>
  )
}
