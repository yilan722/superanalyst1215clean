import { NextRequest, NextResponse } from 'next/server'
import { stripe, SUBSCRIPTION_PLANS, validateStripeConfig } from '@/lib/stripe-config'
import { createApiSupabaseClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    console.log('Creating checkout session...')
    
    // Validate Stripe configuration
    try {
      validateStripeConfig()
      console.log('Stripe config validation passed')
    } catch (configError) {
      console.error('Stripe config validation failed:', configError)
      return NextResponse.json(
        { error: `Configuration error: ${configError instanceof Error ? configError.message : 'Unknown error'}` },
        { status: 500 }
      )
    }

    // Debug: Log all request headers
    console.log('Request headers:', Object.fromEntries(request.headers.entries()))
    
    const supabase = createApiSupabaseClient(request)
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    console.log('API Auth check - User:', user ? 'Found' : 'Not found')
    console.log('API Auth check - Error:', authError)
    console.log('API Auth check - User ID:', user?.id)
    console.log('API Auth check - User Email:', user?.email)
    
    if (authError || !user) {
      console.log('Authentication failed in API route')
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { planId, successUrl, cancelUrl } = await request.json()
    console.log('Request data:', { planId, successUrl, cancelUrl })

    if (!planId) {
      return NextResponse.json(
        { error: 'Plan ID is required' },
        { status: 400 }
      )
    }

    // Get plan details
    const plan = SUBSCRIPTION_PLANS[planId as keyof typeof SUBSCRIPTION_PLANS]
    console.log('Plan details:', plan)
    if (!plan) {
      return NextResponse.json(
        { error: 'Invalid plan ID' },
        { status: 400 }
      )
    }

    // Check if user already has an active subscription
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('subscriptionId, subscriptionType, subscriptionEnd')
      .eq('id', user.id)
      .single()

    if (userError) {
      console.error('Error fetching user data:', userError)
      return NextResponse.json(
        { error: 'Failed to fetch user data' },
        { status: 500 }
      )
    }

    // If user has an active subscription, return error
    if (userData?.subscriptionId && userData?.subscriptionEnd) {
      const subscriptionEnd = new Date(userData.subscriptionEnd)
      if (subscriptionEnd > new Date()) {
        return NextResponse.json(
          { error: 'User already has an active subscription' },
          { status: 400 }
        )
      }
    }

    // Check if Stripe is initialized
    if (!stripe) {
      console.error('Stripe not initialized')
      return NextResponse.json(
        { error: 'Stripe not initialized' },
        { status: 500 }
      )
    }

    console.log('Creating Stripe checkout session with plan:', plan.stripePriceId)
    
    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: plan.stripePriceId,
          quantity: 1,
        },
      ],
      customer_email: user.email,
      metadata: {
        userId: user.id,
        planId: plan.id,
        planName: plan.name,
      },
      success_url: successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/payment/cancel`,
      subscription_data: {
        metadata: {
          userId: user.id,
          planId: plan.id,
          planName: plan.name,
        },
      },
    })

    console.log('Checkout session created successfully:', session.id)
    
    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    })

  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}

