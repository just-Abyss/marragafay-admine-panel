"use client"
import { useState, useMemo } from "react"
import type { Booking } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { mockDrivers, mockResources, mockActivities, getAvailability } from "@/lib/mock-data"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Check, ChevronLeft, ChevronRight, Calendar, User, CreditCard, AlertCircle, MapPin } from "lucide-react"

import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useEffect } from "react"
import { sendBookingEmail } from "@/app/actions"

interface BookingWizardProps {
  open: boolean
  onClose: () => void
  onSave: (booking: Booking) => void
  existingBookings: Booking[]
}

const steps = [
  { id: 1, title: "Selection", icon: Calendar },
  { id: 2, title: "Client Info", icon: User },
  { id: 3, title: "Logistics", icon: MapPin },
  { id: 4, title: "Payment", icon: CreditCard },
]

export function BookingWizard({ open, onClose, onSave, existingBookings }: BookingWizardProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [pricingItems, setPricingItems] = useState<{ id: string; name: string; price: number; type: string }[]>([])
  const [drivers, setDrivers] = useState<{ id: string; name: string; vehicle: string; is_available: boolean }[]>([]) // ✅ Added drivers state

  const [formData, setFormData] = useState({
    // Step 1
    date: "",
    package_title: "",
    activity_type: "",
    guests: 1,
    pickup_time: "09:00",
    // Step 2
    name: "",
    email: "",
    phone_number: "",
    notes: "",
    // Step 3
    pickup_location: "",
    driver_id: "",
    driver_name: "",
    // Step 4
    payment_status: "unpaid" as "paid" | "deposit" | "unpaid",
    amount_paid: 0,
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: pricingData, error: pricingError } = await supabase
          .from('pricing')
          .select('id, name, price, type')
          .order('type', { ascending: false })
          .order('name', { ascending: true })

        if (pricingError) {
          console.error("Error fetching pricing:", pricingError)
        } else {
          setPricingItems(pricingData || [])
        }

        // ✅ Fetch Drivers
        const { data: driversData, error: driversError } = await supabase
          .from('drivers')
          .select('id, name, vehicle, is_available')
          .order('name')

        if (driversError) {
          console.error("Error fetching drivers:", driversError)
        } else {
          setDrivers(driversData || [])
        }

      } catch (err) {
        console.error("Unexpected error fetching data:", err)
      }
    }
    fetchData()
  }, [])

  // Calculate price based on selected package/activity
  // Calculate price based on selected package/activity
  const selectedItem = pricingItems.find(i => i.name === formData.package_title)
  const pricePerPerson = selectedItem?.price || 0
  const totalPrice = pricePerPerson * formData.guests
  const remainingBalance = totalPrice - formData.amount_paid

  // Calculate availability
  const availability = useMemo(() => {
    if (!formData.date || !formData.activity_type) return null
    return getAvailability(formData.date, formData.activity_type, existingBookings, mockResources, mockActivities)
  }, [formData.date, formData.activity_type, existingBookings])

  const hasEnoughCapacity = availability ? availability.available >= formData.guests : true

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.date && formData.package_title && formData.activity_type && hasEnoughCapacity
      case 2:
        return formData.name && formData.email && formData.phone_number
      case 3:
        return formData.pickup_location
      case 4:
        return true
      default:
        return false
    }
  }

  const handleNext = () => {
    if (currentStep < 4) setCurrentStep((s) => s + 1)
  }

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep((s) => s - 1)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const driver = drivers.find((d) => d.id === formData.driver_id) // ✅ Use real drivers
      const status = formData.payment_status === 'paid' ? 'confirmed' : 'pending'

      const { data, error } = await supabase
        .from('bookings')
        .insert({
          name: formData.name,
          email: formData.email,
          phone_number: formData.phone_number,
          package_title: formData.package_title,
          date: formData.date,
          guests: formData.guests,
          adults: formData.guests,          // ✅ Default adults = guests
          children: 0,                      // ✅ Default children = 0
          status: status,
          total_price: totalPrice,
          notes: formData.notes,
          driver: driver?.name || null,
          pickup_location: formData.pickup_location,
          payment_status: formData.payment_status,
          deposit_amount: formData.amount_paid,
        })
        .select()
        .single()

      if (error) throw error

      const newBooking: Booking = {
        id: data.id.toString(),
        name: formData.name,
        email: formData.email,
        phone_number: formData.phone_number,
        package_title: formData.package_title,
        status: status,
        date: formData.date,
        guests: formData.guests,
        adults: formData.guests,           // ✅ Added
        children: 0,                       // ✅ Added
        total_price: totalPrice,
        notes: formData.notes,
        payment_status: formData.payment_status,
        amount_paid: formData.amount_paid,
        deposit_amount: formData.amount_paid,
        remaining_balance: remainingBalance,
        driver_id: formData.driver_id,
        driver_name: driver?.name,
        driver: driver?.name,
        pickup_time: formData.pickup_time,
        pickup_location: formData.pickup_location,
        activity_type: formData.activity_type,
        created_at: data.created_at
      }

      onSave(newBooking)

      toast.success("Booking Created", {
        description: `New booking for ${formData.name} has been created successfully.`,
      })

      // Send Email Notification (Non-blocking)
      console.log("DEBUG: Triggering sendBookingEmail action...");
      sendBookingEmail({
        name: formData.name,
        phone_number: formData.phone_number,
        package_title: formData.package_title,
        date: formData.date,
        guests: formData.guests,
        adults: formData.guests,
        children: 0,
        total_price: totalPrice,
        status: status,
        notes: formData.notes
      }).then((res: any) => {
        if (!res.success) {
          console.error("Failed to send notification email (Server Action Result):", res.error)
        } else {
          console.log("Email sent successfully:", res.data)
        }
      }).catch((err) => {
        console.error("CRITICAL: Failed to invoke Server Action:", err)
      })

      // Reset form
      setFormData({
        date: "",
        package_title: "",                 // ✅ Empty default, no hardcoded title
        activity_type: "",                 // ✅ Empty default
        guests: 1,
        pickup_time: "09:00",
        name: "",
        email: "",
        phone_number: "",
        notes: "",
        pickup_location: "",
        payment_status: "unpaid",
        amount_paid: 0,
        driver_id: "",
        driver_name: "",
      })
      setCurrentStep(1)
      router.refresh()
      onClose()
    } catch (error) {
      console.error('Error creating booking:', error)
      toast.error("Failed to create booking. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setCurrentStep(1)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-white border border-gray-200 max-w-xl max-h-[90vh] overflow-hidden p-0 rounded-3xl">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl font-semibold">New Booking</DialogTitle>
        </DialogHeader>

        {/* Step Indicators */}
        <div className="px-6 pt-4">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300",
                    currentStep >= step.id
                      ? "bg-[#C19B76] text-white shadow-lg shadow-[#C19B76]/30"
                      : "bg-slate-100 text-muted-foreground",
                  )}
                >
                  {currentStep > step.id ? <Check className="w-5 h-5" /> : <step.icon className="w-5 h-5" />}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "w-12 lg:w-20 h-0.5 mx-2 transition-all duration-300",
                      currentStep > step.id ? "bg-[#C19B76]" : "bg-slate-200",
                    )}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 px-1">
            {steps.map((step) => (
              <span
                key={step.id}
                className={cn(
                  "text-[10px] lg:text-xs font-medium transition-colors",
                  currentStep >= step.id ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {step.title}
              </span>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="p-6 overflow-y-auto max-h-[50vh]">
          {/* Step 1: Date & Activity */}
          {currentStep === 1 && (
            <div className="space-y-5 animate-fade-in">
              <div className="space-y-2">
                <Label>Select Date *</Label>
                <Input
                  required
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                  className="rounded-xl border border-slate-200 bg-slate-50 h-12"
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>

              <div className="space-y-2">
                <Label>Package / Activity *</Label>
                <Select
                  value={formData.package_title}
                  onValueChange={(v) => {
                    const selected = pricingItems.find(p => p.name === v)

                    setFormData((prev) => ({
                      ...prev,
                      package_title: v,
                      // Assign a default activity type if needed
                      activity_type: selected?.type === 'activity' ? 'activity' : 'pack'
                    }))
                  }}
                >
                  <SelectTrigger className="rounded-xl border border-slate-200 bg-slate-50 h-12">
                    <SelectValue placeholder="Select package or activity" />
                  </SelectTrigger>
                  <SelectContent>
                    {pricingItems.filter(item => item.type === 'pack').length > 0 && (
                      <SelectGroup>
                        <SelectLabel>Packages</SelectLabel>
                        {pricingItems.filter(item => item.type === 'pack').map((pkg) => (
                          <SelectItem key={pkg.id} value={pkg.name}>
                            {pkg.name} - {pkg.price.toLocaleString()} MAD/person
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    )}
                    {pricingItems.filter(item => item.type === 'activity').length > 0 && (
                      <SelectGroup>
                        <SelectLabel>Activities</SelectLabel>
                        {pricingItems.filter(item => item.type === 'activity').map((act) => (
                          <SelectItem key={act.id} value={act.name}>
                            {act.name} - {act.price.toLocaleString()} MAD/person
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Number of Guests *</Label>
                  <Input
                    required
                    type="number"
                    min="1"
                    value={formData.guests}
                    onChange={(e) => setFormData((prev) => ({ ...prev, guests: Number.parseInt(e.target.value) || 1 }))}
                    className="rounded-xl border border-slate-200 bg-slate-50 h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Pickup Time *</Label>
                  <Input
                    type="time"
                    value={formData.pickup_time}
                    onChange={(e) => setFormData((prev) => ({ ...prev, pickup_time: e.target.value }))}
                    className="rounded-xl border border-slate-200 bg-slate-50 h-12"
                  />
                </div>
              </div>

              {/* Simplified Availability Display - Always Available for now */}
              {formData.date && formData.package_title && (
                <div className="p-4 rounded-2xl flex items-center gap-3 bg-emerald-50 border border-emerald-200">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <Check className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-emerald-800">Available</p>
                      <span className="text-sm text-emerald-600">Slots Open</span>
                    </div>
                    <div className="w-full h-2 bg-emerald-200 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full w-full" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Customer Details */}
          {currentStep === 2 && (
            <div className="space-y-5 animate-fade-in">
              <div className="space-y-2">
                <Label>Customer Name *</Label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter full name"
                  className="rounded-xl border border-slate-200 bg-slate-50 h-12"
                />
              </div>

              <div className="space-y-2">
                <Label>WhatsApp Number *</Label>
                <div className="flex gap-2">
                  <Select defaultValue="+212">
                    <SelectTrigger className="w-24 rounded-xl border border-slate-200 bg-slate-50 h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="+212">+212</SelectItem>
                      <SelectItem value="+33">+33</SelectItem>
                      <SelectItem value="+44">+44</SelectItem>
                      <SelectItem value="+1">+1</SelectItem>
                      <SelectItem value="+49">+49</SelectItem>
                      <SelectItem value="+34">+34</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    required
                    value={formData.phone_number}
                    onChange={(e) => setFormData((prev) => ({ ...prev, phone_number: e.target.value }))}
                    placeholder="6XX XXX XXX"
                    className="flex-1 rounded-xl border border-slate-200 bg-slate-50 h-12"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Email *</Label>
                <Input
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="email@example.com"
                  className="rounded-xl border border-slate-200 bg-slate-50 h-12"
                />
              </div>

              <div className="space-y-2">
                <Label>Special Notes</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                  placeholder="Dietary requirements, special requests, etc."
                  className="rounded-xl border border-slate-200 bg-slate-50 min-h-[80px]"
                />
              </div>
            </div>
          )}

          {/* Step 3: Logistics */}
          {currentStep === 3 && (
            <div className="space-y-5 animate-fade-in">
              <div className="space-y-2">
                <Label>Pickup Location *</Label>
                <Select
                  value={formData.pickup_location}
                  onValueChange={(v) => setFormData((prev) => ({ ...prev, pickup_location: v }))}
                >
                  <SelectTrigger className="rounded-xl border border-slate-200 bg-slate-50 h-12">
                    <SelectValue placeholder="Select pickup area" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Gueliz">Gueliz</SelectItem>
                    <SelectItem value="Medina">Medina</SelectItem>
                    <SelectItem value="Hivernage">Hivernage</SelectItem>
                    <SelectItem value="Palmeraie">Palmeraie</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label>Assign Driver (Optional)</Label>
                <div className="space-y-2">
                  {drivers.map((driver) => (    // ✅ Use real drivers
                    <div
                      key={driver.id}
                      onClick={() => {
                        if (driver.is_available) {
                          setFormData((prev) => ({
                            ...prev,
                            driver_id: prev.driver_id === driver.id ? "" : driver.id,
                          }))
                        }
                      }}
                      className={cn(
                        "p-4 rounded-2xl border transition-all cursor-pointer",
                        !driver.is_available && "opacity-50 cursor-not-allowed",
                        formData.driver_id === driver.id
                          ? "border-[#C19B76] bg-[#C19B76]/5"
                          : "border-slate-200 bg-slate-50 hover:border-slate-300",
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-semibold">
                            {driver.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium">{driver.name}</p>
                            <p className="text-xs text-muted-foreground">{driver.vehicle}</p>
                          </div>
                        </div>
                        {formData.driver_id === driver.id && <Check className="w-5 h-5 text-[#C19B76]" />}
                        {!driver.is_available && <span className="text-xs text-red-500">Unavailable</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Payment */}
          {currentStep === 4 && (
            <div className="space-y-5 animate-fade-in">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Package</span>
                  <span className="font-medium">{formData.package_title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Guests</span>
                  <span className="font-medium">{formData.guests}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price per person</span>
                  <span className="font-medium">{pricePerPerson.toLocaleString()} MAD</span>
                </div>
                <div className="border-t border-slate-200 pt-2 mt-2">
                  <div className="flex justify-between text-lg">
                    <span className="font-semibold">Total Amount</span>
                    <span className="font-bold text-[#C19B76]">{totalPrice.toLocaleString()} MAD</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Payment Status *</Label>
                <RadioGroup
                  value={formData.payment_status}
                  onValueChange={(v: "paid" | "deposit" | "unpaid") => {
                    setFormData((prev) => ({
                      ...prev,
                      payment_status: v,
                      amount_paid: v === "paid" ? totalPrice : v === "unpaid" ? 0 : prev.amount_paid,
                    }))
                  }}
                  className="grid grid-cols-3 gap-3"
                >
                  <div>
                    <RadioGroupItem value="paid" id="paid" className="peer sr-only" />
                    <Label
                      htmlFor="paid"
                      className={cn(
                        "flex flex-col items-center justify-center p-4 rounded-2xl border-2 cursor-pointer transition-all",
                        formData.payment_status === "paid"
                          ? "border-emerald-500 bg-emerald-50"
                          : "border-slate-200 hover:border-emerald-200",
                      )}
                    >
                      <span className="text-emerald-600 font-semibold">Full Payment</span>
                      <span className="text-xs text-muted-foreground mt-1">100% paid</span>
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="deposit" id="deposit" className="peer sr-only" />
                    <Label
                      htmlFor="deposit"
                      className={cn(
                        "flex flex-col items-center justify-center p-4 rounded-2xl border-2 cursor-pointer transition-all",
                        formData.payment_status === "deposit"
                          ? "border-amber-500 bg-amber-50"
                          : "border-slate-200 hover:border-amber-200",
                      )}
                    >
                      <span className="text-amber-600 font-semibold">Deposit</span>
                      <span className="text-xs text-muted-foreground mt-1">Partial payment</span>
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="unpaid" id="unpaid" className="peer sr-only" />
                    <Label
                      htmlFor="unpaid"
                      className={cn(
                        "flex flex-col items-center justify-center p-4 rounded-2xl border-2 cursor-pointer transition-all",
                        formData.payment_status === "unpaid"
                          ? "border-red-500 bg-red-50"
                          : "border-slate-200 hover:border-red-200",
                      )}
                    >
                      <span className="text-red-600 font-semibold">Unpaid</span>
                      <span className="text-xs text-muted-foreground mt-1">Pay on arrival</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {formData.payment_status === "deposit" && (
                <div className="space-y-2 animate-fade-in">
                  <Label>Deposit Paid (MAD)</Label>
                  <Input
                    type="number"
                    min="0"
                    max={totalPrice}
                    value={formData.amount_paid}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, amount_paid: Number.parseInt(e.target.value) || 0 }))
                    }
                    className="rounded-xl border border-slate-200 bg-slate-50 h-12"
                  />
                  <p className="text-sm text-muted-foreground">
                    Remaining Balance:{" "}
                    <span className="font-semibold text-amber-600">{remainingBalance.toLocaleString()} MAD</span>
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer with navigation */}
        <div className="p-6 pt-0 flex gap-3">
          {currentStep > 1 && (
            <Button variant="outline" onClick={handleBack} className="rounded-xl h-12 px-6 bg-white border-slate-200">
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}
          {currentStep < 4 ? (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex-1 rounded-xl h-12 bg-[#C19B76] hover:bg-[#A67C52] disabled:opacity-50"
            >
              Continue
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} className="flex-1 rounded-xl h-12 bg-[#C19B76] hover:bg-[#A67C52]">
              Create Booking
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
