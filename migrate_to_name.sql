-- =====================================================
-- MIGRATION: Rename activity_name to name
-- =====================================================
-- This renames the column in your pricing table to match the code

-- Rename the column
ALTER TABLE pricing 
RENAME COLUMN activity_name TO name;

-- Verify the change
SELECT id, name, price, type, duration 
FROM pricing 
LIMIT 5;

-- =====================================================
-- After running this, your pricing table will have:
-- - name (instead of activity_name)
-- - price
-- - type
-- - duration
-- - currency
-- =====================================================
