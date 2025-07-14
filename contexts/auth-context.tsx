"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { getBrowserSupabaseClient } from "@/lib/supabase"
import type { User, Session } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string) => Promise<{ error: string | null }>
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<{ error: string | null }>
  resendConfirmationEmail: (email: string) => Promise<{ error: string | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = getBrowserSupabaseClient()

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      setUser(session?.user || null)
      setLoading(false)

      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        // If user is signed in and email is confirmed, redirect to dashboard
        if (session?.user?.email_confirmed_at) {
          router.push("/")
        } else {
          // If signed in but email not confirmed, redirect to verification page
          router.push("/email-verification")
        }
      } else if (event === "SIGNED_OUT") {
        router.push("/auth")
      }
    })

    // Initial session check
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        setSession(session)
        setUser(session?.user || null)
        setLoading(false)
      })
      .catch((error) => {
        console.error("Error getting initial session:", error)
        toast({
          title: "Authentication Error",
          description: "Could not retrieve session. Please try again.",
          variant: "destructive",
        })
        setLoading(false)
      })

    return () => {
      authListener.unsubscribe()
    }
  }, [supabase, router])

  const signUp = useCallback(
    async (email, password) => {
      try {
        setLoading(true)
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        })

        if (error) {
          console.error("Sign up error:", error)
          toast({
            title: "Sign Up Failed",
            description: error.message,
            variant: "destructive",
          })
          return { error: error.message }
        }

        if (data.user && !data.user.email_confirmed_at) {
          toast({
            title: "Confirmation Email Sent",
            description: "Please check your email to confirm your account.",
            variant: "default",
          })
          router.push("/email-verification")
        } else if (data.user) {
          toast({
            title: "Sign Up Successful",
            description: "Welcome! You are now logged in.",
            variant: "default",
          })
          router.push("/")
        }
        return { error: null }
      } catch (err: any) {
        console.error("Unexpected sign up error:", err)
        toast({
          title: "Sign Up Failed",
          description: err.message || "An unexpected error occurred.",
          variant: "destructive",
        })
        return { error: err.message || "An unexpected error occurred." }
      } finally {
        setLoading(false)
      }
    },
    [supabase, router],
  )

  const signIn = useCallback(
    async (email, password) => {
      try {
        setLoading(true)
        const { error } = await supabase.auth.signInWithPassword({ email, password })

        if (error) {
          console.error("Sign in error:", error)
          toast({
            title: "Sign In Failed",
            description: error.message,
            variant: "destructive",
          })
          return { error: error.message }
        }

        toast({
          title: "Sign In Successful",
          description: "Welcome back!",
          variant: "default",
        })
        return { error: null }
      } catch (err: any) {
        console.error("Unexpected sign in error:", err)
        toast({
          title: "Sign In Failed",
          description: err.message || "An unexpected error occurred.",
          variant: "destructive",
        })
        return { error: err.message || "An unexpected error occurred." }
      } finally {
        setLoading(false)
      }
    },
    [supabase],
  )

  const signOut = useCallback(async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()

      if (error) {
        console.error("Sign out error:", error)
        toast({
          title: "Sign Out Failed",
          description: error.message,
          variant: "destructive",
        })
        return { error: error.message }
      }

      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
        variant: "default",
      })
      return { error: null }
    } catch (err: any) {
      console.error("Unexpected sign out error:", err)
      toast({
        title: "Sign Out Failed",
        description: err.message || "An unexpected error occurred.",
        variant: "destructive",
      })
      return { error: err.message || "An unexpected error occurred." }
    } finally {
      setLoading(false)
    }
  }, [supabase])

  const resendConfirmationEmail = useCallback(
    async (email: string) => {
      try {
        setLoading(true)
        const { error } = await supabase.auth.resend({
          type: "signup",
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        })

        if (error) {
          console.error("Resend confirmation email error:", error)
          toast({
            title: "Failed to Resend Email",
            description: error.message,
            variant: "destructive",
          })
          return { error: error.message }
        }

        toast({
          title: "Confirmation Email Resent",
          description: "Please check your inbox for the new confirmation link.",
          variant: "default",
        })
        return { error: null }
      } catch (err: any) {
        console.error("Unexpected resend confirmation email error:", err)
        toast({
          title: "Failed to Resend Email",
          description: err.message || "An unexpected error occurred.",
          variant: "destructive",
        })
        return { error: err.message || "An unexpected error occurred." }
      } finally {
        setLoading(false)
      }
    },
    [supabase],
  )

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
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
