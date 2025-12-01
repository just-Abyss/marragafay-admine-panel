"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { PackageGrid } from "@/components/packages/package-grid"
import { mockPackages } from "@/lib/mock-data"
import type { Package } from "@/lib/types"
import { Loader2 } from "lucide-react"

export default function PackagesPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [packages, setPackages] = useState<Package[]>(mockPackages)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/")
    }
  }, [user, isLoading, router])

  const handleUpdate = (updatedPkg: Package) => {
    setPackages((prev) => prev.map((p) => (p.id === updatedPkg.id ? updatedPkg : p)))
  }

  if (isLoading || !user) {
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
