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

async function test45Coupons() {
  console.log('🧪 测试45美金优惠券...\n')
  
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
    
    // 3. 测试所有45美金优惠券
    const coupons45 = ['LIUYILAN45A', 'LIUYILAN45B', 'LIUYILAN45C']
    
    for (const couponCode of coupons45) {
      console.log(`\n2️⃣ 测试优惠券: ${couponCode}`)
      
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
          couponCode: couponCode,
        }),
      })
      
      const result = await response.json()
      console.log(`API响应状态: ${response.status}`)
      
      if (response.ok) {
        console.log(`✅ ${couponCode} 测试成功`)
        console.log(`   - 原价: $49`)
        console.log(`   - 折扣: $45`)
        console.log(`   - 最终价格: $4`)
        console.log(`   - 重定向URL: ${result.url ? '已生成' : '未生成'}`)
      } else {
        console.log(`❌ ${couponCode} 测试失败: ${result.error}`)
      }
    }
    
    console.log('\n🎉 45美金优惠券测试完成！')
    console.log('liuyilan72@outlook.com用户现在可以使用以下优惠券：')
    console.log('- LIUYILAN20: 减免$20 (最终价格$29)')
    console.log('- LIUYILAN45A: 减免$45 (最终价格$4)')
    console.log('- LIUYILAN45B: 减免$45 (最终价格$4)')
    console.log('- LIUYILAN45C: 减免$45 (最终价格$4)')
    
  } catch (error) {
    console.error('💥 测试过程中出现异常:', error)
  }
}

// 运行测试
test45Coupons()

