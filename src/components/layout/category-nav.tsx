import Image from "next/image"
import Link from "next/link"
import { ArrowRightIcon, ChevronRightIcon } from "lucide-react"

import { departmentBanners } from "@/features/department/data"
import {
  categoryHref,
  departmentAllHref,
  departmentHandles,
  departmentHref,
  forYouLink,
  subcategoryHref,
  utilityLinks,
  type Category,
  type Department,
} from "@/lib/navigation"
import { cn } from "@/lib/utils"

import { categoryIcons } from "./category-icons"
import { CategoryTab } from "./category-tab"
import { DropdownNav } from "./dropdown-nav"

/*
 * Category bar (icon + label, like a marketplace app). "For You" is the homepage.
 * Each item opens its department page (banners + category tiles).
 *
 * On product-list pages (header has `data-listing`), items go straight to the department's
 * product list, and hovering one on desktop shows a dropdown with all its categories.
 * Phones and tablets: one sideways-scrolling row. Track order and Help sit at the end.
 */

const panel = [
  "invisible absolute inset-x-0 top-full z-40 hidden -translate-y-1 opacity-0",
  "transition-[opacity,visibility,translate] duration-150 ease-out",
  "lg:listing-page:block",
  "group-hover/mi:visible group-hover/mi:translate-y-0 group-hover/mi:opacity-100",
  "group-focus-within/mi:visible group-focus-within/mi:translate-y-0 group-focus-within/mi:opacity-100",
  "group-data-closed/nav:invisible! group-data-closed/nav:opacity-0!",
].join(" ")

const groupTitle = "mb-1.5 block text-[0.6875rem] font-bold tracking-[0.1em] text-slate uppercase"
const menuLink =
  "group/link flex items-center justify-between gap-2 rounded-lg px-2.5 py-[7px] text-sm text-ink transition-colors hover:bg-sand hover:text-teal focus-visible:bg-sand focus-visible:outline-none"

function MenuLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className={menuLink}>
      {label}
      <ChevronRightIcon
        aria-hidden="true"
        className="size-3.5 -translate-x-1 opacity-0 transition group-hover/link:translate-x-0 group-hover/link:opacity-100"
      />
    </Link>
  )
}

