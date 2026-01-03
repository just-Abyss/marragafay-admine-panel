"use client"

import { useState } from "react"
import type { Booking } from "@/lib/types"
import { StatusBadge } from "@/components/ui/status-badge"
import { PaymentBadge } from "@/components/ui/payment-badge"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, SlidersHorizontal, ArrowUpDown, MessageCircle } from "lucide-react"
import { startOfDay, endOfDay, addDays, startOfWeek, endOfWeek, isWithinInterval, parseISO } from "date-fns"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface BookingTableProps {
  bookings: Booking[]
  onSelect: (booking: Booking) => void
}

type SortField = "date" | "name" | "total_price"
type SortOrder = "asc" | "desc"

export function BookingTable({ bookings, onSelect }: BookingTableProps) {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [paymentFilter, setPaymentFilter] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState<string>("all")
  const [sortField, setSortField] = useState<SortField>("date")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")

  const filteredBookings = bookings
    .filter((booking) => {
      const matchesSearch =
        booking.name.toLowerCase().includes(search.toLowerCase()) ||
        booking.email.toLowerCase().includes(search.toLowerCase()) ||
        booking.package_title.toLowerCase().includes(search.toLowerCase())

      const matchesStatus = statusFilter === "all" || booking.status === statusFilter

      let matchesPayment = true
      if (paymentFilter === "paid") {
        matchesPayment = booking.payment_status === "paid"
      } else if (paymentFilter === "unpaid_deposit") {
        matchesPayment = booking.payment_status === "unpaid" || booking.payment_status === "deposit"
      }

      let matchesDate = true
      if (dateFilter !== "all") {
        const bookingDate = typeof booking.date === 'string' ? parseISO(booking.date) : new Date(booking.date)
        const today = new Date()

        if (dateFilter === "today") {
          matchesDate = isWithinInterval(bookingDate, {
            start: startOfDay(today),
            end: endOfDay(today)
          })
        } else if (dateFilter === "tomorrow") {
          const tomorrow = addDays(today, 1)
          matchesDate = isWithinInterval(bookingDate, {
            start: startOfDay(tomorrow),
            end: endOfDay(tomorrow)
          })
        } else if (dateFilter === "week") {
          matchesDate = isWithinInterval(bookingDate, {
            start: startOfWeek(today, { weekStartsOn: 1 }),
            end: endOfWeek(today, { weekStartsOn: 1 })
          })
        }
      }

      return matchesSearch && matchesStatus && matchesPayment && matchesDate
    })
    .sort((a, b) => {
      let comparison = 0
      switch (sortField) {
        case "date":
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime()
          break
        case "name":
          comparison = a.name.localeCompare(b.name)
          break
        case "total_price":
          comparison = a.total_price - b.total_price
          break
      }
      return sortOrder === "asc" ? comparison : -comparison
    })

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("asc")
    }
  }

  return (
    <GlassCard variant="solid" className="overflow-hidden">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search bookings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 rounded-xl border border-slate-200 bg-slate-50"
          />
        </div>

        <Select value={dateFilter} onValueChange={setDateFilter}>
          <SelectTrigger className="w-full sm:w-[140px] rounded-xl border border-slate-200 bg-slate-50">
            <SelectValue placeholder="Date" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="tomorrow">Tomorrow</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[140px] rounded-xl border border-slate-200 bg-slate-50">
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        <Select value={paymentFilter} onValueChange={setPaymentFilter}>
          <SelectTrigger className="w-full sm:w-[160px] rounded-xl border border-slate-200 bg-slate-50">
            <SelectValue placeholder="Payment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Payments</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="unpaid_deposit">Unpaid/Deposit</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto -mx-6">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-slate-100 hover:bg-transparent">
              <TableHead className="pl-6">
                <Button
                  variant="ghost"
                  className="p-0 h-auto font-medium hover:bg-transparent"
                  onClick={() => handleSort("name")}
                >
                  Customer
                  <ArrowUpDown className="ml-2 w-3 h-3" />
                </Button>
              </TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Package</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  className="p-0 h-auto font-medium hover:bg-transparent"
                  onClick={() => handleSort("date")}
                >
                  Date
                  <ArrowUpDown className="ml-2 w-3 h-3" />
                </Button>
              </TableHead>
              <TableHead>Guests</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  className="p-0 h-auto font-medium hover:bg-transparent"
                  onClick={() => handleSort("total_price")}
                >
                  Total
                  <ArrowUpDown className="ml-2 w-3 h-3" />
                </Button>
              </TableHead>
              <TableHead className="pr-6 text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBookings.map((booking) => (
              <TableRow
                key={booking.id}
                onClick={() => onSelect(booking)}
                className="cursor-pointer border-b border-slate-50 hover:bg-slate-50 transition-colors"
              >
                <TableCell className="pl-6">
                  <p className="font-medium">{booking.name}</p>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-0.5">
                    <div
                      className="text-sm max-w-[150px] truncate"
                      title={booking.email}
                    >
                      {booking.email}
                    </div>
                    <div
                      className="text-xs text-muted-foreground max-w-[150px] truncate"
                      title={booking.phone_number}
                    >
                      {booking.phone_number}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{booking.package_title}</TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(booking.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="cursor-help decoration-dotted underline underline-offset-4 decoration-slate-300">
                          {booking.guests}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{booking.adults} Adults, {booking.children} Children</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                <TableCell>
                  <StatusBadge status={booking.status} />
                </TableCell>
                <TableCell>
                  <PaymentBadge status={booking.payment_status} />
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{booking.total_price.toLocaleString()} MAD</p>
                    {booking.remaining_balance > 0 && (
                      <p className="text-xs text-amber-600">Due: {booking.remaining_balance.toLocaleString()}</p>
                    )}
                  </div>
                </TableCell>
                <TableCell className="pr-6">
                  <div className="flex justify-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        const phone = booking.phone_number.replace(/[^0-9+]/g, '')
                        const message = encodeURIComponent(`Hello ${booking.name}, regarding your booking for ${booking.package_title} on ${new Date(booking.date).toLocaleDateString()}`)
                        window.open(`https://wa.me/${phone}?text=${message}`, '_blank')
                      }}
                      className="h-9 w-9 bg-green-500 hover:bg-green-600 text-white rounded-full"
                      title="Contact on WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredBookings.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No bookings found</p>
        </div>
      )}
    </GlassCard>
  )
}
