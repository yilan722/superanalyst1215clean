import { createBrowserClient } from '@supabase/ssr'

// 获取环境变量，提供默认值以避免 "Invalid value" 错误
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://decmecsshjqymhkykazg.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlY21lY3NzaGpxeW1oa3lrYXpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2MzIyNTMsImV4cCI6MjA3MDIwODI1M30.-eRwyHINS0jflhYeWT3bvZAmpdvSOLmpFmKCztMLzU0'

// 验证环境变量
if (!supabaseUrl || !supabaseAnonKey) {
  if (typeof window !== 'undefined') {
    console.error('❌ Missing Supabase configuration:', { 
      supabaseUrl: supabaseUrl ? '***' : 'undefined', 
      supabaseAnonKey: supabaseAnonKey ? '***' : 'undefined' 
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
    }
    return globalObj.__supabaseClient
  }
  
  // 服务器端：createBrowserClient 可以在服务器端使用，但通常应该使用 createServerClient
  // 这里为了兼容性，仍然创建实例，但会使用不同的存储机制
  // 注意：在服务器端，每次调用都会创建新实例，这是正常的，因为服务器端没有持久化存储
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
