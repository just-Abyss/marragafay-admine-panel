'use server'

import { Resend } from 'resend'

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
  console.log("🔴 SERVER ACTION STARTED - sendBookingEmail")
  console.log("🔴 Booking data received:", JSON.stringify(booking, null, 2))

  try {
    // Sanitize data
    const name = String(booking.name || 'Unknown Customer')
    const phone = String(booking.phone_number || 'N/A')
    const phoneClean = phone.replace(/[^0-9]/g, '') // For WhatsApp
    const packageTitle = String(booking.package_title || 'Unknown Package')
    const date = String(booking.date || new Date().toISOString().split('T')[0])
    const guests = Number(booking.guests) || 1
    const price = Number(booking.total_price) || 0
    const status = String(booking.status || 'Pending').toUpperCase()
    const notes = booking.notes ? String(booking.notes) : ''

    // Format date nicely
    let formattedDate = date
    try {
      const d = new Date(date)
      if (!isNaN(d.getTime())) {
        formattedDate = d.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      }
    } catch (e) {
      // Use raw date if formatting fails
    }

    // Format price
    const formattedPrice = `${price.toLocaleString()} MAD`

    // Create simple, professional HTML email
    const htmlEmail = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Booking - ${name}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <!-- Main Container -->
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #C19B76; padding: 30px 40px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold; letter-spacing: 2px;">MARRAGAFAY</h1>
              <p style="margin: 10px 0 0; color: #ffffff; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">New Booking Request</p>
            </td>
          </tr>

          <!-- Booking Details -->
          <tr>
            <td style="padding: 40px;">
              <table width="100%" cellpadding="8" cellspacing="0" style="border-collapse: collapse;">
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0;">
                    <strong style="color: #b0b0b0; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">Customer Name</strong><br>
                    <span style="font-size: 16px; color: #333333; font-weight: 600;">${name}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0;">
                    <strong style="color: #b0b0b0; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">Phone Number</strong><br>
                    <span style="font-size: 16px; color: #333333;">${phone}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0;">
                    <strong style="color: #b0b0b0; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">Package</strong><br>
                    <span style="font-size: 16px; color: #333333; font-weight: 600;">${packageTitle}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0;">
                    <strong style="color: #b0b0b0; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">Date</strong><br>
                    <span style="font-size: 16px; color: #333333;">${formattedDate}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0;">
                    <strong style="color: #b0b0b0; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">Guests</strong><br>
                    <span style="font-size: 16px; color: #333333;">${guests} ${guests === 1 ? 'Person' : 'People'}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0;">
                    <strong style="color: #b0b0b0; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">Total Price</strong><br>
                    <span style="font-size: 24px; color: #C19B76; font-weight: bold;">${formattedPrice}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0;">
                    <strong style="color: #b0b0b0; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">Status</strong><br>
                    <span style="display: inline-block; background-color: #f0fdf4; color: #166534; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-top: 5px;">${status}</span>
                  </td>
                </tr>
                ${notes ? `
                <tr>
                  <td style="padding: 20px; background-color: #fdf8f4; border-radius: 8px; margin-top: 15px;">
                    <strong style="color: #b0b0b0; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">Special Notes</strong><br>
                    <span style="font-size: 14px; color: #666666; font-style: italic; margin-top: 5px; display: block;">${notes}</span>
                  </td>
                </tr>
                ` : ''}
              </table>

              <!-- Action Buttons -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 30px;">
                <tr>
                  <td align="center" style="padding: 10px;">
                    <a href="tel:${phone}" style="display: inline-block; background-color: #C19B76; color: #ffffff; text-decoration: none; padding: 14px 30px; border-radius: 8px; font-weight: bold; font-size: 14px; margin: 5px;">
                      📞 Call Customer
                    </a>
                  </td>
                  <td align="center" style="padding: 10px;">
                    <a href="https://wa.me/${phoneClean}" style="display: inline-block; background-color: #25D366; color: #ffffff; text-decoration: none; padding: 14px 30px; border-radius: 8px; font-weight: bold; font-size: 14px; margin: 5px;">
                      💬 WhatsApp
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Dashboard Link -->
              <div style="text-align: center; margin-top: 20px;">
                <a href="https://marragafay-admin.vercel.app/dashboard/bookings" style="color: #C19B76; text-decoration: none; font-size: 14px; font-weight: 500;">
                  View in Dashboard →
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; border-top: 1px solid #f0f0f0; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #999999; line-height: 1.6;">
                Marragafay Travels<br>
                Marrakech, Morocco<br>
                <a href="https://marragafay.com" style="color: #999999; text-decoration: underline;">www.marragafay.com</a>
              </p>
              <p style="margin: 10px 0 0; font-size: 10px; color: #cccccc;">
                © ${new Date().getFullYear()} Marragafay. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `

    console.log("🔴 Sending email to Resend API...")
    console.log("📧 Recipient: imadaitlachger@gmail.com")
    console.log("📋 Subject: New Booking - " + name)

    const { data, error } = await resend.emails.send({
      from: 'Marragafay Bookings <onboarding@resend.dev>',
      to: ['imadaitlachger@gmail.com'],
      subject: `New Booking: ${name} - ${packageTitle}`,
      html: htmlEmail
    })

    if (error) {
      console.error("❌ Resend API Error:", error)
      throw error
    }

    console.log("✅ SUCCESS: Email sent to Resend API")
    console.log("✅ Email ID:", data?.id)
    console.log("✅ Email should arrive at: imadaitlachger@gmail.com")

    return { success: true, data }

  } catch (error) {
    console.error("💥 Email send failed:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
