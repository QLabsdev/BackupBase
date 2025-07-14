"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Loader2 } from "lucide-react"

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading, session } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // User is not logged in, redirect to auth page
        router.push("/auth")
      } else if (!user.email_confirmed_at) {
        // User is logged in but email not confirmed, redirect to verification page
        router.push("/email-verification")
      }
    }
  }, [user, loading, router, session])

  if (loading || !user || !user.email_confirmed_at) {
    // Show a loading spinner or a placeholder while authentication status is being determined
    // or if user is not authenticated/email not confirmed
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    )
  }

  // If user is authenticated and email is confirmed, render the children
  return <>{children}</>
}
