

import { SubscriptionService } from './database/subscription-service'
import { UserService } from './database/user-service'
import { UserWithSubscription } from './database/user-service'

// Create instances
const userService = new UserService()
const subscriptionService = new SubscriptionService()

export interface SubscriptionStatus {
  name: string
  color: string
  bgColor: string
  description: string
}

export interface SubscriptionMetrics {
  isSubscriptionActive: boolean
  monthlyReportLimit: number
  paidReportsUsed: number
  freeReportsUsed: number
  totalReportsUsed: number
  reportsRemaining: number
  reportUsagePercentage: number
}

export class SubscriptionPageService {
  /**
   * Fetch user data with subscription tier information
   */
  static async fetchUserSubscriptionData(userId: string): Promise<UserWithSubscription | null> {
    return userService.getUserWithSubscription(userId)
  }

  /**
   * Get subscription status information
   */
  static async getSubscriptionStatus(userData: UserWithSubscription | null, locale: string): Promise<SubscriptionStatus> {
    let subscriptionTier = null;
    
    if (userData?.subscription_id) {
      subscriptionTier = await SubscriptionService.getTierById(userData.subscription_id);
    }
    if (userData?.subscription_id === 3) {
      return {
        name: locale === 'zh' ? '免费用户' : 'Free User',
        color: 'text-slate-500',
        bgColor: 'bg-slate-100',
        description: locale === 'zh' ? '您目前是免费用户。' : 'You are currently on the Free plan.'
      }
    }

    // Check if subscription is still active
    if (userData?.subscription_end) {
      const endDate = new Date(userData.subscription_end)
      const isActive = endDate > new Date()
      
      if (!isActive) {
        return {
          name: locale === 'zh' ? '订阅已过期' : 'Subscription Expired',
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          description: locale === 'zh' ? '您的订阅已过期，请续费。' : 'Your subscription has expired. Please renew.'
        }
      }
    }

    // Use the tier name from the database
    const tierId = subscriptionTier?.id ?? 'unknown'


    switch (tierId) {
      case 3:
        return {
          name: locale === 'zh' ? '免费用户' : 'Free User',
          color: 'text-slate-500',
          bgColor: 'bg-slate-100',
          description: locale === 'zh' ? '您目前是免费用户。' : 'You are currently on the Free plan.'
        }
      case 4:
        return {
          name: locale === 'zh' ? '基础会员' : 'Basic Member',
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
          description: locale === 'zh' ? '享受基础报告功能。' : 'Access to basic report features.'
        }
      case 5:
        return {
          name: locale === 'zh' ? '专业会员' : 'Pro Member',
          color: 'text-purple-600',
          bgColor: 'bg-purple-100',
          description: locale === 'zh' ? '解锁更多高级分析。' : 'Unlock more advanced analytics.'
        }
      case 6:
        return {
          name: locale === 'zh' ? '企业会员' : 'Business Member',
          color: 'text-amber-600',
          bgColor: 'bg-amber-100',
          description: locale === 'zh' ? '获得所有企业级功能。' : 'Gain access to all enterprise-grade features.'
        }
      case 7:
        return {
          name: locale === 'zh' ? '企业会员' : 'Enterprise Member',
          color: 'text-emerald-600',
          bgColor: 'bg-emerald-100',
          description: locale === 'zh' ? '获得所有企业级功能。' : 'Gain access to all enterprise-grade features.'
        }
      default:
        return {
          name: locale === 'zh' ? '未知会员' : 'Unknown Member',
          color: 'text-slate-500',
          bgColor: 'bg-slate-100',
          description: locale === 'zh' ? '您的会员状态未知。' : 'Your membership status is unknown.'
        }
    }
  }

  /**
   * Calculate subscription metrics
   */
  static async calculateSubscriptionMetrics(userData: UserWithSubscription | null): Promise<SubscriptionMetrics> {
    
    // Check if subscription is active
    const isSubscriptionActive = userData?.subscription_id && userData?.subscription_end && 
      new Date(userData.subscription_end) > new Date()
    
    // Get subscription tier data
    let subscriptionTier = null;
    if (userData?.subscription_id) {
      subscriptionTier = await SubscriptionService.getTierById(userData.subscription_id);
    }
    
    // Get monthly report limit from subscription_tiers table (only if subscription is active)
    
    const monthlyReportLimit = subscriptionTier?.monthly_report_limit || 0

    const paidReportsUsed = userData?.paid_reports_used || 0
    const freeReportsUsed = userData?.free_reports_used || 0
    const totalReportsUsed = paidReportsUsed + freeReportsUsed
    
    // For free users or expired subscriptions, use free report logic
    const reportsRemaining = isSubscriptionActive 
      ? Math.max(0, (monthlyReportLimit || 0) - totalReportsUsed)
      : Math.max(0, 1 - freeReportsUsed) // Free users get 1 report
    
    const reportUsagePercentage = isSubscriptionActive && monthlyReportLimit > 0 
      ? (totalReportsUsed / monthlyReportLimit) * 100 
      : (freeReportsUsed / 1) * 100 // Free users: percentage of 1 report used

    return {
      isSubscriptionActive: isSubscriptionActive || false,
      monthlyReportLimit,
      paidReportsUsed,
      freeReportsUsed,
      totalReportsUsed,
      reportsRemaining,
      reportUsagePercentage
    }
  }

  /**
   * Cancel user subscription
   */
  static async cancelSubscription(subscriptionId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // This would typically call your payment provider's API (Stripe, etc.)
      // For now, we'll just return a success response
      console.log('Cancelling subscription:', subscriptionId)
      
      // TODO: Implement actual subscription cancellation logic
      // This might involve:
      // 1. Calling Stripe API to cancel the subscription
      // 2. Updating the user's subscription status in the database
      // 3. Sending confirmation email
      
      return { success: true }
    } catch (error) {
      console.error('Error cancelling subscription:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  /**
   * Get subscription tier details for display
   */
  static getSubscriptionTierDetails(userData: UserWithSubscription | null) {
    const subscriptionTier = userData?.subscription_tiers
    
    if (!userData?.subscription_id || !subscriptionTier) {
      return null
    }

    return {
      name: subscriptionTier.name,
      monthlyReportLimit: subscriptionTier.monthly_report_limit,
      priceMonthly: subscriptionTier.price_monthly,
      features: subscriptionTier.features,
      subscriptionEnd: userData.subscription_end
    }
  }

  /**
   * Get all available subscription tiers
   */
  static async getAvailableTiers() {
    return SubscriptionService.getActiveTiers()
  }

  /**
   * Get tier by ID
   */
  static async getTierById(tierId: number) {
    return SubscriptionService.getTierById(tierId)
  }
}