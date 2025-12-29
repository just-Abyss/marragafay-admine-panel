'use server'

import { Resend } from 'resend'

import { render } from '@react-email/render' // Trying render first, assuming v2 handles it
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
  console.log("DEBUG: SERVER ACTION STARTED - sendBookingEmail")

  // 1. TIMEOUT PROTECTION (5 seconds limit)
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Email process TIMEOUT")), 5000)
  )

  const emailProcess = async () => {
    console.log("DEBUG: Checking API Key:", process.env.RESEND_API_KEY ? "EXISTS" : "MISSING")

    // 2. Connectivity Check (Simple Text Email)
    console.log("DEBUG: Sending Connectivity Check Email (Fire & Forget)...")
    await resend.emails.send({
      from: 'Marragafay Bookings <onboarding@resend.dev>',
      to: ['marragafay@gmail.com'],
      subject: 'Debug: Server Action Started',
      text: 'The server action has successfully reached the email provider.'
    })

    // 3. Render Attempt with Logging
    let htmlContent = ""
    try {
      console.log("DEBUG: Attempting to RENDER template...")
      // In v2, render might be async or sync. We await it just in case it returns a promise.
      htmlContent = await render(
        BookingNotificationEmail({
          name: booking.name,
          phone_number: booking.phone_number,
          package_title: booking.package_title,
          date: booking.date,
          guests: booking.guests ?? 1,
          adults: booking.adults ?? 1,
          children: booking.children ?? 0,
          total_price: booking.total_price ?? 0,
          status: booking.status ?? 'Pending',
          notes: booking.notes
        })
      )
      console.log("DEBUG: RENDER COMPLETE. HTML Length:", htmlContent.length)
    } catch (renderError) {
      console.error("DEBUG: RENDER FAILED / CRASHED:", renderError)
      throw renderError // Let fallback handle it
    }

    // 4. Send Email
    console.log("DEBUG: Sending to Resend API...")
    const { data, error } = await resend.emails.send({
      from: 'Marragafay Bookings <onboarding@resend.dev>',
      to: ['marragafay@gmail.com'],
      subject: `New Booking: ${booking.name} - ${booking.package_title}`,
      html: htmlContent
    })

    if (error) {
      console.error("DEBUG: Resend API responded with ERROR:", error)
      throw error
    }

    console.log("DEBUG: Resend SUCCESS:", data)
    return { success: true, data }
  }

  // Execute with race
  try {
    return await Promise.race([emailProcess(), timeoutPromise]) as any
  } catch (err) {
    console.error("DEBUG: Email System CRITICAL FAILURE (Timeout or Crash):", err)

    // ABSOLUTE FALLBACK on Crash/Timeout
    console.log("DEBUG: Attempting ABSOLUTE FALLBACK (Simple HTML)...")
    try {
      const { data } = await resend.emails.send({
        from: 'Marragafay Bookings <onboarding@resend.dev>',
        to: ['marragafay@gmail.com'],
        subject: `New Booking (FALLBACK): ${booking.name}`,
        html: `<p>System crashed while sending fancy email.</p><p>Booking: ${JSON.stringify(booking)}</p>`
      })
      console.log("DEBUG: Absolute Fallback Sent:", data)
      return { success: true, data, note: "Fallback sent" }
    } catch (fallbackErr) {
      console.error("DEBUG: Even fallback failed:", fallbackErr)
      return { success: false, error: fallbackErr }
    }
  }
}
