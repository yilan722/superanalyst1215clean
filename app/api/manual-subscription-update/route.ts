import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { SUBSCRIPTION_PLANS } from '@/lib/stripe-config'

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

export async function POST(request: NextRequest) {
  try {
    const { email, planId, subscriptionId } = await request.json()
    
    if (!email || !planId) {
      return NextResponse.json({ 
        error: 'Email and planId are required' 
      }, { status: 400 })
    }

    console.log('🔄 Manual subscription update:', { email, planId, subscriptionId })

    // Get user by email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (userError) {
      console.error('❌ User not found:', userError)
      return NextResponse.json({ 
        error: 'User not found', 
        details: userError.message 
      }, { status: 404 })
    }

    console.log('✅ Found user:', { id: user.id, email: user.email, currentSubscription: user.subscription_type })

    // Get plan details
    const plan = SUBSCRIPTION_PLANS[planId as keyof typeof SUBSCRIPTION_PLANS]
    if (!plan) {
      return NextResponse.json({ 
        error: 'Invalid plan ID' 
      }, { status: 400 })
    }

    console.log('📋 Plan details:', plan)

    // Calculate subscription end date (30 days from now)
    const subscriptionEnd = new Date()
    subscriptionEnd.setDate(subscriptionEnd.getDate() + 30)

    // Update user subscription
    const updates = {
      subscription_type: planId,
      subscription_id: subscriptionId || `manual_${Date.now()}`,
      subscription_start: new Date().toISOString(),
      subscription_end: subscriptionEnd.toISOString(),
      monthly_report_limit: plan.reportLimit || 0,
      updated_at: new Date().toISOString()
    }

    console.log('🔄 Updating user with:', updates)

    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('❌ Error updating user:', updateError)
      return NextResponse.json({ 
        error: 'Failed to update subscription', 
        details: updateError.message 
      }, { status: 500 })
    }

    console.log('✅ User subscription updated successfully:', updatedUser)

    return NextResponse.json({
      success: true,
      message: `User ${email} subscription updated to ${planId}`,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        subscription_type: updatedUser.subscription_type,
        subscription_id: updatedUser.subscription_id,
        monthly_report_limit: updatedUser.monthly_report_limit,
        subscription_start: updatedUser.subscription_start,
        subscription_end: updatedUser.subscription_end
      }
    })

  } catch (error) {
    console.error('❌ Manual subscription update error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
