import { NextResponse } from 'next/server'

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  // 检查环境变量是否存在
  const hasUrl = !!supabaseUrl && supabaseUrl.trim() !== ''
  const hasKey = !!supabaseAnonKey && supabaseAnonKey.trim() !== ''
  
  // 验证 URL 格式
  let isValidUrl = false
  if (hasUrl) {
    try {
      const url = new URL(supabaseUrl)
      isValidUrl = url.protocol === 'https:' && url.hostname.includes('supabase.co')
    } catch {
      isValidUrl = false
    }
  }
  
  // 验证 Key 格式（JWT token 应该包含点号）
  const isValidKey = hasKey && supabaseAnonKey.includes('.') && supabaseAnonKey.length > 50
  
  return NextResponse.json({
    status: hasUrl && hasKey && isValidUrl && isValidKey ? 'ok' : 'error',
    checks: {
      hasUrl,
      hasKey,
      isValidUrl,
      isValidKey,
      urlPreview: hasUrl ? `${supabaseUrl.substring(0, 30)}...` : 'missing',
      keyLength: hasKey ? supabaseAnonKey.length : 0
    },
    message: hasUrl && hasKey && isValidUrl && isValidKey 
      ? '✅ Supabase environment variables are correctly configured'
      : '❌ Supabase environment variables are missing or invalid. Please check your Vercel environment variables.'
  })
}

