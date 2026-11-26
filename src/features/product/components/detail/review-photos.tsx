"use client"

import { useEffect, useRef, useState } from "react"
import { CameraIcon, XIcon } from "lucide-react"

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

import { reviewPhotoUploadsAction } from "../../actions"
import { REVIEW_PHOTOS } from "../../feedback"

/** Photo picker for the review form: previews, remove, limits. Files upload on submit. */
export function ReviewPhotoPicker({ files, onChange }: { files: File[]; onChange: (files: File[]) => void }) {
  const input = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [previews, setPreviews] = useState<string[]>([])

  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f))
    setPreviews(urls)
    return () => urls.forEach((u) => URL.revokeObjectURL(u))
  }, [files])

  function add(list: FileList | null) {
    if (!list) return
    const allowed: readonly string[] = REVIEW_PHOTOS.types
    const picked = Array.from(list)
    const ok = picked.filter((f) => allowed.includes(f.type) && f.size <= REVIEW_PHOTOS.maxBytes)
    setError(ok.length < picked.length ? "Some files were skipped: photos must be JPG, PNG, WebP or HEIC, up to 5 MB." : null)
    const next = [...files, ...ok].slice(0, REVIEW_PHOTOS.max)
    if (files.length + ok.length > REVIEW_PHOTOS.max) setError(`You can add up to ${REVIEW_PHOTOS.max} photos.`)
    onChange(next)
    if (input.current) input.current.value = ""
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[0.8125rem] font-semibold">
        Photos <span className="font-normal text-slate">(optional, up to {REVIEW_PHOTOS.max})</span>
      </span>
      <div className="flex flex-wrap gap-2.5">
        {previews.map((src, i) => (
          <div key={src} className="relative size-20 overflow-hidden rounded-xl border border-line bg-sand">
            {/* Local preview of a file the shopper just picked (blob: URL). */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={`Photo ${i + 1}`} className="size-full object-cover" />
            <button
              type="button"
              aria-label={`Remove photo ${i + 1}`}
              onClick={() => onChange(files.filter((_, j) => j !== i))}
              className="absolute top-1 right-1 grid size-6 place-items-center rounded-full bg-ink/75 text-white hover:bg-ink"
            >
              <XIcon className="size-3.5" />
            </button>
          </div>
        ))}
        {files.length < REVIEW_PHOTOS.max && (
          <button
            type="button"
            onClick={() => input.current?.click()}
            className="flex size-20 flex-col items-center justify-center gap-1 rounded-xl border-[1.5px] border-dashed border-teal-line bg-teal-tint text-xs font-semibold text-teal transition-colors hover:border-teal"
          >
            <CameraIcon aria-hidden="true" className="size-5" />
            Add photo
          </button>
        )}
      </div>
      <input
        ref={input}
        type="file"
        accept={REVIEW_PHOTOS.types.join(",")}
        multiple
        hidden
        onChange={(e) => add(e.target.files)}
      />
      {error && <span className="text-[0.8125rem] font-semibold text-[#a33a1f]">{error}</span>}
    </div>
  )
}

/** Sends picked photos straight to storage. Returns their storage paths, or an error message. */
export async function uploadReviewPhotos(files: File[]): Promise<{ paths: string[] } | { error: string }> {
  if (files.length === 0) return { paths: [] }
  const signed = await reviewPhotoUploadsAction(files.map((f) => ({ type: f.type, size: f.size })))
  if (!signed.ok) return { error: signed.error }
  try {
    await Promise.all(
      signed.uploads.map(async ({ url }, i) => {
        const res = await fetch(url, { method: "PUT", body: files[i], headers: { "Content-Type": files[i].type } })
        if (!res.ok) throw new Error(`Upload failed (${res.status})`)
      })
    )
    return { paths: signed.uploads.map((u) => u.path) }
  } catch {
    return { error: "Your photos didn't upload. Check your connection and try again." }
  }
}

/** Review photos as small thumbnails; tap to see one large. */
export function ReviewPhotoStrip({ photos, author }: { photos: string[]; author: string }) {
  const [open, setOpen] = useState<number | null>(null)
  if (photos.length === 0) return null
  return (
    <>
      <div className="flex flex-wrap gap-2">
        {photos.map((src, i) => (
          <button
            key={src}
            type="button"
            onClick={() => setOpen(i)}
            aria-label={`Open photo ${i + 1} from ${author}`}
            className="size-16 overflow-hidden rounded-lg border border-line-soft bg-sand transition-opacity hover:opacity-85 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none sm:size-20"
          >
            {/* Shopper photos from Supabase Storage, shown as uploaded. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" loading="lazy" className="size-full object-cover" />
          </button>
        ))}
      </div>
      <Dialog open={open !== null} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent className="max-w-3xl border-0 bg-transparent p-0 shadow-none">
          <DialogTitle className="sr-only">Photo from {author}</DialogTitle>
          {open !== null && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photos[open]} alt={`Photo from ${author}`} className={cn("max-h-[80vh] w-full rounded-2xl object-contain")} />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
