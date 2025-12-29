-- =====================================================
-- Marragafay Admin Dashboard - Complete Database Setup
-- =====================================================
-- This script creates ALL required tables including bookings
-- Run this in your Supabase SQL Editor

-- =====================================================
-- 1. PRICING TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS pricing (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  activity_name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  currency TEXT DEFAULT 'MAD',
  duration TEXT,
  type TEXT CHECK (type IN ('activity', 'pack')) DEFAULT 'activity',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE pricing ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Allow public read access to pricing"
  ON pricing FOR SELECT
  TO anon
  USING (true);

CREATE POLICY IF NOT EXISTS "Allow authenticated users to manage pricing"
  ON pricing FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- 2. REVIEWS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  comment TEXT NOT NULL,
  image_url TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  status TEXT NOT NULL CHECK (status IN ('approved', 'pending', 'rejected')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Allow public read access to approved reviews"
  ON reviews FOR SELECT
  TO anon
  USING (status = 'approved');

CREATE POLICY IF NOT EXISTS "Allow public to insert reviews"
  ON reviews FOR INSERT
  TO anon
  WITH CHECK (status = 'pending');

CREATE POLICY IF NOT EXISTS "Allow authenticated users to manage reviews"
  ON reviews FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- 3. BOOKINGS TABLE
-- =====================================================
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

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Allow authenticated users to manage bookings"
  ON bookings FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Allow public to insert bookings"
  ON bookings FOR INSERT
  TO anon
  WITH CHECK (true);

-- =====================================================
-- 4. DRIVERS TABLE (Optional)
-- =====================================================
CREATE TABLE IF NOT EXISTS drivers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  vehicle TEXT,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Allow authenticated users to manage drivers"
  ON drivers FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- 5. CREATE INDEXES FOR BETTER PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_pricing_activity_name ON pricing(activity_name);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON bookings(payment_status);

-- =====================================================
-- 6. CREATE UPDATED_AT TRIGGER
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_pricing_updated_at ON pricing;
CREATE TRIGGER update_pricing_updated_at 
    BEFORE UPDATE ON pricing 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_reviews_updated_at ON reviews;
CREATE TRIGGER update_reviews_updated_at 
    BEFORE UPDATE ON reviews 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 7. INSERT SAMPLE DATA
-- =====================================================

-- Sample Pricing Data
INSERT INTO pricing (activity_name, price, currency, duration, type) VALUES
  ('Quad Biking', 350, 'MAD', '2 hours', 'activity'),
  ('Camel Trekking', 200, 'MAD', '1 hour', 'activity'),
  ('Sunset Dinner', 500, 'MAD', '3 hours', 'activity'),
  ('Hot Air Balloon', 800, 'MAD', '1 hour', 'activity'),
  ('Buggy Adventure', 450, 'MAD', '2.5 hours', 'activity'),
  ('Horseback Riding', 250, 'MAD', '1.5 hours', 'activity'),
  ('Basic Package', 1200, 'MAD', 'Full Day', 'pack'),
  ('Premium Package', 2500, 'MAD', 'Full Day', 'pack'),
  ('Luxury Package', 4000, 'MAD', 'Full Day', 'pack')
ON CONFLICT DO NOTHING;

-- Sample Reviews
INSERT INTO reviews (name, email, comment, rating, status) VALUES
  ('John Smith', 'john@example.com', 'Amazing experience! The quad biking was thrilling and the sunset was breathtaking.', 5, 'approved'),
  ('Sarah Johnson', 'sarah@example.com', 'Perfect desert adventure. Highly recommend the luxury package!', 5, 'approved'),
  ('Michael Brown', 'mike@example.com', 'Great service, beautiful location. Will definitely come back!', 4, 'approved')
ON CONFLICT DO NOTHING;

-- Sample Drivers
INSERT INTO drivers (name, phone, vehicle, is_available) VALUES
  ('Ahmed Hassan', '+212 600-111111', '4x4 Toyota Land Cruiser', true),
  ('Omar Khalid', '+212 600-222222', 'Mercedes Sprinter Van', true),
  ('Fatima Zahra', '+212 600-333333', '4x4 Nissan Patrol', false)
ON CONFLICT DO NOTHING;

-- Sample Test Booking
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

-- =====================================================
-- 8. ENABLE REAL-TIME SUBSCRIPTIONS
-- =====================================================
ALTER PUBLICATION supabase_realtime ADD TABLE reviews;
ALTER PUBLICATION supabase_realtime ADD TABLE pricing;
ALTER PUBLICATION supabase_realtime ADD TABLE bookings;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
SELECT 'Pricing Table' as table_name, COUNT(*) as row_count FROM pricing
UNION ALL
SELECT 'Reviews Table' as table_name, COUNT(*) as row_count FROM reviews
UNION ALL
SELECT 'Bookings Table' as table_name, COUNT(*) as row_count FROM bookings
UNION ALL
SELECT 'Drivers Table' as table_name, COUNT(*) as row_count FROM drivers;

-- Show the test booking
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
  created_at
FROM bookings
ORDER BY created_at DESC
LIMIT 5;

-- =====================================================
-- SETUP COMPLETE! 🎉
-- =====================================================
