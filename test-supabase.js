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

console.log('🔍 环境变量检查:')
console.log('URL:', supabaseUrl ? 'Found' : 'Missing')
console.log('Key:', supabaseKey ? 'Found' : 'Missing')

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testSupabase() {
  try {
    console.log('🔍 测试Supabase连接...')
    
    // 测试基本连接
    const { data, error } = await supabase.from('users').select('count').limit(1)
    
    if (error) {
      console.error('❌ Supabase连接失败:', error.message)
    } else {
      console.log('✅ Supabase连接成功')
    }
    
    // 测试认证
    console.log('🔍 测试认证状态...')
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('❌ 获取会话失败:', sessionError.message)
    } else if (session) {
      console.log('✅ 用户已登录:', session.user.email)
    } else {
      console.log('ℹ️ 用户未登录')
    }
    
  } catch (error) {
    console.error('❌ 测试异常:', error.message)
  }
}

testSupabase()
