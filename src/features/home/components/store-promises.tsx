import { HeadsetIcon, PackageCheckIcon, SparklesIcon, type LucideIcon } from "lucide-react"

import { siteConfig } from "@/lib/config/site"
import { cn } from "@/lib/utils"

import type { StorePromise } from "../data"

const icons: Record<StorePromise["icon"], LucideIcon> = {
  quality: SparklesIcon,
  damage: PackageCheckIcon,
  support: HeadsetIcon,
}

/** "Why shop with Mcesta": three promise cards. */
export function StorePromises({ promises, className }: { promises: StorePromise[]; className?: string }) {
  return (
    <section id="promise" aria-labelledby="promise-h" className={cn("container-shop", className)}>
      <div className="mb-5 flex flex-col gap-1">
        <h2 id="promise-h" className="text-[1.375rem] leading-[1.15] md:text-[1.75rem]">
          Why shop with {siteConfig.name}
        </h2>
        <p className="text-[0.9375rem] text-slate">Three promises behind every order.</p>
      </div>
      <ul className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {promises.map((item) => {
          const Icon = icons[item.icon]
          return (
            <li
              key={item.eyebrow}
              className="flex min-h-[13.75rem] flex-col justify-between gap-7 rounded-2xl p-6 md:min-h-[15rem] md:p-7"
              style={{ background: item.bg }}
            >
              <div className="flex items-start justify-between gap-3">
                <span
                  className={cn(
                    "text-xs font-bold tracking-[0.08em] uppercase",
                    item.eyebrowTone === "terra" ? "text-terra-text" : "text-teal"
                  )}
                >
                  {item.eyebrow}
                </span>
                <span aria-hidden="true" className="grid size-14 flex-none place-items-center rounded-full bg-white text-teal">
                  <Icon className="size-6" />
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-[1.25rem] leading-[1.12] md:text-[1.375rem]">{item.title}</h3>
                <p className="max-w-[30em] text-[0.9375rem] leading-[1.55] text-slate">{item.text}</p>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
