import { PaymentService } from './payment-service'
import { ReportService } from './report-service'
import { SubscriptionService } from './subscription-service'
import { UserService } from './user-service'

// Export all database services
export { BaseDatabaseService } from './base-database-service'
export { UserService } from './user-service'
export { SubscriptionService } from './subscription-service'
export { ReportService } from './report-service'
export { PaymentService } from './payment-service'

// Export types
export type { User, UserWithSubscription } from './user-service'
export type { SubscriptionTier } from './subscription-service'
export type { Report, ReportWithUser } from './report-service'
export type { Payment } from './payment-service'

// Create singleton instances for easy use
export const userService = new UserService()
export const subscriptionService = new SubscriptionService()
export const reportService = new ReportService()
export const paymentService = new PaymentService()
