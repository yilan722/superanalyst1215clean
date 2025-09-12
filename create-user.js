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

async function createUser() {
  try {
    console.log('🔐 创建新用户...')
    
    const { data, error } = await supabase.auth.signUp({
      email: 'liuyilan72@outlook.com',
      password: 'test123456',
      options: {
        emailRedirectTo: 'http://localhost:3000'
      }
    })
    
    if (error) {
      console.error('❌ 创建用户失败:', error.message)
      
      // 如果用户已存在，尝试重置密码
      if (error.message.includes('already registered')) {
        console.log('🔄 用户已存在，尝试重置密码...')
        
        const { data: resetData, error: resetError } = await supabase.auth.resetPasswordForEmail('liuyilan72@outlook.com', {
          redirectTo: 'http://localhost:3000/reset-password'
        })
        
        if (resetError) {
          console.error('❌ 重置密码失败:', resetError.message)
        } else {
          console.log('✅ 密码重置邮件已发送')
        }
      }
    } else {
      console.log('✅ 用户创建成功!')
      console.log('用户ID:', data.user?.id)
      console.log('邮箱:', data.user?.email)
      console.log('需要验证邮箱:', data.user?.email_confirmed_at ? '否' : '是')
    }
    
  } catch (error) {
    console.error('❌ 创建用户异常:', error.message)
  }
}

createUser()
