"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Compass, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const { login, isLoading, isAutoLogin, toggleAutoLogin } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const success = await login(email, password)
    if (!success) {
      setError("Invalid credentials. Please try again.")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10 animate-fade-in">
          <div className="w-20 h-20 rounded-3xl bg-[#C19B76] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#C19B76]/20">
            <Compass className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">Marragafay</h1>
          <p className="text-muted-foreground mt-2">Premium Travel Management</p>
        </div>

        {/* Form */}
        <div
          className={cn(
            "rounded-3xl p-8",
            "bg-white/70 backdrop-blur-xl",
            "border border-white/50",
            "shadow-[0_8px_40px_rgba(0,0,0,0.08)]",
            "animate-slide-up",
          )}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@marragafay.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 rounded-xl border-0 bg-secondary/50 focus:bg-white transition-colors"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 rounded-xl border-0 bg-secondary/50 focus:bg-white transition-colors"
                required
              />
            </div>

            {error && <p className="text-sm text-destructive animate-fade-in">{error}</p>}

            <Button
              type="submit"
              disabled={isLoading}
              className={cn(
                "w-full h-12 rounded-xl text-base font-medium",
                "bg-[#C19B76] hover:bg-[#A67C52]",
                "shadow-lg shadow-[#C19B76]/20",
                "transition-all duration-200",
              )}
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
            </Button>
          </form>

          {/* Dev Mode Toggle */}
          <div className="mt-6 pt-6 border-t border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Auto-Login (Dev)</p>
                <p className="text-xs text-muted-foreground">Skip authentication for development</p>
              </div>
              <Switch checked={isAutoLogin} onCheckedChange={toggleAutoLogin} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-8">Luxury desert experiences in Agafay</p>
      </div>
    </div>
  )
}
