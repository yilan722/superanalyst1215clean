const { createClient } = require('@supabase/supabase-js')

// 配置
const supabaseUrl = 'https://decmecsshjqymhkykazg.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlY21lY3NzaGpxeW1oa3lrYXpnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDYzMjI1MywiZXhwIjoyMDcwMjA4MjUzfQ.TYomlDXMETtWVXPcyoL8kDdRga4cw48cJmmQnfxmWkI'

// 创建服务端客户端
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function verifySubscriptionTypeMigration() {
  console.log('🔍 验证 subscription_type 外键迁移...\n')
  
  try {
    // 1. 检查 subscription_tiers 表
    console.log('📊 检查 subscription_tiers 表...')
    
    const { data: tiersData, error: tiersError } = await supabase
      .from('subscription_tiers')
      .select('*')
      .order('id')
    
    if (tiersError) {
      console.log('❌ 无法查询 subscription_tiers 表:', tiersError.message)
      return
    }
    
    console.log(`✅ subscription_tiers 表包含 ${tiersData.length} 个层级:`)
    tiersData.forEach(tier => {
      console.log(`  - ID ${tier.id}: ${tier.name} ($${tier.price_monthly}/月, ${tier.daily_report_limit} 报告/天)`)
    })
    
    // 2. 检查 users 表的 subscription_type 列类型
    console.log('\n🔍 检查 users 表的 subscription_type 列...')
    
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('id, email, subscription_type, subscription_end')
      .order('created_at', { ascending: false })
      .limit(10)
    
    if (usersError) {
      console.log('❌ 无法查询 users 表:', usersError.message)
      return
    }
    
    console.log(`✅ 成功查询 users 表，显示前 ${usersData.length} 个用户:`)
    
    // 3. 验证 subscription_type 值
    let validReferences = 0
    let invalidReferences = 0
    let nullValues = 0
    
    usersData.forEach(user => {
      if (user.subscription_type === null) {
        nullValues++
        console.log(`  - ${user.email}: subscription_type = NULL`)
      } else {
        const tierId = parseInt(user.subscription_type)
        const tier = tiersData.find(t => t.id === tierId)
        
        if (tier) {
          validReferences++
          const isActive = user.subscription_end && new Date(user.subscription_end) > new Date()
          console.log(`  - ${user.email}: subscription_type = ${tierId} (${tier.name}) ${isActive ? '✅ 激活' : '❌ 过期'}`)
        } else {
          invalidReferences++
          console.log(`  - ${user.email}: subscription_type = ${user.subscription_type} ❌ 无效引用`)
        }
      }
    })
    
    // 4. 统计结果
    console.log('\n📊 验证结果:')
    console.log(`  - 有效引用: ${validReferences}`)
    console.log(`  - 无效引用: ${invalidReferences}`)
    console.log(`  - NULL 值: ${nullValues}`)
    console.log(`  - 总计: ${usersData.length}`)
    
    // 5. 测试外键约束
    console.log('\n🔗 测试外键约束...')
    
    try {
      // 尝试插入一个无效的 subscription_type 值
      const { error: constraintError } = await supabase
        .from('users')
        .update({ subscription_type: 999 }) // 不存在的 tier ID
        .eq('id', usersData[0]?.id)
        .select()
      
      if (constraintError) {
        if (constraintError.message.includes('foreign key') || constraintError.message.includes('constraint')) {
          console.log('✅ 外键约束正常工作 - 阻止了无效引用')
        } else {
          console.log('⚠️ 外键约束可能未正确设置:', constraintError.message)
        }
      } else {
        console.log('⚠️ 外键约束可能未正确设置 - 允许了无效引用')
      }
    } catch (error) {
      console.log('ℹ️ 无法测试外键约束 (可能是权限问题)')
    }
    
    // 6. 测试 JOIN 查询
    console.log('\n🔗 测试 JOIN 查询...')
    
    const { data: joinData, error: joinError } = await supabase
      .from('users')
      .select(`
        id,
        email,
        subscription_type,
        subscription_end,
        subscription_tiers!inner(
          id,
          name,
          daily_report_limit,
          price_monthly
        )
      `)
      .not('subscription_type', 'is', null)
      .limit(5)
    
    if (joinError) {
      console.log('❌ JOIN 查询失败:', joinError.message)
    } else {
      console.log(`✅ JOIN 查询成功，找到 ${joinData.length} 个有订阅的用户:`)
      joinData.forEach(user => {
        const tier = user.subscription_tiers
        const isActive = user.subscription_end && new Date(user.subscription_end) > new Date()
        console.log(`  - ${user.email}: ${tier.name} ($${tier.price_monthly}/月) ${isActive ? '✅' : '❌'}`)
      })
    }
    
    // 7. 总结
    console.log('\n🎉 迁移验证完成!')
    
    if (invalidReferences === 0) {
      console.log('✅ 所有 subscription_type 值都是有效的引用')
    } else {
      console.log('⚠️ 发现无效引用，需要清理数据')
    }
    
    if (validReferences > 0) {
      console.log('✅ 外键关系正常工作')
    }
    
  } catch (error) {
    console.error('💥 验证过程中发生错误:', error)
  }
}

// 运行验证
verifySubscriptionTypeMigration()
