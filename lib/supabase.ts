import { createClient } from "@supabase/supabase-js"

// Ensure environment variables are available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables")
}

// Client-side Supabase client (singleton pattern)
let supabaseClient: ReturnType<typeof createClient> | null = null

export const supabase = (() => {
  if (!supabaseClient) {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        // Configure for Netlify deployment
        storage: typeof window !== "undefined" ? window.localStorage : undefined,
        storageKey: "supabase.auth.token",
        flowType: "pkce",
      },
      // Add retry logic for network issues
      global: {
        headers: {
          "X-Client-Info": "backupbase-netlify",
        },
      },
    })
  }
  return supabaseClient
})()

// Server-side Supabase client (not used in static export but kept for compatibility)
export const createServerClient = () => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  })
}

export type Database = {
  // Add your database types here if needed
}
