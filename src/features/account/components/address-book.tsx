"use client"

import { useActionState, useEffect, useRef, useState, useTransition } from "react"
import { CheckIcon, Loader2Icon, MapPinIcon, PencilIcon, PlusIcon, StarIcon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { FormField, inputClass } from "@/features/product/components/detail/form-field"
import { normalizePostal, postalRule } from "@/features/product/delivery-check"
import { idleState, type FormState } from "@/features/product/feedback"
import { flagUrl } from "@/lib/market/countries"
import { cn } from "@/lib/utils"

import { deleteAddressAction, lookupPostalAction, makeDefaultAddressAction, saveAddressAction } from "../actions"
import { ADDRESS_ZONES, type SavedAddress } from "../address-zones"

type Country = { code: string; name: string }

/** Settings → Addresses: list, add, edit, delete, make default. Saved in the Shopify customer, so checkout offers them too. */
export function AddressBook({
  addresses,
  countries,
  defaultCountry,
  name,
}: {
  addresses: SavedAddress[]
  countries: Country[]
  defaultCountry: string
  name: { firstName: string; lastName: string }
}) {
  const [editing, setEditing] = useState<SavedAddress | "new" | null>(null)
  const [busy, startBusy] = useTransition()

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>, success: string) =>
    startBusy(async () => {
      const result = await fn()
      if (result.ok) toast.success(success)
      else toast.error(result.error ?? "Something went wrong.")
    })

  return (
    <div className="flex flex-col gap-3">
      {addresses.length === 0 ? (
        <p className="flex items-center gap-2.5 rounded-xl bg-cream px-4 py-3 text-sm text-slate">
          <MapPinIcon aria-hidden="true" className="size-4 text-teal" />
          No saved addresses yet. Add one for faster checkout.
        </p>
      ) : (
        <ul className={cn("grid gap-3 sm:grid-cols-2", busy && "pointer-events-none opacity-60")}>
          {addresses.map((a) => (
            <li
              key={a.id}
              className={cn(
                "flex flex-col gap-3 rounded-xl border p-4 text-sm leading-relaxed",
                a.isDefault ? "border-teal bg-teal-tint" : "border-line-soft bg-white"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <address className="not-italic">
                  {a.lines.map((line, i) => (
                    <span key={i} className={i === 0 ? "block font-semibold text-ink" : "block text-slate"}>
                      {line}
                    </span>
                  ))}
                  {a.phone && <span className="block text-slate">{a.phone}</span>}
                </address>
                {a.isDefault && (
                  <span className="inline-flex flex-none items-center gap-1 rounded-full bg-teal px-2 py-0.5 text-xs font-bold text-cream">
                    <StarIcon aria-hidden="true" className="size-3 fill-cream" />
                    Default
                  </span>
                )}
              </div>
              <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-line-soft pt-2.5 text-[0.8125rem] font-semibold">
                <button type="button" onClick={() => setEditing(a)} className="inline-flex items-center gap-1 text-teal hover:underline">
                  <PencilIcon aria-hidden="true" className="size-3.5" />
                  Edit
                </button>
                {!a.isDefault && (
                  <button
                    type="button"
                    onClick={() => run(() => makeDefaultAddressAction(a.id), "Default address updated")}
                    className="text-ink hover:underline"
                  >
                    Set as default
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm("Remove this address?")) run(() => deleteAddressAction(a.id), "Address removed")
                  }}
                  className="ml-auto inline-flex items-center gap-1 text-terra-text hover:underline"
                >
                  <Trash2Icon aria-hidden="true" className="size-3.5" />
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Button
        type="button"
        variant="outline"
        onClick={() => setEditing("new")}
        className="h-11 self-start rounded-xl border-[1.5px] border-dashed border-teal bg-white px-4 font-bold text-teal hover:bg-teal-soft"
      >
        <PlusIcon data-icon="inline-start" className="size-4" />
        Add a new address
      </Button>

      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto rounded-2xl bg-white p-6">
          <div className="flex flex-col gap-1">
            <DialogTitle className="font-heading text-xl">{editing === "new" ? "Add a new address" : "Edit address"}</DialogTitle>
            <DialogDescription className="text-sm text-slate">Saved to your account and offered at checkout.</DialogDescription>
          </div>
          {editing !== null && (
            <AddressForm
              key={editing === "new" ? "new" : editing.id}
              address={editing === "new" ? null : editing}
              countries={countries}
              defaultCountry={defaultCountry}
              name={name}
              firstAddress={addresses.length === 0}
              onDone={() => setEditing(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

/** Calling codes for the phone prefix. Others: the shopper types the full +number. */
const DIAL_CODES: Record<string, string> = { IN: "91", US: "1", CA: "1", GB: "44", AU: "61", AE: "971", SG: "65", NZ: "64", IE: "353" }

/** Stored "+916377579544" (or Shopify's "06377579544") → "6377579544" for the input next to the +91 prefix. */
function nationalNumber(phone: string, country: string) {
  const dial = DIAL_CODES[country]
  const digits = phone.replace(/[^\d+]/g, "")
  if (dial && digits.startsWith(`+${dial}`)) return digits.slice(dial.length + 1)
  if (dial && digits.startsWith("0")) return digits.slice(1)
  return digits
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-3.5">
      <legend className="mb-3 text-xs font-bold tracking-[0.08em] text-teal uppercase">{title}</legend>
      {children}
    </fieldset>
  )
}

function AddressForm({
  address,
  countries,
  defaultCountry,
  name,
  firstAddress,
  onDone,
}: {
  address: SavedAddress | null
  countries: Country[]
  defaultCountry: string
  name: { firstName: string; lastName: string }
  firstAddress: boolean
  onDone: () => void
}) {
  const [state, action, pending] = useActionState(saveAddressAction, idleState)
  const [country, setCountry] = useState(address?.country || defaultCountry)
  const [city, setCity] = useState(address?.city ?? "")
  const [zone, setZone] = useState(address?.zone ?? "")
  const [phone, setPhone] = useState(() => nationalNumber(address?.phone ?? "", address?.country || defaultCountry))
  const [looking, startLookup] = useTransition()
  const [found, setFound] = useState<string | null>(null)
  const errors = state.status === "error" ? (state.fields ?? {}) : {}
  const zones = ADDRESS_ZONES[country]
  const postal = postalRule(country)
  const dial = DIAL_CODES[country]
  const flag = countries.find((c) => c.code === country) ? flagUrl(country, 40) : null

  // Once per successful save (the parent re-renders with a new onDone, so guard with a ref).
  const handled = useRef<FormState | null>(null)
  useEffect(() => {
    if (state.status !== "success" || handled.current === state) return
    handled.current = state
    toast.success(address ? "Address updated" : "Address added")
    onDone()
  }, [state, address, onDone])

  /** A complete PIN / ZIP fills city and state (India Post for India, Zippopotam elsewhere). */
  function onPostal(value: string) {
    setFound(null)
    if (!postal.pattern.test(normalizePostal(value))) return
    startLookup(async () => {
      const place = await lookupPostalAction(country, value)
      if (!place) return
      setCity(place.city)
      if (place.zone) setZone(place.zone)
      setFound([place.city, zones?.find((z) => z.code === place.zone)?.name].filter(Boolean).join(", "))
    })
  }

  return (
    <form action={action} className="mt-1 flex flex-col gap-6">
      {address && <input type="hidden" name="id" value={address.id} />}
      <input type="hidden" name="phone" value={phone && dial && !phone.startsWith("+") ? `+${dial}${phone}` : phone} />

      <Section title="Contact">
        <div className="grid gap-3.5 sm:grid-cols-2">
          <FormField label="First name" error={errors.firstName}>
            {(p) => <input {...p} name="firstName" defaultValue={address?.firstName ?? name.firstName} autoComplete="given-name" className={inputClass} />}
          </FormField>
          <FormField label="Last name" error={errors.lastName}>
            {(p) => <input {...p} name="lastName" defaultValue={address?.lastName ?? name.lastName} autoComplete="family-name" className={inputClass} />}
          </FormField>
        </div>
        <FormField label="Mobile number (for delivery updates)" error={errors.phone}>
          {(p) => (
            <div
              className={cn(
                "flex items-center overflow-hidden rounded-[10px] border-[1.5px] bg-white focus-within:border-teal focus-within:ring-3 focus-within:ring-ring/40",
                p["aria-invalid"] ? "border-[#a33a1f]" : "border-line-strong"
              )}
            >
              {dial && (
                <span className="flex h-full items-center gap-1.5 border-r border-line-soft bg-cream px-3 py-2.5 text-[0.9375rem] font-semibold text-ink tabular-nums">
                  {flag && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={flag} alt="" width={20} height={15} className="h-[15px] w-5 rounded-[3px] object-cover ring-1 ring-black/10" />
                  )}
                  +{dial}
                </span>
              )}
              <input
                id={p.id}
                aria-invalid={p["aria-invalid"]}
                aria-describedby={p["aria-describedby"]}
                type="tel"
                inputMode="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/[^\d+ ]/g, ""))}
                placeholder={country === "IN" ? "98765 43210" : dial ? "Phone number" : "+ country code and number"}
                autoComplete="tel-national"
                className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-[0.9375rem] text-ink outline-none tabular-nums"
              />
            </div>
          )}
        </FormField>
      </Section>

      <Section title="Address">
        <div className="grid gap-3.5 sm:grid-cols-2">
          <FormField label="Country" error={errors.country}>
            {(p) => (
              <select
                {...p}
                name="country"
                value={country}
                onChange={(e) => {
                  setCountry(e.target.value)
                  setZone("")
                  setFound(null)
                }}
                autoComplete="country"
                className={inputClass}
              >
                {countries.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
            )}
          </FormField>
          <FormField label={postal.label.charAt(0).toUpperCase() + postal.label.slice(1)} error={errors.zip}>
            {(p) => (
              <div className="relative">
                <input
                  {...p}
                  name="zip"
                  defaultValue={address?.zip ?? ""}
                  onChange={(e) => onPostal(e.target.value)}
                  placeholder={postal.placeholder}
                  inputMode={country === "IN" || country === "US" ? "numeric" : "text"}
                  autoComplete="postal-code"
                  className={cn(inputClass, "pr-9 uppercase")}
                />
                {looking && <Loader2Icon aria-hidden="true" className="absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin text-teal" />}
              </div>
            )}
          </FormField>
        </div>
        {found && (
          <p aria-live="polite" className="-mt-1.5 flex items-center gap-1.5 text-[0.8125rem] font-semibold text-success">
            <CheckIcon aria-hidden="true" className="size-4" strokeWidth={2.5} />
            {found}: city and state filled in
          </p>
        )}
        <FormField label="House no., building, street" error={errors.address1}>
          {(p) => <input {...p} name="address1" defaultValue={address?.address1 ?? ""} placeholder="e.g. 12, Rose Apartments, MG Road" autoComplete="address-line1" className={inputClass} />}
        </FormField>
        <FormField label="Area, landmark (optional)" error={errors.address2}>
          {(p) => <input {...p} name="address2" defaultValue={address?.address2 ?? ""} placeholder="e.g. Near City Hospital" autoComplete="address-line2" className={inputClass} />}
        </FormField>
        <div className="grid gap-3.5 sm:grid-cols-2">
          <FormField label="City / District" error={errors.city}>
            {(p) => <input {...p} name="city" value={city} onChange={(e) => setCity(e.target.value)} autoComplete="address-level2" className={inputClass} />}
          </FormField>
          {zones ? (
            <FormField label="State" error={errors.zone}>
              {(p) => (
                <select {...p} name="zone" value={zone} onChange={(e) => setZone(e.target.value)} autoComplete="address-level1" className={inputClass}>
                  <option value="" disabled>
                    Select state
                  </option>
                  {zones.map((z) => (
                    <option key={z.code} value={z.code}>
                      {z.name}
                    </option>
                  ))}
                </select>
              )}
            </FormField>
          ) : (
            <input type="hidden" name="zone" value="" />
          )}
        </div>
      </Section>

      {!address?.isDefault && (
        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-line-soft bg-white px-4 py-3 text-sm">
          <input type="checkbox" name="makeDefault" defaultChecked={firstAddress} className="size-4 accent-teal" />
          <span>
            <span className="font-semibold">Make this my default address</span>
            <span className="block text-xs text-slate">Picked first at checkout.</span>
          </span>
        </label>
      )}
      {state.status === "error" && !state.fields && (
        <p role="alert" className="rounded-lg bg-terra-soft px-3 py-2 text-[0.8125rem] font-semibold text-terra-text">
          {state.message}
        </p>
      )}
      <div className="sticky -bottom-6 -mx-6 -mb-6 flex justify-end gap-2.5 border-t border-line-soft bg-white/95 px-6 py-4 backdrop-blur">
        <Button type="button" variant="ghost" onClick={onDone} className="h-11 text-slate">
          Cancel
        </Button>
        <Button type="submit" disabled={pending} className="h-11 rounded-xl px-6 font-bold">
          {pending ? "Saving…" : address ? "Save address" : "Add address"}
        </Button>
      </div>
    </form>
  )
}
