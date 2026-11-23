import Link from "next/link"
import { CheckIcon } from "lucide-react"

import { InstagramIcon, TiktokIcon, YoutubeIcon } from "@/components/icons/social-icons"
import { NewsletterForm } from "@/features/newsletter/components/newsletter-form"
import { siteConfig } from "@/lib/config/site"
import { cn } from "@/lib/utils"

import type { newsletter as NewsletterContent } from "../data"

const socials = [
  { label: "Instagram", href: siteConfig.social.instagram, Icon: InstagramIcon },
  { label: "YouTube", href: siteConfig.social.youtube, Icon: YoutubeIcon },
  { label: "TikTok", href: siteConfig.social.tiktok, Icon: TiktokIcon },
]

/** Email sign-up with a preview of the welcome email. */
export function NewsletterSection({ content, className }: { content: typeof NewsletterContent; className?: string }) {
  return (
    <section id="newsletter" aria-labelledby="mail-h" className={cn("container-shop", className)}>
      <div className="grid grid-cols-1 items-center gap-10 rounded-[20px] bg-terra-soft p-7 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-12 lg:p-12">
        <div className="flex flex-col gap-[18px]">
          <span className="text-xs font-semibold tracking-[0.08em] text-terra-text uppercase">{content.eyebrow}</span>
          <h2 id="mail-h" className="text-[1.75rem] leading-[1.1] md:text-[2.25rem]">
            {content.title}
          </h2>
          <ul className="flex flex-wrap gap-x-[22px] gap-y-2 text-[0.9375rem]">
            {content.perks.map((perk) => (
              <li key={perk} className="flex items-center gap-2">
                <CheckIcon aria-hidden="true" className="size-[18px] text-teal" />
                {perk}
              </li>
            ))}
          </ul>
          <NewsletterForm cta={content.cta} />
          <p className="text-[0.8125rem] text-slate">
            {content.note} See our{" "}
            <Link href="/policies/privacy-policy" className="text-ink underline underline-offset-2 hover:text-teal">
              privacy policy
            </Link>
            .
          </p>
        </div>

        <div className="flex flex-col items-center gap-[18px]">
          <figure
            aria-label="Preview of the welcome email"
            className="m-0 w-full max-w-[360px] -rotate-2 overflow-hidden rounded-[18px] bg-white shadow-[0_2px_6px_rgba(31,42,46,0.06),0_18px_40px_rgba(31,42,46,0.12)]"
          >
            <div className="flex items-center gap-2.5 border-b border-line-soft px-[18px] py-3.5">
              <span aria-hidden="true" className="grid size-[34px] flex-none place-items-center rounded-full bg-teal font-heading text-base text-cream">
                F
              </span>
              <span className="flex min-w-0 flex-col leading-[1.3]">
                <span className="text-[0.8125rem] font-semibold">Finn at {siteConfig.name}</span>
                <span className="text-xs text-slate">Welcome! Here is your {content.discount} off</span>
              </span>
            </div>
            <div className="flex flex-col gap-3.5 px-[18px] pt-5 pb-[22px]">
              <span className="font-heading text-[1.25rem] leading-[1.2]">Thanks for joining. Your first find is on us.</span>
              <div className="flex items-center justify-between gap-2.5 rounded-xl border-2 border-dashed border-[#e8875e] bg-[#fdf6f2] px-4 py-3.5">
                <span className="flex flex-col leading-tight">
                  <span className="text-xs text-slate">Your code</span>
                  <span className="text-xl font-bold tracking-[0.06em]">{content.code}</span>
                </span>
                <span className="text-[1.75rem] font-bold text-terra-text">{content.discount}</span>
              </div>
              <span className="text-xs text-slate">Valid on your first order. Example email.</span>
            </div>
          </figure>

          <div className="flex flex-col items-center gap-2.5">
            <span className="text-[0.8125rem] text-slate">Follow along</span>
            <ul className="flex gap-2.5">
              {socials.map(({ label, href, Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${siteConfig.name} on ${label}`}
                    className="grid size-11 place-items-center rounded-full bg-white text-ink transition-colors hover:bg-teal hover:text-cream focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                  >
                    <Icon className="size-5" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
