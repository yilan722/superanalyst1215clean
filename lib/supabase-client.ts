import { createBrowserClient } from '@supabase/ssr'

// 创建全局的Supabase客户端实例
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
