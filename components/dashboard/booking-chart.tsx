import { useMemo } from "react"
import { GlassCard } from "@/components/ui/glass-card"
import type { Booking } from "@/lib/types"
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { startOfWeek, endOfWeek, eachDayOfInterval, format, isSameDay, parseISO } from "date-fns"

interface BookingChartProps {
  bookings: Booking[]
}

export function BookingChart({ bookings }: BookingChartProps) {
  const chartData = useMemo(() => {
    const today = new Date()
    const start = startOfWeek(today, { weekStartsOn: 1 }) // Monday
    const end = endOfWeek(today, { weekStartsOn: 1 }) // Sunday

    const days = eachDayOfInterval({ start, end })

    return days.map((day) => {
      const count = bookings.filter((booking) => {
        if (!booking.booking_date) return false
        // Handle both ISO string and YYYY-MM-DD format
        const bookingDate = typeof booking.booking_date === 'string'
          ? parseISO(booking.booking_date)
          : new Date(booking.booking_date)
        return isSameDay(bookingDate, day)
      }).length

      return {
        date: format(day, "EEE"), // Mon, Tue, etc.
        bookings: count,
        fullDate: format(day, "MMM d, yyyy"),
      }
    })
  }, [bookings])

  return (
    <GlassCard variant="solid" className="animate-slide-up" style={{ animationDelay: "400ms" } as React.CSSProperties}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-lg">Booking Trends</h3>
        <span className="text-sm text-muted-foreground">This Week</span>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="bookingGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#C19B76" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#C19B76" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} allowDecimals={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "16px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              }}
              labelStyle={{ color: "#64748b", marginBottom: "0.25rem" }}
              labelFormatter={(label, payload) => {
                if (payload && payload.length > 0) {
                  return payload[0].payload.fullDate
                }
                return label
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
