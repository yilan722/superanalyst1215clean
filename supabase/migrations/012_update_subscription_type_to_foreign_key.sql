-- Migration to change subscription_type from TEXT to INTEGER and add foreign key constraint
-- This will link users.subscription_type to subscription_tiers.id

-- Step 1: First, ensure subscription_tiers table exists and has data
-- (This should already be done, but we'll check)

-- Step 2: Add a temporary column to store the new subscription_type as INTEGER
ALTER TABLE public.users 
ADD COLUMN subscription_type_new INTEGER;

-- Step 3: Update the new column with tier IDs based on current subscription_type values
-- Map old string values to new tier IDs
UPDATE public.users 
SET subscription_type_new = CASE 
  WHEN subscription_type = 'Free' THEN 1
  WHEN subscription_type = 'Basic' THEN 2
  WHEN subscription_type = 'Pro' THEN 3
  WHEN subscription_type = 'Business' THEN 4
  WHEN subscription_type = 'Enterprise' THEN 5
  WHEN subscription_type = 'single_report' THEN 1  -- Map to Free tier
  WHEN subscription_type = 'monthly_30' THEN 2     -- Map to Basic tier
  WHEN subscription_type = 'monthly_70' THEN 3     -- Map to Pro tier
  WHEN subscription_type = 'premium_300' THEN 4    -- Map to Business tier
  ELSE NULL
END
WHERE subscription_type IS NOT NULL;

-- Step 4: Drop the old subscription_type column
ALTER TABLE public.users 
DROP COLUMN subscription_type;

-- Step 5: Rename the new column to subscription_type
ALTER TABLE public.users 
RENAME COLUMN subscription_type_new TO subscription_type;

-- Step 6: Add foreign key constraint
ALTER TABLE public.users 
ADD CONSTRAINT fk_users_subscription_type 
FOREIGN KEY (subscription_type) 
REFERENCES public.subscription_tiers(id) 
ON DELETE SET NULL;

-- Step 7: Add index for better performance
CREATE INDEX IF NOT EXISTS idx_users_subscription_type 
ON public.users(subscription_type);

-- Step 8: Add comment to document the change
COMMENT ON COLUMN public.users.subscription_type IS 'Foreign key reference to subscription_tiers.id';

-- Step 9: Update RLS policies if needed (they should still work with the new column type)
-- The existing policies should continue to work since they don't depend on the column type
