import { createBrowserClient } from "@supabase/ssr";

/**
 * Creates a Supabase client for browser/client-side components.
 * Operates strictly with the public anon key.
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://vfjriqhfwnubjtepyork.supabase.co";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
