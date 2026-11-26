import "server-only"

import { createClient, type SupabaseClient } from "@supabase/supabase-js"

import { serverEnv } from "@/lib/config/env.server"

import type { Database } from "./database.types"

/*
 * Server-only Supabase client with the service-role key. It bypasses RLS, so it must never reach
 * the browser ("server-only" makes the build fail if it does). Reviews and Q&A tables have RLS on
 * with no public policies: only this client can read or write them.
 */

let client: SupabaseClient<Database> | null = null

/** True when the Supabase URL and service-role key are set. */
export const supabaseConfigured = Boolean(serverEnv.NEXT_PUBLIC_SUPABASE_URL && serverEnv.SUPABASE_SERVICE_ROLE_KEY)

/** Typed with the generated `Database` types, so column names and values are checked. */
export function supabaseAdmin(): SupabaseClient<Database> {
  if (!serverEnv.NEXT_PUBLIC_SUPABASE_URL || !serverEnv.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Supabase is not configured: set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local")
  }
  client ??= createClient<Database>(serverEnv.NEXT_PUBLIC_SUPABASE_URL, serverEnv.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  return client
}
