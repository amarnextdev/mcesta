import Link from "next/link"

import { announcement } from "@/lib/config/site"

/** Terracotta offer bar above the header. Hidden when `announcement.enabled` is false. */
export function AnnouncementBar() {
  if (!announcement.enabled) return null

  return (
    <div className="bg-terra px-4 py-2 text-center text-[0.8125rem] font-medium tracking-[0.02em] text-white">
      <span className="font-bold">{announcement.lead}</span> {announcement.text}
      <span aria-hidden="true" className="mx-2.5 hidden sm:inline">·</span>
      <span className="hidden sm:inline">{announcement.extra}</span>
      <Link href={announcement.cta.href} className="ml-2.5 font-bold text-white underline-offset-2 hover:underline">
        {announcement.cta.label}
      </Link>
    </div>
  )
}
