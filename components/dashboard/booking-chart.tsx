"use client"

import type React from "react"

import { GlassCard } from "@/components/ui/glass-card"
import type { BookingTrend } from "@/lib/types"
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

interface BookingChartProps {
  data: BookingTrend[]
}

export function BookingChart({ data }: BookingChartProps) {
  return (
    <GlassCard variant="solid" className="animate-slide-up" style={{ animationDelay: "400ms" } as React.CSSProperties}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-lg">Booking Trends</h3>
        <span className="text-sm text-muted-foreground">This week</span>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="bookingGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#C19B76" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#C19B76" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "16px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              }}
              formatter={(value: number) => [`${value} bookings`, "Bookings"]}
            />
            <Area type="monotone" dataKey="bookings" stroke="#C19B76" strokeWidth={2} fill="url(#bookingGradient)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  )
}
