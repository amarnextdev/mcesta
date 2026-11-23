"use client"

import Image from "next/image"
import Link from "next/link"
import { useCallback, useEffect, useRef, useState } from "react"
import { ArrowRightIcon } from "lucide-react"

import { cn } from "@/lib/utils"

import type { DepartmentBanner } from "../data"

/** Time each banner stays before the row moves on. */
const AUTOPLAY_MS = 5000

/**
 * Department offers: a sideways row of wide banners that plays by itself.
 * Phones show one banner, laptops two and a bit. No arrows: it autoplays, you can swipe or
 * scroll, and the dots jump to a banner. Autoplay pauses on hover, keyboard focus, while the
 * tab is hidden, and when the shopper prefers reduced motion.
 */
export function BannerRail({ banners, label }: { banners: DepartmentBanner[]; label: string }) {
  const railRef = useRef<HTMLUListElement>(null)
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)

  // Track which banner is in view (swipes, scrolls and autoplay all update the dots).
  useEffect(() => {
    const rail = railRef.current
    if (!rail) return
    const items = Array.from(rail.children) as HTMLElement[]
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActive(items.indexOf(entry.target as HTMLElement))
      },
      { root: rail, threshold: 0.6 }
    )
    items.forEach((item) => observer.observe(item))
    return () => observer.disconnect()
  }, [banners.length])

  const scrollTo = useCallback((index: number) => {
    const rail = railRef.current
    const item = rail?.children[index] as HTMLElement | undefined
    if (rail && item) rail.scrollTo({ left: item.offsetLeft - rail.offsetLeft, behavior: "smooth" })
  }, [])

  // Autoplay: next banner every few seconds, back to the first after the last one.
  useEffect(() => {
    if (paused || banners.length < 2) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const timer = setInterval(() => {
      if (document.hidden) return
      const rail = railRef.current
      if (!rail) return
      const atEnd = rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 8
      scrollTo(atEnd ? 0 : active + 1)
    }, AUTOPLAY_MS)
    return () => clearInterval(timer)
  }, [paused, active, banners.length, scrollTo])

  return (
    <div
      className="flex flex-col gap-3"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <ul
        ref={railRef}
        aria-label={label}
        aria-roledescription="carousel"
        className="-mx-4 grid snap-x snap-mandatory auto-cols-[88%] grid-flow-col gap-3 overflow-x-auto scroll-px-4 px-4 [scrollbar-width:none] sm:auto-cols-[62%] md:mx-0 md:scroll-px-0 md:px-0 lg:auto-cols-[calc((100%-1rem)/2.35)] lg:gap-4 [&::-webkit-scrollbar]:hidden"
      >
        {banners.map((banner, i) => (
          <li key={banner.href + i} aria-roledescription="slide" aria-label={`${i + 1} of ${banners.length}`} className="snap-start">
            <Link
              href={banner.href}
              className="group relative flex aspect-[16/8] overflow-hidden rounded-[20px] md:aspect-[16/7]"
              style={{ background: banner.theme.bg, color: banner.theme.fg }}
            >
              {banner.imageUrl ? (
                <Image
                  src={banner.imageUrl}
                  alt=""
                  fill
                  preload={i === 0}
                  sizes="(min-width: 1024px) 42vw, (min-width: 640px) 62vw, 88vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
              ) : (
                <>
                  <span aria-hidden="true" className="absolute -right-12 -bottom-16 size-56 rounded-full opacity-[0.1]" style={{ background: banner.theme.accent }} />
                  <span aria-hidden="true" className="absolute right-16 -bottom-8 size-24 rounded-full opacity-[0.1]" style={{ background: banner.theme.accent }} />
                </>
              )}
              <span className="relative flex max-w-[72%] flex-col justify-center gap-1.5 p-6 md:gap-2 md:p-8">
                <span className="text-[0.6875rem] font-bold tracking-[0.12em] uppercase md:text-xs" style={{ color: banner.theme.accent }}>
                  {banner.eyebrow}
                </span>
                <span className="font-heading text-[1.25rem] leading-[1.06] text-balance md:text-[1.75rem]">{banner.title}</span>
                <span className="text-sm opacity-80 md:text-[0.9375rem]">{banner.subtitle}</span>
                <span
                  className="mt-2 inline-flex h-9 items-center gap-1.5 self-start rounded-full px-4 text-[0.8125rem] font-semibold transition-transform group-hover:translate-x-0.5 md:h-10 md:text-sm"
                  style={{ background: banner.theme.fg, color: banner.theme.bg }}
                >
                  {banner.cta}
                  <ArrowRightIcon aria-hidden="true" className="size-4" />
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {banners.length > 1 && (
        <div className="flex justify-center gap-1.5">
          {banners.map((b, i) => (
            <button
              key={b.href + i}
              type="button"
              aria-label={`Show banner ${i + 1}`}
              aria-current={i === active}
              onClick={() => scrollTo(i)}
              className={cn("h-1.5 rounded-full transition-all duration-300", i === active ? "w-6 bg-ink" : "w-1.5 bg-line-strong hover:bg-slate")}
            />
          ))}
        </div>
      )}
    </div>
  )
}
