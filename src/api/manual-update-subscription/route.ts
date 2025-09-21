import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create Supabase client with service role key for admin operations
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
    const { email, subscriptionType, subscriptionId } = await request.json()
    
    if (!email || !subscriptionType) {
      return NextResponse.json({ 
        error: 'Email and subscriptionType are required' 
      }, { status: 400 })
    }

    // Get user by email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (userError) {
      return NextResponse.json({ 
        error: 'User not found', 
        details: userError.message 
      }, { status: 404 })
    }

    // Define report limits based on subscription type
    const reportLimits = {
      'basic': 8,
      'professional': 20,
      'business': 50
    }

    // Update user subscription
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({
        subscription_type: subscriptionType,
        subscription_id: subscriptionId || `manual_${Date.now()}`,
        subscription_start: new Date().toISOString(),
        subscription_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        monthly_report_limit: reportLimits[subscriptionType as keyof typeof reportLimits] || 0,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ 
        error: 'Failed to update subscription', 
        details: updateError.message 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `User ${email} subscription updated to ${subscriptionType}`,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        subscription_type: updatedUser.subscription_type,
        subscription_id: updatedUser.subscription_id,
        monthly_report_limit: updatedUser.monthly_report_limit,
        subscription_end: updatedUser.subscription_end
      }
    })

  } catch (error) {
    console.error('Manual update subscription error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
