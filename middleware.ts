import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { locales, defaultLocale } from './app/services/i18n'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // 创建响应对象
  let response = NextResponse.next()

  // 检查必需的环境变量
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ 中间件错误: Supabase环境变量未设置')
    // 如果环境变量未设置，直接返回响应，不处理Supabase会话
    return handleLocaleRedirect(request, response)
  }

  try {
    // ⚠️ 重要优化：Vercel Edge Middleware 有严格的执行时间限制（通常 < 50ms）
    // 不要在 Middleware 中做慢速的数据库查询或网络请求，这会导致 504 超时错误
    
    // 对于 API 路由，跳过 Supabase 客户端创建，让 API 路由自己处理认证
    // 这样可以避免在 Edge Middleware 中的任何潜在慢速操作
    if (pathname.startsWith('/api/')) {
      // API 路由：直接返回，让 API 路由内部使用 createApiSupabaseClient 进行认证
      return response
    }
    
    // 对于非 API 路由，创建 Supabase 客户端仅用于 cookie 管理（不查询数据库）
    // 实际的会话刷新会在页面组件中通过 Supabase SSR 自动进行
    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              // 确保 name 和 value 都是有效的字符串
              if (!name || typeof name !== 'string' || name.trim() === '') {
                return // 静默跳过无效的 cookie
              }
              if (value === null || value === undefined) {
                return // 静默跳过无效值
              }
              const stringValue = String(value)
              if (stringValue.trim() === '') {
                return // 静默跳过空值
              }
              
              try {
                request.cookies.set(name, stringValue)
                response = NextResponse.next({
                  request: {
                    headers: request.headers,
                  },
                })
                
                // 验证并清理 options，确保所有值都是有效的
                const validOptions: any = {}
                if (options) {
                  Object.entries(options).forEach(([key, val]) => {
                    // 只保留有效的字符串、数字或布尔值
                    if (val !== null && val !== undefined) {
                      if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') {
                        validOptions[key] = val
                      } else if (typeof val === 'object' && val instanceof Date) {
                        validOptions[key] = val
                      }
                    }
                  })
                }
                response.cookies.set(name, stringValue, validOptions)
              } catch (error) {
                // 静默处理 cookie 设置错误，避免影响主流程
              }
            })
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
    
    // 注意：这里不调用 getSession()，因为那会触发数据库查询
    // 会话刷新会在页面组件加载时自动进行（通过 Supabase SSR）
    
    return handleLocaleRedirect(request, response)
    
  } catch (error) {
    // 如果任何操作失败，仍然处理语言重定向，确保网站可以正常访问
    console.error('❌ 中间件错误:', error)
    return handleLocaleRedirect(request, response)
  }
}

// 处理语言重定向的辅助函数
function handleLocaleRedirect(request: NextRequest, response: NextResponse) {
  const pathname = request.nextUrl.pathname
  
  // 检查路径是否已经包含语言代码
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  // 处理语言重定向
  if (pathnameHasLocale) {
    return response
  }

  // 特殊路径不需要语言重定向
  const specialPaths = ['/sitemap.xml', '/robots.txt', '/manifest.json']
  if (specialPaths.includes(pathname)) {
    return response
  }

  // 重定向到默认语言
  const locale = defaultLocale
  request.nextUrl.pathname = `/${locale}${pathname}`
  return NextResponse.redirect(request.nextUrl)
}

export const config = {
  matcher: [
    // 只匹配需要处理的路径，避免所有路径
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
} 