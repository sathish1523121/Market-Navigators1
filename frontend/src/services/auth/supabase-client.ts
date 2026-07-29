import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Supabase GoTrue Auth configuration with fallback to production database coordinates
const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://syyzirqewixvfquglsvi.supabase.co";

const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5eXppcnFld2l4dmZxdWdsc3ZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMyNDgwNzUsImV4cCI6MjA1ODgyNDA3NX0.QgBQ00OtCxChlHUIw0qjqQ_JnAZRPyy";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://market-navigators1.vercel.app";

let clientInstance: SupabaseClient | null = null;

try {
  clientInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: "compete_iq_supabase_session",
    },
  });
} catch (error) {
  console.error("Failed to initialize Supabase auth client:", error);
}

export const supabase = clientInstance!;
export const isSupabaseReady = Boolean(clientInstance);
