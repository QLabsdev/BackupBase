"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import type { User, Session, AuthError } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<{ error: AuthError | null }>
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>
  resendConfirmationEmail: (email: string) => Promise<{ error: AuthError | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return

    // Get initial session with retry logic
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error("Error getting session:", error)
          // Don't throw error, just log it for debugging
        } else {
          setSession(session)
          setUser(session?.user ?? null)
        }
      } catch (error) {
        console.error("Unexpected error getting session:", error)
        // Graceful fallback - continue without session
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes with error handling
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.email)

      try {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      } catch (error) {
        console.error("Error handling auth state change:", error)
        setLoading(false)
      }
    })

    return () => {
      try {
        subscription.unsubscribe()
      } catch (error) {
        console.error("Error unsubscribing from auth changes:", error)
      }
    }
  }, [])

  const signUp = async (email: string, password: string) => {
    try {
      // Get the current origin dynamically for Netlify
      const origin = typeof window !== "undefined" ? window.location.origin : ""

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${origin}/auth/callback`,
        },
      })
      return { error }
    } catch (error) {
      console.error("Sign up error:", error)
      return { error: error as AuthError }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      return { error }
    } catch (error) {
      console.error("Sign in error:", error)
      return { error: error as AuthError }
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      return { error }
    } catch (error) {
      console.error("Sign out error:", error)
      return { error: error as AuthError }
    }
  }

  const resetPassword = async (email: string) => {
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : ""

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/auth/reset-password`,
      })
      return { error }
    } catch (error) {
      console.error("Reset password error:", error)
      return { error: error as AuthError }
    }
  }

  const resendConfirmationEmail = async (email: string) => {
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
      })
      return { error }
    } catch (error) {
      console.error("Resend confirmation email error:", error)
      return { error: error as AuthError }
    }
  }

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    resendConfirmationEmail,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
