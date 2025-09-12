import Stripe from 'stripe'

// Stripe configuration
export const STRIPE_CONFIG = {
  // Use test mode for development, live mode for production
  testMode: process.env.NODE_ENV === 'development',
  
  // API Keys
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
  secretKey: process.env.STRIPE_SECRET_KEY!,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
  
  // Currency
  currency: 'usd',
  
  // Success and cancel URLs
  successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
  cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payment/cancel`,
}

// Initialize Stripe (only on server side)
export const stripe = typeof window === 'undefined' && STRIPE_CONFIG.secretKey 
  ? new Stripe(STRIPE_CONFIG.secretKey, {
      apiVersion: '2024-06-20',
      typescript: true,
    })
  : null

// Subscription plans configuration
export const SUBSCRIPTION_PLANS = {
  basic: {
    id: 'basic',
    name: 'Basic',
    description: 'Perfect for individual investors',
    price: 49,
    currency: 'usd',
    interval: 'month',
    features: [
      '5 reports per month',
      'Basic analysis features',
      'Email support',
      'Standard data access'
    ],
    reportLimit: 5,
    stripeProductId: process.env.STRIPE_BASIC_PRODUCT_ID || 'prod_T1gZyugkH04dyS',
    stripePriceId: process.env.STRIPE_BASIC_PRICE_ID || 'price_1S5dCKKLGxHQJ0LDACeVCNU7',
  },
  professional: {
    id: 'professional',
    name: 'Professional',
    description: 'Ideal for active traders and analysts',
    price: 299,
    currency: 'usd',
    interval: 'month',
    features: [
      '30 reports per month',
      'Advanced analysis tools',
      'Priority support',
      'Extended data access',
      'Custom alerts'
    ],
    reportLimit: 30,
    stripeProductId: process.env.STRIPE_PROFESSIONAL_PRODUCT_ID || 'prod_T23xvs4H0ALIaH',
    stripePriceId: process.env.STRIPE_PROFESSIONAL_PRICE_ID || 'price_1S5zpjKLGxHQJ0LDvIbzHLOE',
  },
  business: {
    id: 'business',
    name: 'Business',
    description: 'Comprehensive solution for teams and institutions',
    price: 599,
    currency: 'usd',
    interval: 'month',
    features: [
      'Unlimited reports',
      'All analysis features',
      'Dedicated support',
      'Full data access',
      'Team collaboration',
      'API access',
      'Custom integrations'
    ],
    reportLimit: -1, // -1 means unlimited
    stripeProductId: process.env.STRIPE_BUSINESS_PRODUCT_ID || 'prod_T244cJ11xB8CSn',
    stripePriceId: process.env.STRIPE_BUSINESS_PRICE_ID || 'price_1S5zwGKLGxHQJ0LDpyl5vNWr',
  }
}

// Get plan by ID
export function getPlanById(planId: string) {
  return Object.values(SUBSCRIPTION_PLANS).find(plan => plan.id === planId)
}

// Get all plans
export function getAllPlans() {
  return Object.values(SUBSCRIPTION_PLANS)
}

// Validate Stripe configuration
export function validateStripeConfig() {
  const requiredEnvVars = [
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'STRIPE_BASIC_PRODUCT_ID',
    'STRIPE_BASIC_PRICE_ID',
    'STRIPE_PROFESSIONAL_PRODUCT_ID',
    'STRIPE_PROFESSIONAL_PRICE_ID',
    'STRIPE_BUSINESS_PRODUCT_ID',
    'STRIPE_BUSINESS_PRICE_ID',
  ]

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName])
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`)
  }
}
