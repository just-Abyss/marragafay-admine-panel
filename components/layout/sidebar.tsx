"use client"

import { useState } from "react" // This line is actually being removed in the chunk below, wait.
// I need to be careful. The previous tool call removed `const [collapsed, setCollapsed] = useState(false)`.
// But the import `  import { useState } from "react"` is still there at line 3.

// Let's just remove the import and fix the type.
// just nothing .................

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import {
  LayoutDashboard,
  Calendar,
  Package,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Compass,
  Bike,
  FileText,
  Star,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Command Center" },
  { href: "/dashboard/bookings", icon: Calendar, label: "Bookings" },
  { href: "/dashboard/packages", icon: Package, label: "Packages" },
  { href: "/dashboard/activities", icon: Bike, label: "Activities" },
  { href: "/dashboard/blog", icon: FileText, label: "Blog" },
  { href: "/dashboard/testimonials", icon: Star, label: "Testimonials" },
  { href: "/dashboard/settings", icon: Settings, label: "Settings" },
]

interface SidebarProps {
  collapsed: boolean
  setCollapsed: (collapsed: boolean) => void
}

export function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
  // const [collapsed, setCollapsed] = useState(false) // Removed local state
  const pathname = usePathname()
  const { user, logout } = useAuth()

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        onClick={() => collapsed && setCollapsed(false)}
        className={cn(
          "hidden lg:flex flex-col h-screen fixed left-0 top-0 z-40",
          "glass border-r border-white/10",
          "transition-all duration-300 ease-in-out",
          collapsed ? "w-20 cursor-pointer" : "w-72",
        )}
      >
        {/* Logo */}
        <div
          className={cn(
            "flex items-center h-16 px-4 border-b border-white/10",
            collapsed ? "justify-center" : "justify-between",
          )}
        >
          {!collapsed && (
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#C19B76] flex items-center justify-center">
                <Compass className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-lg tracking-tight">Marragafay</span>
            </Link>
          )}
          {collapsed && (
            <div className="w-10 h-10 rounded-2xl bg-[#C19B76] flex items-center justify-center">
              <Compass className="w-5 h-5 text-white" />
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")

            return collapsed ? (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center justify-center w-full h-12 rounded-2xl",
                      "transition-all duration-200",
                      isActive
                        ? "bg-[#C19B76] text-white shadow-lg shadow-[#C19B76]/20"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={10}>
                  {item.label}
                </TooltipContent>
              </Tooltip>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-2xl",
                  "transition-all duration-200",
                  isActive
                    ? "bg-[#C19B76] text-white shadow-lg shadow-[#C19B76]/20"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* User section */}
        <div className={cn("p-4 border-t border-white/10", collapsed ? "flex flex-col items-center gap-2" : "")}>
          {collapsed ? (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Avatar className="w-10 h-10 cursor-pointer">
                    <AvatarImage src={user?.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="bg-[#C19B76] text-white">{user?.name?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent side="right">{user?.name}</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={logout}
                    className="rounded-xl text-muted-foreground hover:text-destructive h-11 w-11"
                  >
                    <LogOut className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Sign out</TooltipContent>
              </Tooltip>
            </>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={user?.avatar || "/placeholder.svg"} />
                  <AvatarFallback className="bg-[#C19B76] text-white">{user?.name?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{user?.name}</span>
                  <span className="text-xs text-muted-foreground capitalize">{user?.role}</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={logout}
                className="rounded-xl text-muted-foreground hover:text-destructive h-11 w-11"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          )}
        </div>

        {/* Collapse toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation()
            setCollapsed(!collapsed)
          }}
          className={cn(
            "absolute -right-3 top-20 w-6 h-6 rounded-full",
            "bg-background border border-border shadow-md",
            "hover:bg-secondary",
          )}
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </Button>
      </aside>
    </TooltipProvider>
  )
}
