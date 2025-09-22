/**
 * Subscription Tier Types
 */

export interface SubscriptionTier {
  id: number
  name: string
  daily_report_limit: number
  additional_purchase: number
  monthly_report_limit: number
  price_monthly: number
  features: SubscriptionFeatures
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface SubscriptionFeatures {
  max_reports_per_day: number
  ai_analysis: boolean
  basic_charts: boolean
  email_support: boolean
  priority_support: boolean
  advanced_analytics: boolean
  custom_reports: boolean
  api_access: boolean
  dedicated_support?: boolean
  custom_integrations?: boolean
  white_label?: boolean
}

export type TierName = 'Free' | 'Basic' | 'Pro' | 'Business' | 'Enterprise'

export interface SubscriptionTierComparison {
  tier: SubscriptionTier
  isPopular?: boolean
  isRecommended?: boolean
}

export interface UserSubscriptionInfo {
  current_tier: TierName
  daily_reports_used: number
  daily_reports_remaining: number
  monthly_reports_used?: number
  monthly_reports_remaining?: number
  subscription_end?: string
  can_generate_report: boolean
  upgrade_available: boolean
}

// Default subscription tiers data
export const DEFAULT_SUBSCRIPTION_TIERS: Omit<SubscriptionTier, 'id' | 'created_at' | 'updated_at'>[] = [
  {
    name: 'Free',
    daily_report_limit: 1,
    additional_purchase: 0.00,
    monthly_report_limit: 0,
    price_monthly: 0.00,
    features: {
      max_reports_per_day: 1,
      ai_analysis: true,
      basic_charts: true,
      email_support: false,
      priority_support: false,
      advanced_analytics: false,
      custom_reports: false,
      api_access: false
    },
    is_active: true
  },
  {
    name: 'Basic',
    daily_report_limit: 5,
    additional_purchase: 2.99,
    monthly_report_limit: 0,
    price_monthly: 9.99,
    features: {
      max_reports_per_day: 5,
      ai_analysis: true,
      basic_charts: true,
      email_support: true,
      priority_support: false,
      advanced_analytics: false,
      custom_reports: false,
      api_access: false
    },
    is_active: true
  },
  {
    name: 'Pro',
    daily_report_limit: 20,
    additional_purchase: 1.99,
    monthly_report_limit: 0,
    price_monthly: 29.99,
    features: {
      max_reports_per_day: 20,
      ai_analysis: true,
      basic_charts: true,
      email_support: true,
      priority_support: true,
      advanced_analytics: true,
      custom_reports: false,
      api_access: false
    },
    is_active: true
  },
  {
    name: 'Business',
    daily_report_limit: 50,
    additional_purchase: 1.49,
    monthly_report_limit: 0,
    price_monthly: 79.99,
    features: {
      max_reports_per_day: 50,
      ai_analysis: true,
      basic_charts: true,
      email_support: true,
      priority_support: true,
      advanced_analytics: true,
      custom_reports: true,
      api_access: true
    },
    is_active: true
  },
  {
    name: 'Enterprise',
    daily_report_limit: 200,
    additional_purchase: 0.99,
    monthly_report_limit: 0,
    price_monthly: 199.99,
    features: {
      max_reports_per_day: 200,
      ai_analysis: true,
      basic_charts: true,
      email_support: true,
      priority_support: true,
      advanced_analytics: true,
      custom_reports: true,
      api_access: true,
      dedicated_support: true,
      custom_integrations: true,
      white_label: true
    },
    is_active: true
  }
]
