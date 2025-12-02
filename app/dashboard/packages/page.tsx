"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { PackageGrid } from "@/components/packages/package-grid"
import type { Package } from "@/lib/types"
import { Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

export default function PackagesPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    fetchPackages()
  }, [])

  const fetchPackages = async () => {
    try {
      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .order('price', { ascending: true })

      if (error) throw error

      if (data) {
        setPackages(data)
      }
    } catch (error) {
      console.error('Error fetching packages:', error)
      toast({
        title: "Error",
        description: "Failed to load packages",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (updatedPkg: Package) => {
    try {
      const { error } = await supabase
        .from('packages')
        .update({
          title: updatedPkg.title,
          description: updatedPkg.description,
          price: updatedPkg.price,
          duration: updatedPkg.duration,
          includes: updatedPkg.includes,
          is_active: updatedPkg.is_active
        })
        .eq('id', updatedPkg.id)

      if (error) throw error

      setPackages((prev) => prev.map((p) => (p.id === updatedPkg.id ? updatedPkg : p)))

      toast({
        title: "Package Updated",
        description: `${updatedPkg.title} has been updated successfully.`,
      })
    } catch (error) {
      console.error('Error updating package:', error)
      toast({
        title: "Error",
        description: "Failed to update package",
        variant: "destructive",
      })
    }
  }

  if (isLoading || !user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#C19B76]" />
      </div>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-8 space-y-6">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-3xl lg:text-4xl font-semibold tracking-tight">Packages</h1>
          <p className="text-muted-foreground mt-1">Manage your experience offerings and pricing</p>
        </div>

        {/* Package Grid */}
        <div className="animate-slide-up">
          <PackageGrid packages={packages} onUpdate={handleUpdate} />
        </div>
      </div>
    </DashboardLayout>
  )
}
