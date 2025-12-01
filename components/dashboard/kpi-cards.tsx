"use client"

import type React from "react"

import { GlassCard } from "@/components/ui/glass-card"
import type { DashboardStats } from "@/lib/types"
import { TrendingUp, TrendingDown, Banknote, Calendar, MessageSquare, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface KPICardsProps {
  stats: DashboardStats
}

export function KPICards({ stats }: KPICardsProps) {
  const cards = [
    {
      title: "Cash Collected",
      value: `${stats.cash_collected.toLocaleString()} MAD`,
      change: stats.revenue_change,
      icon: Banknote,
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
      subtitle: "Real money in hand",
    },
    {
      title: "Pending Balance",
      value: `${stats.pending_balance.toLocaleString()} MAD`,
      change: null,
      icon: Clock,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      subtitle: "To collect on arrival",
    },
    {
      title: "Active Bookings",
      value: stats.active_bookings.toString(),
      change: stats.bookings_change,
      icon: Calendar,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      subtitle: "This month",
    },
    {
      title: "Pending Inquiries",
      value: stats.pending_inquiries.toString(),
      change: stats.inquiries_change,
      icon: MessageSquare,
      iconBg: "bg-slate-100",
      iconColor: "text-slate-600",
      subtitle: "Awaiting response",
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
      {cards.map((card, i) => (
        <GlassCard
          key={card.title}
          variant="solid"
          hover
          className="animate-slide-up"
          style={{ animationDelay: `${i * 100}ms` } as React.CSSProperties}
        >
          <div className="flex flex-col h-full">
            <div className="flex items-start justify-between mb-3">
              <div className={cn("p-2.5 rounded-xl", card.iconBg)}>
                <card.icon className={cn("w-5 h-5", card.iconColor)} />
              </div>
              {card.change !== null && (
                <div className="flex items-center gap-1">
                  {card.change >= 0 ? (
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5 text-red-500" />
                  )}
                  <span className={cn("text-xs font-medium", card.change >= 0 ? "text-emerald-500" : "text-red-500")}>
                    {card.change >= 0 ? "+" : ""}
                    {card.change}%
                  </span>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground font-medium mb-1">{card.title}</p>
            <p className="text-xl lg:text-2xl font-semibold tracking-tight">{card.value}</p>
            <p className="text-[10px] text-muted-foreground mt-1">{card.subtitle}</p>
          </div>
        </GlassCard>
      ))}
    </div>
  )
}
