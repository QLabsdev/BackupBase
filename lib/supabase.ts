import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase URL or Anon Key is missing. Please check your environment variables.")
  // In a real application, you might want to throw an error or handle this more gracefully
  // For now, we'll proceed with undefined clients, which will likely cause runtime errors.
}

// Client-side Supabase client (for browser interactions)
// Use a singleton pattern to prevent multiple client instances
let browserSupabase: ReturnType<typeof createClient> | undefined

export function getBrowserSupabaseClient() {
  if (!browserSupabase) {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Supabase URL or Anon Key is not defined for browser client.")
    }
    browserSupabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true, // Persist session in local storage
        autoRefreshToken: true, // Automatically refresh tokens
        detectSessionInUrl: true, // Detect session from URL (for auth callbacks)
      },
    })
  }
  return browserSupabase
}

// Server-side Supabase client (for server components/actions/API routes)
// Note: For server-side, you might need a different setup if using RLS and user context
// For simple cases, the anon key might suffice, but for secure server operations,
// you'd typically use a service role key or a user-specific token.
// Given the context of a client-heavy app, we'll keep it simple for now.
export function getServerSupabaseClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase URL or Anon Key is not defined for server client.")
  }
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false, // Do not persist session on the server
    },
  })
}
