"use client"

import { ShoppingBagIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"

/** Step 6c: toast only. Adds the bundle product to the real cart in Step 9. */
export function AddBundleButton({ title }: { title: string }) {
  return (
    <Button
      size="lg"
      className="h-[3.25rem] flex-[1_1_220px] text-base"
      onClick={() => toast.success(`${title} added to cart`, { description: "Cart arrives in Step 9." })}
    >
      <ShoppingBagIcon data-icon="inline-start" className="size-5" />
      Add the set to cart
    </Button>
  )
}
