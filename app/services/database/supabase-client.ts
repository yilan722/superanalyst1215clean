import { createBrowserClient } from '@supabase/ssr'

// 获取环境变量，提供默认值以避免 "Invalid value" 错误
// 确保即使环境变量是空字符串也使用默认值
const getEnvVar = (key: string, defaultValue: string): string => {
  const value = process.env[key]
  return (value && value.trim() !== '') ? value : defaultValue
}

const supabaseUrl = getEnvVar('NEXT_PUBLIC_SUPABASE_URL', 'https://decmecsshjqymhkykazg.supabase.co')
const supabaseAnonKey = getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlY21lY3NzaGpxeW1oa3lrYXpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2MzIyNTMsImV4cCI6MjA3MDIwODI1M30.-eRwyHINS0jflhYeWT3bvZAmpdvSOLmpFmKCztMLzU0')

// 验证环境变量格式（URL 和 JWT token 的基本验证）
const isValidUrl = (url: string): boolean => {
  try {
    new URL(url)
    return url.startsWith('https://')
  } catch {
    return false
  }
}

const isValidJWT = (token: string): boolean => {
  return token.length > 50 && token.includes('.')
}

// 验证环境变量
if (typeof window !== 'undefined') {
  if (!isValidUrl(supabaseUrl)) {
    console.error('❌ Invalid Supabase URL:', supabaseUrl)
  }
  if (!isValidJWT(supabaseAnonKey)) {
    console.error('❌ Invalid Supabase Anon Key format')
  }
  // 调试信息（仅在开发环境）
  if (process.env.NODE_ENV === 'development') {
    console.log('🔧 Supabase Client Config:', {
      url: supabaseUrl.substring(0, 30) + '...',
      hasKey: !!supabaseAnonKey,
      keyLength: supabaseAnonKey.length
    })
  }
}

// 单例模式，确保只有一个客户端实例
// 使用全局变量存储实例，避免在模块加载时创建多个实例
// 在浏览器环境中，使用 window 对象；在 Node.js 环境中，使用 global
const getGlobal = () => {
  if (typeof window !== 'undefined') {
    return window as any
  }
  if (typeof global !== 'undefined') {
    return global as any
  }
  return {} as any
}

const globalObj = getGlobal()

// 创建全局的Supabase客户端实例（单例模式）
export const supabase = (() => {
  // 在客户端，使用全局变量避免热重载时创建多个实例
  if (typeof window !== 'undefined') {
    if (!globalObj.__supabaseClient) {
      try {
        // 再次验证 URL 和 Key 的有效性
        if (!isValidUrl(supabaseUrl) || !isValidJWT(supabaseAnonKey)) {
          throw new Error(`Invalid Supabase configuration: URL=${isValidUrl(supabaseUrl)}, Key=${isValidJWT(supabaseAnonKey)}`)
        }
        
        globalObj.__supabaseClient = createBrowserClient(
          supabaseUrl,
          supabaseAnonKey,
          {
            auth: {
              persistSession: true,
              autoRefreshToken: true,
              detectSessionInUrl: true,
              flowType: 'pkce',
              storage: window.localStorage,
              storageKey: 'sb-decmecsshjqymhkykazg-auth-token',
              debug: process.env.NODE_ENV === 'development'
            }
          }
        )
        
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ Supabase client created successfully')
        }
      } catch (error) {
        console.error('❌ Failed to create Supabase client:', error)
        throw error
      }
    }
    return globalObj.__supabaseClient
  }
  
  // 服务器端：createBrowserClient 可以在服务器端使用，但通常应该使用 createServerClient
  // 这里为了兼容性，仍然创建实例，但会使用不同的存储机制
  // 注意：在服务器端，每次调用都会创建新实例，这是正常的，因为服务器端没有持久化存储
  if (!isValidUrl(supabaseUrl) || !isValidJWT(supabaseAnonKey)) {
    throw new Error(`Invalid Supabase configuration for server: URL=${isValidUrl(supabaseUrl)}, Key=${isValidJWT(supabaseAnonKey)}`)
  }
  
  return createBrowserClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
        flowType: 'pkce'
      }
    }
  )
})()
