"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { KPICards } from "@/components/dashboard/kpi-cards"
import { ScheduleWidget } from "@/components/dashboard/schedule-widget"
import { BookingChart } from "@/components/dashboard/booking-chart"
import { mockTrends } from "@/lib/mock-data"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import type { DashboardStats, ScheduleItem, Booking } from "@/lib/types"

export default function DashboardPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    total_revenue: 0,
    active_bookings: 0,
    pending_inquiries: 0,
    revenue_change: 0,
    bookings_change: 0,
    inquiries_change: 0,
    cash_collected: 0,
    pending_balance: 0,
  })
  const [schedule, setSchedule] = useState<ScheduleItem[]>([])
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: bookingsData, error } = await supabase
          .from('bookings')
          .select('*')
          .order('booking_date', { ascending: true })

        if (error) throw error

        if (bookingsData) {
          // Calculate Stats
          const totalRevenue = bookingsData.reduce((sum, b) => sum + (b.total_price || 0), 0)
          const activeBookings = bookingsData.filter(b => b.status !== 'cancelled').length
          const pendingInquiries = bookingsData.filter(b => b.status === 'pending').length
          const cashCollected = bookingsData.reduce((sum, b) => sum + (b.deposit_amount || 0), 0)
          const pendingBalance = totalRevenue - cashCollected

          setStats({
            total_revenue: totalRevenue,
            active_bookings: activeBookings,
            pending_inquiries: pendingInquiries,
            revenue_change: 12, // Placeholder for now as we don't have historical data logic yet
            bookings_change: 8,
            inquiries_change: -2,
            cash_collected: cashCollected,
            pending_balance: pendingBalance,
          })

          // Filter Today's Schedule
          const today = new Date().toISOString().split('T')[0]
          const todaysBookings = bookingsData.filter(b => b.booking_date === today)

          const scheduleItems: ScheduleItem[] = todaysBookings.map(b => ({
            id: b.id.toString(),
            time: b.pickup_time || '09:00',
            customer_name: b.customer_name,
            package_title: b.package_title,
            guests: b.guests_count,
            driver_name: b.driver,
            pickup_location: b.pickup_location,
            customer_phone: b.phone,
            special_notes: b.notes,
            booking_id: b.id.toString(),
            activity_type: b.activity_type,
            payment_status: b.payment_status,
          }))

          setSchedule(scheduleItems)
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoadingData(false)
      }
    }

    fetchData()
  }, [])

  if (isLoading || !user || loadingData) {
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
        <KPICards stats={stats} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          <ScheduleWidget schedule={schedule} />
          <BookingChart data={mockTrends} />
        </div>
      </div>
    </DashboardLayout>
  )
}
