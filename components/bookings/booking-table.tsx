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
import { Search, SlidersHorizontal, ArrowUpDown } from "lucide-react"

interface BookingTableProps {
  bookings: Booking[]
  onSelect: (booking: Booking) => void
}

type SortField = "date" | "customer_name" | "total_price"
type SortOrder = "asc" | "desc"

export function BookingTable({ bookings, onSelect }: BookingTableProps) {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [paymentFilter, setPaymentFilter] = useState<string>("all")
  const [sortField, setSortField] = useState<SortField>("date")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")

  const filteredBookings = bookings
    .filter((booking) => {
      const matchesSearch =
        booking.customer_name.toLowerCase().includes(search.toLowerCase()) ||
        booking.email.toLowerCase().includes(search.toLowerCase()) ||
        booking.package_title.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = statusFilter === "all" || booking.status === statusFilter
      const matchesPayment = paymentFilter === "all" || booking.payment_status === paymentFilter
      return matchesSearch && matchesStatus && matchesPayment
    })
    .sort((a, b) => {
      let comparison = 0
      switch (sortField) {
        case "date":
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime()
          break
        case "customer_name":
          comparison = a.customer_name.localeCompare(b.customer_name)
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
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search bookings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 rounded-xl border border-slate-200 bg-slate-50"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40 rounded-xl border border-slate-200 bg-slate-50">
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
          <SelectTrigger className="w-full sm:w-40 rounded-xl border border-slate-200 bg-slate-50">
            <SelectValue placeholder="Payment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Payments</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="deposit">Deposit</SelectItem>
            <SelectItem value="unpaid">Unpaid</SelectItem>
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
                  onClick={() => handleSort("customer_name")}
                >
                  Customer
                  <ArrowUpDown className="ml-2 w-3 h-3" />
                </Button>
              </TableHead>
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
              <TableHead className="pr-6">
                <Button
                  variant="ghost"
                  className="p-0 h-auto font-medium hover:bg-transparent"
                  onClick={() => handleSort("total_price")}
                >
                  Total
                  <ArrowUpDown className="ml-2 w-3 h-3" />
                </Button>
              </TableHead>
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
                  <div>
                    <p className="font-medium">{booking.customer_name}</p>
                    <p className="text-sm text-muted-foreground">{booking.email}</p>
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
                <TableCell className="text-muted-foreground">{booking.guests}</TableCell>
                <TableCell>
                  <StatusBadge status={booking.status} />
                </TableCell>
                <TableCell>
                  <PaymentBadge status={booking.payment_status} />
                </TableCell>
                <TableCell className="pr-6">
                  <div>
                    <p className="font-medium">{booking.total_price.toLocaleString()} MAD</p>
                    {booking.remaining_balance > 0 && (
                      <p className="text-xs text-amber-600">Due: {booking.remaining_balance.toLocaleString()}</p>
                    )}
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
