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
    // 处理Supabase会话
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
                console.warn('Invalid cookie name:', name)
                return
              }
              if (value === null || value === undefined) {
                console.warn('Invalid cookie value (null/undefined) for:', name)
                return
              }
              const stringValue = String(value)
              if (stringValue.trim() === '') {
                console.warn('Invalid cookie value (empty) for:', name)
                return
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
                console.error('Error setting cookie in middleware:', error, { name, value: stringValue })
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

    // 刷新会话 - 这对API路由也很重要
    const { data: { session } } = await supabase.auth.getSession()
  
    // 如果是API路由，确保会话被正确传递
    if (pathname.startsWith('/api/')) {
      // 对于API路由，我们需要确保会话信息被正确传递
      if (session && session.user && session.user.id) {
        // 如果会话存在，将其添加到请求头中
        // 确保值不是 null 或 undefined
        const userId = String(session.user.id)
        if (userId) {
          response.headers.set('x-user-id', userId)
          response.headers.set('x-session-valid', 'true')
        }
      }
      return response
    }
    
    return handleLocaleRedirect(request, response)
    
  } catch (error) {
    console.error('❌ 中间件Supabase错误:', error)
    // 如果Supabase出错，仍然处理语言重定向
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