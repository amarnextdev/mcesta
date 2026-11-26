"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { fieldErrors, type FormState } from "@/features/product/feedback"

import { normalizePostal, postalRule } from "@/features/product/delivery-check"
import { lookupPlace } from "@/features/product/delivery-check.server"

import { ADDRESS_ZONES } from "./address-zones"
import { deleteAddress, getProfile, saveAddress, setDefaultAddress, updateName } from "./session.server"

/*
 * "Problem with this item?" report. Validates and logs for now; later it emails support with
 * the order number and uploaded photos (Supabase storage), and shows in the admin.
 */
const reportSchema = z.object({
  orderId: z.string().min(1),
  reason: z.enum(["damaged", "wrong-item", "missing", "other"], { error: "Pick what happened." }),
  details: z.string().trim().min(10, { error: "Tell us a bit more (at least 10 characters)." }).max(2000),
})

export async function reportProblemAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = reportSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { status: "error", message: "Please check the highlighted fields.", fields: fieldErrors(parsed.error) }
  if (process.env.NODE_ENV !== "production") console.info("[order problem] (dev) received", parsed.data)
  return { status: "success" }
}

const nameSchema = z.object({
  firstName: z.string().trim().min(1, { error: "Enter your first name." }).max(60),
  lastName: z.string().trim().max(60),
})

/** Settings → Profile: save first and last name to the Shopify customer. */
export async function updateProfileAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = nameSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { status: "error", message: "Please check the highlighted fields.", fields: fieldErrors(parsed.error) }
  try {
    const error = await updateName(parsed.data.firstName, parsed.data.lastName)
    if (error) return { status: "error", message: error }
    revalidatePath("/account", "layout")
    return { status: "success" }
  } catch (error) {
    console.error("[account] update profile", error)
    return { status: "error", message: "We couldn't save your details. Please try again." }
  }
}

/** Phone in the E.164 form Shopify wants. 10-digit Indian numbers get +91. */
function toE164(raw: string, country: string): string | null {
  const digits = raw.replace(/[^\d+]/g, "")
  if (!digits) return ""
  if (digits.startsWith("+")) return /^\+\d{8,15}$/.test(digits) ? digits : null
  if (country === "IN" && /^[6-9]\d{9}$/.test(digits)) return `+91${digits}`
  if ((country === "US" || country === "CA") && /^\d{10}$/.test(digits)) return `+1${digits}`
  if (country === "GB" && /^0\d{10}$/.test(digits)) return `+44${digits.slice(1)}`
  return null
}

const addressSchema = z
  .object({
    id: z.string().regex(/^gid:\/\/shopify\/CustomerAddress\/\d+/).optional().or(z.literal("")),
    firstName: z.string().trim().min(1, { error: "Enter a first name." }).max(60),
    lastName: z.string().trim().min(1, { error: "Enter a last name." }).max(60),
    phone: z.string().trim().max(20),
    address1: z.string().trim().min(3, { error: "Enter the house / street." }).max(120),
    address2: z.string().trim().max(120),
    city: z.string().trim().min(2, { error: "Enter the city." }).max(60),
    zone: z.string().trim().max(10),
    zip: z.string().trim().max(12),
    country: z.string().regex(/^[A-Z]{2}$/, { error: "Pick a country." }),
    makeDefault: z.literal("on").optional(),
  })
  .superRefine((a, ctx) => {
    const zones = ADDRESS_ZONES[a.country]
    if (zones && !zones.some((z) => z.code === a.zone)) ctx.addIssue({ code: "custom", path: ["zone"], message: "Pick a state." })
    const rule = postalRule(a.country)
    if (!rule.pattern.test(normalizePostal(a.zip))) ctx.addIssue({ code: "custom", path: ["zip"], message: rule.hint })
    if (toE164(a.phone, a.country) === null) ctx.addIssue({ code: "custom", path: ["phone"], message: "Enter a valid phone number." })
  })

/** Settings → Addresses: add a new address or save changes to one. */
export async function saveAddressAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = addressSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { status: "error", message: "Please check the highlighted fields.", fields: fieldErrors(parsed.error) }
  const { id, makeDefault, ...a } = parsed.data
  try {
    const error = await saveAddress(
      { ...a, zip: normalizePostal(a.zip), phone: toE164(a.phone, a.country) ?? "" },
      { id: id || undefined, makeDefault: makeDefault === "on" }
    )
    if (error) return { status: "error", message: error }
    revalidatePath("/account/settings")
    return { status: "success" }
  } catch (error) {
    console.error("[account] save address", error)
    return { status: "error", message: "We couldn't save this address. Please try again." }
  }
}

const addressId = z.string().regex(/^gid:\/\/shopify\/CustomerAddress\/\d+/)

export async function deleteAddressAction(id: string): Promise<{ ok: boolean; error?: string }> {
  if (!addressId.safeParse(id).success) return { ok: false, error: "Unknown address." }
  try {
    const error = await deleteAddress(id)
    if (error) return { ok: false, error }
    revalidatePath("/account/settings")
    return { ok: true }
  } catch (error) {
    console.error("[account] delete address", error)
    return { ok: false, error: "We couldn't remove this address. Please try again." }
  }
}

export async function makeDefaultAddressAction(id: string): Promise<{ ok: boolean; error?: string }> {
  if (!addressId.safeParse(id).success) return { ok: false, error: "Unknown address." }
  try {
    const address = (await getProfile())?.addresses.find((a) => a.id === id)
    if (!address) return { ok: false, error: "Please log in again." }
    const error = await setDefaultAddress(address)
    if (error) return { ok: false, error }
    revalidatePath("/account/settings")
    return { ok: true }
  } catch (error) {
    console.error("[account] default address", error)
    return { ok: false, error: "We couldn't update your default address." }
  }
}

/** India Post's PIN directory: district (city) and state. More complete than generic lists for India. */
async function indiaPin(pin: string): Promise<{ name: string; province: string | null; provinceCode: null } | null> {
  try {
    const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`, {
      signal: AbortSignal.timeout(3000),
      next: { revalidate: 60 * 60 * 24 * 30 },
    })
    if (!res.ok) return null
    const [first] = (await res.json()) as { Status: string; PostOffice: { District: string; State: string }[] | null }[]
    const office = first?.Status === "Success" ? first.PostOffice?.[0] : undefined
    return office ? { name: office.District, province: office.State, provinceCode: null } : null
  } catch {
    return null
  }
}

/** PIN / ZIP → city and state, to fill the address form as the shopper types. */
export async function lookupPostalAction(country: string, code: string): Promise<{ city: string; zone: string | null } | null> {
  if (!/^[A-Z]{2}$/.test(country) || typeof code !== "string") return null
  const value = normalizePostal(code)
  if (!postalRule(country).pattern.test(value)) return null
  const place = country === "IN" ? await indiaPin(value) : await lookupPlace(country, value)
  if (!place) return null
  const zones = ADDRESS_ZONES[country]
  const zone =
    zones?.find((z) => z.code === place.provinceCode)?.code ??
    zones?.find((z) => z.name.toLowerCase() === place.province?.toLowerCase())?.code ??
    null
  return { city: place.name, zone }
}
