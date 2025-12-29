import { BookingNotificationEmail } from '@/emails/new-booking-email'
import { Resend } from 'resend'
import { NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const booking = await request.json()

    // Basic validation to ensure we have enough info
    if (!booking.name || !booking.package_title) {
      return NextResponse.json(
        { error: 'Missing required booking fields (name, package_title)' },
        { status: 400 }
      )
    }

    // 1. Try sending with React Email Template
    try {
      const { data, error } = await resend.emails.send({
        from: 'Marragafay Bookings <onboarding@resend.dev>',
        to: ['marragafay@gmail.com'],
        subject: `New Public Booking: ${booking.name} - ${booking.package_title}`,
        react: BookingNotificationEmail({
          name: booking.name,
          phone_number: booking.phone_number,
          package_title: booking.package_title,
          date: booking.date,
          guests: booking.guests ?? 1,
          adults: booking.adults ?? booking.guests ?? 1,
          children: booking.children ?? 0,
          total_price: booking.total_price ?? 0,
          status: booking.status ?? 'pending',
          notes: booking.notes
        })
      })

      if (error) {
        console.error('React Email API Error:', error)
        throw error // Throw to trigger fallback
      }

      return NextResponse.json({ success: true, data })
    } catch (reactError) {
      console.error('Failed to send React email (API), using fallback...', reactError)

      // 2. Fallback to basic HTML
      const { data, error } = await resend.emails.send({
        from: 'Marragafay Bookings <onboarding@resend.dev>',
        to: ['marragafay@gmail.com'],
        subject: `New Public Booking: ${booking.name} - ${booking.package_title} (Fallback)`,
        html: `
          <h1>New Public Booking</h1>
          <p><strong>Customer:</strong> ${booking.name}</p>
          <p><strong>Phone:</strong> ${booking.phone_number}</p>
          <p><strong>Package:</strong> ${booking.package_title}</p>
          <p><strong>Total Price:</strong> ${booking.total_price} MAD</p>
           <p style="color: red; font-size: 12px;">Note: The fancy email template failed to render.</p>
        `
      })

      if (error) {
        console.error('Fallback email also failed:', error)
        return NextResponse.json({ error }, { status: 500 })
      }
      return NextResponse.json({ success: true, data })
    }
  } catch (error) {
    console.error('Email API Exception:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
