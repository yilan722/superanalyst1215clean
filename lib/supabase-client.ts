import { createBrowserClient } from '@supabase/ssr'

// 创建全局的Supabase客户端实例
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      storageKey: 'supabase.auth.token',
      debug: process.env.NODE_ENV === 'development'
    },
    cookies: {
      get(name: string) {
        if (typeof document === 'undefined') return undefined
        const value = `; ${document.cookie}`
        const parts = value.split(`; ${name}=`)
        if (parts.length === 2) return parts.pop()?.split(';').shift()
        return undefined
      },
      set(name: string, value: string, options: any) {
        if (typeof document === 'undefined') return
        document.cookie = `${name}=${value}; ${Object.entries(options || {})
          .map(([key, val]) => `${key}=${val}`)
          .join('; ')}`
      },
      remove(name: string, options: any) {
        if (typeof document === 'undefined') return
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; ${Object.entries(options || {})
          .map(([key, val]) => `${key}=${val}`)
          .join('; ')}`
      }
    }
  }
)
