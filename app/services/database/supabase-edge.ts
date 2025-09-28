import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Edge Runtime 兼容的 Supabase 客户端
export function createEdgeSupabaseClient() {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
      flowType: 'implicit'
    },
    global: {
      fetch: fetch,
      WebSocket: typeof WebSocket !== 'undefined' ? WebSocket : undefined
    }
  })
}

// 用于 API 路由的 Edge Runtime 兼容客户端
export function createApiEdgeSupabaseClient(request: Request) {
  const cookieHeader = request.headers.get('cookie') || ''
  
  // 解析 cookies
  const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
    const trimmedCookie = cookie.trim()
    const equalIndex = trimmedCookie.indexOf('=')
    if (equalIndex > 0) {
      const key = trimmedCookie.substring(0, equalIndex)
      const value = trimmedCookie.substring(equalIndex + 1)
      if (key && value) {
        acc[key] = value
      }
    }
    return acc
  }, {} as Record<string, string>)

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
      flowType: 'implicit'
    },
    global: {
      fetch: fetch,
      WebSocket: typeof WebSocket !== 'undefined' ? WebSocket : undefined
    }
  })
}
