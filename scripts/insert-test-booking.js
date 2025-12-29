/**
 * Insert Test Booking Script
 * Run this with: node scripts/insert-test-booking.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Supabase credentials not found in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function insertTestBooking() {
    console.log('🚀 Inserting test booking...\n');

    // Calculate a date 3 days from now
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 3);
    const formattedDate = futureDate.toISOString().split('T')[0];

    const testBooking = {
        name: 'Test Customer',
        email: 'test@example.com',
        phone_number: '+212 600-123456',
        package_title: 'Luxury Desert Experience',
        status: 'confirmed',
        date: formattedDate,
        guests: 4,
        adults: 2,
        children: 2,
        total_price: 2000,
        notes: 'This is a test booking for dashboard testing. Customer requested vegetarian meals.',
        payment_status: 'deposit',
        amount_paid: 500,
        remaining_balance: 1500,
        driver_name: 'Ahmed Hassan',
        pickup_time: '14:30',
        pickup_location: 'Hotel Atlas Marrakech',
        activity_type: 'Quad Biking + Camel Trek',
        deposit_amount: 500
    };

    const { data, error } = await supabase
        .from('bookings')
        .insert([testBooking])
        .select();

    if (error) {
        console.error('❌ Error inserting test booking:', error.message);
        console.error('Details:', error);
        return;
    }

    console.log('✅ Test booking created successfully!\n');
    console.log('📋 Booking Details:');
    console.log('─────────────────────────────────────────');
    console.log(`ID: ${data[0].id}`);
    console.log(`Name: ${data[0].name}`);
    console.log(`Email: ${data[0].email}`);
    console.log(`Package: ${data[0].package_title}`);
    console.log(`Status: ${data[0].status}`);
    console.log(`Date: ${data[0].date}`);
    console.log(`Guests: ${data[0].guests} (${data[0].adults} adults, ${data[0].children} children)`);
    console.log(`Total Price: ${data[0].total_price} MAD`);
    console.log(`Payment Status: ${data[0].payment_status}`);
    console.log(`Amount Paid: ${data[0].amount_paid} MAD`);
    console.log(`Remaining: ${data[0].remaining_balance} MAD`);
    console.log(`Driver: ${data[0].driver_name}`);
    console.log(`Pickup: ${data[0].pickup_time} at ${data[0].pickup_location}`);
    console.log('─────────────────────────────────────────\n');
    console.log('🎉 You can now see this booking in your dashboard!');
}

// Run the script
insertTestBooking();
