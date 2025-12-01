"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { GlassCard } from "@/components/ui/glass-card"
import { PaymentBadge } from "@/components/ui/payment-badge"
import type { ScheduleItem } from "@/lib/types"
import { Clock, Users, Phone, MapPin, Car, AlertTriangle, MessageCircle, Banknote } from "lucide-react"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface ScheduleWidgetProps {
  schedule: ScheduleItem[]
}

export function ScheduleWidget({ schedule }: ScheduleWidgetProps) {
  const [selectedItem, setSelectedItem] = useState<ScheduleItem | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const handleItemClick = (item: ScheduleItem) => {
    setSelectedItem(item)
    setDrawerOpen(true)
  }

  const handleWhatsApp = (phone: string, name: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, "")
    const message = encodeURIComponent(`Hello ${name}, this is Marragafay. We'll be picking you up soon!`)
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, "_blank")
  }

  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`, "_blank")
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <>
      <GlassCard
        variant="solid"
        className="animate-slide-up"
        style={{ animationDelay: "300ms" } as React.CSSProperties}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-lg">Today&apos;s Schedule</h3>
          <span className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
          </span>
        </div>

        <div className="space-y-3">
          {schedule.map((item) => (
            <div
              key={item.id}
              onClick={() => handleItemClick(item)}
              className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100 hover:border-slate-200 transition-all cursor-pointer min-h-[68px]"
            >
              <div className="flex-shrink-0 w-16 text-center">
                <div className="text-lg font-semibold text-[#C19B76]">{item.time}</div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{item.customer_name}</p>
                <p className="text-sm text-muted-foreground truncate">{item.package_title}</p>
              </div>
              <div className="flex items-center gap-2">
                {item.payment_status && <PaymentBadge status={item.payment_status} size="sm" />}
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span className="text-sm">{item.guests}</span>
                </div>
              </div>
            </div>
          ))}

          {schedule.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No trips scheduled for today</p>
            </div>
          )}
        </div>
      </GlassCard>

      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent
          side={isMobile ? "bottom" : "right"}
          className={`
            ${isMobile ? "h-[90vh] rounded-t-3xl" : "w-full sm:max-w-md"}
            bg-gray-50 border-0 overflow-hidden flex flex-col p-0
          `}
        >
          {/* iOS-style drag handle on mobile */}
          {isMobile && (
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-gray-300" />
            </div>
          )}

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto pb-32">
            {selectedItem && (
              <>
                <div className="bg-white px-5 pt-4 pb-5">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-16 h-16 border-2 border-white shadow-lg">
                      <AvatarFallback className="bg-[#C19B76] text-white text-xl font-semibold">
                        {getInitials(selectedItem.customer_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-3xl font-bold text-gray-900">{selectedItem.time}</span>
                      </div>
                      <h2 className="text-xl font-semibold text-gray-900">{selectedItem.customer_name}</h2>
                      <p className="text-gray-500 text-sm mt-0.5">{selectedItem.package_title}</p>
                    </div>
                  </div>
                </div>

                <div className="px-5 py-4 space-y-4">
                  {/* Payment Status */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider px-1">Payment Status</h4>
                    <div
                      className={`rounded-2xl shadow-sm p-4 ${
                        selectedItem.payment_status === "paid"
                          ? "bg-emerald-50 border border-emerald-200"
                          : selectedItem.payment_status === "deposit"
                            ? "bg-amber-50 border border-amber-200"
                            : "bg-red-50 border border-red-200"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Banknote
                          className={`w-5 h-5 ${
                            selectedItem.payment_status === "paid"
                              ? "text-emerald-600"
                              : selectedItem.payment_status === "deposit"
                                ? "text-amber-600"
                                : "text-red-600"
                          }`}
                        />
                        <span
                          className={`font-semibold ${
                            selectedItem.payment_status === "paid"
                              ? "text-emerald-700"
                              : selectedItem.payment_status === "deposit"
                                ? "text-amber-700"
                                : "text-red-700"
                          }`}
                        >
                          {selectedItem.payment_status === "paid"
                            ? "Fully Paid"
                            : selectedItem.payment_status === "deposit"
                              ? "Deposit Received - Collect Balance"
                              : "Unpaid - Collect on Arrival"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider px-1">Itinerary</h4>
                    <div className="bg-white rounded-2xl shadow-sm divide-y divide-gray-100 overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-3.5 min-h-[52px]">
                        <div className="flex items-center">
                          <Car className="w-5 h-5 text-gray-400 mr-4 flex-shrink-0" />
                          <span className="text-gray-500 text-[15px]">Driver</span>
                        </div>
                        <span
                          className={`font-medium text-[15px] ${selectedItem.driver_name ? "text-gray-900" : "text-amber-600"}`}
                        >
                          {selectedItem.driver_name || "Not assigned"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between px-4 py-3.5 min-h-[52px]">
                        <div className="flex items-center">
                          <MapPin className="w-5 h-5 text-gray-400 mr-4 flex-shrink-0" />
                          <span className="text-gray-500 text-[15px]">Pickup Location</span>
                        </div>
                        <span className="text-gray-900 font-medium text-[15px]">
                          {selectedItem.pickup_location || "Not specified"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between px-4 py-3.5 min-h-[52px]">
                        <div className="flex items-center">
                          <Phone className="w-5 h-5 text-gray-400 mr-4 flex-shrink-0" />
                          <span className="text-gray-500 text-[15px]">Client Phone</span>
                        </div>
                        <span className="text-gray-900 font-medium text-[15px]">
                          {selectedItem.customer_phone || "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between px-4 py-3.5 min-h-[52px]">
                        <div className="flex items-center">
                          <Users className="w-5 h-5 text-gray-400 mr-4 flex-shrink-0" />
                          <span className="text-gray-500 text-[15px]">Guests</span>
                        </div>
                        <span className="text-gray-900 font-medium text-[15px]">{selectedItem.guests} people</span>
                      </div>
                    </div>
                  </div>

                  {selectedItem.special_notes && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider px-1">Client Notes</h4>
                      <div className="bg-amber-50 rounded-2xl shadow-sm border border-amber-200 p-4">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                          <p className="text-amber-900 text-[15px]">{selectedItem.special_notes}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {selectedItem && (
            <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-gray-200 p-4 safe-area-inset-bottom">
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    if (selectedItem.customer_phone) {
                      handleWhatsApp(selectedItem.customer_phone, selectedItem.customer_name)
                    }
                  }}
                  className="flex-1 rounded-xl h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-[15px]"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  WhatsApp
                </Button>
                <Button
                  onClick={() => {
                    if (selectedItem.customer_phone) {
                      handleCall(selectedItem.customer_phone)
                    }
                  }}
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
    </>
  )
}