/** One category in the dropdown: photo + name (links to the category), its sub-categories below. */
function CategoryColumn({
  department,
  category,
  Icon,
}: {
  department: Department
  category: Category
  Icon: (typeof categoryIcons)[keyof typeof categoryIcons]
}) {
  const subs = category.subcategories
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <Link
        href={categoryHref(department, category)}
        className="group/cat flex items-center gap-3 rounded-xl p-1.5 pr-3 transition-colors hover:bg-sand focus-visible:bg-sand focus-visible:outline-none"
      >
        <span className="relative grid size-12 shrink-0 place-items-center overflow-hidden rounded-lg bg-sand text-ink/50 ring-1 ring-ink/5">
          {category.image ? (
            <Image src={category.image.url} alt="" fill sizes="48px" className="object-cover" />
          ) : (
            <Icon aria-hidden="true" className="size-5" strokeWidth={1.7} />
          )}
        </span>
        <span className="flex min-w-0 flex-col leading-tight">
          <span className="line-clamp-2 text-[0.9375rem] font-semibold text-ink group-hover/cat:text-teal">{category.label}</span>
          <span className="text-xs text-slate">
            {subs.length > 0 ? `${subs.length} ${subs.length === 1 ? "type" : "types"}` : "Shop now"}
          </span>
        </span>
        <ChevronRightIcon
          aria-hidden="true"
          className="ml-auto size-4 shrink-0 text-slate opacity-0 transition group-hover/cat:translate-x-0.5 group-hover/cat:opacity-100"
        />
      </Link>
      {subs.length > 0 && (
        <ul className="ml-[1.9rem] border-l border-line-soft pl-2">
          {subs.map((sub) => (
            <li key={sub.slug}>
              <MenuLink href={subcategoryHref(department, category, sub)} label={sub.label} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/** Desktop dropdown on product-list pages: department summary, its categories and an offer. */
function DepartmentDropdown({ department }: { department: Department }) {
  const Icon = categoryIcons[department.icon]
  const count = department.categories.length
  const promo = departmentBanners(department)[0]

  return (
    <div role="region" aria-label={`${department.label} categories`} className={panel}>
      <div className="border-y border-line bg-white shadow-[0_24px_48px_-12px_rgba(31,42,46,0.22)]">
        <div className="container-shop grid grid-cols-[200px_minmax(0,1fr)_260px] gap-8 py-6">
          <div className="flex flex-col gap-3 border-r border-line-soft pr-6">
            <span aria-hidden="true" className="grid size-12 place-items-center rounded-xl bg-teal-soft text-teal">
              <Icon className="size-6" strokeWidth={1.8} />
            </span>
            <span className="flex flex-col gap-0.5">
              <span className="font-heading text-[1.25rem] leading-tight">{department.label}</span>
              <span className="text-[0.8125rem] text-slate">
                {count} {count === 1 ? "category" : "categories"}
              </span>
            </span>
            <Link
              href={departmentAllHref(department)}
              className="group/all mt-auto inline-flex h-9 items-center justify-center gap-1.5 self-start rounded-full bg-ink px-4 text-[0.8125rem] font-semibold text-cream transition-colors hover:bg-teal"
            >
              Shop all
              <ArrowRightIcon aria-hidden="true" className="size-3.5 transition-transform group-hover/all:translate-x-0.5" />
            </Link>
          </div>

          <div className="grid content-start gap-x-6 gap-y-5 [grid-template-columns:repeat(auto-fill,minmax(200px,1fr))]">
            {department.categories.map((c) => (
              <CategoryColumn key={c.slug} department={department} category={c} Icon={Icon} />
            ))}
            {department.popular.length > 0 && (
              <div className="min-w-44">
                <span className={cn(groupTitle, "px-2.5")}>Popular</span>
                <ul>
                  {department.popular.map((l) => (
                    <li key={l.href}>
                      <MenuLink href={l.href} label={l.label} />
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {promo && (
            <Link
              href={promo.href}
              className="group/promo flex flex-col justify-end gap-1.5 rounded-xl p-5 transition-transform hover:-translate-y-0.5"
              style={{ background: promo.theme.bg, color: promo.theme.fg }}
            >
              <span className="text-[0.6875rem] font-bold tracking-[0.1em] uppercase" style={{ color: promo.theme.accent }}>
                {promo.eyebrow}
              </span>
              <span className="font-heading text-xl leading-tight text-balance">{promo.title}</span>
              <span className="text-[0.8125rem] opacity-80">{promo.subtitle}</span>
              <span className="mt-1 inline-flex items-center gap-1 text-[0.8125rem] font-semibold" style={{ color: promo.theme.accent }}>
                {promo.cta}
                <ArrowRightIcon aria-hidden="true" className="size-3.5 transition-transform group-hover/promo:translate-x-0.5" />
              </span>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

/** The category bar. Departments come from the Shopify menu (see navigation.server.ts). */
export function CategoryNav({ departments }: { departments: Department[] }) {
  return (
    <DropdownNav className="group/nav relative border-t border-line-soft bg-white">
      <div className="container-shop">
        <ul className="-mx-4 flex items-stretch overflow-x-auto px-2 [scrollbar-width:none] lg:mx-0 lg:justify-between lg:px-0 [&::-webkit-scrollbar]:hidden">
          <li className="flex shrink-0 lg:flex-1 lg:justify-center">
            <CategoryTab label={forYouLink.label} href={forYouLink.href} icon={forYouLink.icon} />
          </li>
          {departments.map((d) => (
            // Not positioned: the dropdown anchors to the nav, outside the scrolling row.
            <li key={d.slug} data-menu-item className="group/mi flex shrink-0 lg:flex-1 lg:justify-center">
              <CategoryTab
                label={d.label}
                href={departmentHref(d)}
                listingHref={departmentAllHref(d)}
                handles={departmentHandles(d)}
                icon={d.icon}
                highlight={d.highlight}
              />
              <DepartmentDropdown department={d} />
            </li>
          ))}
          <li aria-hidden="true" className="mx-1 my-4 w-px shrink-0 bg-line transition-[margin] header-compact:my-2.5 lg:mx-2" />
          {utilityLinks.map((item) => (
            <li key={item.href} className="flex shrink-0 lg:flex-1 lg:justify-center">
              <CategoryTab label={item.label} href={item.href} icon={item.icon} muted />
            </li>
          ))}
        </ul>
      </div>
    </DropdownNav>
  )
}
