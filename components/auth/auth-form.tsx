"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, CheckCircle } from "lucide-react" // Added CheckCircle
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"

interface AuthFormProps {
  mode: "signin" | "signup"
  onModeChange: (mode: "signin" | "signup") => void
}

export function AuthForm({ mode, onModeChange }: AuthFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const { signIn, signUp, resetPassword, resendConfirmationEmail } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      if (mode === "signin") {
        const { error } = await signIn(email, password)
        if (error) {
          setError(error.message)
        }
      } else {
        const { error } = await signUp(email, password)
        if (error) {
          setError(error.message)
        } else {
          setMessage("Success! Please check your email for a confirmation link to activate your account.")
        }
      }
    } catch (error) {
      setError("An unexpected error occurred")
      console.error("Auth error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async () => {
    if (!email) {
      setError("Please enter your email address first")
      return
    }

    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      const { error } = await resetPassword(email)
      if (error) {
        setError(error.message)
      } else {
        setMessage("Password reset email sent! Check your inbox.")
      }
    } catch (error) {
      setError("An unexpected error occurred")
      console.error("Reset password error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleResendConfirmation = async () => {
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
    } catch (error) {
      setError("An unexpected error occurred while resending email.")
      console.error("Resend confirmation error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-6">
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ delay: 0.2, duration: 0.3 }}>
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="h-8 w-8 text-white" />
              </div>
            </motion.div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              {mode === "signin" ? "Welcome Back" : "Create Account"}
            </CardTitle>
            <p className="text-gray-600 mt-2">
              {mode === "signin" ? "Sign in to access your BackupBase" : "Join BackupBase to start storing your files"}
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg"
              >
                <AlertCircle className="h-4 w-4 text-red-600" />
                <p className="text-sm text-red-600">{error}</p>
              </motion.div>
            )}

            {message && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg"
              >
                <CheckCircle className="h-4 w-4 text-green-600" />
                <p className="text-sm text-green-600">{message}</p>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="pl-10"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="pl-10 pr-10"
                    required
                    disabled={loading}
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>{mode === "signin" ? "Signing in..." : "Creating account..."}</span>
                  </div>
                ) : mode === "signin" ? (
                  "Sign In"
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            {mode === "signin" && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResetPassword}
                  className="text-sm text-blue-600 hover:text-blue-700 underline"
                  disabled={loading}
                >
                  Forgot your password?
                </button>
              </div>
            )}

            {mode === "signup" && message && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendConfirmation}
                  className="text-sm text-blue-600 hover:text-blue-700 underline"
                  disabled={loading}
                >
                  Resend confirmation email
                </button>
              </div>
            )}

            <div className="text-center pt-4 border-t">
              <p className="text-sm text-gray-600">
                {mode === "signin" ? "Don't have an account? " : "Already have an account? "}
                <button
                  type="button"
                  onClick={() => onModeChange(mode === "signin" ? "signup" : "signin")}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                  disabled={loading}
                >
                  {mode === "signin" ? "Sign up" : "Sign in"}
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
