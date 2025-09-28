import { ServerDatabaseService } from '@/app/services/database/server-database-service'

export interface User {
  id: string
  email: string
  name: string | null
  created_at: string
  updated_at: string
  free_reports_used: number
  paid_reports_used: number
  subscription_id: number | null
  subscription_start: string | null
  subscription_end: string | null
}

export interface UserWithSubscription extends User {
  subscription_tiers?: {
    id: number
    name: string
    monthly_report_limit: number
    price_monthly: number
    features: Record<string, any>
  } | null
}

export class ServerUserService extends ServerDatabaseService {
  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<User | null> {
    return this.fetchSingle<User>('users', '*', { id: userId })
  }

  /**
   * Get user with subscription tier information
   */
  async getUserWithSubscription(userId: string): Promise<UserWithSubscription | null> {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .select(`
          *,
          subscription_tiers!subscription_id(
            id,
            name,
            monthly_report_limit,
            price_monthly,
            features
          )
        `)
        .eq('id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null
        }
        console.error('Error fetching user with subscription:', error)
        throw new Error(error.message)
      }

      return data as UserWithSubscription
    } catch (error) {
      console.error('Unexpected error fetching user with subscription:', error)
      throw error
    }
  }

  /**
   * Create new user
   */
  async createUser(userData: Partial<User>): Promise<User> {
    return this.insertData<User>('users', userData)
  }

  /**
   * Update user
   */
  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    return this.updateData<User>('users', { id: userId }, updates)
  }

  /**
   * Update user's subscription information
   */
  async updateUserSubscription(
    userId: string,
    subscriptionData: {
      subscription_id?: number | null
      subscription_type?: number | null
      subscription_start?: string | null
      subscription_end?: string | null
      monthly_report_limit?: number
    }
  ): Promise<User> {
    return this.updateData<User>('users', { id: userId }, subscriptionData)
  }

  /**
   * Increment user's report usage
   */
  async incrementReportUsage(
    userId: string,
    type: 'free' | 'paid' = 'free'
  ): Promise<User> {
    const user = await this.getUserById(userId)
    if (!user) {
      throw new Error('User not found')
    }

    const updates: Partial<User> = {}
    if (type === 'free') {
      updates.free_reports_used = user.free_reports_used + 1
    } else {
      updates.paid_reports_used = user.paid_reports_used + 1
    }

    return this.updateData<User>('users', { id: userId }, updates)
  }

  /**
   * Get all users (admin only)
   */
  async getAllUsers(): Promise<User[]> {
    return this.fetchData<User>('users', '*', undefined, { column: 'created_at', ascending: false })
  }

  /**
   * Delete user
   */
  async deleteUser(userId: string): Promise<boolean> {
    return this.deleteData('users', { id: userId })
  }
}
