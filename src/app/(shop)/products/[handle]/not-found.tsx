import Link from "next/link"

import { Button } from "@/components/ui/button"

export default function ProductNotFound() {
  return (
    <div className="container-shop flex flex-col items-center gap-3 py-20 text-center">
      <span className="text-xs font-semibold tracking-[0.08em] text-terra-text uppercase">404</span>
      <h1 className="text-[1.625rem] leading-tight md:text-[2rem]">This product isn&apos;t available</h1>
      <p className="max-w-md text-[0.9375rem] text-slate">It may have sold out for good or the link may be old. Have a look at what&apos;s new instead.</p>
      <div className="mt-2 flex flex-wrap justify-center gap-2.5">
        <Button asChild size="lg">
          <Link href="/collections/all?sort=newest">See new arrivals</Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="border-[1.5px] border-ink bg-transparent">
          <Link href="/">Go to homepage</Link>
        </Button>
      </div>
    </div>
  )
}
