"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import { Loader2 } from "lucide-react"

export function AuthForm() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const { signUp, signIn, loading } = useAuth()
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"success" | "error" | "">("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage("")
    setMessageType("")

    if (isLogin) {
      const { error } = await signIn(email, password)
      if (error) {
        setMessage(error)
        setMessageType("error")
      } else {
        setMessage("Signed in successfully!")
        setMessageType("success")
      }
    } else {
      const { error } = await signUp(email, password)
      if (error) {
        setMessage(error)
        setMessageType("error")
      } else {
        setMessage("Confirmation email sent! Please check your inbox to verify your account.")
        setMessageType("success")
      }
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">{isLogin ? "Login" : "Sign Up"}</CardTitle>
        <CardDescription>
          {isLogin ? "Enter your credentials to access your account." : "Create a new account to get started."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {message && (
            <div className={`text-sm text-center ${messageType === "error" ? "text-red-500" : "text-green-500"}`}>
              {message}
            </div>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isLogin ? "Logging In..." : "Signing Up..."}
              </>
            ) : isLogin ? (
              "Login"
            ) : (
              "Sign Up"
            )}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm">
          {isLogin ? (
            <>
              Don&apos;t have an account?{" "}
              <Button variant="link" onClick={() => setIsLogin(false)} disabled={loading}>
                Sign Up
              </Button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <Button variant="link" onClick={() => setIsLogin(true)} disabled={loading}>
                Login
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
