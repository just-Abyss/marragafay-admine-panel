import { useState, type ReactNode } from "react"
import { Sidebar } from "./sidebar"
import { BottomNav } from "./bottom-nav"
import { BookingRealtimeListener } from "@/components/dashboard/booking-realtime-listener"
import { cn } from "@/lib/utils"

interface DashboardLayoutProps {
  children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      {/* Global Realtime Listener for Bookings */}
      <BookingRealtimeListener />

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

