-- =====================================================
-- SUPABASE AUTHENTICATION SETUP
-- =====================================================
-- This script helps you set up Supabase Authentication
-- Run these steps manually in your Supabase Dashboard

-- =====================================================
-- OPTION 1: Create Admin User via Supabase Dashboard UI
-- =====================================================
-- 1. Go to: https://app.supabase.com/project/bgjohquanepghmlmdiyd/auth/users
-- 2. Click "Add User" button
-- 3. Select "Create new user"
-- 4. Enter Email: admin@marragafay.com (or your preferred email)
-- 5. Enter Password: (choose a strong password)
-- 6. Click "Create user"

-- =====================================================
-- OPTION 2: Create Admin User via SQL (Advanced)
-- =====================================================
-- Note: User creation via SQL is complex and not recommended.
-- Use the Dashboard UI (Option 1) instead.

-- =====================================================
-- VERIFY AUTHENTICATION SETUP
-- =====================================================
-- After creating your admin user, verify it exists:

SELECT 
  id,
  email,
  created_at,
  email_confirmed_at,
  last_sign_in_at
FROM auth.users;

-- =====================================================
-- UPDATE RLS POLICIES FOR AUTHENTICATED ACCESS
-- =====================================================
-- Ensure your tables allow authenticated users to access data

-- Update bookings table RLS
DROP POLICY IF EXISTS "Allow authenticated users to manage bookings" ON bookings;
CREATE POLICY "Allow authenticated users to manage bookings"
  ON bookings FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Update drivers table RLS
DROP POLICY IF EXISTS "Allow authenticated users to manage drivers" ON drivers;
CREATE POLICY "Allow authenticated users to manage drivers"
  ON drivers FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Update pricing table RLS
DROP POLICY IF EXISTS "Allow authenticated users to manage pricing" ON pricing;
CREATE POLICY "Allow authenticated users to manage pricing"
  ON pricing FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Update reviews table RLS
DROP POLICY IF EXISTS "Allow authenticated users to manage reviews" ON reviews;
CREATE POLICY "Allow authenticated users to manage reviews"
  ON reviews FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- VERIFY RLS POLICIES
-- =====================================================
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- =====================================================
-- SETUP COMPLETE! 
-- =====================================================
-- Next Steps:
-- 1. Create admin user via Dashboard UI
-- 2. Run the RLS policies above
-- 3. Test login at http://localhost:3000
-- 4. Use your admin credentials to sign in
