"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import { Loader2 } from "lucide-react"
import { useState } from "react"

export default function EmailVerificationPage() {
  const { user, resendConfirmationEmail, loading } = useAuth()
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"success" | "error" | "">("")

  const handleResend = async () => {
    if (user?.email) {
      setMessage("")
      setMessageType("")
      const { error } = await resendConfirmationEmail(user.email)
      if (error) {
        setMessage(error)
        setMessageType("error")
      } else {
        setMessage("Confirmation email resent! Please check your inbox.")
        setMessageType("success")
      }
    } else {
      setMessage("No email found to resend confirmation. Please try logging in again.")
      setMessageType("error")
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Verify Your Email</CardTitle>
          <CardDescription>
            A confirmation link has been sent to your email address ({user?.email || "your email"}). Please click the
            link in the email to activate your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {message && (
            <div className={`text-sm text-center ${messageType === "error" ? "text-red-500" : "text-green-500"}`}>
              {message}
            </div>
          )}
          <Button onClick={handleResend} className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Resending...
              </>
            ) : (
              "Resend Confirmation Email"
            )}
          </Button>
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            If you don&apos;t see the email, please check your spam folder.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
