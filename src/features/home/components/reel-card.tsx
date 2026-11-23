"use client"

import Image from "next/image"
import Link from "next/link"
import { useRef, useState } from "react"
import { PauseIcon, PlayIcon, ShoppingBagIcon } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"

import type { Reel } from "../data"

/**
 * One 9:16 video with its product pinned at the bottom.
 * The video only loads after the shopper presses play.
 */
export function ReelCard({ reel, host }: { reel: Reel; host: string }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [started, setStarted] = useState(false)
  const [playing, setPlaying] = useState(false)

  function toggle() {
    if (!reel.videoUrl) {
      toast("Video coming soon", { description: `${host}'s video for this find isn't up yet.` })
      return
    }
    if (!started) {
      setStarted(true)
      return
    }
    const video = videoRef.current
    if (!video) return
    if (video.paused) void video.play()
    else video.pause()
  }

  return (
    <article aria-label={reel.title}>
      <div className="relative isolate aspect-[9/16] w-full overflow-hidden rounded-2xl" style={{ background: reel.bg }}>
        {started && reel.videoUrl ? (
          <video
            ref={videoRef}
            src={reel.videoUrl}
            poster={reel.posterUrl}
            autoPlay
            playsInline
            loop
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            className="absolute inset-0 size-full object-cover"
          />
        ) : reel.posterUrl ? (
          <Image src={reel.posterUrl} alt="" fill sizes="(min-width: 768px) 20vw, 46vw" className="object-cover" />
        ) : (
          <span className="absolute inset-x-3 top-11 hidden text-center text-[0.6875rem] text-slate sm:block">Video placeholder</span>
        )}

        <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-white/90 py-0.5 pr-2 pl-0.5 text-[0.6875rem] font-semibold text-ink sm:top-2.5 sm:left-2.5 sm:gap-1.5 sm:py-1 sm:pl-1 sm:text-xs">
          <span aria-hidden="true" className="grid size-[18px] place-items-center rounded-full bg-teal text-[0.625rem] text-cream sm:size-5 sm:text-[0.6875rem]">
            {host[0]}
          </span>
          {host}
        </span>
        <span className="absolute top-2 right-2 rounded-full bg-ink/75 px-1.5 py-0.5 text-[0.6875rem] font-semibold text-cream sm:top-2.5 sm:right-2.5 sm:px-2 sm:py-[3px] sm:text-xs">
          {reel.duration}
        </span>

        {/* Play button: centred in the area above the product box. Plain flex, no % offsets. */}
        <div className="pointer-events-none absolute inset-x-0 top-0 bottom-20 flex items-center justify-center sm:bottom-28">
          <button
            type="button"
            onClick={toggle}
            aria-label={`${playing ? "Pause" : "Play"} video: ${reel.title}`}
            className={cn(
              "pointer-events-auto grid size-11 place-items-center rounded-full bg-ink/75 text-cream transition hover:bg-ink focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none sm:size-14",
              playing && "opacity-0 hover:opacity-100 focus-visible:opacity-100"
            )}
          >
            {playing ? (
              <PauseIcon className="size-5 fill-current sm:size-6" />
            ) : (
              <PlayIcon className="ml-0.5 size-5 fill-current sm:size-6" />
            )}
          </button>
        </div>

        <div className="absolute inset-x-1.5 bottom-1.5 flex items-center gap-2 rounded-xl bg-white p-1.5 pl-2.5 shadow-[0_4px_14px_rgba(31,42,46,0.15)] sm:inset-x-2 sm:bottom-2 sm:flex-col sm:items-stretch sm:p-2">
          <Link href={reel.product.href} className="flex min-w-0 flex-1 items-center gap-2 text-ink hover:text-teal">
            <span aria-hidden="true" className="relative hidden size-9 flex-none overflow-hidden rounded-lg bg-sand sm:block">
              {reel.product.imageUrl && <Image src={reel.product.imageUrl} alt="" fill sizes="36px" className="object-cover" />}
            </span>
            <span className="flex min-w-0 flex-1 flex-col leading-tight">
              <span className="truncate text-xs font-semibold sm:text-[0.8125rem]">{reel.product.name}</span>
              <span className="text-[0.8125rem] font-bold">{reel.product.price}</span>
            </span>
          </Link>
          <button
            type="button"
            onClick={() => toast.success(`${reel.product.name} added to cart`, { description: "Cart arrives in Step 9." })}
            aria-label={`Add ${reel.product.name} to cart`}
            className="flex size-9 flex-none items-center justify-center gap-1.5 rounded-full bg-teal text-[0.8125rem] font-semibold sm:h-9 sm:w-auto sm:rounded-lg text-cream transition-colors hover:bg-teal/90 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            <ShoppingBagIcon aria-hidden="true" className="size-4" />
            <span className="hidden sm:inline">Add to cart</span>
          </button>
        </div>
      </div>
    </article>
  )
}
