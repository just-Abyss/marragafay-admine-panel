'use server'

import { Resend } from 'resend'
import { render } from '@react-email/render' // In v2.0.0, render() is already async
import { BookingNotificationEmail } from '@/emails/new-booking-email'

const resend = new Resend(process.env.RESEND_API_KEY)

interface BookingEmailData {
  name: string
  phone_number: string
  package_title: string
  date: string
  guests: number
  adults: number
  children: number
  total_price: number
  status: string
  notes?: string
}

export async function sendBookingEmail(booking: BookingEmailData) {
  console.log("🔴 STEP 1: SERVER ACTION STARTED - sendBookingEmail")
  console.log("🔴 STEP 2: Booking data received:", JSON.stringify(booking, null, 2))

  try {
    // CRITICAL CONNECTIVITY TEST (Hardcoded as requested)
    console.log("🔴 STEP 3: Attempting HARDCODED connectivity test...")
    try {
      const testResult = await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: 'imadaitlachger@gmail.com',
        subject: 'API TEST',
        html: '<p>Test</p>'
      })
      console.log("✅ STEP 3 SUCCESS: Connectivity test passed:", testResult)
    } catch (testError) {
      console.error("❌ STEP 3 FAILED: Connectivity test failed:", testError)
      throw new Error("Resend API connectivity test failed")
    }

    // Check API Key
    console.log("🔴 STEP 4: Checking RESEND_API_KEY:", process.env.RESEND_API_KEY ? "EXISTS" : "❌ MISSING")
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not defined in environment variables")
    }

    // Sanitize booking data (convert all to strings/numbers as requested)
    console.log("🔴 STEP 5: Sanitizing payload...")
    const sanitizedBooking = {
      name: String(booking.name || 'Unknown'),
      phone_number: String(booking.phone_number || 'N/A'),
      package_title: String(booking.package_title || 'Unknown Package'),
      date: String(booking.date || new Date().toISOString()),
      guests: Number(booking.guests) || 1,
      adults: Number(booking.adults) || 1,
      children: Number(booking.children) || 0,
      total_price: Number(booking.total_price) || 0,
      status: String(booking.status || 'Pending'),
      notes: booking.notes ? String(booking.notes) : undefined
    }
    console.log("✅ STEP 5 SUCCESS: Payload sanitized:", sanitizedBooking)

    // Render Template with ASYNC method (render() returns Promise in v2.0.0)
    console.log("🔴 STEP 6: Calling render() for email template...")
    let htmlContent = ""
    try {
      htmlContent = await render(
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
      console.log("✅ STEP 6 SUCCESS: Template rendered. HTML Length:", htmlContent.length)
    } catch (renderError) {
      console.error("❌ STEP 6 FAILED: renderAsync crashed:", renderError)
      throw renderError
    }

    // Send Email to ADMIN (explicitly hardcoded as requested)
    console.log("🔴 STEP 7: Sending email to ADMIN (imadaitlachger@gmail.com)...")
    const { data, error } = await resend.emails.send({
      from: 'Marragafay Bookings <onboarding@resend.dev>',
      to: ['imadaitlachger@gmail.com'], // EXPLICIT admin email as requested
      subject: `New Booking: ${sanitizedBooking.name} - ${sanitizedBooking.package_title}`,
      html: htmlContent
    })

    if (error) {
      console.error("❌ STEP 7 FAILED: Resend API returned error:", error)
      throw error
    }

    console.log("✅ STEP 7 SUCCESS: Email sent successfully. Resend ID:", data?.id)
    console.log("✅ ALL STEPS COMPLETE - Email system working")
    return { success: true, data }

  } catch (err) {
    console.error("💥 CRITICAL FAILURE - Email process crashed:", err)
    console.error("Error details:", {
      message: err instanceof Error ? err.message : 'Unknown error',
      stack: err instanceof Error ? err.stack : undefined
    })

    // ABSOLUTE FALLBACK (Simple email without template)
    console.log("🔴 FALLBACK: Attempting to send simple HTML email...")
    try {
      const { data } = await resend.emails.send({
        from: 'Marragafay Bookings <onboarding@resend.dev>',
        to: ['imadaitlachger@gmail.com'],
        subject: `New Booking (FALLBACK): ${booking.name}`,
        html: `
          <h2>⚠️ Email System Fallback</h2>
          <p>The fancy template failed. Here's the raw booking data:</p>
          <pre>${JSON.stringify(booking, null, 2)}</pre>
          <p style="color: red;">Error: ${err instanceof Error ? err.message : 'Unknown error'}</p>
        `
      })
      console.log("✅ FALLBACK SUCCESS: Simple email sent. ID:", data?.id)
      return { success: true, data, note: "Fallback email sent" }
    } catch (fallbackErr) {
      console.error("💥 FALLBACK ALSO FAILED:", fallbackErr)
      return { success: false, error: fallbackErr }
    }
  }
}
