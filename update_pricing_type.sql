-- Add 'type' column to pricing table with default value 'activity'
ALTER TABLE pricing 
ADD COLUMN type TEXT NOT NULL DEFAULT 'activity';

-- Add check constraint to ensure only 'activity' or 'pack' values are allowed
ALTER TABLE pricing 
ADD CONSTRAINT check_pricing_type CHECK (type IN ('activity', 'pack'));
