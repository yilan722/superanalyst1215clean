import { NextRequest, NextResponse } from 'next/server'
import { createApiSupabaseClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    console.log('Testing authentication...')
    
    const supabase = createApiSupabaseClient(request)
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    console.log('Test Auth - User:', user ? 'Found' : 'Not found')
    console.log('Test Auth - Error:', authError)
    console.log('Test Auth - User ID:', user?.id)
    console.log('Test Auth - User Email:', user?.email)
    
    if (authError || !user) {
      return NextResponse.json({
        success: false,
        authenticated: false,
        error: authError?.message || 'No user found',
        timestamp: new Date().toISOString()
      })
    }
    
    return NextResponse.json({
      success: true,
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at
      },
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Auth test error:', error)
    return NextResponse.json({
      success: false,
      authenticated: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
