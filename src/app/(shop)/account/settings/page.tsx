import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { LogOutIcon, MapPinIcon, StarIcon } from "lucide-react"

import { Breadcrumb } from "@/components/shared/breadcrumb"
import { Skeleton } from "@/components/ui/skeleton"
import { AccountSidebar } from "@/features/account/components/account-sidebar"
import { ProfileForm } from "@/features/account/components/profile-form"
import { getOrders, getProfile } from "@/features/account/session.server"

export const metadata: Metadata = { title: "Settings", robots: { index: false } }

function Card({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4 rounded-[18px] border border-line bg-white p-5 sm:p-6">
      <div className="flex flex-col gap-1">
        <h2 className="font-sans text-lg font-bold">{title}</h2>
        {description && <p className="text-sm text-slate">{description}</p>}
      </div>
      {children}
    </section>
  )
}

async function SettingsContent() {
  const profile = await getProfile().catch((error) => {
    console.error("[account] settings", error)
    return undefined
  })
  if (profile === null) redirect("/account/login?returnTo=/account/settings")
  if (!profile) {
    return (
      <p role="alert" className="rounded-2xl border border-line bg-white px-5 py-8 text-center text-[0.9375rem] text-slate">
        We couldn&apos;t load your settings right now. Please refresh the page.
      </p>
    )
  }
  const orders = await getOrders().catch(() => [])
  const onTheWay = orders.filter((o) => o.kind === "processing" || o.kind === "transit").length
  const firstName = profile.firstName || profile.email.split("@")[0] || "there"

  return (
    <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
      <AccountSidebar customer={{ firstName, email: profile.email }} current="/account/settings" stats={{ orders: orders.length, onTheWay }} />
      <div className="flex flex-col gap-5">
        <h1 className="text-[1.625rem] leading-tight md:text-[2rem]">Settings</h1>

        <Card title="Profile" description="Your name appears on orders and emails.">
          <ProfileForm firstName={profile.firstName} lastName={profile.lastName} email={profile.email} phone={profile.phone} />
        </Card>

        <Card title="Saved addresses" description="Addresses you use at checkout are saved here for next time.">
          {profile.addresses.length === 0 ? (
            <p className="flex items-center gap-2.5 rounded-xl bg-cream px-4 py-3 text-sm text-slate">
              <MapPinIcon aria-hidden="true" className="size-4 text-teal" />
              No saved addresses yet. Your next checkout will add one.
            </p>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2">
              {profile.addresses.map((a) => (
                <li key={a.id} className="flex flex-col gap-2 rounded-xl border border-line-soft bg-cream/60 p-4 text-sm leading-relaxed">
                  {a.isDefault && (
                    <span className="inline-flex items-center gap-1 self-start rounded-full bg-teal-soft px-2 py-0.5 text-xs font-bold text-teal">
                      <StarIcon aria-hidden="true" className="size-3 fill-teal" />
                      Default
                    </span>
                  )}
                  <address className="not-italic">
                    {a.lines.map((line, i) => (
                      <span key={i} className={i === 0 ? "block font-semibold text-ink" : "block text-slate"}>
                        {line}
                      </span>
                    ))}
                  </address>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Sign out" description="Sign out of Mcesta on this device.">
          <a
            href="/account/logout"
            className="inline-flex h-11 items-center gap-2 self-start rounded-xl border-[1.5px] border-terra-light px-5 text-sm font-bold text-terra-text transition-colors hover:bg-terra-soft"
          >
            <LogOutIcon aria-hidden="true" className="size-4" />
            Sign out
          </a>
        </Card>
      </div>
    </div>
  )
}

function SettingsSkeleton() {
  return (
    <div aria-hidden="true" className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
      <Skeleton className="hidden h-80 rounded-[18px] lg:block" />
      <div className="flex flex-col gap-5">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-64 rounded-[18px]" />
        <Skeleton className="h-40 rounded-[18px]" />
      </div>
    </div>
  )
}

/** /account/settings: name, login email, saved addresses, sign out. */
export default function SettingsPage() {
  return (
    <section aria-labelledby="settings-h" className="container-shop pt-6 pb-16 md:pt-7">
      <Breadcrumb className="mb-4" items={[{ label: "Home", href: "/" }, { label: "My account", href: "/account" }, { label: "Settings" }]} />
      <Suspense fallback={<SettingsSkeleton />}>
        <SettingsContent />
      </Suspense>
    </section>
  )
}
