# 📧 Email Notifications Setup

## ✅ Implementation Complete

I have successfully set up email notifications using `resend`.

### 1. Dashboard "New Booking" (Wizard)
- **Status:** ✅ Integrated
- **How it works:** When you create a booking via the "New Booking" wizard, a Server Action (`sendBookingEmail`) is triggered immediately after the database insert.
- **Recipient:** `marragafay@gmail.com`
- **Error Handling:** If sending fails, it logs to the console but does **not** stop the booking from being saved.

### 2. Public Website Form
- **Status:** ✅ API Route Created
- **Endpoint:** `/api/send-email` (POST)
- **How to use:**
  If your public site is separate (e.g., static HTML), update your JavaScript to call this endpoint after inserting into Supabase.

**Example Fetch Call for Public Site:**
```javascript
// After successfully inserting into Supabase...
const bookingData = {
  name: "John Doe",
  phone_number: "+212...",
  package_title: "Camel Ride",
  date: "2025-01-01",
  guests: 2,
  total_price: 600,
  status: "pending"
};

fetch('https://your-dashboard-url.com/api/send-email', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(bookingData)
})
.then(response => response.json())
.then(data => console.log('Email sent:', data))
.catch(error => console.error('Email error:', error));
```

---

## 🔧 Configuration

**Provider:** Resend  
**API Key:** Loaded from `.env.local` (`RESEND_API_KEY`)  
**Sender:** `onboarding@resend.dev` (Default).  
*Note: To change the sender to `bookings@marragafay.com`, you need to verify your domain in the Resend Dashboard and update `app/actions.ts` and `app/api/send-email/route.ts`.*

---

## 🧪 Testing

1. Go to the Dashboard.
2. Click **"New Booking"**.
3. Fill out the form and submit.
4. Check `marragafay@gmail.com` for the notification.
   *(Check Spam folder if using the default `resend.dev` sender).*
