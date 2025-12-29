-- =====================================================
-- Marragafay Admin Dashboard - Database Setup
-- =====================================================
-- This script creates the required tables for the new admin features
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
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add RLS (Row Level Security) policies
ALTER TABLE pricing ENABLE ROW LEVEL SECURITY;

-- Allow public to read pricing
CREATE POLICY "Allow public read access to pricing"
  ON pricing FOR SELECT
  TO anon
  USING (true);

-- Allow authenticated users to manage pricing
CREATE POLICY "Allow authenticated users to manage pricing"
  ON pricing FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert sample pricing data
INSERT INTO pricing (activity_name, price, currency, duration) VALUES
  ('Quad Biking', 350, 'MAD', '2 hours'),
  ('Camel Trekking', 200, 'MAD', '1 hour'),
  ('Sunset Dinner', 500, 'MAD', '3 hours'),
  ('Hot Air Balloon', 800, 'MAD', '1 hour'),
  ('Buggy Adventure', 450, 'MAD', '2.5 hours'),
  ('Horseback Riding', 250, 'MAD', '1.5 hours')
ON CONFLICT DO NOTHING;

-- =====================================================
-- 2. REVIEWS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  email TEXT,
  comment TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  status TEXT NOT NULL CHECK (status IN ('approved', 'pending', 'rejected')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add RLS (Row Level Security) policies
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Allow public to read only approved reviews
CREATE POLICY "Allow public read access to approved reviews"
  ON reviews FOR SELECT
  TO anon
  USING (status = 'approved');

-- Allow public to insert reviews (they start as pending)
CREATE POLICY "Allow public to insert reviews"
  ON reviews FOR INSERT
  TO anon
  WITH CHECK (status = 'pending');

-- Allow authenticated users to manage all reviews
CREATE POLICY "Allow authenticated users to manage reviews"
  ON reviews FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert sample review data
INSERT INTO reviews (customer_name, email, comment, rating, status) VALUES
  ('John Smith', 'john@example.com', 'Amazing experience! The quad biking was thrilling and the sunset was breathtaking. Our guide was incredibly knowledgeable and made sure we had the best time.', 5, 'approved'),
  ('Sarah Johnson', 'sarah@example.com', 'Perfect desert adventure. Highly recommend the luxury package! The dinner under the stars was unforgettable.', 5, 'approved'),
  ('Michael Brown', 'mike@example.com', 'Great service, beautiful location. Will definitely come back with my family next time!', 4, 'approved'),
  ('Emma Wilson', 'emma@example.com', 'Incredible views and fantastic hospitality. The camel trekking was so peaceful and serene.', 5, 'pending'),
  ('David Martinez', 'david@example.com', 'Best adventure of our Morocco trip! The staff was professional and the experience was worth every penny.', 5, 'pending'),
  ('Lisa Anderson', 'lisa@example.com', 'Good experience overall. The quad bikes were in excellent condition and the desert landscape was stunning.', 4, 'pending')
ON CONFLICT DO NOTHING;

-- =====================================================
-- 3. ENABLE REAL-TIME SUBSCRIPTIONS (OPTIONAL)
-- =====================================================
-- This allows the dashboard to receive real-time updates when data changes

-- Enable real-time for reviews table
ALTER PUBLICATION supabase_realtime ADD TABLE reviews;

-- Enable real-time for pricing table
ALTER PUBLICATION supabase_realtime ADD TABLE pricing;

-- =====================================================
-- 4. CREATE INDEXES FOR BETTER PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_pricing_activity_name ON pricing(activity_name);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);

-- =====================================================
-- 5. CREATE UPDATED_AT TRIGGER
-- =====================================================
-- This automatically updates the updated_at timestamp when a row is modified

-- Create the trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to pricing table
DROP TRIGGER IF EXISTS update_pricing_updated_at ON pricing;
CREATE TRIGGER update_pricing_updated_at 
    BEFORE UPDATE ON pricing 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Apply to reviews table
DROP TRIGGER IF EXISTS update_reviews_updated_at ON reviews;
CREATE TRIGGER update_reviews_updated_at 
    BEFORE UPDATE ON reviews 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run these to verify the tables were created successfully

-- Check pricing table
SELECT 'Pricing Table' as table_name, COUNT(*) as row_count FROM pricing;

-- Check reviews table
SELECT 'Reviews Table' as table_name, COUNT(*) as row_count FROM reviews;

-- Check reviews by status
SELECT status, COUNT(*) as count FROM reviews GROUP BY status ORDER BY status;

-- =====================================================
-- SETUP COMPLETE! 🎉
-- =====================================================
-- You can now use the Pricing Management and Review Moderation features
