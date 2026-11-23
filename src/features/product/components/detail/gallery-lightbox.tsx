"use client"

import Image from "next/image"
import { Dialog as DialogPrimitive } from "radix-ui"
import { useCallback, useEffect, useRef, useState, type MouseEvent, type TouchEvent } from "react"
import { ChevronLeftIcon, ChevronRightIcon, XIcon, ZoomInIcon, ZoomOutIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import type { Image as ImageData } from "@/lib/shopify/types"

type GalleryLightboxProps = {
  title: string
  images: ImageData[]
  /** Index to show, or null when closed. */
  index: number | null
  onIndexChange: (index: number | null) => void
}

/** Swipe distance (px) that counts as "next / previous photo". */
const SWIPE = 50

/**
 * Full-screen photo viewer. Arrows, keyboard (← →, Esc), swipe on touch screens, thumbnails,
 * and click-to-zoom with the mouse (the zoomed photo follows the cursor).
 */
export function GalleryLightbox({ title, images, index, onIndexChange }: GalleryLightboxProps) {
  const open = index !== null
  const current = index ?? 0
  const count = images.length
  const [zoomed, setZoomed] = useState(false)
  const [origin, setOrigin] = useState("50% 50%")
  const touchX = useRef<number | null>(null)
  const thumbsRef = useRef<HTMLUListElement>(null)

  const go = useCallback(
    (next: number) => {
      setZoomed(false)
      onIndexChange((next + count) % count)
    },
    [count, onIndexChange]
  )

  // Keyboard: ← → move between photos (Esc is handled by the dialog).
  useEffect(() => {
    if (!open || count < 2) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(current + 1)
      if (e.key === "ArrowLeft") go(current - 1)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, count, current, go])

  // Keep the active thumbnail in view.
  useEffect(() => {
    if (!open) return
    const thumb = thumbsRef.current?.children[current] as HTMLElement | undefined
    thumb?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" })
  }, [open, current])

  /** Zoom towards the cursor: the photo's transform origin follows the mouse. */
  const followCursor = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setOrigin(`${((e.clientX - rect.left) / rect.width) * 100}% ${((e.clientY - rect.top) / rect.height) * 100}%`)
  }

  const onImageClick = (e: MouseEvent<HTMLDivElement>) => {
    // Zoom is for mouse users; on touch screens a tap does nothing (swipe moves, pinch zooms).
    if ((e.nativeEvent as PointerEvent).pointerType === "touch") return
    followCursor(e)
    setZoomed((z) => !z)
  }

  const onTouchStart = (e: TouchEvent) => {
    touchX.current = e.touches.length === 1 ? e.touches[0].clientX : null
  }
  const onTouchEnd = (e: TouchEvent) => {
    if (touchX.current === null || count < 2) return
    const dx = e.changedTouches[0].clientX - touchX.current
    touchX.current = null
    if (Math.abs(dx) > SWIPE) go(current + (dx < 0 ? 1 : -1))
  }

  const photo = images[current]

  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(o) => {
        if (!o) {
          setZoomed(false)
          onIndexChange(null)
        }
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-ink/95 backdrop-blur-sm duration-200 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className="fixed inset-0 z-50 flex flex-col text-cream outline-none duration-200 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0"
        >
          {/* Top bar */}
          <div className="flex items-center justify-between gap-4 px-4 py-3 md:px-6 md:py-4">
            <div className="flex min-w-0 items-center gap-3">
              <span className="rounded-full bg-white/10 px-3 py-1 text-[0.8125rem] font-semibold tabular-nums">
                {current + 1} / {count}
              </span>
              <DialogPrimitive.Title className="truncate text-sm font-medium text-cream/80">{title}</DialogPrimitive.Title>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setZoomed((z) => !z)}
                aria-label={zoomed ? "Zoom out" : "Zoom in"}
                className="hidden size-10 place-items-center rounded-full bg-white/10 transition-colors hover:bg-white/20 md:grid"
              >
                {zoomed ? <ZoomOutIcon className="size-5" /> : <ZoomInIcon className="size-5" />}
              </button>
              <DialogPrimitive.Close
                aria-label="Close gallery"
                className="grid size-10 place-items-center rounded-full bg-white/10 transition-colors hover:bg-white/20 focus-visible:ring-3 focus-visible:ring-white/40 focus-visible:outline-none"
              >
                <XIcon className="size-5" />
              </DialogPrimitive.Close>
            </div>
          </div>

          {/* Photo */}
          <div className="relative flex min-h-0 flex-1 items-center justify-center px-2 md:px-20">
            {photo && (
              <div
                key={photo.url}
                onClick={onImageClick}
                onMouseMove={(e) => zoomed && followCursor(e)}
                onTouchStart={onTouchStart}
                onTouchEnd={onTouchEnd}
                className={cn(
                  "relative h-full w-full max-w-5xl overflow-hidden animate-in fade-in-0 duration-300",
                  zoomed ? "cursor-zoom-out" : "md:cursor-zoom-in"
                )}
              >
                <Image
                  src={photo.url}
                  alt={photo.alt || `${title}, photo ${current + 1}`}
                  fill
                  preload
                  sizes="(min-width: 1024px) 64rem, 100vw"
                  draggable={false}
                  style={{ transformOrigin: origin }}
                  className={cn(
                    "object-contain transition-transform duration-300 ease-out select-none",
                    zoomed && "scale-[2.2]"
                  )}
                />
              </div>
            )}

            {/* Neighbours load early so moving feels instant. */}
            {count > 1 &&
              [images[(current + 1) % count], images[(current - 1 + count) % count]].map((img) => (
                <Image key={`pre-${img.url}`} src={img.url} alt="" fill sizes="(min-width: 1024px) 64rem, 100vw" className="pointer-events-none invisible" />
              ))}

            {count > 1 && (
              <>
                <NavButton side="left" onClick={() => go(current - 1)} />
                <NavButton side="right" onClick={() => go(current + 1)} />
              </>
            )}
          </div>

          {/* Thumbnails */}
          {count > 1 && (
            <ul
              ref={thumbsRef}
              aria-label="All photos"
              className="mx-auto flex max-w-full gap-2 overflow-x-auto px-4 py-4 [scrollbar-width:none] md:py-5 [&::-webkit-scrollbar]:hidden"
            >
              {images.map((img, i) => (
                <li key={img.url} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => go(i)}
                    aria-label={`Show photo ${i + 1}`}
                    aria-current={i === current}
                    className={cn(
                      "relative block size-14 overflow-hidden rounded-lg ring-2 transition md:size-16",
                      i === current ? "opacity-100 ring-cream" : "opacity-50 ring-transparent hover:opacity-90"
                    )}
                  >
                    <Image src={img.url} alt="" fill sizes="64px" className="object-cover" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

function NavButton({ side, onClick }: { side: "left" | "right"; onClick: () => void }) {
  const Icon = side === "left" ? ChevronLeftIcon : ChevronRightIcon
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={side === "left" ? "Previous photo" : "Next photo"}
      className={cn(
        "absolute top-1/2 hidden size-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-cream backdrop-blur transition-colors hover:bg-white hover:text-ink focus-visible:ring-3 focus-visible:ring-white/40 focus-visible:outline-none md:grid",
        side === "left" ? "left-5" : "right-5"
      )}
    >
      <Icon className="size-6" />
    </button>
  )
}
