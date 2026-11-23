import { MinusIcon, PlusIcon } from "lucide-react"

/** − 1 + control. Max 10 per order line keeps dropship stock issues small. */
export function QuantityStepper({ value, onChange, max = 10 }: { value: number; onChange: (n: number) => void; max?: number }) {
  return (
    <div role="group" aria-label="Quantity" className="flex h-[3.25rem] flex-none items-center rounded-[10px] border-[1.5px] border-line-strong bg-white">
      <button
        type="button"
        aria-label="Decrease quantity"
        disabled={value <= 1}
        onClick={() => onChange(value - 1)}
        className="grid h-full w-10 place-items-center rounded-l-[10px] text-ink hover:bg-sand disabled:opacity-30 disabled:hover:bg-transparent"
      >
        <MinusIcon className="size-4" />
      </button>
      <span aria-live="polite" className="min-w-6 text-center font-bold tabular-nums">
        {value}
      </span>
      <button
        type="button"
        aria-label="Increase quantity"
        disabled={value >= max}
        onClick={() => onChange(value + 1)}
        className="grid h-full w-10 place-items-center rounded-r-[10px] text-ink hover:bg-sand disabled:opacity-30 disabled:hover:bg-transparent"
      >
        <PlusIcon className="size-4" />
      </button>
    </div>
  )
}
