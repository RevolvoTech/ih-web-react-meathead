import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let browserClient: SupabaseClient | null = null;
let refreshPromise: Promise<string | null> | null = null;

export function getSupabaseBrowserClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) return null;
  browserClient ??= createClient(url, publishableKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
  return browserClient;
}

/**
 * Resolve the current browser access token before an authenticated API call.
 * This deliberately does not trust the token captured by an old React render:
 * a mobile browser or WebView may have slept past that token's expiry.
 */
export async function getSupabaseAccessToken(
  fallbackToken?: string,
  forceRefresh = false,
): Promise<string | null> {
  const client = getSupabaseBrowserClient();
  if (!client || typeof window === "undefined") return fallbackToken ?? null;

  if (forceRefresh) {
    refreshPromise ??= client.auth.refreshSession()
      .then(({ data, error }) => {
        if (error) return null;
        return data.session?.access_token ?? null;
      })
      .finally(() => {
        refreshPromise = null;
      });
    return refreshPromise;
  }

  const { data, error } = await client.auth.getSession();
  if (error) return fallbackToken ?? null;
  return data.session?.access_token ?? fallbackToken ?? null;
}
