"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { KPICards } from "@/components/dashboard/kpi-cards"
import { ScheduleWidget } from "@/components/dashboard/schedule-widget"
import { BookingChart } from "@/components/dashboard/booking-chart"
import { mockStats, mockSchedule, mockTrends } from "@/lib/mock-data"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

export default function DashboardPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/")
    }
  }, [user, isLoading, router])

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#C19B76]" />
      </div>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-8 space-y-6 lg:space-y-8">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight">Command Center</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Welcome back, {user.name.split(" ")[0]}. Here&apos;s your overview.
          </p>
        </div>

        {/* KPI Cards */}
        <KPICards stats={mockStats} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          <ScheduleWidget schedule={mockSchedule} />
          <BookingChart data={mockTrends} />
        </div>
      </div>
    </DashboardLayout>
  )
}
