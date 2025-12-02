import { supabase } from "@/lib/supabase"
import { BookingsView } from "@/components/bookings/bookings-view"
import type { Booking } from "@/lib/types"

export const dynamic = 'force-dynamic'

export default async function BookingsPage() {
  const { data: bookingsData, error } = await supabase
    .from('bookings')
    .select('id, customer_name, customer_email, phone, package_title, booking_date, guests_count, status, total_price, driver, pickup_location, payment_status, deposit_amount')
    .order('booking_date', { ascending: false })

  if (error) {
    console.error('Error fetching bookings:', error)
  }

  const bookings: Booking[] = (bookingsData || []).map((row: any) => ({
    id: row.id.toString(),
    customer_name: row.customer_name || 'Unknown',
    email: row.customer_email || '',
    phone: row.phone || '',
    package_title: row.package_title || 'Unknown Package',
    status: (row.status?.toLowerCase() as any) || 'pending',
    date: row.booking_date || new Date().toISOString().split('T')[0],
    guests: row.guests_count || 1,
    total_price: row.total_price || 0,
    payment_status: row.payment_status || 'unpaid',
    amount_paid: row.deposit_amount || 0,
    deposit_amount: row.deposit_amount || 0,
    remaining_balance: (row.total_price || 0) - (row.deposit_amount || 0),
    created_at: new Date().toISOString(), // Default
    notes: '', // Notes are now separate, or we can fetch them if they exist
    driver_id: undefined,
    driver_name: row.driver,
    driver: row.driver,
    pickup_time: undefined,
    pickup_location: row.pickup_location,
    activity_type: undefined,
  }))

  return <BookingsView initialBookings={bookings} />
}
