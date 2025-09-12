import { NextRequest, NextResponse } from 'next/server'
import { createApiSupabaseClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    
    if (!email) {
      return NextResponse.json({ error: 'Email parameter required' }, { status: 400 })
    }

    const supabase = createApiSupabaseClient(request)
    
    // Get user by email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (userError) {
      return NextResponse.json({ 
        error: 'User not found', 
        details: userError.message,
        email 
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        subscription_type: user.subscription_type,
        subscription_id: user.subscription_id,
        subscription_start: user.subscription_start,
        subscription_end: user.subscription_end,
        monthly_report_limit: user.monthly_report_limit,
        paid_reports_used: user.paid_reports_used,
        free_reports_used: user.free_reports_used,
        created_at: user.created_at,
        updated_at: user.updated_at
      }
    })

  } catch (error) {
    console.error('Debug user subscription error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
