-- Add status column to reports table
ALTER TABLE reports ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'completed';

-- Update existing reports to have 'completed' status
UPDATE reports SET status = 'completed' WHERE status IS NULL;
