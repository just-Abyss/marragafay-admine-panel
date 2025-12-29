import { BookingNotificationEmail } from '@/emails/new-booking-email'
import { Resend } from 'resend'
import { render } from '@react-email/render' // In v2.0.0, render() is already async
import { NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  console.log("🔴 API ROUTE STARTED: /api/send-email")

  try {
    const booking = await request.json()
    console.log("🔴 Booking data received:", JSON.stringify(booking, null, 2))

    // Basic validation
    if (!booking.name || !booking.package_title) {
      console.error("❌ Validation failed: Missing required fields")
      return NextResponse.json(
        { error: 'Missing required booking fields (name, package_title)' },
        { status: 400 }
      )
    }

    // HARDCODED CONNECTIVITY TEST
    console.log("🔴 Running connectivity test...")
    try {
      const testResult = await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: 'imadaitlachger@gmail.com',
        subject: 'API TEST (from API route)',
        html: '<p>API Route Test</p>'
      })
      console.log("✅ Connectivity test passed:", testResult)
    } catch (testError) {
      console.error("❌ Connectivity test failed:", testError)
    }

    // Sanitize booking data
    console.log("🔴 Sanitizing payload...")
    const sanitizedBooking = {
      name: String(booking.name || 'Unknown'),
      phone_number: String(booking.phone_number || 'N/A'),
      package_title: String(booking.package_title || 'Unknown Package'),
      date: String(booking.date || new Date().toISOString()),
      guests: Number(booking.guests) || 1,
      adults: Number(booking.adults) || Number(booking.guests) || 1,
      children: Number(booking.children) || 0,
      total_price: Number(booking.total_price) || 0,
      status: String(booking.status || 'pending'),
      notes: booking.notes ? String(booking.notes) : undefined
    }

    // Try sending with React Email Template using renderAsync
    try {
      console.log("🔴 Rendering email template with render()...")
      const htmlContent = await render(
        BookingNotificationEmail({
          name: sanitizedBooking.name,
          phone_number: sanitizedBooking.phone_number,
          package_title: sanitizedBooking.package_title,
          date: sanitizedBooking.date,
          guests: sanitizedBooking.guests,
          adults: sanitizedBooking.adults,
          children: sanitizedBooking.children,
          total_price: sanitizedBooking.total_price,
          status: sanitizedBooking.status,
          notes: sanitizedBooking.notes
        })
      )
      console.log("✅ Template rendered successfully. Length:", htmlContent.length)

      console.log("🔴 Sending email to imadaitlachger@gmail.com...")
      const { data, error } = await resend.emails.send({
        from: 'Marragafay Bookings <onboarding@resend.dev>',
        to: ['imadaitlachger@gmail.com'], // Explicit admin email
        subject: `New Public Booking: ${sanitizedBooking.name} - ${sanitizedBooking.package_title}`,
        html: htmlContent
      })

      if (error) {
        console.error("❌ Resend API error:", error)
        throw error
      }

      console.log("✅ Email sent successfully. ID:", data?.id)
      return NextResponse.json({ success: true, data })

    } catch (reactError) {
      console.error("❌ React email failed, using fallback...", reactError)

      // Fallback to basic HTML
      console.log("🔴 Sending fallback HTML email...")
      const { data, error } = await resend.emails.send({
        from: 'Marragafay Bookings <onboarding@resend.dev>',
        to: ['imadaitlachger@gmail.com'],
        subject: `New Public Booking: ${sanitizedBooking.name} - ${sanitizedBooking.package_title} (Fallback)`,
        html: `
          <h1>New Public Booking</h1>
          <p><strong>Customer:</strong> ${sanitizedBooking.name}</p>
          <p><strong>Phone:</strong> ${sanitizedBooking.phone_number}</p>
          <p><strong>Package:</strong> ${sanitizedBooking.package_title}</p>
          <p><strong>Date:</strong> ${sanitizedBooking.date}</p>
          <p><strong>Guests:</strong> ${sanitizedBooking.guests}</p>
          <p><strong>Total Price:</strong> ${sanitizedBooking.total_price} MAD</p>
          ${sanitizedBooking.notes ? `<p><strong>Notes:</strong> ${sanitizedBooking.notes}</p>` : ''}
          <p style="color: red; font-size: 12px;">Note: The fancy email template failed to render.</p>
        `
      })

      if (error) {
        console.error("❌ Fallback email also failed:", error)
        return NextResponse.json({ error }, { status: 500 })
      }

      console.log("✅ Fallback email sent. ID:", data?.id)
      return NextResponse.json({ success: true, data })
    }
  } catch (error) {
    console.error("💥 API Route Exception:", error)
    return NextResponse.json({
      error: 'Internal Server Error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
