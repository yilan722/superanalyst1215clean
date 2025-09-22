const { createClient } = require('@supabase/supabase-js')

// 配置
const supabaseUrl = 'https://decmecsshjqymhkykazg.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlY21lY3NzaGpxeW1oa3lrYXpnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDYzMjI1MywiZXhwIjoyMDcwMjA4MjUzfQ.TYomlDXMETtWVXPcyoL8kDdRga4cw48cJmmQnfxmWkI'

// 创建服务端客户端
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function applySubscriptionTypeMigration() {
  console.log('🔧 开始应用 subscription_type 外键迁移...\n')
  
  try {
    // 1. 检查 subscription_tiers 表是否存在
    console.log('🔍 检查 subscription_tiers 表是否存在...')
    
    const { data: tiersData, error: tiersError } = await supabase
      .from('subscription_tiers')
      .select('id, name')
      .order('id')
    
    if (tiersError) {
      console.log('❌ subscription_tiers 表不存在或无法访问:', tiersError.message)
      console.log('💡 请先创建 subscription_tiers 表')
      return
    }
    
    console.log('✅ subscription_tiers 表存在，包含以下层级:')
    tiersData.forEach(tier => {
      console.log(`  - ID ${tier.id}: ${tier.name}`)
    })
    
    // 2. 检查当前 users 表中的 subscription_type 值
    console.log('\n🔍 检查当前 users 表中的 subscription_type 值...')
    
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('id, email, subscription_type')
      .not('subscription_type', 'is', null)
    
    if (usersError) {
      console.log('❌ 无法查询 users 表:', usersError.message)
      return
    }
    
    console.log(`✅ 找到 ${usersData.length} 个用户有 subscription_type 值:`)
    usersData.forEach(user => {
      console.log(`  - ${user.email}: ${user.subscription_type}`)
    })
    
    // 3. 显示迁移计划
    console.log('\n📋 迁移计划:')
    console.log('1. 添加临时列 subscription_type_new (INTEGER)')
    console.log('2. 将现有字符串值映射到对应的 tier ID')
    console.log('3. 删除旧的 subscription_type 列')
    console.log('4. 重命名新列为 subscription_type')
    console.log('5. 添加外键约束')
    console.log('6. 添加索引')
    
    // 4. 显示映射关系
    console.log('\n🔄 值映射关系:')
    const mapping = {
      'Free': 1,
      'Basic': 2,
      'Pro': 3,
      'Business': 4,
      'Enterprise': 5,
      'single_report': 1,  // 映射到 Free
      'monthly_30': 2,     // 映射到 Basic
      'monthly_70': 3,     // 映射到 Pro
      'premium_300': 4     // 映射到 Business
    }
    
    Object.entries(mapping).forEach(([oldValue, newId]) => {
      const tierName = tiersData.find(t => t.id === newId)?.name || 'Unknown'
      console.log(`  - "${oldValue}" → ID ${newId} (${tierName})`)
    })
    
    console.log('\n⚠️  注意: 由于 Supabase 客户端无法执行 DDL 语句，请手动执行以下 SQL:')
    console.log('\n' + '='.repeat(80))
    console.log('-- 在 Supabase Dashboard 的 SQL Editor 中执行以下 SQL:')
    console.log('')
    
    // 读取并显示迁移 SQL
    const fs = require('fs')
    const path = require('path')
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '012_update_subscription_type_to_foreign_key.sql')
    
    try {
      const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
      console.log(migrationSQL)
    } catch (error) {
      console.log('❌ 无法读取迁移文件:', error.message)
    }
    
    console.log('\n' + '='.repeat(80))
    console.log('\n🎯 执行步骤:')
    console.log('1. 复制上面的 SQL 到 Supabase Dashboard 的 SQL Editor')
    console.log('2. 执行 SQL 语句')
    console.log('3. 运行验证脚本: node scripts/verify-subscription-type-migration.js')
    
  } catch (error) {
    console.error('💥 迁移过程中发生错误:', error)
  }
}

// 运行迁移
applySubscriptionTypeMigration()
