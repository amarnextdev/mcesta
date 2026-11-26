import Link from "next/link"

import { Logo } from "@/components/brand/logo"
import { getDepartments } from "@/lib/navigation/navigation.server"

import { AnnouncementBar } from "./announcement-bar"
import { CategoryNav } from "./category-nav"
import { CountrySelector } from "./country-selector"
import { HeaderActions } from "./header-actions"
import { HeaderSearch } from "./header-search"
import { MobileNav } from "./mobile-nav"
import { ScrollWatcher } from "./scroll-watcher"

/**
 * Site header: offer bar (scrolls away), then a sticky block with logo + search + icons
 * and the category bar. Icons in the category bar show on For You and the department pages.
 * Product-list pages skip the offer bar and always use the compact bar.
 * Product and cart pages hide the category bar altogether.
 */
export async function SiteHeader() {
  // Cached Shopify menu, so the header still prerenders.
  const departments = await getDepartments()

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:shadow"
      >
        Skip to content
      </a>
      <div className="listing-page:hidden">
        <AnnouncementBar />
      </div>
      <header className="group/header sticky top-0 z-30 border-b border-line bg-white">
        <ScrollWatcher />
        <div className="container-shop grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-3 py-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,640px)_minmax(0,1fr)] lg:gap-x-8 lg:py-3.5">
          <div className="flex items-center gap-1 justify-self-start">
            <MobileNav departments={departments} />
            <Link href="/" aria-label="Mcesta home" className="rounded-md focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none">
              <Logo className="h-9 lg:h-10" />
            </Link>
          </div>
          <HeaderSearch className="col-span-2 row-start-2 lg:col-span-1 lg:row-start-auto" />
          <div className="flex items-center gap-1 justify-self-end">
            <CountrySelector />
            <HeaderActions />
          </div>
        </div>
        <div className="product-page:hidden cart-page:hidden">
          <CategoryNav departments={departments} />
        </div>
      </header>
    </>
  )
}
