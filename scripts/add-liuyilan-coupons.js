const { createClient } = require('@supabase/supabase-js')

// 配置
const supabaseUrl = 'https://decmecsshjqymhkykazg.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key'

// 创建管理员客户端
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function addLiuyilanCoupons() {
  console.log('🎫 为liuyilan72@outlook.com添加45美金优惠券...\n')
  
  try {
    // 添加三张45美金优惠券
    const coupons = [
      {
        code: 'LIUYILAN45A',
        description: 'Premium discount for liuyilan72@outlook.com - $45 off (Coupon A)',
        discount_type: 'fixed_amount',
        discount_value: 45.00,
        min_order_amount: 49.00,
        max_uses: 1,
        valid_until: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1年后
      },
      {
        code: 'LIUYILAN45B',
        description: 'Premium discount for liuyilan72@outlook.com - $45 off (Coupon B)',
        discount_type: 'fixed_amount',
        discount_value: 45.00,
        min_order_amount: 49.00,
        max_uses: 1,
        valid_until: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        code: 'LIUYILAN45C',
        description: 'Premium discount for liuyilan72@outlook.com - $45 off (Coupon C)',
        discount_type: 'fixed_amount',
        discount_value: 45.00,
        min_order_amount: 49.00,
        max_uses: 1,
        valid_until: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]

    for (const coupon of coupons) {
      const { data, error } = await supabase
        .from('coupons')
        .insert(coupon)
        .select()

      if (error) {
        console.error(`❌ 添加优惠券 ${coupon.code} 失败:`, error.message)
      } else {
        console.log(`✅ 成功添加优惠券: ${coupon.code}`)
      }
    }

    console.log('\n🎉 优惠券添加完成！')
    console.log('现在liuyilan72@outlook.com用户可以使用以下优惠券：')
    console.log('- LIUYILAN20: 减免$20')
    console.log('- LIUYILAN45A: 减免$45')
    console.log('- LIUYILAN45B: 减免$45')
    console.log('- LIUYILAN45C: 减免$45')

  } catch (error) {
    console.error('💥 添加优惠券时出现异常:', error)
  }
}

// 运行脚本
addLiuyilanCoupons()

