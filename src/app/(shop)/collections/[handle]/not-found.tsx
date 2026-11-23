import Link from "next/link"

import { Button } from "@/components/ui/button"

export default function CollectionNotFound() {
  return (
    <div className="container-shop flex flex-col items-center gap-3 py-20 text-center">
      <span className="text-xs font-semibold tracking-[0.08em] text-terra-text uppercase">404</span>
      <h1 className="text-[1.625rem] leading-tight md:text-[2rem]">We couldn&apos;t find that collection</h1>
      <p className="max-w-md text-[0.9375rem] text-slate">It may have moved or been renamed. Try one of our collections instead.</p>
      <div className="mt-2 flex flex-wrap justify-center gap-2.5">
        <Button asChild size="lg">
          <Link href="/collections">See all collections</Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="border-[1.5px] border-ink bg-transparent">
          <Link href="/collections/all">Shop all products</Link>
        </Button>
      </div>
    </div>
  )
}
