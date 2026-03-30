import { createBrowserClient } from "@supabase/ssr";
import { SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

declare global {
  interface Window {
    __supabaseInstance?: SupabaseClient;
  }
}

export function getSupabaseClient(): SupabaseClient {
  if (typeof window === "undefined") {
    return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }

  if (!window.__supabaseInstance) {
    window.__supabaseInstance = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }

  return window.__supabaseInstance;
}