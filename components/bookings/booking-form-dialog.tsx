"use client"

import type React from "react"

import { useState } from "react"
import type { Booking } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface BookingFormDialogProps {
  open: boolean
  onClose: () => void
  onSave: (booking: Omit<Booking, "id" | "created_at">) => void
}

export function BookingFormDialog({ open, onClose, onSave }: BookingFormDialogProps) {
  const [formData, setFormData] = useState({
    customer_name: "",
    email: "",
    phone: "",
    package_title: "Basic Discovery",
    date: "",
    guests: 1,
    total_price: 1500,
    status: "pending" as const,
    notes: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
    // Reset form
    setFormData({
      customer_name: "",
      email: "",
      phone: "",
      package_title: "Basic Discovery",
      date: "",
      guests: 1,
      total_price: 1500,
      status: "pending",
      notes: "",
    })
    onClose()
  }

  // Auto-update price based on package
  const handlePackageChange = (value: string) => {
    const prices: Record<string, number> = {
      "Basic Discovery": 1500,
      "Premium Sunset Tour": 4000,
      "VIP Desert Experience": 6000,
    }
    setFormData((prev) => ({
      ...prev,
      package_title: value,
      total_price: (prices[value] || 1500) * prev.guests,
    }))
  }

  const handleGuestsChange = (guests: number) => {
    const prices: Record<string, number> = {
      "Basic Discovery": 1500,
      "Premium Sunset Tour": 4000,
      "VIP Desert Experience": 6000,
    }
    setFormData((prev) => ({
      ...prev,
      guests,
      total_price: (prices[prev.package_title] || 1500) * guests,
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="glass border border-white/10 max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">New Booking</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-4">
          <div className="space-y-2">
            <Label>Customer Name *</Label>
            <Input
              required
              value={formData.customer_name}
              onChange={(e) => setFormData((prev) => ({ ...prev, customer_name: e.target.value }))}
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
                value={formData.phone}
                onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                placeholder="+212 6XX XXX XXX"
                className="rounded-xl border-0 bg-secondary/50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Package *</Label>
            <Select value={formData.package_title} onValueChange={handlePackageChange}>
              <SelectTrigger className="rounded-xl border-0 bg-secondary/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Basic Discovery">Basic Discovery - 1,500 MAD/person</SelectItem>
                <SelectItem value="Premium Sunset Tour">Premium Sunset Tour - 4,000 MAD/person</SelectItem>
                <SelectItem value="VIP Desert Experience">VIP Desert Experience - 6,000 MAD/person</SelectItem>
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
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, total_price: Number.parseInt(e.target.value) || 0 }))
                }
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
      </DialogContent>
    </Dialog>
  )
}
