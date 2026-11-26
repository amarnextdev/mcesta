import Link from "next/link"
import { ArrowUpIcon, GlobeIcon, MailIcon } from "lucide-react"
import type { ReactNode } from "react"

import { Logo } from "@/components/brand/logo"
import { getNavigation } from "@/lib/navigation/navigation.server"
import { siteConfig } from "@/lib/config/site"

const socials: { label: string; href: string; icon: ReactNode }[] = [
  {
    label: "Instagram",
    href: siteConfig.social.instagram,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="size-[18px]">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.9" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: "YouTube",
    href: siteConfig.social.youtube,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="size-[18px]">
        <rect x="2.5" y="5" width="19" height="14" rx="4" />
        <path d="M10 9.2v5.6l4.8-2.8z" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: "TikTok",
    href: siteConfig.social.tiktok,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="size-[18px]">
        <path d="M13.5 3v11.5a3.5 3.5 0 1 1-3.5-3.5" />
        <path d="M13.5 3c.4 2.6 2.2 4.4 5 4.6" />
      </svg>
    ),
  },
]

/**
 * Dark footer. Brand, contact and socials on the left, three link columns, then a bottom bar
 * with copyright, where we ship, accepted payments and a back-to-top link.
 */
export async function SiteFooter() {
  const year = 2026
  // Footer links come from the Shopify menu "storefront-footer".
  const { footer: footerNav } = await getNavigation()

  return (
    <footer className="relative isolate overflow-hidden bg-ink text-sand">
      {/* Soft brand glow, purely decorative. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 -left-40 -z-10 size-[520px] rounded-full bg-teal opacity-25 blur-[120px]"
      />
      <div aria-hidden="true" className="h-1 bg-linear-to-r from-teal via-terra to-teal opacity-80" />

      <div className="container-shop flex flex-col gap-12 pt-14 pb-8 md:pt-16">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-[minmax(0,1.5fr)_repeat(3,minmax(0,1fr))] md:gap-x-10">
          {/* Brand */}
          <div className="col-span-2 flex min-w-0 flex-col gap-5 md:col-span-1 md:pr-8">
            <Logo tone="reverse" className="h-10 self-start" />
            <p className="max-w-[30em] text-[0.9375rem] leading-relaxed text-[#a7b2b0]">
              {siteConfig.tagline}. Thoughtful finds for the home, the desk and the people you love, shipped from the
              USA.
            </p>

            <a
              href={`mailto:${siteConfig.supportEmail}`}
              className="group flex max-w-sm items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3 pr-4 transition-colors hover:border-white/20 hover:bg-white/[0.07]"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-teal text-cream">
                <MailIcon aria-hidden="true" className="size-[18px]" />
              </span>
              <span className="flex min-w-0 flex-col leading-tight">
                <span className="text-sm font-semibold text-sand">Need help? Email us</span>
                <span className="truncate text-[0.8125rem] text-[#a7b2b0]">{siteConfig.supportReply}</span>
              </span>
            </a>

            <ul aria-label="Follow us" className="flex gap-2">
              {socials.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${siteConfig.name} on ${s.label}`}
                    className="grid size-10 place-items-center rounded-full border border-white/12 text-sand transition-colors hover:border-sand hover:bg-sand hover:text-ink"
                  >
                    {s.icon}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Link columns */}
          {footerNav.map((col) => (
            <nav key={col.title} aria-label={col.title} className="flex min-w-0 flex-col gap-4">
              <h2 className="font-sans text-xs font-bold tracking-[0.12em] text-sand uppercase">{col.title}</h2>
              <ul className="flex flex-col gap-3 text-[0.9375rem]">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="group relative inline-flex text-[#a7b2b0] transition-colors hover:text-white"
                    >
                      {l.label}
                      <span
                        aria-hidden="true"
                        className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-terra-light transition-transform duration-300 group-hover:scale-x-100"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col gap-5 border-t border-white/10 pt-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[0.8125rem] text-[#a7b2b0]">
            <span>
              © {year} {siteConfig.name}. All rights reserved.
            </span>
            <span aria-hidden="true" className="hidden size-1 rounded-full bg-white/20 sm:block" />
            <span className="inline-flex items-center gap-1.5">
              <GlobeIcon aria-hidden="true" className="size-3.5" />
              {siteConfig.shipsTo}
            </span>
            <span aria-hidden="true" className="hidden size-1 rounded-full bg-white/20 sm:block" />
            <span>{siteConfig.alsoShipsTo}</span>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <ul aria-label="Accepted payment methods" className="flex flex-wrap gap-1.5">
              {siteConfig.paymentMethods.map((m) => (
                <li
                  key={m}
                  className="inline-flex h-7 min-w-12 items-center justify-center rounded-md bg-white px-2.5 text-[0.6875rem] font-bold tracking-wide text-ink shadow-sm"
                >
                  {m}
                </li>
              ))}
            </ul>
            <a
              href="#"
              className="group inline-flex h-9 items-center gap-1.5 rounded-full border border-white/12 px-3.5 text-[0.8125rem] font-semibold text-sand transition-colors hover:border-sand hover:bg-sand hover:text-ink"
            >
              Back to top
              <ArrowUpIcon aria-hidden="true" className="size-3.5 transition-transform group-hover:-translate-y-0.5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
