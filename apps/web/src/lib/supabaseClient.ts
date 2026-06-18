import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cachedClient: SupabaseClient | undefined;

/**
 * Lazily creates a Supabase client from NEXT_PUBLIC_SUPABASE_URL/ANON_KEY.
 * Returns undefined when either is unset, so callers (app/page.tsx) can fall
 * back to the in-memory ports for local dev without a Supabase project.
 */
export function getSupabaseClient(): SupabaseClient | undefined {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return undefined;

  if (!cachedClient) {
    cachedClient = createClient(url, anonKey);
  }
  return cachedClient;
}
