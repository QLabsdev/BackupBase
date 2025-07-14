"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { MailCheck, AlertCircle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/contexts/auth-context"

export default function EmailVerificationPage() {
  const { user, resendConfirmationEmail, loading: authLoading } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState(user?.email || "")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleResend = async () => {
    if (!email) {
      setError("Please enter your email address to resend the confirmation.")
      return
    }
    setLoading(true)
    setError(null)
    setMessage(null)
    try {
      const { error } = await resendConfirmationEmail(email)
      if (error) {
        setError(error.message)
      } else {
        setMessage("Confirmation email resent! Please check your inbox.")
      }
    } catch (err) {
      setError("An unexpected error occurred while resending email.")
      console.error("Resend confirmation error:", err)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // If user is already confirmed, redirect to dashboard
  if (user?.email_confirmed_at) {
    router.push("/")
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="text-center pb-6">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <MailCheck className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Verify Your Email</CardTitle>
          <p className="text-gray-600 mt-2">
            A confirmation link has been sent to your email address. Please click the link to activate your account.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          {message && (
            <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <p className="text-sm text-green-600">{message}</p>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Your Email</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} />
          </div>

          <Button onClick={handleResend} className="w-full" disabled={loading}>
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Resending...</span>
              </div>
            ) : (
              "Resend Confirmation Email"
            )}
          </Button>

          <div className="text-center pt-4 border-t">
            <p className="text-sm text-gray-600">
              Already confirmed?{" "}
              <button
                type="button"
                onClick={() => router.push("/auth")}
                className="text-blue-600 hover:text-blue-700 font-medium"
                disabled={loading}
              >
                Sign In
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
