import { useState, type ReactNode, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "./sidebar"
import { BottomNav } from "./bottom-nav"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

interface DashboardLayoutProps {
  children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const channel = supabase
      .channel('booking-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
        },
        (payload) => {
          // Handle New Booking (INSERT)
          if (payload.eventType === 'INSERT') {
            const newBooking = payload.new as any

            // Play notification sound
            try {
              const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3')
              audio.volume = 0.5
              audio.play().catch(e => console.log('Audio play blocked', e))
            } catch (e) {
              console.log('Audio setup failed', e)
            }

            toast.success("New Booking Received! 🎉", {
              description: `${newBooking.customer_name} booked ${newBooking.package_title} for ${new Date(newBooking.date || newBooking.booking_date).toLocaleDateString()}`,
              action: {
                label: "View Details",
                onClick: () => router.push('/dashboard/bookings')
              },
              duration: 8000,
            })
          }
          // Handle Cancellation (UPDATE)
          else if (payload.eventType === 'UPDATE') {
            const newBooking = payload.new as any
            const oldBooking = payload.old as any

            // Only notify if status changed to cancelled
            if (newBooking.status === 'cancelled') {
              toast.error("Booking Cancelled ⚠️", {
                description: `Booking for ${newBooking.customer_name} has been cancelled.`,
                duration: 6000,
              })
            }
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [router])

  return (
    <div className="min-h-screen bg-background">
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      <main
        className={cn(
          "min-h-screen transition-all duration-300",
          sidebarCollapsed ? "lg:ml-20" : "lg:ml-72",
          "pb-20 lg:pb-0",
        )}
      >
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
