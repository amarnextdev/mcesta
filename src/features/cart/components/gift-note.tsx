"use client"

import { useState } from "react"
import { CheckIcon, GiftIcon } from "lucide-react"

import type { Cart } from "@/lib/shopify/cart"
import { cn } from "@/lib/utils"

import { useCartNote } from "../hooks"

/** "This is a gift" + note, saved to the Shopify cart note (shown to you on the order). */
export function GiftNote({ cart, className }: { cart: Cart; className?: string }) {
  const save = useCartNote()
  const [open, setOpen] = useState(Boolean(cart.note))
  const [note, setNote] = useState(cart.note)
  const saved = note === cart.note

  return (
    <div className={cn("flex flex-col gap-2.5 rounded-2xl border border-dashed border-teal-line bg-teal-tint px-4 py-3.5", className)}>
      <button
        type="button"
        role="checkbox"
        aria-checked={open}
        onClick={() => {
          setOpen(!open)
          if (open && cart.note) {
            setNote("")
            save.mutate("")
          }
        }}
        className="flex items-center gap-2.5 text-left text-sm"
      >
        <span aria-hidden="true" className={cn("grid size-5 place-items-center rounded-[5px] border-[1.5px] border-teal", open ? "bg-teal text-cream" : "bg-white")}>
          {open && <CheckIcon className="size-3.5" strokeWidth={3} />}
        </span>
        <GiftIcon aria-hidden="true" className="size-[18px] text-teal" />
        <span>
          <span className="font-bold">This is a gift.</span> Add a free gift note
        </span>
      </button>
      {open && (
        <>
          <textarea
            rows={3}
            maxLength={500}
            aria-label="Gift note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onBlur={() => !saved && save.mutate(note)}
            placeholder="Write your message. We'll include it with the order."
            className="w-full resize-y rounded-[10px] border-[1.5px] border-line-strong bg-white px-3 py-2.5 text-[0.9375rem] outline-none focus-visible:border-teal focus-visible:ring-3 focus-visible:ring-ring/40"
          />
          <span aria-live="polite" className="text-xs text-slate">
            {save.isPending ? "Saving…" : saved && note ? "Saved" : `${note.length}/500`}
          </span>
        </>
      )}
    </div>
  )
}

