"use client"

import { useState, useEffect } from "react"
import type { Booking } from "@/lib/types"
import { StatusBadge } from "@/components/ui/status-badge"
import { PaymentBadge } from "@/components/ui/payment-badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { mockDrivers } from "@/lib/mock-data"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Mail,
  Phone,
  Calendar,
  Users,
  Package,
  MessageCircle,
  Edit,
  Trash2,
  Save,
  X,
  MapPin,
  Clock,
  Car,
  AlertTriangle,
  Banknote,
  CreditCard,
} from "lucide-react"

interface BookingDrawerProps {
  booking: Booking | null
  open: boolean
  onClose: () => void
  onEdit?: (booking: Booking) => void
  onDelete?: (bookingId: string) => void
  onSave?: (booking: Booking) => void
}

export function BookingDrawer({ booking, open, onClose, onEdit, onDelete, onSave }: BookingDrawerProps) {
  const [isEditMode, setIsEditMode] = useState(false)
  const [editedBooking, setEditedBooking] = useState<Booking | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  if (!booking) return null

  const handleWhatsApp = () => {
    const phone = booking.phone.replace(/[^0-9]/g, "")
    const message = encodeURIComponent(
      `Hello ${booking.customer_name}, this is Marragafay regarding your ${booking.package_title} booking on ${new Date(booking.date).toLocaleDateString()}.`,
    )
    window.open(`https://wa.me/${phone}?text=${message}`, "_blank")
  }

  const handleCall = () => {
    window.open(`tel:${booking.phone}`, "_blank")
  }

  const handleEditClick = () => {
    setEditedBooking({ ...booking })
    setIsEditMode(true)
  }

  const handleCancelEdit = () => {
    setIsEditMode(false)
    setEditedBooking(null)
  }

  const handleSaveChanges = () => {
    if (editedBooking && onSave) {
      const updated = {
        ...editedBooking,
        remaining_balance: editedBooking.total_price - editedBooking.amount_paid,
      }
      onSave(updated)
      toast({
        title: "Booking Updated",
        description: `Changes to ${updated.customer_name}'s booking have been saved.`,
      })
    }
    setIsEditMode(false)
    setEditedBooking(null)
  }

  const handleClose = () => {
    setIsEditMode(false)
    setEditedBooking(null)
    onClose()
  }

  const handleDelete = () => {
    if (onDelete) {
      onDelete(booking.id)
      toast({
        title: "Booking Deleted",
        description: `${booking.customer_name}'s booking has been removed.`,
        variant: "destructive",
      })
    }
    handleClose()
  }

  const currentBooking = isEditMode && editedBooking ? editedBooking : booking

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className={`
          ${isMobile ? "h-[90vh] rounded-t-3xl" : "w-full sm:max-w-md"}
          bg-gray-50 border-0 overflow-hidden flex flex-col p-0
        `}
      >
        {isMobile && (
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-gray-300" />
          </div>
        )}

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto pb-32">
          <div className="bg-white px-5 pt-4 pb-5">
            {isEditMode ? (
              <div className="space-y-3">
                <Label className="text-xs text-gray-500 uppercase tracking-wider">Customer Name</Label>
                <Input
                  value={editedBooking?.customer_name || ""}
                  onChange={(e) =>
                    setEditedBooking((prev) => (prev ? { ...prev, customer_name: e.target.value } : null))
                  }
                  className="text-xl font-bold rounded-xl border-gray-200 bg-gray-50 h-12"
                />
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16 border-2 border-white shadow-lg">
                  <AvatarFallback className="bg-[#C19B76] text-white text-xl font-semibold">
                    {getInitials(currentBooking.customer_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-3xl font-bold text-gray-900">{currentBooking.pickup_time || "TBD"}</span>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">{currentBooking.customer_name}</h2>
                  <div className="flex items-center gap-2 mt-2">
                    <StatusBadge status={currentBooking.status} />
                    <PaymentBadge status={currentBooking.payment_status} />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="px-5 py-4 space-y-4">
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider px-1">Contact</h4>
              <div className="bg-white rounded-2xl shadow-sm divide-y divide-gray-100 overflow-hidden">
                {isEditMode ? (
                  <div className="p-4 space-y-3">
                    <div>
                      <Label className="text-xs text-gray-500">Email</Label>
                      <Input
                        value={editedBooking?.email || ""}
                        onChange={(e) => setEditedBooking((prev) => (prev ? { ...prev, email: e.target.value } : null))}
                        className="mt-1 rounded-xl border-gray-200 bg-gray-50 h-11"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Phone</Label>
                      <Input
                        value={editedBooking?.phone || ""}
                        onChange={(e) => setEditedBooking((prev) => (prev ? { ...prev, phone: e.target.value } : null))}
                        className="mt-1 rounded-xl border-gray-200 bg-gray-50 h-11"
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center px-4 py-3.5 min-h-[52px]">
                      <Mail className="w-5 h-5 text-gray-400 mr-4 flex-shrink-0" />
                      <span className="text-gray-900 text-[15px]">{currentBooking.email}</span>
                    </div>
                    <div className="flex items-center px-4 py-3.5 min-h-[52px]">
                      <Phone className="w-5 h-5 text-gray-400 mr-4 flex-shrink-0" />
                      <span className="text-gray-900 text-[15px]">{currentBooking.phone}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider px-1">Booking Details</h4>
              <div className="bg-white rounded-2xl shadow-sm divide-y divide-gray-100 overflow-hidden">
                {isEditMode ? (
                  <div className="p-4 space-y-3">
                    <div>
                      <Label className="text-xs text-gray-500">Package</Label>
                      <Select
                        value={editedBooking?.package_title}
                        onValueChange={(value) =>
                          setEditedBooking((prev) => (prev ? { ...prev, package_title: value } : null))
                        }
                      >
                        <SelectTrigger className="mt-1 rounded-xl border-gray-200 bg-gray-50 h-11">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Basic Discovery">Basic Discovery</SelectItem>
                          <SelectItem value="Premium Sunset Tour">Premium Sunset Tour</SelectItem>
                          <SelectItem value="VIP Desert Experience">VIP Desert Experience</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs text-gray-500">Date</Label>
                        <Input
                          type="date"
                          value={editedBooking?.date || ""}
                          onChange={(e) =>
                            setEditedBooking((prev) => (prev ? { ...prev, date: e.target.value } : null))
                          }
                          className="mt-1 rounded-xl border-gray-200 bg-gray-50 h-11"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Pickup Time</Label>
                        <Input
                          type="time"
                          value={editedBooking?.pickup_time || ""}
                          onChange={(e) =>
                            setEditedBooking((prev) => (prev ? { ...prev, pickup_time: e.target.value } : null))
                          }
                          className="mt-1 rounded-xl border-gray-200 bg-gray-50 h-11"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Guests</Label>
                      <Input
                        type="number"
                        min="1"
                        value={editedBooking?.guests || 1}
                        onChange={(e) =>
                          setEditedBooking((prev) =>
                            prev ? { ...prev, guests: Number.parseInt(e.target.value) || 1 } : null,
                          )
                        }
                        className="mt-1 rounded-xl border-gray-200 bg-gray-50 h-11"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Pickup Location</Label>
                      <Select
                        value={editedBooking?.pickup_location || ""}
                        onValueChange={(value) =>
                          setEditedBooking((prev) => (prev ? { ...prev, pickup_location: value } : null))
                        }
                      >
                        <SelectTrigger className="mt-1 rounded-xl border-gray-200 bg-gray-50 h-11">
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Gueliz">Gueliz</SelectItem>
                          <SelectItem value="Medina">Medina</SelectItem>
                          <SelectItem value="Hivernage">Hivernage</SelectItem>
                          <SelectItem value="Palmeraie">Palmeraie</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Status</Label>
                      <Select
                        value={editedBooking?.status}
                        onValueChange={(value: "pending" | "confirmed" | "cancelled") =>
                          setEditedBooking((prev) => (prev ? { ...prev, status: value } : null))
                        }
                      >
                        <SelectTrigger className="mt-1 rounded-xl border-gray-200 bg-gray-50 h-11">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Assign Driver</Label>
                      <Select
                        value={editedBooking?.driver_id || "none"}
                        onValueChange={(value) => {
                          const driver = mockDrivers.find((d) => d.id === value)
                          setEditedBooking((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  driver_id: value === "none" ? undefined : value,
                                  driver_name: driver?.name || undefined,
                                }
                              : null,
                          )
                        }}
                      >
                        <SelectTrigger className="mt-1 rounded-xl border-gray-200 bg-gray-50 h-11">
                          <SelectValue placeholder="Select driver" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No driver</SelectItem>
                          {mockDrivers
                            .filter((d) => d.is_available)
                            .map((driver) => (
                              <SelectItem key={driver.id} value={driver.id}>
                                {driver.name} - {driver.vehicle}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between px-4 py-3.5 min-h-[52px]">
                      <div className="flex items-center">
                        <Package className="w-5 h-5 text-gray-400 mr-4 flex-shrink-0" />
                        <span className="text-gray-500 text-[15px]">Package</span>
                      </div>
                      <span className="text-gray-900 font-medium text-[15px]">{currentBooking.package_title}</span>
                    </div>
                    <div className="flex items-center justify-between px-4 py-3.5 min-h-[52px]">
                      <div className="flex items-center">
                        <Calendar className="w-5 h-5 text-gray-400 mr-4 flex-shrink-0" />
                        <span className="text-gray-500 text-[15px]">Date</span>
                      </div>
                      <span className="text-gray-900 font-medium text-[15px]">
                        {new Date(currentBooking.date).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between px-4 py-3.5 min-h-[52px]">
                      <div className="flex items-center">
                        <Clock className="w-5 h-5 text-gray-400 mr-4 flex-shrink-0" />
                        <span className="text-gray-500 text-[15px]">Pickup Time</span>
                      </div>
                      <span className="text-gray-900 font-medium text-[15px]">
                        {currentBooking.pickup_time || "TBD"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between px-4 py-3.5 min-h-[52px]">
                      <div className="flex items-center">
                        <Users className="w-5 h-5 text-gray-400 mr-4 flex-shrink-0" />
                        <span className="text-gray-500 text-[15px]">Guests</span>
                      </div>
                      <span className="text-gray-900 font-medium text-[15px]">{currentBooking.guests} people</span>
                    </div>
                    <div className="flex items-center justify-between px-4 py-3.5 min-h-[52px]">
                      <div className="flex items-center">
                        <MapPin className="w-5 h-5 text-gray-400 mr-4 flex-shrink-0" />
                        <span className="text-gray-500 text-[15px]">Pickup</span>
                      </div>
                      <span className="text-gray-900 font-medium text-[15px]">
                        {currentBooking.pickup_location || "Not set"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between px-4 py-3.5 min-h-[52px]">
                      <div className="flex items-center">
                        <Car className="w-5 h-5 text-gray-400 mr-4 flex-shrink-0" />
                        <span className="text-gray-500 text-[15px]">Driver</span>
                      </div>
                      <span
                        className={`font-medium text-[15px] ${currentBooking.driver_name ? "text-gray-900" : "text-amber-600"}`}
                      >
                        {currentBooking.driver_name || "Not assigned"}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider px-1">Payment</h4>
              <div className="bg-white rounded-2xl shadow-sm divide-y divide-gray-100 overflow-hidden">
                {isEditMode ? (
                  <div className="p-4 space-y-3">
                    <div>
                      <Label className="text-xs text-gray-500">Payment Status</Label>
                      <Select
                        value={editedBooking?.payment_status}
                        onValueChange={(value: "paid" | "deposit" | "unpaid") =>
                          setEditedBooking((prev) => (prev ? { ...prev, payment_status: value } : null))
                        }
                      >
                        <SelectTrigger className="mt-1 rounded-xl border-gray-200 bg-gray-50 h-11">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="deposit">Deposit</SelectItem>
                          <SelectItem value="unpaid">Unpaid</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs text-gray-500">Total Price (MAD)</Label>
                        <Input
                          type="number"
                          min="0"
                          value={editedBooking?.total_price || 0}
                          onChange={(e) =>
                            setEditedBooking((prev) =>
                              prev ? { ...prev, total_price: Number.parseInt(e.target.value) || 0 } : null,
                            )
                          }
                          className="mt-1 rounded-xl border-gray-200 bg-gray-50 h-11"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Amount Paid (MAD)</Label>
                        <Input
                          type="number"
                          min="0"
                          value={editedBooking?.amount_paid || 0}
                          onChange={(e) =>
                            setEditedBooking((prev) =>
                              prev ? { ...prev, amount_paid: Number.parseInt(e.target.value) || 0 } : null,
                            )
                          }
                          className="mt-1 rounded-xl border-gray-200 bg-gray-50 h-11"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between px-4 py-3.5 min-h-[52px]">
                      <div className="flex items-center">
                        <Banknote className="w-5 h-5 text-gray-400 mr-4 flex-shrink-0" />
                        <span className="text-gray-500 text-[15px]">Total</span>
                      </div>
                      <span className="text-gray-900 font-semibold text-[15px]">
                        {currentBooking.total_price.toLocaleString()} MAD
                      </span>
                    </div>
                    <div className="flex items-center justify-between px-4 py-3.5 min-h-[52px]">
                      <div className="flex items-center">
                        <CreditCard className="w-5 h-5 text-gray-400 mr-4 flex-shrink-0" />
                        <span className="text-gray-500 text-[15px]">Paid</span>
                      </div>
                      <span className="text-emerald-600 font-semibold text-[15px]">
                        {currentBooking.amount_paid.toLocaleString()} MAD
                      </span>
                    </div>
                    {currentBooking.remaining_balance > 0 && (
                      <div className="flex items-center justify-between px-4 py-3.5 min-h-[52px] bg-amber-50">
                        <div className="flex items-center">
                          <AlertTriangle className="w-5 h-5 text-amber-500 mr-4 flex-shrink-0" />
                          <span className="text-amber-700 font-medium text-[15px]">Balance Due</span>
                        </div>
                        <span className="text-amber-700 font-bold text-[15px]">
                          {currentBooking.remaining_balance.toLocaleString()} MAD
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {currentBooking.notes && !isEditMode && (
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider px-1">Client Notes</h4>
                <div className="bg-amber-50 rounded-2xl shadow-sm border border-amber-200 p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-amber-900 text-[15px]">{currentBooking.notes}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Edit mode notes */}
            {isEditMode && (
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider px-1">Client Notes</h4>
                <div className="bg-white rounded-2xl shadow-sm p-4">
                  <textarea
                    value={editedBooking?.notes || ""}
                    onChange={(e) => setEditedBooking((prev) => (prev ? { ...prev, notes: e.target.value } : null))}
                    placeholder="Add special requests or notes..."
                    className="w-full h-24 rounded-xl border border-gray-200 bg-gray-50 p-3 text-[15px] resize-none focus:outline-none focus:ring-2 focus:ring-[#C19B76]"
                  />
                </div>
              </div>
            )}

            {/* Actions (non-sticky, for edit/delete) */}
            {!isEditMode && (
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={handleEditClick}
                  className="flex-1 rounded-xl h-12 bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDelete}
                  className="rounded-xl h-12 px-4 bg-white border-gray-200 text-red-600 hover:bg-red-50 hover:border-red-200"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            )}

            {/* Edit mode save/cancel */}
            {isEditMode && (
              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={handleCancelEdit} className="flex-1 rounded-xl h-12 bg-white">
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveChanges}
                  className="flex-1 rounded-xl h-12 bg-[#C19B76] hover:bg-[#A67C52] text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            )}
          </div>
        </div>

        {!isEditMode && (
          <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-gray-200 p-4 safe-area-inset-bottom">
            <div className="flex gap-3">
              <Button
                onClick={handleWhatsApp}
                className="flex-1 rounded-xl h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-[15px]"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                WhatsApp
              </Button>
              <Button
                onClick={handleCall}
                variant="outline"
                className="flex-1 rounded-xl h-14 bg-white border-gray-200 text-gray-900 font-medium text-[15px] hover:bg-gray-50"
              >
                <Phone className="w-5 h-5 mr-2" />
                Call
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
