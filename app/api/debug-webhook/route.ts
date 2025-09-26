import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/app/services/stripe-config'
import { createClient } from '@supabase/supabase-js'

// Create Supabase client with service role key
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

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json({ error: 'Stripe not initialized' }, { status: 500 })
    }

    // Get recent webhook events
    const events = await stripe.events.list({
      limit: 20,
      type: 'checkout.session.completed'
    })

    const sessions = []
    
    for (const event of events.data) {
      if (event.type === 'checkout.session.completed') {
        const session = event.data.object as any
        sessions.push({
          id: session.id,
          customer_email: session.customer_email,
          customer_details: session.customer_details,
          metadata: session.metadata,
          subscription: session.subscription,
          payment_status: session.payment_status,
          amount_total: session.amount_total,
          created: new Date(session.created * 1000).toISOString(),
          event_id: event.id,
          event_created: new Date(event.created * 1000).toISOString()
        })
      }
    }

    // Get recent subscriptions
    const subscriptions = await stripe.subscriptions.list({
      limit: 10
    })

    const subscriptionData = subscriptions.data.map(sub => ({
      id: sub.id,
      customer: sub.customer,
      metadata: sub.metadata,
      status: sub.status,
      current_period_start: new Date((sub as any).current_period_start * 1000).toISOString(),
      current_period_end: new Date((sub as any).current_period_end * 1000).toISOString(),
      created: new Date(sub.created * 1000).toISOString()
    }))

    // Get users with recent subscription updates
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .not('subscription_type', 'is', null)
      .order('updated_at', { ascending: false })
      .limit(10)

    if (usersError) {
      console.error('Error fetching users:', usersError)
    }

    return NextResponse.json({
      success: true,
      webhook_secret_configured: !!process.env.STRIPE_WEBHOOK_SECRET,
      recent_sessions: sessions,
      recent_subscriptions: subscriptionData,
      users_with_subscriptions: users || [],
      total_events: events.data.length,
      total_subscriptions: subscriptions.data.length
    })

  } catch (error) {
    console.error('Debug webhook error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch webhook data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
