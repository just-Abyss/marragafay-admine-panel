-- =====================================================
-- Insert Test Booking
-- =====================================================
-- Run this in your Supabase SQL Editor to create a test booking

-- First, ensure the bookings table exists with the correct schema
CREATE TABLE IF NOT EXISTS bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  package_title TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'cancelled')) DEFAULT 'pending',
  date DATE NOT NULL,
  guests INTEGER NOT NULL DEFAULT 1,
  adults INTEGER NOT NULL DEFAULT 1,
  children INTEGER NOT NULL DEFAULT 0,
  total_price NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  notes TEXT,
  payment_status TEXT NOT NULL CHECK (payment_status IN ('paid', 'deposit', 'unpaid')) DEFAULT 'unpaid',
  amount_paid NUMERIC DEFAULT 0,
  remaining_balance NUMERIC DEFAULT 0,
  driver_id UUID,
  driver_name TEXT,
  driver TEXT,
  pickup_time TEXT,
  pickup_location TEXT,
  activity_type TEXT,
  deposit_amount NUMERIC
);

-- Enable RLS (Row Level Security) policies
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to manage all bookings
CREATE POLICY IF NOT EXISTS "Allow authenticated users to manage bookings"
  ON bookings FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert a test booking
INSERT INTO bookings (
  name,
  email,
  phone_number,
  package_title,
  status,
  date,
  guests,
  adults,
  children,
  total_price,
  notes,
  payment_status,
  amount_paid,
  remaining_balance,
  driver_name,
  pickup_time,
  pickup_location,
  activity_type,
  deposit_amount
) VALUES (
  'Test Customer',
  'test@example.com',
  '+212 600-123456',
  'Luxury Desert Experience',
  'confirmed',
  CURRENT_DATE + INTERVAL '3 days',
  4,
  2,
  2,
  2000,
  'This is a test booking for dashboard testing. Customer requested vegetarian meals.',
  'deposit',
  500,
  1500,
  'Ahmed Hassan',
  '14:30',
  'Hotel Atlas Marrakech',
  'Quad Biking + Camel Trek',
  500
);

-- Verify the booking was created
SELECT 
  id,
  name,
  email,
  package_title,
  status,
  date,
  guests,
  total_price,
  payment_status,
  amount_paid,
  remaining_balance,
  created_at
FROM bookings
ORDER BY created_at DESC
LIMIT 1;

-- =====================================================
-- ADDITIONAL TEST BOOKINGS (Optional)
-- =====================================================
-- Uncomment the section below to insert more test data

/*
INSERT INTO bookings (name, email, phone_number, package_title, status, date, guests, adults, children, total_price, payment_status, amount_paid, remaining_balance, pickup_location, activity_type) VALUES
  ('Sarah Johnson', 'sarah.j@email.com', '+212 655-789012', 'Sunset Dinner Experience', 'pending', CURRENT_DATE + INTERVAL '1 day', 2, 2, 0, 1000, 'unpaid', 0, 1000, 'Riad Yasmine', 'Camel Trekking'),
  ('Mohammed Ali', 'mohammed@email.com', '+212 661-234567', 'Hot Air Balloon Adventure', 'confirmed', CURRENT_DATE + INTERVAL '5 days', 6, 4, 2, 4800, 'paid', 4800, 0, 'Medina Hotel', 'Hot Air Balloon'),
  ('Emma Williams', 'emma.w@email.com', '+212 678-901234', 'Buggy Desert Safari', 'confirmed', CURRENT_DATE + INTERVAL '2 days', 3, 3, 0, 1350, 'deposit', 450, 900, 'La Mamounia', 'Buggy Adventure'),
  ('Carlos Martinez', 'carlos@email.com', '+212 645-567890', 'Premium Package', 'cancelled', CURRENT_DATE - INTERVAL '1 day', 2, 2, 0, 1600, 'unpaid', 0, 1600, 'Four Seasons', 'Full Day Experience');
*/

-- =====================================================
-- SETUP COMPLETE! 🎉
-- =====================================================
