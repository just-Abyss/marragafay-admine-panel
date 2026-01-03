"use client"

import { useState, useEffect } from "react"
import type { Booking, Driver } from "@/lib/types"
import { StatusBadge } from "@/components/ui/status-badge"
import { PaymentBadge } from "@/components/ui/payment-badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { toast } from "sonner"
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
  FileText,
} from "lucide-react"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

interface BookingDrawerProps {
  booking: Booking | null
  open: boolean
  onClose: () => void
  onEdit?: (booking: Booking) => void
  onDelete?: (bookingId: string) => void
  onSave?: (booking: Booking) => void
}

export function BookingDrawer({ booking, open, onClose, onEdit, onDelete, onSave }: BookingDrawerProps) {
  // ===== ALL HOOKS AT THE TOP (CRITICAL FOR REACT RULES) =====
  const [isEditMode, setIsEditMode] = useState(false)
  const [editedBooking, setEditedBooking] = useState<Booking | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [isLoadingDrivers, setIsLoadingDrivers] = useState(false)
  const [pricingItems, setPricingItems] = useState<Array<{ id: string, name: string, price: number, type: string }>>([])  // ✅ Added
  const router = useRouter()

  // Fetch drivers and pricing items from Supabase
  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingDrivers(true)
      try {
        // Fetch drivers
        const { data: driversData, error: driversError } = await supabase
          .from('drivers')
          .select('*')
          .order('name')

        if (driversError) {
          console.error('Error fetching drivers:', driversError)
        } else {
          setDrivers(driversData || [])
        }

        // ✅ Fetch pricing items (packages + activities)
        const { data: pricingData, error: pricingError } = await supabase
          .from('pricing')
          .select('id, name, price, type')
          .order('type', { ascending: false })  // packs first
          .order('name', { ascending: true })

        if (pricingError) {
          console.error('Error fetching pricing:', pricingError)
        } else {
          setPricingItems(pricingData || [])
        }
      } catch (err) {
        console.error('Failed to fetch data:', err)
      } finally {
        setIsLoadingDrivers(false)
      }
    }

    if (open) {
      fetchData()
    }
  }, [open])

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // ===== HANDLE NULL BOOKING AFTER HOOKS =====
  if (!booking) return null

  // ===== HANDLERS =====
  const handleWhatsApp = () => {
    const phone = booking.phone_number.replace(/[^0-9]/g, "")
    const message = encodeURIComponent(
      `Hello ${booking.name}, this is Marragafay regarding your ${booking.package_title} booking on ${new Date(booking.date).toLocaleDateString()}.`,
    )
    window.open(`https://wa.me/${phone}?text=${message}`, "_blank")
  }

  const handleCall = () => {
    window.open(`tel:${booking.phone_number}`, "_blank")
  }

  const handleEditClick = () => {
    setEditedBooking({ ...booking })
    setIsEditMode(true)
  }

  const handleCancelEdit = () => {
    setIsEditMode(false)
    setEditedBooking(null)
  }

  const handleSaveChanges = async () => {
    if (!editedBooking) return

    setIsSaving(true)
    try {
      // ===== SANITIZE & VALIDATE DATA =====
      const totalPrice = parseFloat(String(editedBooking.total_price)) || 0
      const amountPaid = parseFloat(String(editedBooking.amount_paid)) || 0
      const guestsCount = parseInt(String(editedBooking.guests)) || 1

      // ===== BUILD CLEAN PAYLOAD =====
      const payload = {
        name: editedBooking.name?.trim() || '',
        email: editedBooking.email?.trim() || '',
        phone_number: editedBooking.phone_number?.trim() || '',
        package_title: editedBooking.package_title?.trim() || '',
        date: editedBooking.date || new Date().toISOString().split('T')[0],
        guests: (editedBooking.adults || 1) + (editedBooking.children || 0),
        adults: editedBooking.adults || 1,
        children: editedBooking.children || 0,
        status: editedBooking.status,
        payment_status: editedBooking.payment_status,
        total_price: totalPrice,
        amount_paid: amountPaid,
        remaining_balance: totalPrice - amountPaid,
        deposit_amount: amountPaid,
        notes: editedBooking.notes?.trim() || null,
        driver_id: editedBooking.driver_id || null,
        driver_name: editedBooking.driver_name?.trim() || null,
        driver: editedBooking.driver_name?.trim() || null, // Legacy field mapping
        pickup_time: editedBooking.pickup_time || null,
        pickup_location: editedBooking.pickup_location?.trim() || null,
      }

      console.log('📤 Sending update payload:', payload)

      // ===== EXECUTE UPDATE =====
      const { data, error } = await supabase
        .from('bookings')
        .update(payload)
        .eq('id', editedBooking.id)
        .select()

      if (error) {
        console.error('❌ Supabase Update Error:', JSON.stringify(error, null, 2))
        throw error
      }

      console.log('✅ Update successful:', data)

      // ===== SUCCESS: UPDATE UI =====
      toast.success("Booking Updated", {
        description: `Changes to ${editedBooking.name}'s booking have been saved.`,
      })

      if (onSave) {
        // Cast payload to any to avoid "null vs undefined" type mismatch with Booking interface
        onSave({ ...editedBooking, ...payload } as any)
      }

      // Close edit mode and refresh
      setIsEditMode(false)
      setEditedBooking(null)
      router.refresh()

    } catch (error: any) {
      console.error('❌ Full Error Object:', JSON.stringify(error, null, 2))
      toast.error(error?.message || 'There was an error saving your changes. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleClose = () => {
    setIsEditMode(false)
    setEditedBooking(null)
    onClose()
  }

  const handleDelete = () => {
    if (onDelete) {
      onDelete(booking.id)
      toast.success("Booking Deleted", {
        description: `${booking.name}'s booking has been removed.`,
      })
    }
    handleClose()
  }

  // ===== DERIVED STATE =====
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

  const getPickupTimeLabel = (current: Booking) => {
    const time = current.pickup_time?.trim()
    if (time) return time
    return current.status === "pending" ? "New Booking" : "Pending Info"
  }

  const getCondensedPackageTitle = (title: string) => {
    if (!title) return "Not set"
    const [firstPart] = title.split(/[-|]/)
    return firstPart?.trim() || title.trim()
  }

  const formatMad = (amount: number) => {
    if (!Number.isFinite(amount)) return "MAD 0"
    return `MAD ${amount.toLocaleString("en-US")}`
  }

  const pickupTimeDisplay = getPickupTimeLabel(currentBooking)
  const condensedPackageTitle = getCondensedPackageTitle(currentBooking.package_title)

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className={`
          ${isMobile ? "h-[90vh] rounded-t-3xl" : "w-full sm:max-w-md"}
          bg-gray-50 border-0 overflow-hidden flex flex-col p-0
        `}
      >
        <SheetHeader>
          <SheetTitle className="sr-only">Booking Details</SheetTitle>
        </SheetHeader>
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
                  value={editedBooking?.name || ""}
                  onChange={(e) =>
                    setEditedBooking((prev) => (prev ? { ...prev, name: e.target.value } : null))
                  }
                  className="text-xl font-bold rounded-xl border-gray-200 bg-gray-50 h-12"
                />
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16 border-2 border-white shadow-lg">
                  <AvatarFallback className="bg-[#C19B76] text-white text-xl font-semibold">
                    {getInitials(currentBooking.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-3xl font-bold text-gray-900">{pickupTimeDisplay}</span>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">{currentBooking.name}</h2>
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
                        value={editedBooking?.phone_number || ""}
                        onChange={(e) => setEditedBooking((prev) => (prev ? { ...prev, phone_number: e.target.value } : null))}
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
                      <span className="text-gray-900 text-[15px]">{currentBooking.phone_number}</span>
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
                      <Label className="text-xs text-gray-500">Package / Activity</Label>
                      <Select
                        value={editedBooking?.package_title}
                        onValueChange={(value) => {
                          const selected = pricingItems.find(item => item.name === value)
                          const totalPrice = selected ? selected.price * (editedBooking?.guests || 1) : editedBooking?.total_price || 0
                          setEditedBooking((prev) => prev ? {
                            ...prev,
                            package_title: value,
                            total_price: totalPrice
                          } : null)
                        }}
                      >
                        <SelectTrigger className="mt-1 rounded-xl border-gray-200 bg-gray-50 h-11">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {/* Packages Group */}
                          {pricingItems.filter(item => item.type === 'pack').length > 0 && (
                            <>
                              <div className="px-2 py-1.5 text-xs font-semibold text-[#C19B76]">Packages</div>
                              {pricingItems.filter(item => item.type === 'pack').map((item) => (
                                <SelectItem key={item.id} value={item.name}>
                                  {item.name} - {item.price.toLocaleString()} MAD/person
                                </SelectItem>
                              ))}
                            </>
                          )}

                          {/* Activities Group */}
                          {pricingItems.filter(item => item.type === 'activity').length > 0 && (
                            <>
                              <div className="px-2 py-1.5 text-xs font-semibold text-[#C19B76]">Activities</div>
                              {pricingItems.filter(item => item.type === 'activity').map((item) => (
                                <SelectItem key={item.id} value={item.name}>
                                  {item.name} - {item.price.toLocaleString()} MAD/person
                                </SelectItem>
                              ))}
                            </>
                          )}
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
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs text-gray-500">Adults</Label>
                        <Input
                          type="number"
                          min="1"
                          value={editedBooking?.adults || 1}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 1
                            const newGuests = val + (editedBooking?.children || 0)
                            const selected = pricingItems.find(item => item.name === editedBooking?.package_title)
                            const totalPrice = selected ? selected.price * newGuests : editedBooking?.total_price || 0
                            setEditedBooking((prev) =>
                              prev ? { ...prev, adults: val, guests: newGuests, total_price: totalPrice } : null,
                            )
                          }}
                          className="mt-1 rounded-xl border-gray-200 bg-gray-50 h-11"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Children</Label>
                        <Input
                          type="number"
                          min="0"
                          value={editedBooking?.children || 0}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 0
                            const newGuests = (editedBooking?.adults || 1) + val
                            const selected = pricingItems.find(item => item.name === editedBooking?.package_title)
                            const totalPrice = selected ? selected.price * newGuests : editedBooking?.total_price || 0
                            setEditedBooking((prev) =>
                              prev ? { ...prev, children: val, guests: newGuests, total_price: totalPrice } : null,
                            )
                          }}
                          className="mt-1 rounded-xl border-gray-200 bg-gray-50 h-11"
                        />
                      </div>
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
                          const driver = drivers.find((d) => d.id === value)
                          setEditedBooking((prev) =>
                            prev
                              ? {
                                ...prev,
                                driver_id: value === "none" ? undefined : value,
                                driver_name: driver?.name || undefined,
                                driver: driver?.name || undefined,
                              }
                              : null,
                          )
                        }}
                        disabled={isLoadingDrivers}
                      >
                        <SelectTrigger className="mt-1 rounded-xl border-gray-200 bg-gray-50 h-11">
                          <SelectValue placeholder={isLoadingDrivers ? "Loading drivers..." : "Select driver"} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No driver</SelectItem>
                          {drivers
                            .filter((d) => d.is_available)
                            .map((driver) => (
                              <SelectItem key={driver.id} value={driver.id}>
                                {driver.name} - {driver.vehicle}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      {drivers.length === 0 && !isLoadingDrivers && (
                        <p className="text-xs text-amber-600 mt-1">No drivers available. Add drivers in the database.</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between px-4 py-3.5 min-h-[52px]">
                      <div className="flex items-center">
                        <Package className="w-5 h-5 text-gray-400 mr-4 flex-shrink-0" />
                        <span className="text-gray-500 text-[15px]">Package</span>
                      </div>
                      <span className="text-gray-900 font-medium text-[15px]" title={currentBooking.package_title}>
                        {condensedPackageTitle}
                      </span>
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
                      <span className="text-gray-900 font-medium text-[15px]">{pickupTimeDisplay}</span>
                    </div>
                    <div className="flex items-center justify-between px-4 py-3.5 min-h-[52px]">
                      <div className="flex items-center">
                        <Users className="w-5 h-5 text-gray-400 mr-4 flex-shrink-0" />
                        <span className="text-gray-500 text-[15px]">Guests</span>
                      </div>
                      <span className="text-gray-900 font-medium text-[15px]">
                        {currentBooking.guests} ({currentBooking.adults || 1} Ad, {currentBooking.children || 0} Ch)
                      </span>
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
                          step="0.01"
                          inputMode="decimal"
                          value={
                            editedBooking?.total_price !== undefined ? editedBooking.total_price.toString() : ""
                          }
                          onChange={(e) =>
                            setEditedBooking((prev) =>
                              prev
                                ? {
                                  ...prev,
                                  total_price:
                                    e.target.value === ""
                                      ? 0
                                      : Number.parseFloat(e.target.value.replace(/,/g, "")),
                                }
                                : null,
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
                          step="0.01"
                          inputMode="decimal"
                          value={
                            editedBooking?.amount_paid !== undefined ? editedBooking.amount_paid.toString() : ""
                          }
                          onChange={(e) =>
                            setEditedBooking((prev) =>
                              prev
                                ? {
                                  ...prev,
                                  amount_paid:
                                    e.target.value === ""
                                      ? 0
                                      : Number.parseFloat(e.target.value.replace(/,/g, "")),
                                }
                                : null,
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
                      <span className="text-gray-900 font-bold text-base tracking-tight">
                        {formatMad(currentBooking.total_price)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between px-4 py-3.5 min-h-[52px]">
                      <div className="flex items-center">
                        <CreditCard className="w-5 h-5 text-gray-400 mr-4 flex-shrink-0" />
                        <span className="text-gray-500 text-[15px]">Paid</span>
                      </div>
                      <span className="text-emerald-600 font-semibold text-[15px]">
                        {formatMad(currentBooking.amount_paid)}
                      </span>
                    </div>
                    {currentBooking.remaining_balance > 0 && (
                      <div className="flex items-center justify-between px-4 py-3.5 min-h-[52px] bg-amber-50">
                        <div className="flex items-center">
                          <AlertTriangle className="w-5 h-5 text-amber-500 mr-4 flex-shrink-0" />
                          <span className="text-amber-700 font-medium text-[15px]">Balance Due</span>
                        </div>
                        <span className="text-amber-700 font-bold text-[15px]">
                          {formatMad(currentBooking.remaining_balance)}
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
                <Button
                  variant="outline"
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                  className="flex-1 rounded-xl h-12 bg-white"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveChanges}
                  disabled={isSaving}
                  className="flex-1 rounded-xl h-12 bg-[#C19B76] hover:bg-[#A67C52] text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>

        {!isEditMode && (
          <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-gray-200 p-4 safe-area-inset-bottom">
            <div className="flex gap-3">
              <Button
                onClick={() => {
                  try {
                    const doc = new jsPDF()

                    // Header
                    doc.setFontSize(22)
                    doc.setFont("helvetica", "bold")
                    doc.text("MARRAGAFAY", 105, 20, { align: "center" })

                    doc.setFontSize(16)
                    doc.setFont("helvetica", "normal")
                    doc.text("Booking Voucher", 105, 30, { align: "center" })

                    // Booking Reference
                    doc.setFontSize(10)
                    doc.setTextColor(100)
                    const ref = currentBooking.id ? currentBooking.id.substring(0, 8).toUpperCase() : "REF-PENDING"
                    doc.text(`Ref: ${ref}`, 105, 40, { align: "center" })

                    // Client Info
                    doc.setFontSize(12)
                    doc.setTextColor(0)
                    doc.text("Client Details", 14, 55)
                    doc.setFontSize(10)
                    doc.text(`Name: ${currentBooking.name || "N/A"}`, 14, 62)
                    doc.text(`Phone: ${currentBooking.phone_number || "N/A"}`, 14, 67)
                    doc.text(`Email: ${currentBooking.email || "N/A"}`, 14, 72)

                    // Trip Details
                    doc.setFontSize(12)
                    doc.text("Trip Details", 14, 85)

                    autoTable(doc, {
                      startY: 90,
                      head: [['Item', 'Details']],
                      body: [
                        ['Package', currentBooking.package_title || "N/A"],
                        ['Date', currentBooking.date ? new Date(currentBooking.date).toLocaleDateString() : "N/A"],
                        ['Guests', `${currentBooking.guests || 1} People`],
                        ['Pickup', currentBooking.pickup_location || 'Not set'],
                        ['Time', currentBooking.pickup_time || 'Pending'],
                        ['Driver', currentBooking.driver_name || 'Pending Assignment'],
                      ],
                      theme: 'grid',
                      headStyles: { fillColor: [193, 155, 118] }, // #C19B76
                    })

                    // Financials
                    const finalY = (doc as any).lastAutoTable.finalY + 10
                    doc.setFontSize(12)
                    doc.text("Financial Status", 14, finalY)

                    autoTable(doc, {
                      startY: finalY + 5,
                      head: [['Description', 'Amount']],
                      body: [
                        ['Total Price', `MAD ${currentBooking.total_price || 0}`],
                        ['Amount Paid', `MAD ${currentBooking.amount_paid || 0}`],
                        ['Remaining Balance', `MAD ${currentBooking.remaining_balance || 0}`],
                        ['Status', (currentBooking.payment_status || "unpaid").toUpperCase()],
                      ],
                      theme: 'striped',
                      headStyles: { fillColor: [60, 60, 60] },
                    })

                    // Footer
                    const pageHeight = doc.internal.pageSize.height
                    doc.setFontSize(8)
                    doc.setTextColor(128)
                    doc.text("Please present this voucher to your driver.", 105, pageHeight - 20, { align: "center" })
                    doc.text("Need help? Contact +212 600 000 000", 105, pageHeight - 15, { align: "center" })

                    const safeName = (currentBooking.name || "client").replace(/[^a-z0-9]/gi, '_').toLowerCase()
                    doc.save(`Marragafay-Ticket-${safeName}.pdf`)

                    toast.success("Voucher Downloaded", {
                      description: "Your booking voucher has been generated successfully.",
                    })
                  } catch (error) {
                    console.error("PDF Generation Error:", error)
                    toast.error("Could not generate PDF voucher. Please try again.")
                  }
                }}
                variant="outline"
                className="flex-1 rounded-xl h-14 bg-white border-gray-200 text-gray-900 font-medium text-[15px] hover:bg-gray-50"
              >
                <FileText className="w-5 h-5 mr-2" />
                Voucher
              </Button>
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
                className="w-14 rounded-xl h-14 bg-white border-gray-200 text-gray-900 font-medium text-[15px] hover:bg-gray-50 flex items-center justify-center p-0"
              >
                <Phone className="w-5 h-5" />
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
