import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/app/services/stripe-config'

export async function GET(request: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json({ error: 'Stripe not initialized' }, { status: 500 })
    }

    // Get recent events from Stripe
    const events = await stripe.events.list({
      limit: 10,
      type: 'checkout.session.completed'
    })

    const sessions = []
    
    for (const event of events.data) {
      if (event.type === 'checkout.session.completed') {
        const session = event.data.object as any
        sessions.push({
          id: session.id,
          customer_email: session.customer_email,
          metadata: session.metadata,
          amount_total: session.amount_total,
          status: session.payment_status,
          created: new Date(session.created * 1000).toISOString()
        })
      }
    }

    return NextResponse.json({
      success: true,
      webhook_secret_configured: !!process.env.STRIPE_WEBHOOK_SECRET,
      recent_sessions: sessions,
      total_events: events.data.length
    })

  } catch (error) {
    console.error('Test webhook error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch webhook data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
