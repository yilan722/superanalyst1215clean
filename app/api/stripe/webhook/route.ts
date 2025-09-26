import { NextRequest, NextResponse } from 'next/server'
import { stripe, STRIPE_CONFIG, SUBSCRIPTION_PLANS } from '@/app/services/stripe-config'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

// Create Supabase client with service role key for webhook operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      console.error('No Stripe signature found')
      return NextResponse.json(
        { error: 'No signature found' },
        { status: 400 }
      )
    }

    // Check if Stripe is initialized
    if (!stripe) {
      console.error('Stripe not initialized')
      return NextResponse.json(
        { error: 'Stripe not initialized' },
        { status: 500 }
      )
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test_webhook_secret'
      )
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    console.log('Processing webhook event:', event.type)

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session)
        break

      case 'checkout.session.expired':
        await handleCheckoutSessionExpired(event.data.object as Stripe.Checkout.Session)
        break

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice)
        break

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice)
        break

      case 'invoice.payment_action_required':
        await handleInvoicePaymentActionRequired(event.data.object as Stripe.Invoice)
        break

      case 'customer.created':
        await handleCustomerCreated(event.data.object as Stripe.Customer)
        break

      case 'customer.updated':
        await handleCustomerUpdated(event.data.object as Stripe.Customer)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log('🔄 Processing checkout session completed:', session.id)
  console.log('📧 Customer email:', session.customer_details?.email)
  console.log('📋 Session metadata:', session.metadata)
  
  const userId = session.metadata?.userId
  const planId = session.metadata?.planId
  const userEmail = session.metadata?.userEmail || session.customer_details?.email

  if (!userId || !planId) {
    console.error('❌ Missing metadata in checkout session:', { 
      userId, 
      planId, 
      userEmail,
      allMetadata: session.metadata 
    })
    return
  }

  // Get subscription details
  if (!stripe) {
    console.error('❌ Stripe not initialized in webhook')
    return
  }
  
  try {
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
    console.log('📊 Retrieved subscription:', subscription.id)
    
    // Update user subscription in database
    const updateResult = await updateUserSubscription(userId, {
      subscriptionId: subscription.id,
      subscriptionType: planId,
      subscriptionStart: new Date().toISOString(),
      subscriptionEnd: new Date((subscription as any).current_period_end * 1000).toISOString(),
      monthlyReportLimit: SUBSCRIPTION_PLANS[planId as keyof typeof SUBSCRIPTION_PLANS]?.reportLimit || 0,
    })

    console.log('✅ User subscription updated successfully:', { 
      userId, 
      planId, 
      userEmail,
      updateResult 
    })
  } catch (error) {
    console.error('❌ Error processing checkout session:', error)
    throw error
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log('Processing subscription created:', subscription.id)
  
  const userId = subscription.metadata?.userId
  const planId = subscription.metadata?.planId

  if (!userId || !planId) {
    console.error('Missing metadata in subscription:', { userId, planId })
    return
  }

  // Update user subscription in database
  await updateUserSubscription(userId, {
    subscriptionId: subscription.id,
    subscriptionType: planId,
    subscriptionStart: new Date().toISOString(),
    subscriptionEnd: new Date((subscription as any).current_period_end * 1000).toISOString(),
    monthlyReportLimit: SUBSCRIPTION_PLANS[planId as keyof typeof SUBSCRIPTION_PLANS]?.reportLimit || 0,
  })

  console.log('Subscription created and user updated:', { userId, planId })
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('Processing subscription updated:', subscription.id)
  
  const userId = subscription.metadata?.userId
  const planId = subscription.metadata?.planId

  if (!userId || !planId) {
    console.error('Missing metadata in subscription:', { userId, planId })
    return
  }

  // Update subscription end date
  await updateUserSubscription(userId, {
    subscriptionId: subscription.id,
    subscriptionType: planId,
    subscriptionEnd: new Date((subscription as any).current_period_end * 1000).toISOString(),
    monthlyReportLimit: SUBSCRIPTION_PLANS[planId as keyof typeof SUBSCRIPTION_PLANS]?.reportLimit || 0,
  })

  console.log('Subscription updated:', { userId, planId })
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('Processing subscription deleted:', subscription.id)
  
  const userId = subscription.metadata?.userId

  if (!userId) {
    console.error('Missing userId in subscription metadata')
    return
  }

  // Remove subscription from user
  await updateUserSubscription(userId, {
    subscriptionId: null,
    subscriptionType: null,
    subscriptionStart: null,
    subscriptionEnd: null,
    monthlyReportLimit: 0,
  })

  console.log('Subscription removed from user:', userId)
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('Processing invoice payment succeeded:', invoice.id)
  
  if (!stripe) {
    console.error('Stripe not initialized in handleInvoicePaymentSucceeded')
    return
  }
  
  if ((invoice as any).subscription) {
    const subscription = await stripe.subscriptions.retrieve((invoice as any).subscription as string)
    const userId = subscription.metadata?.userId
    const planId = subscription.metadata?.planId

    if (userId && planId) {
      // Update subscription end date
      await updateUserSubscription(userId, {
        subscriptionEnd: new Date((subscription as any).current_period_end * 1000).toISOString(),
      })

      console.log('Invoice payment succeeded, subscription renewed:', { userId, planId })
    }
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  console.log('Processing invoice payment failed:', invoice.id)
  
  if (!stripe) {
    console.error('Stripe not initialized in handleInvoicePaymentFailed')
    return
  }
  
  if ((invoice as any).subscription) {
    const subscription = await stripe.subscriptions.retrieve((invoice as any).subscription as string)
    const userId = subscription.metadata?.userId

    if (userId) {
      // Optionally handle payment failure (e.g., send notification, suspend account)
      console.log('Payment failed for user:', userId)
      
      // You might want to send an email notification here
      // or implement a grace period before suspending the account
    }
  }
}

async function updateUserSubscription(
  userId: string, 
  updates: {
    subscriptionId?: string | null
    subscriptionType?: string | null
    subscriptionStart?: string | null
    subscriptionEnd?: string | null
    monthlyReportLimit?: number
  }
) {
  try {
    console.log('🔄 Updating user subscription:', { userId, updates })
    
    // First, get current user data
    const { data: currentUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (fetchError) {
      console.error('❌ Error fetching current user data:', fetchError)
      throw fetchError
    }

    console.log('📋 Current user data:', currentUser)

    // Convert camelCase to snake_case for database fields
    const dbUpdates: any = {}
    if (updates.subscriptionId !== undefined) dbUpdates.subscription_id = updates.subscriptionId
    if (updates.subscriptionType !== undefined) dbUpdates.subscription_type = updates.subscriptionType
    if (updates.subscriptionStart !== undefined) dbUpdates.subscription_start = updates.subscriptionStart
    if (updates.subscriptionEnd !== undefined) dbUpdates.subscription_end = updates.subscriptionEnd
    if (updates.monthlyReportLimit !== undefined) dbUpdates.monthly_report_limit = updates.monthlyReportLimit

    console.log('🔄 Database updates:', dbUpdates)

    // Update user subscription
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update(dbUpdates)
      .eq('id', userId)
      .select()
      .single()

    if (updateError) {
      console.error('❌ Error updating user subscription:', updateError)
      throw updateError
    }

    console.log('✅ User subscription updated successfully:', { 
      userId, 
      updates,
      dbUpdates,
      before: {
        subscription_type: currentUser.subscription_type,
        subscription_id: currentUser.subscription_id,
        monthly_report_limit: currentUser.monthly_report_limit
      },
      after: {
        subscription_type: updatedUser.subscription_type,
        subscription_id: updatedUser.subscription_id,
        monthly_report_limit: updatedUser.monthly_report_limit
      }
    })

    return updatedUser
  } catch (error) {
    console.error('❌ Failed to update user subscription:', error)
    throw error
  }
}

// Additional event handlers
async function handleCheckoutSessionExpired(session: Stripe.Checkout.Session) {
  console.log('⏰ Checkout session expired:', session.id)
  // Optional: Clean up any pending data or send notification
}

async function handleInvoicePaymentActionRequired(invoice: Stripe.Invoice) {
  console.log('⚠️ Payment action required for invoice:', invoice.id)
  // Optional: Send notification to user about required action
}

async function handleCustomerCreated(customer: Stripe.Customer) {
  console.log('👤 Customer created:', customer.id, customer.email)
  // Optional: Log customer creation for analytics
}

async function handleCustomerUpdated(customer: Stripe.Customer) {
  console.log('👤 Customer updated:', customer.id, customer.email)
  // Optional: Sync customer data changes
}
