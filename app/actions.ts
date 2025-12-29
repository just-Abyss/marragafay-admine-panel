'use server'

import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface BookingEmailData {
  name: string
  phone_number: string
  package_title: string
  date: string
  guests: number
  total_price: number
  status?: string
  notes?: string
}

export async function sendBookingEmail(booking: BookingEmailData) {
  console.log("=== EMAIL ACTION STARTED ===")
  console.log("Received booking:", JSON.stringify(booking, null, 2))

  try {
    // Sanitize all data to strings/numbers
    const name = String(booking.name || 'Unknown')
    const phone = String(booking.phone_number || 'N/A')
    const phoneClean = phone.replace(/[^0-9]/g, '')
    const packageTitle = String(booking.package_title || 'Unknown Package')
    const date = String(booking.date || new Date().toISOString().split('T')[0])
    const guests = Number(booking.guests) || 1
    const price = Number(booking.total_price) || 0
    const notes = booking.notes ? String(booking.notes) : ''

    console.log("Data sanitized successfully")

    // Format date nicely
    let formattedDate = date
    try {
      const d = new Date(date)
      formattedDate = d.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })
    } catch (e) {
      console.log("Date formatting failed, using raw date")
    }

    // Format price
    const formattedPrice = price.toLocaleString() + ' MAD'

    // Create simple HTML email using template literal
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>New Booking</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  
  <h2 style="color: #C19B76; text-align: center; border-bottom: 3px solid #C19B76; padding-bottom: 10px;">
    Marragafay - New Booking
  </h2>

  <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
    <tr>
      <td style="padding: 10px; background: #f9f9f9; font-weight: bold; width: 150px;">Customer Name:</td>
      <td style="padding: 10px; background: #fff;">${name}</td>
    </tr>
    <tr>
      <td style="padding: 10px; background: #f9f9f9; font-weight: bold;">Phone:</td>
      <td style="padding: 10px; background: #fff;">${phone}</td>
    </tr>
    <tr>
      <td style="padding: 10px; background: #f9f9f9; font-weight: bold;">Package:</td>
      <td style="padding: 10px; background: #fff;">${packageTitle}</td>
    </tr>
    <tr>
      <td style="padding: 10px; background: #f9f9f9; font-weight: bold;">Date:</td>
      <td style="padding: 10px; background: #fff;">${formattedDate}</td>
    </tr>
    <tr>
      <td style="padding: 10px; background: #f9f9f9; font-weight: bold;">Guests:</td>
      <td style="padding: 10px; background: #fff;">${guests} ${guests === 1 ? 'person' : 'people'}</td>
    </tr>
    <tr style="background: #fff4e6;">
      <td style="padding: 10px; font-weight: bold; font-size: 18px;">Total Price:</td>
      <td style="padding: 10px; font-weight: bold; font-size: 20px; color: #C19B76;">${formattedPrice}</td>
    </tr>
    ${notes ? `
    <tr>
      <td style="padding: 10px; background: #f9f9f9; font-weight: bold;">Notes:</td>
      <td style="padding: 10px; background: #fff; font-style: italic;">${notes}</td>
    </tr>
    ` : ''}
  </table>

  <div style="margin: 30px 0; text-align: center;">
    <a href="tel:${phone}" style="display: inline-block; background-color: #C19B76; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 5px; font-weight: bold;">
      📞 Call Customer
    </a>
    <a href="https://wa.me/${phoneClean}" style="display: inline-block; background-color: #25D366; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 5px; font-weight: bold;">
      💬 WhatsApp
    </a>
  </div>

  <p style="text-align: center; color: #999; font-size: 12px; margin-top: 40px; border-top: 1px solid #ddd; padding-top: 20px;">
    Marragafay Travels | Marrakech, Morocco<br>
    <a href="https://marragafay.com" style="color: #C19B76;">www.marragafay.com</a>
  </p>

</body>
</html>
    `

    console.log("HTML content created, length:", htmlContent.length)
    console.log("SENDING: Attempting to send email...")
    console.log("To: Marragafay@gmail.com")
    console.log("CC: imadaitlachger@gmail.com")

    // Send email with both recipients
    const { data, error } = await resend.emails.send({
      from: 'Marragafay Bookings <onboarding@resend.dev>',
      to: ['Marragafay@gmail.com'],
      cc: ['imadaitlachger@gmail.com'],
      subject: `New Booking: ${name} - ${packageTitle}`,
      html: htmlContent
    })

    if (error) {
      console.error("FAILED: Resend returned error:", error)
      throw error
    }

    console.log("SUCCESS: Email sent to Resend API")
    console.log("Email ID:", data?.id)
    console.log("=== EMAIL ACTION COMPLETED ===")

    return { success: true, emailId: data?.id }

  } catch (error) {
    console.error("CRITICAL ERROR in sendBookingEmail:", error)
    console.error("Error type:", typeof error)
    console.error("Error details:", error instanceof Error ? error.message : String(error))

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
