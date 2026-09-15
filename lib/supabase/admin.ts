import { createClient } from "@supabase/supabase-js";

/**
 * Server-only Admin Supabase client utilizing the high-privilege service-role key.
 * 
 * STRICT RULES:
 * 1. Never import or invoke this module within any Client Component ('use client').
 * 2. Never return service-role credentials or direct client instances to the browser.
 * 3. Every privileged action (e.g. user creation, administrative invite, private bucket storage)
 *    must be accompanied by explicit server-side RBAC authorization and audit logging.
 */
export function createAdminClient() {
  if (typeof window !== "undefined") {
    throw new Error("Security Violation: Attempted to instantiate Supabase Admin client in browser context.");
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://vfjriqhfwnubjtepyork.supabase.co";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    // When operating in dev or sandbox without live service role key, provide a graceful fallback/stub indicator
    console.warn("[Supabase Admin] Warning: SUPABASE_SERVICE_ROLE_KEY is not set in environment.");
  }

  return createClient(supabaseUrl, serviceRoleKey || "mock-service-role-key-for-build", {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
