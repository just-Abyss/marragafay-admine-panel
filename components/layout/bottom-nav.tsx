"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Calendar, Package, Settings, MoreHorizontal } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Bike, FileText } from "lucide-react"

const mainNavItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Home" },
  { href: "/dashboard/bookings", icon: Calendar, label: "Bookings" },
  { href: "/dashboard/packages", icon: Package, label: "Packages" },
]

const moreNavItems = [
  { href: "/dashboard/activities", icon: Bike, label: "Activities" },
  { href: "/dashboard/blog", icon: FileText, label: "Blog" },
  { href: "/dashboard/settings", icon: Settings, label: "Settings" },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 lg:hidden",
        "bg-white/90 backdrop-blur-lg border-t border-gray-200",
        "safe-area-inset-bottom",
      )}
    >
      <div className="flex items-center justify-around h-16 px-2">
        {mainNavItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 py-2 px-4 rounded-2xl",
                "transition-all duration-200 min-w-[64px] min-h-[48px]",
                isActive ? "text-[#C19B76]" : "text-muted-foreground",
              )}
            >
              <div className={cn("p-2 rounded-xl transition-all duration-200", isActive && "bg-[#C19B76]/10")}>
                <item.icon className={cn("w-5 h-5 transition-transform duration-200", isActive && "scale-110")} />
              </div>
              <span className={cn("text-[10px] font-medium", isActive && "font-semibold")}>{item.label}</span>
            </Link>
          )
        })}

        <Popover>
          <PopoverTrigger asChild>
            <button
              className={cn(
                "flex flex-col items-center justify-center gap-1 py-2 px-4 rounded-2xl",
                "transition-all duration-200 min-w-[64px] min-h-[48px] text-muted-foreground",
              )}
            >
              <div className="p-2 rounded-xl">
                <MoreHorizontal className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-medium">More</span>
            </button>
          </PopoverTrigger>
          <PopoverContent
            className="w-48 p-2 bg-white border border-gray-200 shadow-xl rounded-2xl"
            align="end"
            side="top"
          >
            {moreNavItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 rounded-xl transition-colors min-h-[48px]",
                    isActive ? "bg-[#C19B76]/10 text-[#C19B76]" : "hover:bg-gray-100",
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              )
            })}
          </PopoverContent>
        </Popover>
      </div>
    </nav>
  )
}
