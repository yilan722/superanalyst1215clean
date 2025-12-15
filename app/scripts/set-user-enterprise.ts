/**
 * 脚本：将用户订阅状态设置为 Enterprise
 * 使用方法：在 Supabase SQL Editor 中运行，或通过 API 调用
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function setUserToEnterprise(userId: string) {
  try {
    console.log('🔍 查找 Enterprise 订阅层级...')
    
    // 首先查找 Enterprise 的 ID
    const { data: enterpriseTier, error: tierError } = await supabase
      .from('subscription_tiers')
      .select('id, name')
      .eq('name', 'Enterprise')
      .single()

    if (tierError || !enterpriseTier) {
      console.error('❌ 无法找到 Enterprise 订阅层级:', tierError)
      throw new Error('Enterprise tier not found')
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
      throw updateError
    }

    console.log('✅ 用户订阅已更新为 Enterprise:', updatedUser)
    return updatedUser
  } catch (error) {
    console.error('❌ 错误:', error)
    throw error
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  const userId = process.argv[2]
  if (!userId) {
    console.error('❌ 请提供用户ID')
    console.log('使用方法: ts-node set-user-enterprise.ts <userId>')
    process.exit(1)
  }

  setUserToEnterprise(userId)
    .then(() => {
      console.log('✅ 完成')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ 失败:', error)
      process.exit(1)
    })
}

export { setUserToEnterprise }

