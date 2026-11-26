"use client"

import { useActionState, useEffect, useRef, useState, useTransition } from "react"
import { MapPinIcon, PencilIcon, PlusIcon, StarIcon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { FormField, inputClass } from "@/features/product/components/detail/form-field"
import { postalRule } from "@/features/product/delivery-check"
import { idleState, type FormState } from "@/features/product/feedback"
import { cn } from "@/lib/utils"

import { deleteAddressAction, makeDefaultAddressAction, saveAddressAction } from "../actions"
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
        <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto rounded-2xl p-6">
          <DialogTitle className="font-heading text-xl">{editing === "new" ? "Add a new address" : "Edit address"}</DialogTitle>
          <DialogDescription className="sr-only">Delivery address details</DialogDescription>
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
  const errors = state.status === "error" ? (state.fields ?? {}) : {}
  const zones = ADDRESS_ZONES[country]
  const postal = postalRule(country)

  // Once per successful save (the parent re-renders with a new onDone, so guard with a ref).
  const handled = useRef<FormState | null>(null)
  useEffect(() => {
    if (state.status !== "success" || handled.current === state) return
    handled.current = state
    toast.success(address ? "Address updated" : "Address added")
    onDone()
  }, [state, address, onDone])

  return (
    <form action={action} className="mt-2 flex flex-col gap-3.5">
      {address && <input type="hidden" name="id" value={address.id} />}
      <div className="grid gap-3.5 sm:grid-cols-2">
        <FormField label="First name" error={errors.firstName}>
          {(p) => <input {...p} name="firstName" defaultValue={address?.firstName ?? name.firstName} autoComplete="given-name" className={inputClass} />}
        </FormField>
        <FormField label="Last name" error={errors.lastName}>
          {(p) => <input {...p} name="lastName" defaultValue={address?.lastName ?? name.lastName} autoComplete="family-name" className={inputClass} />}
        </FormField>
      </div>
      <FormField label="Phone (for delivery updates)" error={errors.phone}>
        {(p) => (
          <input
            {...p}
            name="phone"
            type="tel"
            inputMode="tel"
            defaultValue={address?.phone ?? ""}
            placeholder={country === "IN" ? "98765 43210" : "Phone number"}
            autoComplete="tel"
            className={inputClass}
          />
        )}
      </FormField>
      <FormField label="House no., building, street" error={errors.address1}>
        {(p) => <input {...p} name="address1" defaultValue={address?.address1 ?? ""} autoComplete="address-line1" className={inputClass} />}
      </FormField>
      <FormField label="Area, landmark (optional)" error={errors.address2}>
        {(p) => <input {...p} name="address2" defaultValue={address?.address2 ?? ""} autoComplete="address-line2" className={inputClass} />}
      </FormField>
      <div className="grid gap-3.5 sm:grid-cols-2">
        <FormField label="City" error={errors.city}>
          {(p) => <input {...p} name="city" defaultValue={address?.city ?? ""} autoComplete="address-level2" className={inputClass} />}
        </FormField>
        <FormField label={postal.label.charAt(0).toUpperCase() + postal.label.slice(1)} error={errors.zip}>
          {(p) => (
            <input
              {...p}
              name="zip"
              defaultValue={address?.zip ?? ""}
              placeholder={postal.placeholder}
              inputMode={country === "IN" || country === "US" ? "numeric" : "text"}
              autoComplete="postal-code"
              className={cn(inputClass, "uppercase")}
            />
          )}
        </FormField>
      </div>
      <div className="grid gap-3.5 sm:grid-cols-2">
        <FormField label="Country" error={errors.country}>
          {(p) => (
            <select {...p} name="country" value={country} onChange={(e) => setCountry(e.target.value)} autoComplete="country" className={inputClass}>
              {countries.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
          )}
        </FormField>
        {zones ? (
          <FormField label="State" error={errors.zone}>
            {(p) => (
              <select {...p} key={country} name="zone" defaultValue={address?.country === country ? address.zone : ""} autoComplete="address-level1" className={inputClass}>
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
      {!address?.isDefault && (
        <label className="flex items-center gap-2.5 text-sm">
          <input type="checkbox" name="makeDefault" defaultChecked={firstAddress} className="size-4 accent-teal" />
          Make this my default address
        </label>
      )}
      {state.status === "error" && !state.fields && (
        <p role="alert" className="rounded-lg bg-terra-soft px-3 py-2 text-[0.8125rem] font-semibold text-terra-text">
          {state.message}
        </p>
      )}
      <div className="flex justify-end gap-2.5 pt-1">
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
