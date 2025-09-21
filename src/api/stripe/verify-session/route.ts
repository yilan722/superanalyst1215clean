import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/src/services/stripe-config'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('session_id')

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }

    // Check if Stripe is initialized
    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe not initialized' },
        { status: 500 }
      )
    }

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'customer']
    })

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    // Extract relevant information
    const sessionData = {
      id: session.id,
      status: session.status,
      paymentStatus: session.payment_status,
      planName: session.metadata?.planName,
      planId: session.metadata?.planId,
      amount: session.amount_total,
      currency: session.currency,
      customerEmail: session.customer_email,
      subscriptionId: session.subscription,
    }

    return NextResponse.json(sessionData)

  } catch (error) {
    console.error('Error verifying session:', error)
    return NextResponse.json(
      { error: 'Failed to verify session' },
      { status: 500 }
    )
  }
}

