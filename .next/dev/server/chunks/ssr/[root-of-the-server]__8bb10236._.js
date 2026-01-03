module.exports = [
"[externals]/node:crypto [external] (node:crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:crypto", () => require("node:crypto"));

module.exports = mod;
}),
"[project]/app/actions.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"4081f1dd4aa8ea82e26767a0ae58c488b12e552900":"sendBookingEmail"},"",""] */ __turbopack_context__.s([
    "sendBookingEmail",
    ()=>sendBookingEmail
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.1.1_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$resend$40$6$2e$6$2e$0_$40$react$2d$email$2b$r_caab9d44f9ae55ca26d784aa9bb5ac0a$2f$node_modules$2f$resend$2f$dist$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/resend@6.6.0_@react-email+r_caab9d44f9ae55ca26d784aa9bb5ac0a/node_modules/resend/dist/index.mjs [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.1.1_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)");
;
;
const resend = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$resend$40$6$2e$6$2e$0_$40$react$2d$email$2b$r_caab9d44f9ae55ca26d784aa9bb5ac0a$2f$node_modules$2f$resend$2f$dist$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Resend"](process.env.RESEND_API_KEY);
async function sendBookingEmail(booking) {
    console.log("=== EMAIL ACTION STARTED ===");
    console.log("Received booking:", JSON.stringify(booking, null, 2));
    try {
        // Sanitize all data to strings/numbers
        const name = String(booking.name || 'Unknown');
        const phone = String(booking.phone_number || 'N/A');
        const phoneClean = phone.replace(/[^0-9]/g, '');
        const packageTitle = String(booking.package_title || 'Unknown Package');
        const date = String(booking.date || new Date().toISOString().split('T')[0]);
        const guests = Number(booking.guests) || 1;
        const price = Number(booking.total_price) || 0;
        const notes = booking.notes ? String(booking.notes) : '';
        console.log("Data sanitized successfully");
        // Format date nicely
        let formattedDate = date;
        try {
            const d = new Date(date);
            formattedDate = d.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric'
            });
        } catch (e) {
            console.log("Date formatting failed, using raw date");
        }
        // Format price
        const formattedPrice = price.toLocaleString() + ' MAD';
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
    `;
        console.log("HTML content created, length:", htmlContent.length);
        console.log("SENDING: Attempting to send email...");
        console.log("To: Marragafay@gmail.com");
        console.log("CC: imadaitlachger@gmail.com");
        // Send email with both recipients
        const { data, error } = await resend.emails.send({
            from: 'Marragafay Bookings <onboarding@resend.dev>',
            to: [
                'Marragafay@gmail.com'
            ],
            cc: [
                'imadaitlachger@gmail.com'
            ],
            subject: `New Booking: ${name} - ${packageTitle}`,
            html: htmlContent
        });
        if (error) {
            console.error("FAILED: Resend returned error:", error);
            throw error;
        }
        console.log("SUCCESS: Email sent to Resend API");
        console.log("Email ID:", data?.id);
        console.log("=== EMAIL ACTION COMPLETED ===");
        return {
            success: true,
            emailId: data?.id
        };
    } catch (error) {
        console.error("CRITICAL ERROR in sendBookingEmail:", error);
        console.error("Error type:", typeof error);
        console.error("Error details:", error instanceof Error ? error.message : String(error));
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    sendBookingEmail
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$1_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(sendBookingEmail, "4081f1dd4aa8ea82e26767a0ae58c488b12e552900", null);
}),
"[project]/.next-internal/server/app/dashboard/bookings/page/actions.js { ACTIONS_MODULE0 => \"[project]/app/actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/actions.ts [app-rsc] (ecmascript)");
;
}),
"[project]/.next-internal/server/app/dashboard/bookings/page/actions.js { ACTIONS_MODULE0 => \"[project]/app/actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "4081f1dd4aa8ea82e26767a0ae58c488b12e552900",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["sendBookingEmail"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f$dashboard$2f$bookings$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$app$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i('[project]/.next-internal/server/app/dashboard/bookings/page/actions.js { ACTIONS_MODULE0 => "[project]/app/actions.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <locals>');
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/actions.ts [app-rsc] (ecmascript)");
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__8bb10236._.js.map