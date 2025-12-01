"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: "admin" | "manager"
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAutoLogin: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  toggleAutoLogin: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const mockUser: User = {
  id: "1",
  name: "Sarah Mitchell",
  email: "sarah@marragafay.com",
  role: "admin",
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAutoLogin, setIsAutoLogin] = useState(false)

  useEffect(() => {
    // Check for stored auth state
    const stored = localStorage.getItem("marragafay_auth")
    const autoLogin = localStorage.getItem("marragafay_auto_login") === "true"

    setIsAutoLogin(autoLogin)

    if (stored || autoLogin) {
      setUser(mockUser)
    }

    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800))

    // Mock validation
    if (email && password.length >= 4) {
      setUser(mockUser)
      localStorage.setItem("marragafay_auth", "true")
      setIsLoading(false)
      return true
    }

    setIsLoading(false)
    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("marragafay_auth")
  }

  const toggleAutoLogin = () => {
    const newValue = !isAutoLogin
    setIsAutoLogin(newValue)
    localStorage.setItem("marragafay_auto_login", String(newValue))

    if (newValue && !user) {
      setUser(mockUser)
      localStorage.setItem("marragafay_auth", "true")
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, isAutoLogin, login, logout, toggleAutoLogin }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
