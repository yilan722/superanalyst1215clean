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
    
    // Check for cookies
    const cookieHeader = request.headers.get('cookie')
    console.log('Cookie header:', cookieHeader)
    
    let user = null
    let authError = null
    
    // Try both cookie-based and header-based authentication
    const supabase = createApiSupabaseClient(request)
    
    // First try cookie-based auth
    const { data: { user: cookieUser }, error: cookieError } = await supabase.auth.getUser()
    console.log('Cookie auth result:', { cookieUser: cookieUser?.id, cookieError })
    
    if (cookieUser && !cookieError) {
      console.log('Using cookie-based auth')
      user = cookieUser
      authError = cookieError
    } else if (authHeader && authHeader.startsWith('Bearer ')) {
      console.log('Using header-based auth')
      // Try to get user from the access token
      const { data: { user: headerUser }, error: headerError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
      console.log('Header auth result:', { headerUser: headerUser?.id, headerError })
      user = headerUser
      authError = headerError
    } else {
      console.log('No valid authentication method found')
      console.log('Cookie error details:', cookieError)
      user = null
      authError = new Error('No authentication provided')
    }
    
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

    const { planId, successUrl, cancelUrl, couponCode } = await request.json()
    console.log('Request data:', { planId, successUrl, cancelUrl, couponCode })

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
      .select('subscription_id, subscription_type, subscription_end')
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
        userData = { subscription_id: null, subscription_type: null, subscription_end: null }
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
    console.log('🔍 订阅检查详情:')
    console.log('  - subscription_id:', userData?.subscription_id)
    console.log('  - subscription_end:', userData?.subscription_end)
    console.log('  - subscription_type:', userData?.subscription_type)
    
    if (userData?.subscription_id && userData?.subscription_end) {
      console.log('❌ 用户有订阅ID和结束时间，检查是否有效')
      const subscriptionEnd = new Date(userData.subscription_end)
      const now = new Date()
      console.log('  - 订阅结束时间:', subscriptionEnd.toISOString())
      console.log('  - 当前时间:', now.toISOString())
      console.log('  - 订阅是否有效:', subscriptionEnd > now)
      
      if (subscriptionEnd > new Date()) {
        console.log('❌ 订阅有效，阻止重复订阅')
        return NextResponse.json(
          { error: 'User already has an active subscription' },
          { status: 400 }
        )
      } else {
        console.log('✅ 订阅已过期，允许重新订阅')
      }
    } else {
      console.log('✅ 用户没有订阅，允许订阅')
    }

    // Validate coupon if provided
    let couponValidation = null
    if (couponCode) {
      console.log('Validating coupon:', couponCode)
      
      // 简化的coupon验证逻辑
      const validCoupons = {
        'WELCOME20': { discount_amount: 20, description: 'Welcome discount - $20 off' },
        'LIUYILAN20': { discount_amount: 20, description: 'Special discount for liuyilan72@outlook.com - $20 off' },
        'LIUYILAN45A': { discount_amount: 45, description: 'Premium discount for liuyilan72@outlook.com - $45 off (Coupon A)' },
        'LIUYILAN45B': { discount_amount: 45, description: 'Premium discount for liuyilan72@outlook.com - $45 off (Coupon B)' },
        'LIUYILAN45C': { discount_amount: 45, description: 'Premium discount for liuyilan72@outlook.com - $45 off (Coupon C)' }
      }
      
      const coupon = validCoupons[couponCode.toUpperCase() as keyof typeof validCoupons]
      
      if (!coupon) {
        return NextResponse.json(
          { error: 'Invalid coupon code' },
          { status: 400 }
        )
      }
      
      // 检查最低订单金额
      if (plan.price < 49) {
        return NextResponse.json(
          { error: 'Order amount is below minimum requirement' },
          { status: 400 }
        )
      }
      
      // 计算最终金额
      const finalAmount = Math.max(0, plan.price - coupon.discount_amount)
      
      couponValidation = {
        valid: true,
        code: couponCode.toUpperCase(),
        description: coupon.description,
        discount_amount: coupon.discount_amount,
        final_amount: finalAmount,
        coupon_id: couponCode.toUpperCase(),
        discount_type: 'fixed_amount' // 添加discount_type字段
      }
      
      console.log('Coupon validation successful:', couponValidation)
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
    
    // Create or retrieve Stripe customer
    let customer
    try {
      // First, try to find existing customer by email
      const existingCustomers = await stripe.customers.list({
        email: user.email,
        limit: 1
      })
      
      if (existingCustomers.data.length > 0) {
        customer = existingCustomers.data[0]
        console.log('Found existing customer:', customer.id)
      } else {
        // Create new customer
        customer = await stripe.customers.create({
          email: user.email,
          name: (user as any).name || user.email,
          metadata: {
            userId: user.id,
          }
        })
        console.log('Created new customer:', customer.id)
      }
    } catch (error) {
      console.error('Error creating/finding customer:', error)
      return NextResponse.json(
        { error: 'Failed to create customer' },
        { status: 500 }
      )
    }

    // Prepare checkout session data
    const sessionData: any = {
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: plan.stripePriceId,
          quantity: 1,
        },
      ],
      customer: customer.id, // Use customer ID instead of customer_email
      metadata: {
        userId: user.id,
        userEmail: user.email, // Store email in metadata as backup
        planId: plan.id,
        planName: plan.name,
      },
      success_url: successUrl || `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3002'}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3002'}/payment/cancel`,
      subscription_data: {
        metadata: {
          userId: user.id,
          userEmail: user.email,
          planId: plan.id,
          planName: plan.name,
        },
      },
    }
    
    // Add coupon if validated
    if (couponValidation) {
      console.log('🎯 Applying coupon to Stripe session:', couponValidation)
      sessionData.metadata.couponCode = couponCode
      sessionData.metadata.couponId = couponValidation.coupon_id
      sessionData.metadata.discountAmount = couponValidation.discount_amount
      sessionData.metadata.finalAmount = couponValidation.final_amount
      
      // For fixed amount discounts, we need to create a custom price
      if (couponValidation.discount_type === 'fixed_amount') {
        console.log('🎯 Creating custom Stripe price with discount...')
        console.log('Original price:', plan.price, 'Discount:', couponValidation.discount_amount, 'Final:', couponValidation.final_amount)
        
        // Create a custom price with discount
        const customPrice = await stripe.prices.create({
          unit_amount: Math.round(couponValidation.final_amount * 100), // Convert to cents
          currency: 'usd',
          product: plan.stripeProductId,
          recurring: {
            interval: 'month',
          },
          metadata: {
            original_price_id: plan.stripePriceId,
            coupon_code: couponCode,
            discount_amount: couponValidation.discount_amount.toString(),
          },
        })
        
        sessionData.line_items[0].price = customPrice.id
        console.log('✅ Created custom price with discount:', customPrice.id, 'Amount:', customPrice.unit_amount)
      }
    }
    
    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create(sessionData)

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

