import { NextRequest, NextResponse } from 'next/server'
import { stripe, STRIPE_CONFIG, SUBSCRIPTION_PLANS } from '@/lib/stripe-config'
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
  console.log('Processing checkout session completed:', session.id)
  
  const userId = session.metadata?.userId
  const planId = session.metadata?.planId

  if (!userId || !planId) {
    console.error('Missing metadata in checkout session:', { userId, planId })
    return
  }

  // Get subscription details
  if (!stripe) {
    console.error('Stripe not initialized in webhook')
    return
  }
  
  const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
  
  // Update user subscription in database
  await updateUserSubscription(userId, {
    subscriptionId: subscription.id,
    subscriptionType: planId,
    subscriptionStart: new Date().toISOString(),
    subscriptionEnd: new Date((subscription as any).current_period_end * 1000).toISOString(),
    monthlyReportLimit: SUBSCRIPTION_PLANS[planId as keyof typeof SUBSCRIPTION_PLANS]?.reportLimit || 0,
  })

  console.log('User subscription updated:', { userId, planId })
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
  
  if (invoice.subscription) {
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string)
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
  
  if (invoice.subscription) {
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string)
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
    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)

    if (error) {
      console.error('Error updating user subscription:', error)
      throw error
    }

    console.log('User subscription updated successfully:', { userId, updates })
  } catch (error) {
    console.error('Failed to update user subscription:', error)
    throw error
  }
}
