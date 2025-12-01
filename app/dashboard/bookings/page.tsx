"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { BookingTable } from "@/components/bookings/booking-table"
import { BookingKanban } from "@/components/bookings/booking-kanban"
import { BookingCalendar } from "@/components/bookings/booking-calendar"
import { BookingDrawer } from "@/components/bookings/booking-drawer"
import { BookingWizard } from "@/components/bookings/booking-wizard"
import { OperationsView } from "@/components/bookings/operations-view"
import { Button } from "@/components/ui/button"
import { mockBookings } from "@/lib/mock-data"
import type { Booking, ViewMode, BookingStatus } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Table, Columns3, CalendarDays, Plus, Loader2, ClipboardList } from "lucide-react"

const viewOptions: { value: ViewMode; icon: typeof Table; label: string }[] = [
  { value: "table", icon: Table, label: "Table" },
  { value: "kanban", icon: Columns3, label: "Kanban" },
  { value: "calendar", icon: CalendarDays, label: "Calendar" },
  { value: "operations", icon: ClipboardList, label: "Operations" },
]

export default function BookingsPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [viewMode, setViewMode] = useState<ViewMode>("table")
  const [bookings, setBookings] = useState<Booking[]>(mockBookings)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [newBookingOpen, setNewBookingOpen] = useState(false)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/")
    }
  }, [user, isLoading, router])

  const handleSelect = (booking: Booking) => {
    setSelectedBooking(booking)
    setDrawerOpen(true)
  }

  const handleStatusChange = (bookingId: string, newStatus: BookingStatus) => {
    setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b)))
  }

  const handleDelete = (bookingId: string) => {
    setBookings((prev) => prev.filter((b) => b.id !== bookingId))
    setDrawerOpen(false)
  }

  const handleSaveBooking = (updatedBooking: Booking) => {
    setBookings((prev) => prev.map((b) => (b.id === updatedBooking.id ? updatedBooking : b)))
    setSelectedBooking(updatedBooking)
  }

  const handleCreateBooking = (newBooking: Omit<Booking, "id" | "created_at">) => {
    const booking: Booking = {
      ...newBooking,
      id: `${Date.now()}`,
      created_at: new Date().toISOString(),
    }
    setBookings((prev) => [booking, ...prev])
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
        <div className="flex flex-col gap-4">
          <div className="animate-fade-in">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight">Bookings</h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">Manage and track all your reservations</p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center p-1 rounded-2xl bg-white border border-gray-100 shadow-sm overflow-x-auto">
              {viewOptions.map((option) => (
                <Button
                  key={option.value}
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode(option.value)}
                  className={cn(
                    "rounded-xl px-3 transition-all duration-200 whitespace-nowrap min-h-[44px]",
                    viewMode === option.value
                      ? "bg-slate-100 text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-slate-50",
                  )}
                >
                  <option.icon className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">{option.label}</span>
                </Button>
              ))}
            </div>

            <Button
              className="rounded-xl bg-[#C19B76] hover:bg-[#A67C52] shadow-lg shadow-[#C19B76]/20 min-h-[44px] sm:ml-auto"
              onClick={() => setNewBookingOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Booking
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="animate-slide-up">
          {viewMode === "table" && <BookingTable bookings={bookings} onSelect={handleSelect} />}
          {viewMode === "kanban" && (
            <BookingKanban bookings={bookings} onSelect={handleSelect} onStatusChange={handleStatusChange} />
          )}
          {viewMode === "calendar" && <BookingCalendar bookings={bookings} onSelect={handleSelect} />}
          {viewMode === "operations" && <OperationsView bookings={bookings} onSelect={handleSelect} />}
        </div>
      </div>

      {/* Booking Detail Drawer */}
      <BookingDrawer
        booking={selectedBooking}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onDelete={handleDelete}
        onSave={handleSaveBooking}
      />

      <BookingWizard
        open={newBookingOpen}
        onClose={() => setNewBookingOpen(false)}
        onSave={handleCreateBooking}
        existingBookings={bookings}
      />
    </DashboardLayout>
  )
}
