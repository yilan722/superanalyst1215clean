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
    
    // Check for Authorization header first
    const authHeader = request.headers.get('authorization')
    console.log('Authorization header:', authHeader)
    
    let user = null
    let authError = null
    
    // Always use cookie-based authentication for consistency
    console.log('Using cookie-based auth')
    const supabase = createApiSupabaseClient(request)
    const { data: { user: cookieUser }, error: cookieError } = await supabase.auth.getUser()
    user = cookieUser
    authError = cookieError
    
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
    // Use the same Supabase client for database operations
    console.log('Fetching user data for user ID:', user.id)
    
    let userData = null
    const { data: fetchedUserData, error: userError } = await supabase
      .from('users')
      .select('subscriptionId, subscriptionType, subscriptionEnd')
      .eq('id', user.id)
      .single()
    
    console.log('User data fetch result:', { fetchedUserData, userError })

    if (userError) {
      console.error('Error fetching user data:', userError)
      
      // If user doesn't exist in database, create them
      if (userError.code === 'PGRST116') {
        console.log('User not found in database, creating user record...')
        const { error: createError } = await supabase
          .from('users')
          .insert({
            id: user.id,
            email: user.email!,
            name: user.user_metadata?.name || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            free_reports_used: 0,
            paid_reports_used: 0,
            monthly_report_limit: 0
          })
        
        if (createError) {
          console.error('Error creating user:', createError)
          return NextResponse.json(
            { error: 'Failed to create user record' },
            { status: 500 }
          )
        }
        
        console.log('User created successfully')
        // Set userData to empty object since user was just created
        userData = { subscriptionId: null, subscriptionType: null, subscriptionEnd: null }
      } else {
        return NextResponse.json(
          { error: 'Failed to fetch user data' },
          { status: 500 }
        )
      }
    } else {
      userData = fetchedUserData
    }

    // Verify userData is set
    if (!userData) {
      console.error('userData is null after processing')
      return NextResponse.json(
        { error: 'Failed to process user data' },
        { status: 500 }
      )
    }
    
    console.log('Final userData:', userData)
    
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
    console.log('Plan details:', {
      id: plan.id,
      name: plan.name,
      stripeProductId: plan.stripeProductId,
      stripePriceId: plan.stripePriceId
    })
    
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
      success_url: successUrl || `${process.env.NEXT_PUBLIC_BASE_URL || 'https://top-analyst-5-axl3ghjzx-yilans-projects.vercel.app'}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_BASE_URL || 'https://top-analyst-5-axl3ghjzx-yilans-projects.vercel.app'}/payment/cancel`,
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
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    })
    return NextResponse.json(
      { 
        error: 'Failed to create checkout session',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

