import { createClient } from "@supabase/supabase-js";

/**
 * Service-role client. SERVER ONLY. It bypasses Row Level Security, so it must
 * never be imported from a client component.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. See .env.example."
    );
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      // Always read fresh data so edits show up on the card immediately.
      fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
    },
  });
}
