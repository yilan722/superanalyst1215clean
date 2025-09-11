import { NextRequest, NextResponse } from 'next/server'
import { createApiSupabaseClient } from '@/lib/supabase-server'
import { stripe, SUBSCRIPTION_PLANS, validateStripeConfig } from '@/lib/stripe-config'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const debugSteps: any[] = []
  
  try {
    // Step 1: Check Stripe configuration
    debugSteps.push({
      step: 1,
      name: 'Stripe Configuration Check',
      status: 'running'
    })
    
    try {
      validateStripeConfig()
      debugSteps.push({
        step: 1,
        name: 'Stripe Configuration Check',
        status: 'success',
        details: {
          stripeInitialized: !!stripe,
          plansCount: Object.keys(SUBSCRIPTION_PLANS).length
        }
      })
    } catch (configError) {
      debugSteps.push({
        step: 1,
        name: 'Stripe Configuration Check',
        status: 'error',
        error: configError instanceof Error ? configError.message : 'Unknown error'
      })
      return NextResponse.json({ debugSteps })
    }

    // Step 2: Check authentication
    debugSteps.push({
      step: 2,
      name: 'Authentication Check',
      status: 'running'
    })
    
    const supabase = createApiSupabaseClient(request)
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      debugSteps.push({
        step: 2,
        name: 'Authentication Check',
        status: 'error',
        error: authError?.message || 'No user found'
      })
      return NextResponse.json({ debugSteps })
    }
    
    debugSteps.push({
      step: 2,
      name: 'Authentication Check',
      status: 'success',
      details: {
        userId: user.id,
        userEmail: user.email,
        userCreatedAt: user.created_at
      }
    })

    // Step 3: Check user data in database
    debugSteps.push({
      step: 3,
      name: 'Database User Check',
      status: 'running'
    })
    
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email, subscriptionId, subscriptionType, subscriptionEnd')
      .eq('id', user.id)
      .single()
    
    if (userError) {
      debugSteps.push({
        step: 3,
        name: 'Database User Check',
        status: 'error',
        error: userError.message,
        code: userError.code,
        details: {
          isUserNotFound: userError.code === 'PGRST116'
        }
      })
      
      // If user not found, try to create them
      if (userError.code === 'PGRST116') {
        debugSteps.push({
          step: 3.1,
          name: 'Create Missing User',
          status: 'running'
        })
        
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
          debugSteps.push({
            step: 3.1,
            name: 'Create Missing User',
            status: 'error',
            error: createError.message
          })
          return NextResponse.json({ debugSteps })
        }
        
        debugSteps.push({
          step: 3.1,
          name: 'Create Missing User',
          status: 'success',
          details: {
            userId: user.id
          }
        })
      } else {
        return NextResponse.json({ debugSteps })
      }
    } else {
      debugSteps.push({
        step: 3,
        name: 'Database User Check',
        status: 'success',
        details: {
          userId: userData.id,
          userEmail: userData.email,
          hasSubscription: !!userData.subscriptionId
        }
      })
    }

    // Step 4: Check plan validation
    debugSteps.push({
      step: 4,
      name: 'Plan Validation',
      status: 'running'
    })
    
    const { planId } = await request.json()
    const plan = SUBSCRIPTION_PLANS[planId as keyof typeof SUBSCRIPTION_PLANS]
    
    if (!plan) {
      debugSteps.push({
        step: 4,
        name: 'Plan Validation',
        status: 'error',
        error: 'Invalid plan ID',
        details: {
          requestedPlanId: planId,
          availablePlans: Object.keys(SUBSCRIPTION_PLANS)
        }
      })
      return NextResponse.json({ debugSteps })
    }
    
    debugSteps.push({
      step: 4,
      name: 'Plan Validation',
      status: 'success',
      details: {
        planId: plan.id,
        planName: plan.name,
        stripePriceId: plan.stripePriceId
      }
    })

    // Step 5: Check Stripe session creation
    debugSteps.push({
      step: 5,
      name: 'Stripe Session Creation',
      status: 'running'
    })
    
    if (!stripe) {
      debugSteps.push({
        step: 5,
        name: 'Stripe Session Creation',
        status: 'error',
        error: 'Stripe not initialized'
      })
      return NextResponse.json({ debugSteps })
    }
    
    try {
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
        success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/cancel`,
        subscription_data: {
          metadata: {
            userId: user.id,
            planId: plan.id,
            planName: plan.name,
          },
        },
      })
      
      debugSteps.push({
        step: 5,
        name: 'Stripe Session Creation',
        status: 'success',
        details: {
          sessionId: session.id,
          sessionUrl: session.url
        }
      })
      
      return NextResponse.json({
        success: true,
        sessionId: session.id,
        url: session.url,
        debugSteps
      })
      
    } catch (stripeError) {
      debugSteps.push({
        step: 5,
        name: 'Stripe Session Creation',
        status: 'error',
        error: stripeError instanceof Error ? stripeError.message : 'Unknown Stripe error',
        details: {
          stripeErrorType: stripeError instanceof Error ? stripeError.constructor.name : 'Unknown'
        }
      })
      return NextResponse.json({ debugSteps })
    }

  } catch (error) {
    debugSteps.push({
      step: 'error',
      name: 'Unexpected Error',
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      details: {
        errorType: error instanceof Error ? error.constructor.name : 'Unknown'
      }
    })
    
    return NextResponse.json({ debugSteps })
  }
}
