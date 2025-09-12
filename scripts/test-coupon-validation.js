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

async function testCouponValidation() {
  console.log('🧪 测试优惠券验证功能...\n')
  
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
    
    // 3. 测试优惠券验证API
    const couponsToTest = [
      'WELCOME20',
      'LIUYILAN20', 
      'LIUYILAN45A',
      'LIUYILAN45B',
      'LIUYILAN45C'
    ]
    
    for (const couponCode of couponsToTest) {
      console.log(`\n3️⃣ 测试优惠券: ${couponCode}`)
      
      const response = await fetch('http://localhost:3001/api/coupons/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          code: couponCode,
          orderAmount: 49
        }),
      })
      
      const result = await response.json()
      
      if (result.valid) {
        console.log(`✅ ${couponCode} 验证成功:`)
        console.log(`   - 描述: ${result.description}`)
        console.log(`   - 折扣金额: $${result.discount_amount}`)
        console.log(`   - 最终价格: $${result.final_amount}`)
      } else {
        console.log(`❌ ${couponCode} 验证失败: ${result.error}`)
      }
    }
    
    console.log('\n🎉 优惠券验证测试完成！')
    
  } catch (error) {
    console.error('💥 测试过程中出现异常:', error)
  }
}

// 运行测试
testCouponValidation()
