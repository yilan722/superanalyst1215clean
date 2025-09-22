-- Create subscription_tiers table
-- This table defines different subscription tiers with their limits and features

CREATE TABLE IF NOT EXISTS public.subscription_tiers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  daily_report_limit INTEGER DEFAULT 0,
  additional_purchase DECIMAL(10,2) DEFAULT 0.00,
  monthly_report_limit INTEGER DEFAULT 0,
  price_monthly DECIMAL(10,2) DEFAULT 0.00,
  features JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on name for faster lookups
CREATE INDEX IF NOT EXISTS idx_subscription_tiers_name ON public.subscription_tiers(name);

-- Create index on is_active for filtering active tiers
CREATE INDEX IF NOT EXISTS idx_subscription_tiers_active ON public.subscription_tiers(is_active);

-- Insert default subscription tiers
INSERT INTO public.subscription_tiers (name, daily_report_limit, additional_purchase, monthly_report_limit, price_monthly, features, is_active) VALUES
(
  'Free',
  1,
  0.00,
  0,
  0.00,
  '{
    "max_reports_per_day": 1,
    "ai_analysis": true,
    "basic_charts": true,
    "email_support": false,
    "priority_support": false,
    "advanced_analytics": false,
    "custom_reports": false,
    "api_access": false
  }',
  true
),
(
  'Basic',
  5,
  2.99,
  0,
  9.99,
  '{
    "max_reports_per_day": 5,
    "ai_analysis": true,
    "basic_charts": true,
    "email_support": true,
    "priority_support": false,
    "advanced_analytics": false,
    "custom_reports": false,
    "api_access": false
  }',
  true
),
(
  'Pro',
  20,
  1.99,
  0,
  29.99,
  '{
    "max_reports_per_day": 20,
    "ai_analysis": true,
    "basic_charts": true,
    "email_support": true,
    "priority_support": true,
    "advanced_analytics": true,
    "custom_reports": false,
    "api_access": false
  }',
  true
),
(
  'Business',
  50,
  1.49,
  0,
  79.99,
  '{
    "max_reports_per_day": 50,
    "ai_analysis": true,
    "basic_charts": true,
    "email_support": true,
    "priority_support": true,
    "advanced_analytics": true,
    "custom_reports": true,
    "api_access": true
  }',
  true
),
(
  'Enterprise',
  200,
  0.99,
  0,
  199.99,
  '{
    "max_reports_per_day": 200,
    "ai_analysis": true,
    "basic_charts": true,
    "email_support": true,
    "priority_support": true,
    "advanced_analytics": true,
    "custom_reports": true,
    "api_access": true,
    "dedicated_support": true,
    "custom_integrations": true,
    "white_label": true
  }',
  true
);

-- Enable Row Level Security
ALTER TABLE public.subscription_tiers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Allow everyone to read subscription tiers (for pricing page)
CREATE POLICY "Anyone can view subscription tiers" ON public.subscription_tiers
  FOR SELECT USING (true);

-- Only service role can modify subscription tiers
CREATE POLICY "Service role can manage subscription tiers" ON public.subscription_tiers
  FOR ALL USING (auth.role() = 'service_role');

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_subscription_tiers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_subscription_tiers_updated_at
  BEFORE UPDATE ON public.subscription_tiers
  FOR EACH ROW
  EXECUTE FUNCTION update_subscription_tiers_updated_at();

-- Add comment to table
COMMENT ON TABLE public.subscription_tiers IS 'Subscription tiers with their limits, pricing, and features';
COMMENT ON COLUMN public.subscription_tiers.name IS 'Tier name (Free, Basic, Pro, Business, Enterprise)';
COMMENT ON COLUMN public.subscription_tiers.daily_report_limit IS 'Maximum reports allowed per day';
COMMENT ON COLUMN public.subscription_tiers.additional_purchase IS 'Price per additional report beyond daily limit';
COMMENT ON COLUMN public.subscription_tiers.monthly_report_limit IS 'Maximum reports allowed per month (0 = unlimited)';
COMMENT ON COLUMN public.subscription_tiers.price_monthly IS 'Monthly subscription price';
COMMENT ON COLUMN public.subscription_tiers.features IS 'JSON object containing tier features and capabilities';
COMMENT ON COLUMN public.subscription_tiers.is_active IS 'Whether this tier is currently available for subscription';
