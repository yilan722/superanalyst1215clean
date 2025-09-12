const { createClient } = require('@supabase/supabase-js')

// 配置
const supabaseUrl = 'https://decmecsshjqymhkykazg.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlY21lY3NzaGpxeW1oa3lrYXpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2MzIyNTMsImV4cCI6MjA3MDIwODI1M30.-eRwyHINS0jflhYeWT3bvZAmpdvSOLmpFmKCztMLzU0'

// 创建客户端
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    flowType: 'pkce'
  }
})

async function testSimplePayment() {
  console.log('🧪 测试简化支付流程...\n')
  
  try {
    // 1. 登录获取用户
    console.log('1️⃣ 登录获取用户...')
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'test-stripe-api@example.com',
      password: 'testpassword123'
    })
    
    if (signInError) {
      console.error('❌ 登录失败:', signInError.message)
      return
    }
    
    console.log('✅ 登录成功:', signInData.user?.id)
    
    // 2. 获取会话token
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      console.error('❌ 获取会话失败:', sessionError)
      return
    }
    
    console.log('✅ 会话获取成功')
    
    // 3. 测试45美金优惠券
    console.log('\n2️⃣ 测试45美金优惠券支付...')
    
    const response = await fetch('http://localhost:3001/api/stripe/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        planId: 'basic',
        successUrl: 'http://localhost:3001/payment/success?session_id={CHECKOUT_SESSION_ID}',
        cancelUrl: 'http://localhost:3001/payment/cancel',
        couponCode: 'LIUYILAN45A',
      }),
    })
    
    const result = await response.json()
    console.log(`API响应状态: ${response.status}`)
    
    if (response.ok) {
      console.log('✅ 45美金优惠券支付测试成功')
      console.log(`   - 原价: $49`)
      console.log(`   - 折扣: $45`)
      console.log(`   - 最终价格: $4`)
      console.log(`   - 重定向URL: ${result.url ? '已生成' : '未生成'}`)
      
      if (result.url) {
        console.log('\n🎉 支付链接已生成！')
        console.log('用户现在可以点击链接完成支付')
        console.log('链接:', result.url)
      }
    } else {
      console.log(`❌ 支付测试失败: ${result.error}`)
    }
    
    console.log('\n🎉 简化支付测试完成！')
    console.log('现在可以访问 http://localhost:3001/test-simple-payment 进行完整测试')
    
  } catch (error) {
    console.error('💥 测试过程中出现异常:', error)
  }
}

// 运行测试
testSimplePayment()

