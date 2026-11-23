import { SearchIcon } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * Header search. A plain GET form to /search, so it works before JavaScript loads.
 * Suggestions as you type are added in Step 10.
 */
export function HeaderSearch({ className }: { className?: string }) {
  return (
    <form
      role="search"
      action="/search"
      className={cn(
        "flex h-12 w-full min-w-0 items-center gap-3 rounded-[10px] border border-transparent bg-sand px-4 transition-colors focus-within:border-teal focus-within:bg-white",
        className
      )}
    >
      <label htmlFor="site-search" className="sr-only">
        Search Mcesta
      </label>
      <SearchIcon aria-hidden="true" className="size-5 shrink-0 text-slate" />
      <input
        id="site-search"
        name="q"
        type="search"
        placeholder="Search for gifts, decor and more"
        autoComplete="off"
        className="h-full min-w-0 flex-1 appearance-none bg-transparent text-[0.9375rem] text-ink outline-none placeholder:text-slate"
      />
    </form>
  )
}
