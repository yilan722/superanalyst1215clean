import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

// 获取环境变量，确保它们是有效的字符串
const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = process.env[key]
  if (!value || typeof value !== 'string' || value.trim() === '') {
    if (defaultValue) {
      return defaultValue
    }
    throw new Error(`${key} is not set or is not a valid string`)
  }
  return value.trim()
}

const supabaseUrl = getEnvVar('NEXT_PUBLIC_SUPABASE_URL', 'https://decmecsshjqymhkykazg.supabase.co')
const supabaseAnonKey = getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlY21lY3NzaGpxeW1oa3lrYXpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2MzIyNTMsImV4cCI6MjA3MDIwODI1M30.-eRwyHINS0jflhYeWT3bvZAmpdvSOLmpFmKCztMLzU0')
// Service role key for API routes (bypasses RLS)
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Server-side Supabase client
export function createServerSupabaseClient() {
  const cookieStore = cookies()

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          try {
            const allCookies = cookieStore.getAll()
            // 确保所有cookie值都是有效的字符串
            return allCookies
              .filter(cookie => {
                return cookie.name && 
                       cookie.value !== null && 
                       cookie.value !== undefined &&
                       typeof cookie.name === 'string' &&
                       typeof cookie.value === 'string'
              })
              .map(cookie => ({
                name: String(cookie.name).trim(),
                value: String(cookie.value).trim()
              }))
          } catch (error) {
            console.error('Error getting cookies:', error)
            return []
          }
        },
        setAll(cookiesToSet) {
          try {
            if (!cookiesToSet || !Array.isArray(cookiesToSet)) {
              return
            }
            cookiesToSet.forEach(({ name, value, options }) => {
              // 验证 name 和 value 都是有效的字符串
              if (!name || typeof name !== 'string' || name.trim() === '') {
                console.warn('Invalid cookie name:', name)
                return
              }
              if (value === null || value === undefined) {
                console.warn('Invalid cookie value (null/undefined) for:', name)
                return
              }
              const stringValue = String(value)
              
              // 验证并清理 options
              const validOptions: any = {}
              if (options) {
                Object.entries(options).forEach(([key, val]) => {
                  if (val !== null && val !== undefined) {
                    if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') {
                      validOptions[key] = val
                    } else if (typeof val === 'object' && val instanceof Date) {
                      validOptions[key] = val
                    }
                  }
                })
              }
              
              cookieStore.set(name, stringValue, validOptions)
            })
          } catch (error) {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
            console.warn('Error setting cookies in Server Component:', error)
          }
        },
      },
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce'
      }
    }
  )
}

// 专门用于API路由的Supabase客户端
// 使用 service role key 绕过 RLS 策略，允许查询用户数据
export function createApiSupabaseClient(request: Request) {
  // 确保环境变量是有效的字符串
  if (!supabaseUrl || typeof supabaseUrl !== 'string' || supabaseUrl.trim() === '') {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not a valid string')
  }
  
  // 优先使用 service role key（绕过 RLS），如果没有则回退到 anon key
  const apiKey = supabaseServiceKey && typeof supabaseServiceKey === 'string' && supabaseServiceKey.trim() !== ''
    ? supabaseServiceKey
    : supabaseAnonKey
  
  if (!apiKey || typeof apiKey !== 'string' || apiKey.trim() === '') {
    throw new Error('Supabase API key is not configured. Please set SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }

  // 如果使用 service role key，使用标准客户端（不需要 cookie 处理）
  if (apiKey === supabaseServiceKey) {
    console.log('🔑 使用 Service Role Key 创建 Supabase 客户端（绕过 RLS）')
    return createClient(
      supabaseUrl,
      apiKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
  }

  // 回退到使用 anon key 和 cookie-based 客户端（用于向后兼容）
  console.log('⚠️ 使用 Anon Key 创建 Supabase 客户端（受 RLS 限制）')
  const cookieHeader = request.headers.get('cookie') || ''
  
  // 解析cookies，确保所有值都是有效的字符串
  const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
    const trimmedCookie = cookie.trim()
    const equalIndex = trimmedCookie.indexOf('=')
    if (equalIndex > 0) {
      const key = trimmedCookie.substring(0, equalIndex).trim()
      const value = trimmedCookie.substring(equalIndex + 1).trim()
      // 确保 key 和 value 都是非空字符串
      if (key && value && key.length > 0 && value.length > 0) {
        acc[key] = value
      }
    }
    return acc
  }, {} as Record<string, string>)

  return createServerClient(
    supabaseUrl,
    apiKey,
    {
      cookies: {
        getAll() {
          return Object.entries(cookies)
            .filter(([name, value]) => {
              // 确保 name 和 value 都是有效的非空字符串
              return name && 
                     value && 
                     typeof name === 'string' && 
                     typeof value === 'string' &&
                     name.trim().length > 0 &&
                     value.trim().length > 0
            })
            .map(([name, value]) => {
              // 确保转换为字符串，并去除前后空格
              const cleanName = String(name).trim()
              const cleanValue = String(value).trim()
              // 再次验证，确保不是空字符串
              if (!cleanName || !cleanValue) {
                return null
              }
              return { 
                name: cleanName, 
                value: cleanValue
              }
            })
            .filter((cookie): cookie is { name: string; value: string } => cookie !== null)
        },
        setAll(cookiesToSet) {
          // 在API路由中，我们不需要设置cookies
          // 但需要确保不会导致错误
          if (!cookiesToSet || !Array.isArray(cookiesToSet)) {
            return
          }
          // 验证并过滤无效的cookie值
          cookiesToSet.forEach(({ name, value, options }) => {
            if (name && value && typeof name === 'string' && typeof value === 'string') {
              // 验证 options 中的值也是有效的
              if (options) {
                const validOptions: any = {}
                Object.entries(options).forEach(([key, val]) => {
                  // 只保留有效的字符串、数字或布尔值
                  if (val !== null && val !== undefined) {
                    if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') {
                      validOptions[key] = val
                    }
                  }
                })
                // 这里不实际设置cookie，因为我们在API路由中
              }
            }
          })
        },
      },
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
        debug: process.env.NODE_ENV === 'development'
      }
    }
  )
} 