const { createClient } = require('@supabase/supabase-js')

// 配置
const supabaseUrl = 'https://decmecsshjqymhkykazg.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlY21lY3NzaGpxeW1oa3lrYXpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2MzIyNTMsImV4cCI6MjA3MDIwODI1M30.-eRwyHINS0jflhYeWT3bvZAmpdvSOLmpFmKCztMLzU0'

// 创建客户端
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // 测试时不持久化
    autoRefreshToken: true,
    detectSessionInUrl: false,
    flowType: 'pkce'
  }
})

async function testAuthFix() {
  console.log('🧪 开始测试认证修复...\n')
  
  try {
    // 1. 测试注册
    console.log('1️⃣ 测试用户注册...')
    const testEmail = `test-auth-fix-${Date.now()}@example.com`
    const testPassword = 'testpassword123'
    const testName = 'Auth Fix Test User'
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          name: testName
        }
      }
    })
    
    if (signUpError) {
      console.error('❌ 注册失败:', signUpError.message)
      return
    }
    
    console.log('✅ 注册成功:', signUpData.user?.id)
    
    // 2. 测试登录
    console.log('\n2️⃣ 测试用户登录...')
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    })
    
    if (signInError) {
      console.error('❌ 登录失败:', signInError.message)
      return
    }
    
    console.log('✅ 登录成功:', signInData.user?.id)
    
    // 3. 测试登出
    console.log('\n3️⃣ 测试用户登出...')
    const { error: signOutError } = await supabase.auth.signOut()
    
    if (signOutError) {
      console.error('❌ 登出失败:', signOutError.message)
      return
    }
    
    console.log('✅ 登出成功')
    
    // 4. 验证登出后状态
    console.log('\n4️⃣ 验证登出后状态...')
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    
    if (currentUser) {
      console.error('❌ 登出后仍有用户状态:', currentUser.id)
      return
    }
    
    console.log('✅ 登出后状态正确，无用户信息')
    
    // 5. 测试重新登录
    console.log('\n5️⃣ 测试重新登录...')
    const { data: reSignInData, error: reSignInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    })
    
    if (reSignInError) {
      console.error('❌ 重新登录失败:', reSignInError.message)
      return
    }
    
    console.log('✅ 重新登录成功:', reSignInData.user?.id)
    
    // 6. 最终登出
    console.log('\n6️⃣ 最终登出...')
    const { error: finalSignOutError } = await supabase.auth.signOut()
    
    if (finalSignOutError) {
      console.error('❌ 最终登出失败:', finalSignOutError.message)
      return
    }
    
    console.log('✅ 最终登出成功')
    
    console.log('\n🎉 所有认证测试通过！')
    console.log('✅ 注册功能正常')
    console.log('✅ 登录功能正常')
    console.log('✅ 登出功能正常')
    console.log('✅ 登出后状态清理正常')
    console.log('✅ 重新登录功能正常')
    
  } catch (error) {
    console.error('💥 测试过程中出现异常:', error)
  }
}

// 运行测试
testAuthFix()