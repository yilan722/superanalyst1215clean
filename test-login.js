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

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  console.error('URL:', supabaseUrl ? 'Found' : 'Missing')
  console.error('Key:', supabaseKey ? 'Found' : 'Missing')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testLogin() {
  try {
    console.log('🔐 尝试登录用户...')
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'liuyilan72@outlook.com',
      password: 'test123'
    })
    
    if (error) {
      console.error('❌ 登录失败:', error.message)
      
      // 如果用户不存在，尝试注册
      if (error.message.includes('Invalid login credentials')) {
        console.log('🔄 用户不存在，尝试注册...')
        
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: 'liuyilan72@outlook.com',
          password: 'test123'
        })
        
        if (signUpError) {
          console.error('❌ 注册失败:', signUpError.message)
        } else {
          console.log('✅ 注册成功，请检查邮箱验证')
        }
      }
    } else {
      console.log('✅ 登录成功!')
      console.log('用户ID:', data.user.id)
      console.log('邮箱:', data.user.email)
      console.log('会话:', data.session ? '存在' : '不存在')
    }
  } catch (error) {
    console.error('❌ 登录异常:', error.message)
  }
}

testLogin()
