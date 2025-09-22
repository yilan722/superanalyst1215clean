import { BaseDatabaseService } from './base-database-service'

export interface Payment {
  id: string
  user_id: string
  amount: number
  currency: string
  type: string
  status: string
  alipay_trade_no: string | null
  alipay_order_id: string | null
  subscription_type: string | null
  report_limit: number | null
  report_id: string | null
  created_at: string
  updated_at: string
}

export class PaymentService extends BaseDatabaseService {
  /**
   * Get all payments for a user
   */
  async getUserPayments(userId: string): Promise<Payment[]> {
    return this.fetchData<Payment>(
      'payments',
      '*',
      { user_id: userId },
      { column: 'created_at', ascending: false }
    )
  }

  /**
   * Get payment by ID
   */
  async getPaymentById(paymentId: string): Promise<Payment | null> {
    return this.fetchSingle<Payment>('payments', '*', { id: paymentId })
  }

  /**
   * Create new payment
   */
  async createPayment(paymentData: {
    user_id: string
    amount: number
    currency?: string
    type: string
    status?: string
    alipay_trade_no?: string | null
    alipay_order_id?: string | null
    subscription_type?: string | null
    report_limit?: number | null
    report_id?: string | null
  }): Promise<Payment> {
    const data = {
      currency: 'CNY',
      status: 'pending',
      ...paymentData
    }
    return this.insertData<Payment>('payments', data)
  }

  /**
   * Update payment status
   */
  async updatePaymentStatus(
    paymentId: string,
    status: string,
    additionalData?: Partial<Payment>
  ): Promise<Payment> {
    const updates: Partial<Payment> = { status, ...additionalData }
    return this.updateData<Payment>('payments', { id: paymentId }, updates)
  }

  /**
   * Get payments by status
   */
  async getPaymentsByStatus(status: string): Promise<Payment[]> {
    return this.fetchData<Payment>(
      'payments',
      '*',
      { status },
      { column: 'created_at', ascending: false }
    )
  }

  /**
   * Get pending payments
   */
  async getPendingPayments(): Promise<Payment[]> {
    return this.getPaymentsByStatus('pending')
  }

  /**
   * Get completed payments
   */
  async getCompletedPayments(): Promise<Payment[]> {
    return this.getPaymentsByStatus('completed')
  }

  /**
   * Get payments by type
   */
  async getPaymentsByType(type: string): Promise<Payment[]> {
    return this.fetchData<Payment>(
      'payments',
      '*',
      { type },
      { column: 'created_at', ascending: false }
    )
  }

  /**
   * Get subscription payments
   */
  async getSubscriptionPayments(): Promise<Payment[]> {
    return this.getPaymentsByType('subscription')
  }

  /**
   * Get pay-per-report payments
   */
  async getPayPerReportPayments(): Promise<Payment[]> {
    return this.getPaymentsByType('pay_per_report')
  }

  /**
   * Get user's total spent amount
   */
  async getUserTotalSpent(userId: string): Promise<number> {
    try {
      const { data, error } = await this.supabase
        .from('payments')
        .select('amount')
        .eq('user_id', userId)
        .eq('status', 'completed')

      if (error) {
        console.error('Error getting user total spent:', error)
        throw new Error(error.message)
      }

      return data.reduce((total, payment) => total + payment.amount, 0)
    } catch (error) {
      console.error('Unexpected error getting user total spent:', error)
      throw error
    }
  }

  /**
   * Get payment statistics
   */
  async getPaymentStats(): Promise<{
    totalPayments: number
    totalRevenue: number
    pendingPayments: number
    completedPayments: number
  }> {
    try {
      const [allPayments, pendingPayments, completedPayments] = await Promise.all([
        this.fetchData<Payment>('payments'),
        this.getPendingPayments(),
        this.getCompletedPayments()
      ])

      const totalRevenue = completedPayments.reduce((total, payment) => total + payment.amount, 0)

      return {
        totalPayments: allPayments.length,
        totalRevenue,
        pendingPayments: pendingPayments.length,
        completedPayments: completedPayments.length
      }
    } catch (error) {
      console.error('Error getting payment stats:', error)
      throw error
    }
  }
}
