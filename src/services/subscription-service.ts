/**
 * Subscription Service
 * Handles subscription tier management and user subscription logic
 */

import { supabase } from '../../service/supabase'
import { SubscriptionTier, TierName, UserSubscriptionInfo, SubscriptionFeatures } from '@/src/types/subscription'

export class SubscriptionService {
  /**
   * Get all active subscription tiers
   */
  static async getActiveTiers(): Promise<SubscriptionTier[]> {
    try {
      const { data, error } = await supabase
        .from('subscription_tiers')
        .select('*')
        .eq('is_active', true)
        .order('price_monthly', { ascending: true })

      if (error) {
        console.error('Error fetching subscription tiers:', error)
        throw new Error('Failed to fetch subscription tiers')
      }

      return data || []
    } catch (error) {
      console.error('Error in getActiveTiers:', error)
      throw error
    }
  }

  /**
   * Get a specific subscription tier by name
   */
  static async getTierByName(tierName: TierName): Promise<SubscriptionTier | null> {
    try {
      const { data, error } = await supabase
        .from('subscription_tiers')
        .select('*')
        .eq('name', tierName)
        .eq('is_active', true)
        .single()

      if (error) {
        console.error('Error fetching subscription tier:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in getTierByName:', error)
      return null
    }
  }

  /**
   * Get a specific subscription tier by ID
   */
  static async getTierById(tierId: number): Promise<SubscriptionTier | null> {
    try {
      const { data, error } = await supabase
        .from('subscription_tiers')
        .select('*')
        .eq('id', tierId)
        .eq('is_active', true)
        .single()

      if (error) {
        console.error('Error fetching subscription tier by ID:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in getTierById:', error)
      return null
    }
  }

  /**
   * Get user's current subscription information
   */
  static async getUserSubscriptionInfo(userId: string): Promise<UserSubscriptionInfo> {
    try {
      // Get user profile
      const { data: userProfile, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (userError || !userProfile) {
        throw new Error('User profile not found')
      }

      // Determine current tier
      let currentTier: TierName = 'Free'
      let dailyReportsUsed = userProfile.free_reports_used || 0
      let dailyReportsRemaining = 0
      let monthlyReportsUsed = 0
      let monthlyReportsRemaining = 0
      let subscriptionEnd: string | undefined
      let canGenerateReport = false
      let upgradeAvailable = false

      // Check if user has an active subscription
      if (userProfile.subscription_type && userProfile.subscription_end) {
        const endDate = new Date(userProfile.subscription_end)
        const isActive = endDate > new Date()

        if (isActive) {
          // Get tier information by ID
          const tier = await this.getTierById(userProfile.subscription_type)
          if (tier) {
            currentTier = tier.name as TierName
            subscriptionEnd = userProfile.subscription_end
            monthlyReportsUsed = userProfile.paid_reports_used || 0
            
            dailyReportsRemaining = Math.max(0, tier.daily_report_limit - dailyReportsUsed)
            monthlyReportsRemaining = tier.monthly_report_limit > 0 
              ? Math.max(0, tier.monthly_report_limit - monthlyReportsUsed)
              : Infinity
            
            canGenerateReport = dailyReportsRemaining > 0 && monthlyReportsRemaining > 0
            upgradeAvailable = tier.name !== 'Enterprise'
          } else {
            // Invalid tier ID, fall back to free tier
            currentTier = 'Free'
            dailyReportsUsed = userProfile.free_reports_used || 0
            dailyReportsRemaining = Math.max(0, 1 - dailyReportsUsed)
            canGenerateReport = dailyReportsRemaining > 0
            upgradeAvailable = true
          }
        } else {
          // Subscription expired, fall back to free tier
          currentTier = 'Free'
          dailyReportsUsed = userProfile.free_reports_used || 0
          dailyReportsRemaining = Math.max(0, 1 - dailyReportsUsed)
          canGenerateReport = dailyReportsRemaining > 0
          upgradeAvailable = true
        }
      } else {
        // No subscription, using free tier
        dailyReportsRemaining = Math.max(0, 1 - dailyReportsUsed)
        canGenerateReport = dailyReportsRemaining > 0
        upgradeAvailable = true
      }

      return {
        current_tier: currentTier,
        daily_reports_used: dailyReportsUsed,
        daily_reports_remaining: dailyReportsRemaining,
        monthly_reports_used: monthlyReportsUsed,
        monthly_reports_remaining: monthlyReportsRemaining,
        subscription_end: subscriptionEnd,
        can_generate_report: canGenerateReport,
        upgrade_available: upgradeAvailable
      }
    } catch (error) {
      console.error('Error in getUserSubscriptionInfo:', error)
      throw error
    }
  }

  /**
   * Check if user can generate a report based on their subscription
   */
  static async canUserGenerateReport(userId: string): Promise<{
    canGenerate: boolean
    reason?: string
    remainingReports?: number
    needsUpgrade?: boolean
  }> {
    try {
      const subscriptionInfo = await this.getUserSubscriptionInfo(userId)
      
      if (subscriptionInfo.can_generate_report) {
        return {
          canGenerate: true,
          remainingReports: subscriptionInfo.daily_reports_remaining,
          needsUpgrade: false
        }
      } else {
        let reason = 'No reports remaining'
        let needsUpgrade = true

        if (subscriptionInfo.current_tier === 'Free') {
          reason = 'No free report quota left'
        } else if (subscriptionInfo.daily_reports_remaining === 0) {
          reason = 'Daily report limit reached'
        } else if (subscriptionInfo.monthly_reports_remaining === 0) {
          reason = 'Monthly report limit reached'
        }

        return {
          canGenerate: false,
          reason,
          remainingReports: 0,
          needsUpgrade
        }
      }
    } catch (error) {
      console.error('Error in canUserGenerateReport:', error)
      return {
        canGenerate: false,
        reason: 'Error checking subscription status',
        remainingReports: 0,
        needsUpgrade: true
      }
    }
  }

  /**
   * Get tier comparison data for pricing page
   */
  static async getTierComparison(): Promise<SubscriptionTier[]> {
    try {
      const tiers = await this.getActiveTiers()
      
      // Mark Pro tier as popular
      return tiers.map(tier => ({
        ...tier,
        isPopular: tier.name === 'Pro',
        isRecommended: tier.name === 'Business'
      }))
    } catch (error) {
      console.error('Error in getTierComparison:', error)
      throw error
    }
  }

  /**
   * Calculate additional report cost for a tier
   */
  static calculateAdditionalReportCost(tierName: TierName, quantity: number = 1): number {
    const tierPricing: Record<TierName, number> = {
      'Free': 0,
      'Basic': 2.99,
      'Pro': 1.99,
      'Business': 1.49,
      'Enterprise': 0.99
    }

    return tierPricing[tierName] * quantity
  }

  /**
   * Get feature comparison between tiers
   */
  static getFeatureComparison(): Array<{
    feature: string
    description: string
    tiers: Record<TierName, boolean | string | number>
  }> {
    return [
      {
        feature: 'Daily Reports',
        description: 'Maximum reports per day',
        tiers: {
          'Free': 1,
          'Basic': 5,
          'Pro': 20,
          'Business': 50,
          'Enterprise': 200
        }
      },
      {
        feature: 'AI Analysis',
        description: 'Advanced AI-powered stock analysis',
        tiers: {
          'Free': true,
          'Basic': true,
          'Pro': true,
          'Business': true,
          'Enterprise': true
        }
      },
      {
        feature: 'Email Support',
        description: 'Email customer support',
        tiers: {
          'Free': false,
          'Basic': true,
          'Pro': true,
          'Business': true,
          'Enterprise': true
        }
      },
      {
        feature: 'Priority Support',
        description: 'Priority customer support',
        tiers: {
          'Free': false,
          'Basic': false,
          'Pro': true,
          'Business': true,
          'Enterprise': true
        }
      },
      {
        feature: 'Advanced Analytics',
        description: 'Advanced charts and analytics',
        tiers: {
          'Free': false,
          'Basic': false,
          'Pro': true,
          'Business': true,
          'Enterprise': true
        }
      },
      {
        feature: 'API Access',
        description: 'Programmatic API access',
        tiers: {
          'Free': false,
          'Basic': false,
          'Pro': false,
          'Business': true,
          'Enterprise': true
        }
      },
      {
        feature: 'Custom Reports',
        description: 'Custom report templates',
        tiers: {
          'Free': false,
          'Basic': false,
          'Pro': false,
          'Business': true,
          'Enterprise': true
        }
      }
    ]
  }
}
