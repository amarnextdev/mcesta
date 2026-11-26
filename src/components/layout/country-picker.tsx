"use client"

import { useQueryClient } from "@tanstack/react-query"
import { ChevronDownIcon, Loader2Icon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { toast } from "sonner"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { setCountryAction } from "@/lib/market/actions"
import { flagUrl, type Country } from "@/lib/market/countries"
import { cn } from "@/lib/utils"

function Flag({ code, className }: { code: string; className?: string }) {
  return (
    // Tiny static flag from flagcdn; next/image would add nothing here.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={flagUrl(code)}
      alt=""
      width={20}
      height={15}
      loading="lazy"
      className={cn("h-[15px] w-5 flex-none rounded-[3px] object-cover ring-1 ring-black/10", className)}
    />
  )
}

/**
 * Header country switcher. Picking a country stores it (cookie), moves the cart to that
 * market, then reloads the page data: prices, currency and stock follow the new market.
 */
export function CountryPicker({ countries, current }: { countries: Country[]; current: string }) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [pending, startTransition] = useTransition()
  const active = countries.find((c) => c.code === current) ?? countries[0]

  function choose(code: string) {
    if (code === current) return
    startTransition(async () => {
      const result = await setCountryAction(code)
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      // Every cached list, cart and wishlist was priced for the old market.
      await queryClient.invalidateQueries()
      router.refresh()
      const next = countries.find((c) => c.code === code)
      if (next) toast.success(`Shopping in ${next.name} · prices in ${next.currency}`)
    })
  }

  if (!active) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Shipping to ${active.name}, prices in ${active.currency}. Change country`}
        disabled={pending}
        className="inline-flex h-11 items-center gap-1.5 rounded-full px-2.5 text-sm font-semibold text-ink transition-colors hover:bg-sand focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none disabled:opacity-70"
      >
        {pending ? <Loader2Icon aria-hidden="true" className="size-4 animate-spin" /> : <Flag code={active.code} />}
        <span className="hidden tabular-nums md:inline">{active.currency}</span>
        <ChevronDownIcon aria-hidden="true" className="hidden size-3.5 text-slate md:block" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={6} className="w-64 rounded-xl p-1.5">
        <DropdownMenuLabel className="px-2 pt-1.5 pb-2 text-xs font-semibold text-slate">
          Ship to · prices update for your country
        </DropdownMenuLabel>
        <DropdownMenuRadioGroup value={current} onValueChange={choose}>
          {countries.map((c) => (
            <DropdownMenuRadioItem key={c.code} value={c.code} className="gap-2.5 rounded-lg py-2 pl-2 text-sm">
              <Flag code={c.code} />
              <span className="min-w-0 flex-1 truncate">{c.name}</span>
              <span className="text-xs text-slate tabular-nums">
                {c.currency} {c.symbol}
              </span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
