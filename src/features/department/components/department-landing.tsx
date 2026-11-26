import Image from "next/image"
import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"

import { categoryIcons } from "@/components/layout/category-icons"
import { departmentAllHref, type Department } from "@/lib/navigation"
import type { Image as ImageData } from "@/lib/shopify/types"

import { departmentBanners, departmentTiles } from "../data"
import { BannerRail } from "./banner-rail"

const tints = ["#EFE6D8", "#E3EFEC", "#F7E3D8", "#E4E9EC", "#F3EEE6"]

/** Category tile: collection photo when there is one, otherwise a soft tint with the department icon. */
function Tile({
  label,
  href,
  image,
  index,
  icon: Icon,
}: {
  label: string
  href: string
  image: ImageData | null
  index: number
  icon: (typeof categoryIcons)[keyof typeof categoryIcons]
}) {
  return (
    <Link href={href} className="group flex flex-col gap-2.5">
      <span
        className="relative grid aspect-square place-items-center overflow-hidden rounded-2xl ring-1 ring-ink/5 transition-[box-shadow,transform] duration-300 group-hover:-translate-y-0.5 group-hover:shadow-[0_10px_24px_-10px_rgba(31,42,46,0.25)]"
        style={{ background: tints[index % tints.length] }}
      >
        {image ? (
          <Image
            src={image.url}
            alt=""
            fill
            sizes="(min-width: 768px) 140px, 30vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <span aria-hidden="true" className="grid size-12 place-items-center rounded-full bg-white/70 text-ink/60 md:size-14">
            <Icon className="size-6" strokeWidth={1.6} />
          </span>
        )}
      </span>
      <span className="text-center text-[0.8125rem] leading-tight font-medium text-ink group-hover:text-teal">
        {label}
      </span>
    </Link>
  )
}

/**
 * Department front page (/gifts, /kitchen …): title, offers, "shop for" tiles and a tile per
 * category. The full product list with filters lives at /{department}/all.
 */
export function DepartmentLanding({ department }: { department: Department }) {
  const banners = departmentBanners(department)
  const links = departmentTiles(department)
  const Icon = categoryIcons[department.icon]
  const allHref = departmentAllHref(department)

  return (
    <div className="container-shop flex flex-col gap-8 pt-5 pb-16 md:gap-11 md:pt-6">
      {/* Title for search engines and screen readers; the banners are the visual header. */}
      <h1 className="sr-only">{department.label}</h1>

      <BannerRail banners={banners} label={`${department.label} offers`} />

      <section aria-labelledby="dept-cats-h" className="flex flex-col gap-4">
        <div className="flex items-end justify-between gap-4">
          <h2 id="dept-cats-h" className="text-[1.25rem] leading-tight md:text-[1.375rem]">
            Shop {department.label} by category
          </h2>
          <Link href={allHref} className="group inline-flex items-center gap-1 text-sm font-semibold text-teal hover:underline">
            Shop all {department.label}
            <ArrowRightIcon aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
        <ul className="grid grid-cols-3 gap-x-3 gap-y-5 sm:grid-cols-4 md:grid-cols-[repeat(auto-fill,minmax(128px,1fr))] md:gap-x-5 md:gap-y-6">
          {links.map((link, i) => (
            <li key={link.href}>
              <Tile label={link.label} href={link.href} image={link.image} index={i} icon={Icon} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
