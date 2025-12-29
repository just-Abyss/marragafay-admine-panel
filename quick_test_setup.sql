-- =====================================================
-- Quick Setup: Test Booking + Drivers
-- =====================================================
-- Run this in Supabase SQL Editor to test driver assignment
-- URL: https://app.supabase.com/project/bgjohquanepghmlmdiyd/sql/new

-- Step 1: Ensure tables exist (safe to run multiple times)
CREATE TABLE IF NOT EXISTS drivers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  vehicle TEXT,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

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

-- Step 2: Enable RLS
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Step 3: Create policies
DROP POLICY IF EXISTS "Allow authenticated users to manage drivers" ON drivers;
CREATE POLICY "Allow authenticated users to manage drivers"
  ON drivers FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated users to manage bookings" ON bookings;
CREATE POLICY "Allow authenticated users to manage bookings"
  ON bookings FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Step 4: Insert test drivers (skip if they already exist)
INSERT INTO drivers (name, phone, vehicle, is_available) VALUES
  ('Ahmed Hassan', '+212 600-111111', '4x4 Toyota Land Cruiser', true),
  ('Omar Khalid', '+212 600-222222', 'Mercedes Sprinter Van', true),
  ('Fatima Zahra', '+212 600-333333', '4x4 Nissan Patrol', false)
ON CONFLICT DO NOTHING;

-- Step 5: Insert a test booking (skip if it already exists)
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
  NULL, -- No driver assigned yet - you'll test assigning one!
  '14:30',
  'Hotel Atlas Marrakech',
  'Quad Biking + Camel Trek',
  500
);

-- Step 6: Verify the data
SELECT 'Drivers' as table_name, COUNT(*) as count FROM drivers
UNION ALL
SELECT 'Bookings' as table_name, COUNT(*) as count FROM bookings;

-- Step 7: View the test booking
SELECT 
  id,
  name,
  package_title,
  date,
  driver_name,
  pickup_time,
  payment_status
FROM bookings
ORDER BY created_at DESC
LIMIT 5;

-- =====================================================
-- ✅ SETUP COMPLETE!
-- =====================================================
-- Now test in your dashboard:
-- 1. Refresh the dashboard (http://localhost:3000/dashboard/bookings)
-- 2. Click on the test booking
-- 3. Click "Edit"
-- 4. Select a driver from the dropdown
-- 5. Click "Save Changes"
-- 6. Verify the driver is saved!
