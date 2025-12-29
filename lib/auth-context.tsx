"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { createAuthClient } from "./supabase"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"

interface User {
  id: string
  email: string
  role?: string
  user_metadata?: {
    full_name?: string
    name?: string
    phone?: string
    [key: string]: any
  }
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const supabase = createAuthClient()

    // Check active session
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()

        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email!,
            role: session.user.user_metadata?.role || 'admin'
          })
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          role: session.user.user_metadata?.role || 'admin'
        })
      } else {
        setUser(null)
      }

      setIsLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)

    try {
      const supabase = createAuthClient()
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('Login error:', error.message)
        setIsLoading(false)
        return false
      }

      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email!,
          role: data.user.user_metadata?.role || 'admin'
        })
        setIsLoading(false)
        return true
      }

      setIsLoading(false)
      return false
    } catch (error) {
      console.error('Login exception:', error)
      setIsLoading(false)
      return false
    }
  }

  const logout = async () => {
    const supabase = createAuthClient()
    await supabase.auth.signOut()
    setUser(null)
    router.push('/')
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
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
