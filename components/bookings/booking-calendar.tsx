"use client"

import { useState } from "react"
import type { Booking } from "@/lib/types"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface BookingCalendarProps {
  bookings: Booking[]
  onSelect: (booking: Booking) => void
}

export function BookingCalendar({ bookings, onSelect }: BookingCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  const startingDayOfWeek = firstDayOfMonth.getDay()
  const daysInMonth = lastDayOfMonth.getDate()

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const getBookingsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    return bookings.filter((b) => b.date === dateStr)
  }

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))

  return (
    <GlassCard variant="solid">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold">
          {monthNames[month]} {year}
        </h3>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={prevMonth} className="rounded-xl border-slate-200 bg-white">
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button variant="outline" size="icon" onClick={nextMonth} className="rounded-xl border-slate-200 bg-white">
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Days header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {days.map((day) => (
          <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells for days before start of month */}
        {Array.from({ length: startingDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}

        {/* Days of month */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1
          const dayBookings = getBookingsForDay(day)
          const isToday = new Date().toDateString() === new Date(year, month, day).toDateString()

          return (
            <div
              key={day}
              className={cn("aspect-square p-1 rounded-2xl transition-colors", "hover:bg-slate-50 cursor-pointer")}
            >
              <div
                className={cn(
                  "h-full rounded-xl p-1 flex flex-col",
                  isToday && "bg-[#C19B76]/10 ring-1 ring-[#C19B76]",
                )}
              >
                <span className={cn("text-sm font-medium", isToday && "text-[#C19B76]")}>{day}</span>

                <div className="flex-1 overflow-hidden mt-1 space-y-0.5">
                  {dayBookings.slice(0, 2).map((booking) => (
                    <div
                      key={booking.id}
                      onClick={() => onSelect(booking)}
                      className={cn(
                        "text-[10px] px-1 py-0.5 rounded truncate",
                        booking.status === "confirmed" && "bg-emerald-100 text-emerald-700",
                        booking.status === "pending" && "bg-amber-100 text-amber-700",
                        booking.status === "cancelled" && "bg-red-100 text-red-700",
                      )}
                    >
                      {booking.name.split(" ")[0]}
                    </div>
                  ))}
                  {dayBookings.length > 2 && (
                    <div className="text-[10px] text-muted-foreground pl-1">+{dayBookings.length - 2} more</div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </GlassCard>
  )
}
