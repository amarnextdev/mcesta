"use client"

import Link from "next/link"
import { HeartIcon, LogOutIcon, PackageIcon, UserRoundIcon } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type Props = { firstName: string | null; email: string | null }

const item = "flex h-10 cursor-pointer items-center gap-3 rounded-lg px-2.5 text-sm font-medium text-ink focus:bg-sand"

/** Logged-in avatar (first letter) with a menu: orders, wishlist, sign out. */
export function AccountMenu({ firstName, email }: Props) {
  const initial = (firstName || email || "?").trim().charAt(0).toUpperCase()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Your account"
        className="relative grid size-10 place-items-center rounded-full bg-teal font-heading text-base text-cream shadow-[0_6px_14px_-8px_rgba(31,92,90,0.7)] transition-transform outline-none hover:-translate-y-px focus-visible:ring-3 focus-visible:ring-ring/50 data-[state=open]:ring-3 data-[state=open]:ring-teal-soft"
      >
        {initial !== "?" ? initial : <UserRoundIcon className="size-5" strokeWidth={2} />}
        <span aria-hidden="true" className="absolute -right-0.5 -bottom-0.5 size-3 rounded-full bg-success ring-2 ring-white" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="w-64 rounded-xl p-1.5">
        <DropdownMenuLabel className="flex items-center gap-3 px-2.5 py-2.5">
          <span aria-hidden="true" className="grid size-10 flex-none place-items-center rounded-full bg-teal-soft font-heading text-base text-teal">
            {initial}
          </span>
          <span className="flex min-w-0 flex-col leading-tight">
            <span className="truncate text-sm font-bold text-ink">Hi, {firstName || "there"}</span>
            {email && <span className="truncate text-xs font-normal text-slate">{email}</span>}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className={item}>
          <Link href="/account/orders">
            <PackageIcon aria-hidden="true" className="size-4 text-teal" />
            My orders
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className={item}>
          <Link href="/account/wishlist">
            <HeartIcon aria-hidden="true" className="size-4 text-teal" />
            Wishlist
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className={`${item} text-terra-text focus:bg-terra-soft focus:text-terra-text`}>
          {/* Full page load: signing out also ends the Shopify session. */}
          <a href="/account/logout">
            <LogOutIcon aria-hidden="true" className="size-4" />
            Sign out
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
