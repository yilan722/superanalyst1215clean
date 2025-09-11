import { NextRequest, NextResponse } from 'next/server'
import { validateStripeConfig, SUBSCRIPTION_PLANS } from '@/lib/stripe-config'

export async function GET(request: NextRequest) {
  try {
    // Check environment variables
    const envCheck = {
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      STRIPE_SECRET_KEY: !!process.env.STRIPE_SECRET_KEY,
      STRIPE_WEBHOOK_SECRET: !!process.env.STRIPE_WEBHOOK_SECRET,
      STRIPE_BASIC_PRODUCT_ID: !!process.env.STRIPE_BASIC_PRODUCT_ID,
      STRIPE_BASIC_PRICE_ID: !!process.env.STRIPE_BASIC_PRICE_ID,
      STRIPE_PROFESSIONAL_PRODUCT_ID: !!process.env.STRIPE_PROFESSIONAL_PRODUCT_ID,
      STRIPE_PROFESSIONAL_PRICE_ID: !!process.env.STRIPE_PROFESSIONAL_PRICE_ID,
      STRIPE_BUSINESS_PRODUCT_ID: !!process.env.STRIPE_BUSINESS_PRODUCT_ID,
      STRIPE_BUSINESS_PRICE_ID: !!process.env.STRIPE_BUSINESS_PRICE_ID,
    }

    // Try to validate config
    let configError = null
    try {
      validateStripeConfig()
    } catch (error) {
      configError = error instanceof Error ? error.message : 'Unknown error'
    }

    // Check subscription plans
    const plans = Object.keys(SUBSCRIPTION_PLANS).map(key => ({
      id: key,
      name: SUBSCRIPTION_PLANS[key as keyof typeof SUBSCRIPTION_PLANS].name,
      stripePriceId: SUBSCRIPTION_PLANS[key as keyof typeof SUBSCRIPTION_PLANS].stripePriceId,
    }))

    return NextResponse.json({
      success: true,
      environment: process.env.NODE_ENV,
      envCheck,
      configError,
      plans,
      timestamp: new Date().toISOString(),
    })

  } catch (error) {
    console.error('Error in test-config:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
