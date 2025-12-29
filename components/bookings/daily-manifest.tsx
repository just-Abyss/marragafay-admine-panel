"use client"

import { useState, useRef } from "react"
import type { Booking } from "@/lib/types"
import { format, parseISO, isSameDay } from "date-fns"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Printer, Calendar } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { StatusBadge } from "@/components/ui/status-badge"

interface DailyManifestProps {
    bookings: Booking[]
}

export function DailyManifest({ bookings }: DailyManifestProps) {
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0])
    const printRef = useRef<HTMLDivElement>(null)

    const handlePrint = () => {
        const printContent = printRef.current
        if (printContent) {
            const printWindow = window.open('', '_blank');
            if (printWindow) {
                // Get the HTML content of the table
                const tableHtml = printContent.innerHTML;

                printWindow.document.write(`
                <html>
                <head>
                    <title>Daily Manifest - ${selectedDate}</title>
                    <style>
                        body { font-family: sans-serif; padding: 20px; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background-color: #f2f2f2; font-weight: bold; }
                        .header { margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px; }
                        .header h1 { margin: 0; font-size: 24px; }
                        .header p { margin: 5px 0; color: #666; }
                        .status-badge { padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold; border: 1px solid #ccc; }
                        @media print {
                            .no-print { display: none; }
                            @page { size: landscape; }
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>Daily Manifest</h1>
                        <p>Date: ${format(parseISO(selectedDate), 'EEEE, MMMM d, yyyy')}</p>
                    </div>
                    ${tableHtml}
                    <script>
                        window.onload = function() { window.print(); window.close(); }
                    </script>
                </body>
                </html>
            `);
                printWindow.document.close();
            }
        }
    }

    const filteredBookings = bookings
        .filter(b => {
            const bookingDate = typeof b.date === 'string' ? parseISO(b.date) : new Date(b.date)
            return isSameDay(bookingDate, parseISO(selectedDate))
        })
        .sort((a, b) => {
            const timeA = a.pickup_time || "00:00"
            const timeB = b.pickup_time || "00:00"
            return timeA.localeCompare(timeB)
        })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex-wrap">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-gray-500" />
                        <span className="font-medium text-gray-700">Select Date:</span>
                    </div>
                    <Input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-auto rounded-xl border-gray-200"
                    />
                </div>
                <Button onClick={handlePrint} variant="outline" className="gap-2 rounded-xl">
                    <Printer className="w-4 h-4" />
                    Print Manifest
                </Button>
            </div>

            <GlassCard className="overflow-hidden">
                <div ref={printRef}>
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50/50">
                                <TableHead className="w-[100px] font-semibold">Time</TableHead>
                                <TableHead className="font-semibold">Client</TableHead>
                                <TableHead className="font-semibold">Pax</TableHead>
                                <TableHead className="font-semibold">Pickup Location</TableHead>
                                <TableHead className="font-semibold">Driver</TableHead>
                                <TableHead className="font-semibold">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredBookings.length > 0 ? (
                                filteredBookings.map((booking) => (
                                    <TableRow key={booking.id} className="hover:bg-gray-50/50">
                                        <TableCell className="font-medium">{booking.pickup_time || "TBA"}</TableCell>
                                        <TableCell>
                                            <div className="font-medium">{booking.name}</div>
                                            <div className="text-sm text-gray-500">{booking.phone_number}</div>
                                        </TableCell>
                                        <TableCell>{booking.guests}</TableCell>
                                        <TableCell>{booking.pickup_location || "Not set"}</TableCell>
                                        <TableCell>
                                            <span className={booking.driver_name ? "text-gray-900" : "text-amber-600 font-medium"}>
                                                {booking.driver_name || "Unassigned"}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <StatusBadge status={booking.status} />
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                                        No bookings found for this date.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </GlassCard>
        </div>
    )
}
