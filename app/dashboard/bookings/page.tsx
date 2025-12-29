import { supabase } from "@/lib/supabase"
import { BookingsView } from "@/components/bookings/bookings-view"
import type { Booking } from "@/lib/types"

export const dynamic = 'force-dynamic'

export default async function BookingsPage() {
  const { data: bookingsData, error } = await supabase
    .from('bookings')
    .select('id, name, email, phone_number, package_title, date, guests, adults, children, status, total_price, notes, driver, driver_id, driver_name, pickup_location, pickup_time, payment_status, deposit_amount, amount_paid, remaining_balance, activity_type, created_at')
    .order('date', { ascending: false })

  if (error) {
    console.error('Error fetching bookings:', error)
  }

  // Defensive Transformation Layer
  const bookings: Booking[] = (bookingsData || []).map((row: any) => {
    const adults = typeof row.adults === 'number' ? row.adults : 1
    const children = typeof row.children === 'number' ? row.children : 0
    const guests = typeof row.guests === 'number' ? row.guests : (adults + children)
    const totalPrice = Number(row.total_price) || 0
    const amountPaid = Number(row.amount_paid) || Number(row.deposit_amount) || 0

    return {
      id: row.id.toString(),
      name: row.name || 'Guest', // Fallback for name
      email: row.email || '',
      // CRITICAL: Force string conversion for phone_number which comes as number from DB
      phone_number: row.phone_number !== null && row.phone_number !== undefined ? String(row.phone_number) : '',
      package_title: row.package_title || 'Standard Package',
      status: (row.status?.toLowerCase() as any) || 'pending',
      date: row.date || new Date().toISOString().split('T')[0],
      guests: guests,
      adults: adults,
      children: children,
      total_price: totalPrice,
      payment_status: row.payment_status || 'unpaid',
      amount_paid: amountPaid,
      deposit_amount: amountPaid,
      remaining_balance: Number(row.remaining_balance) || (totalPrice - amountPaid),
      created_at: row.created_at || new Date().toISOString(),
      notes: row.notes || '',
      driver_id: row.driver_id || undefined,
      driver_name: row.driver_name || row.driver || undefined,
      driver: row.driver_name || row.driver || undefined,
      pickup_time: row.pickup_time || undefined,
      pickup_location: row.pickup_location || undefined,
      activity_type: row.activity_type || undefined,
    }
  })

  return <BookingsView initialBookings={bookings} />
}
