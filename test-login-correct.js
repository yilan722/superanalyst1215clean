const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// 读取.env文件
const envPath = path.join(__dirname, '.env')
const envContent = fs.readFileSync(envPath, 'utf8')

// 解析环境变量
const envVars = {}
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=')
  if (key && valueParts.length > 0) {
    envVars[key.trim()] = valueParts.join('=').trim()
  }
})

const supabase = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY)

async function testLogin() {
  try {
    console.log('🔐 尝试登录用户...')
    
    // 尝试不同的密码
    const passwords = ['test123', 'password', '123456', 'admin123']
    
    for (const password of passwords) {
      console.log(`🔄 尝试密码: ${password}`)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'liuyilan72@outlook.com',
        password: password
      })
      
      if (error) {
        console.log(`❌ 密码 ${password} 失败:`, error.message)
      } else {
        console.log('✅ 登录成功!')
        console.log('用户ID:', data.user.id)
        console.log('邮箱:', data.user.email)
        console.log('会话:', data.session ? '存在' : '不存在')
        return
      }
    }
    
    console.log('❌ 所有密码都失败了')
    
  } catch (error) {
    console.error('❌ 登录异常:', error.message)
  }
}

testLogin()
