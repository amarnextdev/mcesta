"use client"

import Link from "next/link"
import { MenuIcon } from "lucide-react"
import { useState } from "react"

import { Logo } from "@/components/brand/logo"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { categoryHref, departmentAllHref, subcategoryHref, utilityLinks, type Department } from "@/lib/navigation"

/** Phone and tablet menu: a left drawer with departments as an accordion. */
export function MobileNav({ departments }: { departments: Department[] }) {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        aria-label="Open menu"
        className="grid size-11 place-items-center rounded-full text-ink hover:bg-sand lg:hidden"
      >
        <MenuIcon className="size-6" strokeWidth={1.8} />
      </SheetTrigger>
      <SheetContent side="left" className="w-[88vw] max-w-sm gap-0 overflow-y-auto bg-white p-0">
        <SheetHeader className="border-b border-line px-5 py-4">
          <SheetTitle>
            <Logo className="h-8" />
          </SheetTitle>
        </SheetHeader>
        <Accordion type="single" collapsible className="px-5">
          {departments.map((d) => (
            <AccordionItem key={d.slug} value={d.slug} className="border-line-soft">
              <AccordionTrigger className="py-4 text-base font-semibold">{d.label}</AccordionTrigger>
              <AccordionContent className="flex flex-col gap-4 pb-4">
                {d.categories.length > 0 && (
                  <ul className="flex flex-col">
                    {d.categories.map((c) => (
                      <li key={c.slug}>
                        <Link href={categoryHref(d, c)} onClick={close} className="block py-1.5 text-[0.9375rem] font-medium text-ink">
                          {c.label}
                        </Link>
                        {c.subcategories.length > 0 && (
                          <ul className="mb-1 ml-3 border-l border-line-soft pl-3">
                            {c.subcategories.map((sub) => (
                              <li key={sub.slug}>
                                <Link
                                  href={subcategoryHref(d, c, sub)}
                                  onClick={close}
                                  className="block py-1 text-sm text-slate"
                                >
                                  {sub.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
                {d.popular.length > 0 && (
                  <div>
                    <span className="mb-1 block text-xs font-bold tracking-[0.08em] text-slate uppercase">Popular</span>
                    {d.popular.map((l) => (
                      <Link key={l.href} href={l.href} onClick={close} className="block py-1.5 text-[0.9375rem] text-ink">
                        {l.label}
                      </Link>
                    ))}
                  </div>
                )}
                <Link href={departmentAllHref(d)} onClick={close} className="text-sm font-semibold text-teal">
                  Shop all {d.label} →
                </Link>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <div className="mt-2 flex flex-col gap-1 border-t border-line px-5 py-4">
          {utilityLinks.map((l) => (
            <Link key={l.href} href={l.href} onClick={close} className="py-2 text-[0.9375rem] text-slate">
              {l.label}
            </Link>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  )
}
