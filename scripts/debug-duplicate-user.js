const { createClient } = require('@supabase/supabase-js')

// 使用环境变量
const supabaseUrl = 'https://decmecsshjqymhkykazg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlY21lY3NzaGpxeW1oa3lrYXpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2MzIyNTMsImV4cCI6MjA3MDIwODI1M30.-eRwyHINS0jflhYeWT3bvZAmpdvSOLmpFmKCztMLzU0'

const supabase = createClient(supabaseUrl, supabaseKey)

async function debugDuplicateUser() {
  console.log('🔍 调试重复用户问题...')
  
  try {
    // 1. 检查是否有重复的用户ID
    console.log('\n📋 步骤1: 检查重复的用户ID...')
    const { data: allUsers, error: usersError } = await supabase
      .from('users')
      .select('id, email, created_at')
      .order('created_at', { ascending: false })
    
    if (usersError) {
      console.error('❌ 查询用户失败:', usersError)
      return
    }
    
    // 检查重复ID
    const userIds = allUsers.map(user => user.id)
    const uniqueIds = [...new Set(userIds)]
    
    if (userIds.length !== uniqueIds.length) {
      console.log('❌ 发现重复的用户ID!')
      const duplicates = userIds.filter((id, index) => userIds.indexOf(id) !== index)
      console.log('重复的ID:', [...new Set(duplicates)])
    } else {
      console.log('✅ 没有发现重复的用户ID')
    }
    
    // 2. 检查最近的用户注册
    console.log('\n📋 步骤2: 检查最近的用户注册...')
    const recentUsers = allUsers.slice(0, 5)
    recentUsers.forEach((user, index) => {
      console.log(`\n用户 ${index + 1}:`)
      console.log(`  ID: ${user.id}`)
      console.log(`  Email: ${user.email}`)
      console.log(`  Created: ${user.created_at}`)
    })
    
    // 3. 测试创建用户时检查是否已存在
    console.log('\n📋 步骤3: 测试用户存在性检查...')
    const testEmail = `test-duplicate-${Date.now()}@example.com`
    
    // 先检查用户是否已存在
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('email', testEmail)
      .single()
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ 检查用户存在性失败:', checkError)
    } else if (existingUser) {
      console.log('⚠️ 用户已存在:', existingUser.id)
    } else {
      console.log('✅ 用户不存在，可以创建')
    }
    
    // 4. 分析可能的原因
    console.log('\n💡 可能的原因分析:')
    console.log('1. 数据库触发器创建了用户记录')
    console.log('2. 代码中手动创建用户记录')
    console.log('3. 用户注册了多次')
    console.log('4. 并发注册导致重复创建')
    
    console.log('\n🔧 解决方案:')
    console.log('1. 在插入前检查用户是否已存在')
    console.log('2. 使用 UPSERT 操作而不是 INSERT')
    console.log('3. 添加错误处理来忽略重复键错误')
    
  } catch (error) {
    console.error('💥 调试过程中出现错误:', error)
  }
}

debugDuplicateUser()
