"use client"

import type React from "react"

import { useState } from "react"
import type { Booking, BookingStatus } from "@/lib/types"
import { PaymentBadge } from "@/components/ui/payment-badge"
import { cn } from "@/lib/utils"
import { Users, Calendar } from "lucide-react"

interface BookingKanbanProps {
  bookings: Booking[]
  onSelect: (booking: Booking) => void
  onStatusChange: (bookingId: string, newStatus: BookingStatus) => void
}

const columns: { status: BookingStatus; title: string; color: string }[] = [
  { status: "pending", title: "Pending", color: "border-amber-400" },
  { status: "confirmed", title: "Confirmed", color: "border-emerald-400" },
  { status: "cancelled", title: "Cancelled", color: "border-red-400" },
]

export function BookingKanban({ bookings, onSelect, onStatusChange }: BookingKanbanProps) {
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<BookingStatus | null>(null)

  const handleDragStart = (e: React.DragEvent, bookingId: string) => {
    setDraggedId(bookingId)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent, status: BookingStatus) => {
    e.preventDefault()
    setDragOverColumn(status)
  }

  const handleDragLeave = () => {
    setDragOverColumn(null)
  }

  const handleDrop = (e: React.DragEvent, newStatus: BookingStatus) => {
    e.preventDefault()
    if (draggedId) {
      onStatusChange(draggedId, newStatus)
    }
    setDraggedId(null)
    setDragOverColumn(null)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {columns.map((column) => {
        const columnBookings = bookings.filter((b) => b.status === column.status)

        return (
          <div
            key={column.status}
            className={cn(
              "rounded-3xl p-4 transition-all duration-200",
              "bg-white border border-gray-100 shadow-sm",
              dragOverColumn === column.status && "ring-2 ring-[#C19B76]/50",
            )}
            onDragOver={(e) => handleDragOver(e, column.status)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, column.status)}
          >
            <div className={cn("flex items-center gap-2 mb-4 pb-3 border-b-2", column.color)}>
              <h3 className="font-semibold">{column.title}</h3>
              <span className="text-sm text-muted-foreground bg-slate-100 px-2 py-0.5 rounded-full">
                {columnBookings.length}
              </span>
            </div>

            <div className="space-y-3">
              {columnBookings.map((booking) => (
                <div
                  key={booking.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, booking.id)}
                  onClick={() => onSelect(booking)}
                  className={cn(
                    "p-4 rounded-2xl cursor-pointer",
                    "bg-slate-50 border border-slate-100",
                    "hover:bg-slate-100 hover:border-slate-200 transition-all duration-200",
                    "hover:scale-[1.02] active:scale-[0.98]",
                    draggedId === booking.id && "opacity-50",
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-medium">{booking.customer_name}</p>
                    <PaymentBadge status={booking.payment_status} size="sm" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{booking.package_title}</p>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(booking.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {booking.guests}
                    </div>
                    <span className="font-medium text-foreground">{booking.total_price.toLocaleString()} MAD</span>
                  </div>
                  {booking.remaining_balance > 0 && (
                    <p className="text-xs text-amber-600 mt-2 pt-2 border-t border-slate-200">
                      Balance: {booking.remaining_balance.toLocaleString()} MAD
                    </p>
                  )}
                </div>
              ))}

              {columnBookings.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">No bookings</div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
