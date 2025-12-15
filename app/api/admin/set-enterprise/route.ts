import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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
    const { userId } = await request.json()
    
    if (!userId) {
      return NextResponse.json({ 
        error: 'userId is required' 
      }, { status: 400 })
    }

    console.log('🔍 查找 Enterprise 订阅层级...')
    
    // 首先查找 Enterprise 的 ID
    const { data: enterpriseTier, error: tierError } = await supabase
      .from('subscription_tiers')
      .select('id, name')
      .eq('name', 'Enterprise')
      .single()

    if (tierError || !enterpriseTier) {
      console.error('❌ 无法找到 Enterprise 订阅层级:', tierError)
      return NextResponse.json({ 
        error: 'Enterprise tier not found',
        details: tierError?.message 
      }, { status: 404 })
    }

    console.log('✅ 找到 Enterprise 层级:', enterpriseTier)

    // 更新用户订阅
    const subscriptionEnd = new Date()
    subscriptionEnd.setFullYear(subscriptionEnd.getFullYear() + 1) // 1年后过期

    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({
        subscription_id: enterpriseTier.id,
        subscription_type: 'enterprise',
        subscription_start: new Date().toISOString(),
        subscription_end: subscriptionEnd.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()

    if (updateError) {
      console.error('❌ 更新用户订阅失败:', updateError)
      return NextResponse.json({ 
        error: 'Failed to update subscription',
        details: updateError.message 
      }, { status: 500 })
    }

    console.log('✅ 用户订阅已更新为 Enterprise:', updatedUser)

    return NextResponse.json({
      success: true,
      user: updatedUser,
      subscriptionTier: enterpriseTier
    })
  } catch (error: any) {
    console.error('❌ 错误:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 })
  }
}

