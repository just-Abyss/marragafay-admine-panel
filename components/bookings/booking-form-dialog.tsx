"use client"

import type React from "react"

import { useState, useEffect } from "react"
import type { Booking } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { supabase } from "@/lib/supabase"
import { Loader2 } from "lucide-react"

interface PricingItem {
  id: string
  name: string              // ✅ Using 'name' from database
  price: number
  type: 'pack' | 'activity'
}

interface Driver {
  id: string
  name: string
  vehicle?: string
}

interface BookingFormDialogProps {
  open: boolean
  onClose: () => void
  onSave: (booking: Omit<Booking, "id" | "created_at">) => void
}

export function BookingFormDialog({ open, onClose, onSave }: BookingFormDialogProps) {
  const [pricingItems, setPricingItems] = useState<PricingItem[]>([])
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone_number: "",
    package_title: "",
    date: "",
    guests: 1,
    adults: 1,
    children: 0,
    total_price: 0,
    status: "pending" as "pending" | "confirmed" | "cancelled",
    notes: "",
    payment_status: "unpaid" as const,
    amount_paid: 0,
    remaining_balance: 0,
    driver_id: "",
    driver_name: "",
    pickup_time: "",
    pickup_location: "",
  })

  useEffect(() => {
    if (open) {
      fetchData()
    }
  }, [open])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch pricing items
      const { data: pricingData, error: pricingError } = await supabase
        .from('pricing')
        .select('id, name, price, type')        // ✅ Selecting 'name' column
        .order('type', { ascending: false }) // packs first
        .order('name', { ascending: true })

      if (pricingError) throw pricingError
      setPricingItems(pricingData || [])

      // Fetch drivers
      const { data: driversData, error: driversError } = await supabase
        .from('drivers')
        .select('id, name, vehicle')
        .eq('is_available', true)
        .order('name', { ascending: true })

      if (driversError) throw driversError
      setDrivers(driversData || [])

    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const bookingData = {
      ...formData,
      remaining_balance: formData.total_price - formData.amount_paid
    }

    onSave(bookingData)

    // Reset form
    setFormData({
      name: "",
      email: "",
      phone_number: "",
      package_title: "",
      date: "",
      guests: 1,
      adults: 1,
      children: 0,
      total_price: 0,
      status: "pending",
      notes: "",
      payment_status: "unpaid",
      amount_paid: 0,
      remaining_balance: 0,
      driver_id: "",
      driver_name: "",
      pickup_time: "",
      pickup_location: "",
    })
    onClose()
  }

  // Handle package/activity selection
  const handlePackageChange = (value: string) => {
    const selected = pricingItems.find(item => item.name === value)
    if (selected) {
      const totalPrice = selected.price * formData.guests
      setFormData((prev) => ({
        ...prev,
        package_title: selected.name,          // ✅ Using 'name'
        total_price: totalPrice,
        remaining_balance: totalPrice - prev.amount_paid
      }))
    }
  }

  // Handle guests change
  const handleGuestsChange = (guests: number) => {
    const selected = pricingItems.find(item => item.name === formData.package_title)
    const pricePerPerson = selected?.price || 0
    const totalPrice = pricePerPerson * guests

    setFormData((prev) => ({
      ...prev,
      guests,
      total_price: totalPrice,
      remaining_balance: totalPrice - prev.amount_paid
    }))
  }

  // Handle driver selection
  const handleDriverChange = (value: string) => {
    if (value === "none") {
      setFormData((prev) => ({
        ...prev,
        driver_id: "",
        driver_name: ""
      }))
    } else {
      const selected = drivers.find(d => d.id === value)
      if (selected) {
        setFormData((prev) => ({
          ...prev,
          driver_id: selected.id,
          driver_name: selected.name
        }))
      }
    }
  }

  // Group pricing items
  const packages = pricingItems.filter(item => item.type === 'pack')
  const activities = pricingItems.filter(item => item.type === 'activity')

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="glass border border-white/10 max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">New Booking</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-[#C19B76]" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 pt-4">
            <div className="space-y-2">
              <Label>Customer Name *</Label>
              <Input
                required
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Enter customer name"
                className="rounded-xl border-0 bg-secondary/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="email@example.com"
                  className="rounded-xl border-0 bg-secondary/50"
                />
              </div>
              <div className="space-y-2">
                <Label>Phone *</Label>
                <Input
                  required
                  value={formData.phone_number}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phone_number: e.target.value }))}
                  placeholder="+212 6XX XXX XXX"
                  className="rounded-xl border-0 bg-secondary/50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Package / Activity *</Label>
              <Select value={formData.package_title} onValueChange={handlePackageChange}>
                <SelectTrigger className="rounded-xl border-0 bg-secondary/50">
                  <SelectValue placeholder="Select package or activity" />
                </SelectTrigger>
                <SelectContent>
                  {packages.length > 0 && (
                    <SelectGroup>
                      <SelectLabel className="text-[#C19B76] font-semibold">Packages</SelectLabel>
                      {packages.map((item) => (
                        <SelectItem key={item.id} value={item.name}>
                          {item.name} - {item.price.toLocaleString()} MAD/person
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  )}
                  {activities.length > 0 && (
                    <SelectGroup>
                      <SelectLabel className="text-[#C19B76] font-semibold">Activities</SelectLabel>
                      {activities.map((item) => (
                        <SelectItem key={item.id} value={item.name}>
                          {item.name} - {item.price.toLocaleString()} MAD/person
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  )}
                  {pricingItems.length === 0 && (
                    <SelectItem value="none" disabled>No packages or activities available</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date *</Label>
                <Input
                  required
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                  className="rounded-xl border-0 bg-secondary/50"
                />
              </div>
              <div className="space-y-2">
                <Label>Number of Guests *</Label>
                <Input
                  required
                  type="number"
                  min="1"
                  value={formData.guests}
                  onChange={(e) => handleGuestsChange(Number.parseInt(e.target.value) || 1)}
                  className="rounded-xl border-0 bg-secondary/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: "pending" | "confirmed" | "cancelled") =>
                    setFormData((prev) => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger className="rounded-xl border-0 bg-secondary/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Total Price (MAD)</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.total_price}
                  disabled
                  className="rounded-xl border-0 bg-secondary/50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Assign Driver</Label>
              <Select value={formData.driver_id || "none"} onValueChange={handleDriverChange}>
                <SelectTrigger className="rounded-xl border-0 bg-secondary/50">
                  <SelectValue placeholder="Select driver (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No driver assigned</SelectItem>
                  {drivers.map((driver) => (
                    <SelectItem key={driver.id} value={driver.id}>
                      {driver.name}{driver.vehicle ? ` - ${driver.vehicle}` : ''}
                    </SelectItem>
                  ))}
                  {drivers.length === 0 && (
                    <SelectItem value="no-drivers" disabled>No drivers available</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Pickup Time</Label>
                <Input
                  type="time"
                  value={formData.pickup_time}
                  onChange={(e) => setFormData((prev) => ({ ...prev, pickup_time: e.target.value }))}
                  className="rounded-xl border-0 bg-secondary/50"
                />
              </div>
              <div className="space-y-2">
                <Label>Pickup Location</Label>
                <Input
                  value={formData.pickup_location}
                  onChange={(e) => setFormData((prev) => ({ ...prev, pickup_location: e.target.value }))}
                  placeholder="Hotel name or address"
                  className="rounded-xl border-0 bg-secondary/50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="Special requests, dietary requirements, etc."
                className="rounded-xl border-0 bg-secondary/50 min-h-[80px]"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                className="flex-1 rounded-xl h-12 bg-[#C19B76] hover:bg-[#A67C52] shadow-lg shadow-[#C19B76]/20"
              >
                Create Booking
              </Button>
              <Button type="button" variant="outline" className="rounded-xl h-12 bg-transparent" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
