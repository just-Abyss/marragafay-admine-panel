import { supabase } from "@/lib/supabase"
import { BookingsView } from "@/components/bookings/bookings-view"
import type { Booking } from "@/lib/types"

export const dynamic = 'force-dynamic'

export default async function BookingsPage() {
  const { data: bookingsData, error } = await supabase
    .from('bookings')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching bookings:', error)
  }

  const bookings: Booking[] = (bookingsData || []).map((row: any) => ({
    id: row.id.toString(),
    customer_name: row.customer?.name || 'Unknown',
    email: row.customer?.email || '',
    phone: row.customer?.phone || '',
    package_title: row.package || 'Unknown Package',
    status: (row.status?.toLowerCase() as any) || 'pending',
    date: row.booking_date || new Date().toISOString().split('T')[0],
    guests: row.guests || 1,
    total_price: row.amount || 0,
    payment_status: row.payment_status || 'unpaid',
    amount_paid: row.amount_paid || 0,
    remaining_balance: row.remaining_balance || 0,
    created_at: row.created_at,
    notes: row.notes,
    driver_id: row.driver_id,
    driver_name: row.driver_name,
    pickup_time: row.pickup_time,
    pickup_location: row.pickup_location,
    activity_type: row.activity_type,
  }))

  return <BookingsView initialBookings={bookings} />
}
