"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowRightIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"

import { cn } from "@/lib/utils"

import { heroPromise, type HeroSlide } from "../data"

const AUTOPLAY_MS = 6000

/**
 * Homepage offer slider.
 * Auto-advances every 6 s, pauses on hover/focus and when the user prefers reduced motion.
 */
export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const reducedMotion = useRef(false)

  const count = slides.length
  const go = useCallback((i: number) => setIndex(((i % count) + count) % count), [count])

  useEffect(() => {
    reducedMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches
  }, [])

  useEffect(() => {
    if (paused || reducedMotion.current || count < 2) return
    const t = window.setTimeout(() => go(index + 1), AUTOPLAY_MS)
    return () => window.clearTimeout(t)
  }, [index, paused, count, go])

  const slide = slides[index]
  if (!slide) return null
  const t = slide.theme

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured offers"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      className="relative min-h-[23.75rem] overflow-hidden rounded-[20px] transition-colors duration-500"
      style={{ background: t.bg, color: t.fg }}
    >
      {/* Decorative stage */}
      <div
        aria-hidden="true"
        className="absolute top-1/2 -right-[90px] hidden size-[460px] -translate-y-1/2 rounded-full transition-colors duration-500 md:block"
        style={{ background: t.circle }}
      />
      <div aria-hidden="true" className="absolute top-[2.125rem] right-[150px] hidden size-3.5 rounded-full bg-[#e8875e] md:block" />

      <div
        key={slide.id}
        role="group"
        aria-roledescription="slide"
        aria-label={`${index + 1} of ${count}: ${slide.title}`}
        className="relative flex min-h-[23.75rem] max-w-full animate-in flex-col justify-center gap-3.5 px-6 pt-10 pb-20 duration-500 fade-in md:max-w-[52%] md:py-0 md:pr-0 md:pb-6 md:pl-14"
      >
        <span
          className="self-start rounded-md px-2.5 py-[5px] text-xs font-semibold tracking-[0.08em] uppercase"
          style={{ background: t.chipBg, color: t.chipFg }}
        >
          {slide.eyebrow}
        </span>
        <h1 className="text-[1.75rem] leading-[1.06] tracking-[-0.01em] md:text-[2.5rem]">{slide.title}</h1>
        <p className="max-w-[26em] text-[1.0625rem] leading-normal opacity-90">{slide.subtitle}</p>
        <div className="flex flex-wrap items-center gap-x-[18px] gap-y-2">
          <Link
            href={slide.cta.href}
            className="inline-flex min-h-[3.125rem] items-center gap-2 rounded-[10px] px-6 font-semibold transition-opacity hover:opacity-90 focus-visible:ring-3 focus-visible:ring-white/60 focus-visible:outline-none"
            style={{ background: t.ctaBg, color: t.ctaFg }}
          >
            {slide.cta.label}
            <ArrowRightIcon aria-hidden="true" className="size-[18px]" />
          </Link>
          <span className="text-sm opacity-85">{heroPromise}</span>
        </div>
      </div>

      {/* Featured product card */}
      <div
        key={`${slide.id}-card`}
        className="absolute top-1/2 right-16 hidden w-[250px] -translate-y-1/2 animate-in duration-500 fade-in slide-in-from-right-4 md:block"
      >
        <div className="flex flex-col gap-2.5 rounded-[18px] bg-white p-3 shadow-[0_2px_6px_rgba(31,42,46,0.08),0_18px_40px_rgba(31,42,46,0.18)]">
          <div className="relative flex aspect-square items-end overflow-hidden rounded-xl p-2.5" style={{ background: t.photoBg }}>
            {slide.product.imageUrl ? (
              <Image src={slide.product.imageUrl} alt={slide.product.name} fill sizes="250px" className="object-cover" />
            ) : (
              <span className="rounded-md bg-white px-2 py-1 text-[0.6875rem] text-slate">{slide.product.imageLabel}</span>
            )}
          </div>
          <div className="flex items-baseline justify-between gap-2 px-1 pb-1 text-sm text-ink">
            <span className="font-semibold">{slide.product.name}</span>
            <span className="font-bold">{slide.product.price}</span>
          </div>
        </div>
        <div className="absolute -top-[26px] -left-[38px] flex size-[92px] -rotate-10 flex-col items-center justify-center rounded-full bg-terra text-center leading-[1.05] text-white shadow-[0_6px_16px_rgba(31,42,46,0.2)]">
          <span className="text-[0.6875rem] font-semibold tracking-[0.06em] uppercase">{slide.sticker.top}</span>
          <span className="text-2xl font-bold">{slide.sticker.big}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-6 left-6 flex items-center gap-1.5 md:left-14">
        {slides.map((s, i) => (
          <button
            key={s.id}
            type="button"
            aria-label={`Show offer ${i + 1}: ${s.title}`}
            aria-current={i === index}
            onClick={() => go(i)}
            className={cn("h-1.5 rounded-full transition-all", i === index ? "w-[22px]" : "w-1.5 opacity-40")}
            style={{ background: t.fg }}
          />
        ))}
      </div>
      <div className="absolute right-5 bottom-5 flex gap-2">
        <button
          type="button"
          aria-label="Previous offer"
          onClick={() => go(index - 1)}
          className="grid size-11 place-items-center rounded-full bg-white text-ink shadow-[0_2px_8px_rgba(31,42,46,0.15)] hover:bg-cream"
        >
          <ChevronLeftIcon className="size-5" />
        </button>
        <button
          type="button"
          aria-label="Next offer"
          onClick={() => go(index + 1)}
          className="grid size-11 place-items-center rounded-full bg-white text-ink shadow-[0_2px_8px_rgba(31,42,46,0.15)] hover:bg-cream"
        >
          <ChevronRightIcon className="size-5" />
        </button>
      </div>
    </section>
  )
}
