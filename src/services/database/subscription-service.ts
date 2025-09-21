import { BaseDatabaseService } from './base-database-service'

export interface SubscriptionTier {
  id: number
  name: string
  daily_report_limit: number
  additional_purchase: number
  monthly_report_limit: number
  price_monthly: number
  features: Record<string, any>
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export class SubscriptionService extends BaseDatabaseService {
  /**
   * Get all active subscription tiers
   */
  async getActiveTiers(): Promise<SubscriptionTier[]> {
    return this.fetchData<SubscriptionTier>(
      'subscription_tiers',
      '*',
      { is_active: true },
      { column: 'price_monthly', ascending: true }
    )
  }

  /**
   * Get subscription tier by ID
   */
  async getTierById(tierId: number): Promise<SubscriptionTier | null> {
    return this.fetchSingle<SubscriptionTier>(
      'subscription_tiers',
      '*',
      { id: tierId, is_active: true }
    )
  }

  /**
   * Get subscription tier by name
   */
  async getTierByName(tierName: string): Promise<SubscriptionTier | null> {
    return this.fetchSingle<SubscriptionTier>(
      'subscription_tiers',
      '*',
      { name: tierName, is_active: true }
    )
  }

  /**
   * Create new subscription tier (admin only)
   */
  async createTier(tierData: Partial<SubscriptionTier>): Promise<SubscriptionTier> {
    return this.insertData<SubscriptionTier>('subscription_tiers', tierData)
  }

  /**
   * Update subscription tier (admin only)
   */
  async updateTier(tierId: number, updates: Partial<SubscriptionTier>): Promise<SubscriptionTier> {
    return this.updateData<SubscriptionTier>('subscription_tiers', { id: tierId }, updates)
  }

  /**
   * Deactivate subscription tier (admin only)
   */
  async deactivateTier(tierId: number): Promise<SubscriptionTier> {
    return this.updateData<SubscriptionTier>(
      'subscription_tiers',
      { id: tierId },
      { is_active: false }
    )
  }

  /**
   * Get tier pricing information
   */
  async getTierPricing(tierId: number): Promise<{
    price_monthly: number
    additional_purchase: number
  } | null> {
    const tier = await this.getTierById(tierId)
    if (!tier) return null

    return {
      price_monthly: tier.price_monthly,
      additional_purchase: tier.additional_purchase
    }
  }

  /**
   * Get tier features
   */
  async getTierFeatures(tierId: number): Promise<Record<string, any> | null> {
    const tier = await this.getTierById(tierId)
    return tier?.features || null
  }

  /**
   * Check if tier has specific feature
   */
  async hasFeature(tierId: number, featureName: string): Promise<boolean> {
    const features = await this.getTierFeatures(tierId)
    return features ? features[featureName] === true : false
  }
}
