/**
 * 输入验证工具
 * 用于防止注入攻击和恶意输入
 */

export class InputValidator {
  // 验证股票代码
  static validateStockSymbol(symbol: string): boolean {
    if (!symbol || typeof symbol !== 'string') return false
    
    // 长度限制
    if (symbol.length < 1 || symbol.length > 10) return false
    
    // 只允许字母、数字、点号
    const validPattern = /^[A-Za-z0-9.]+$/
    return validPattern.test(symbol)
  }

  // 验证股票名称
  static validateStockName(name: string): boolean {
    if (!name || typeof name !== 'string') return false
    
    // 长度限制
    if (name.length < 1 || name.length > 100) return false
    
    // 允许中文、英文、数字、空格、括号、点号
    const validPattern = /^[\u4e00-\u9fffA-Za-z0-9\s().,]+$/
    return validPattern.test(name)
  }

  // 验证搜索查询
  static validateSearchQuery(query: string): boolean {
    if (!query || typeof query !== 'string') return false
    
    // 长度限制
    if (query.length < 1 || query.length > 50) return false
    
    // 防止SQL注入和XSS
    const dangerousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /union\s+select/i,
      /drop\s+table/i,
      /delete\s+from/i,
      /insert\s+into/i,
      /update\s+set/i
    ]
    
    return !dangerousPatterns.some(pattern => pattern.test(query))
  }

  // 验证用户ID
  static validateUserId(userId: string): boolean {
    if (!userId || typeof userId !== 'string') return false
    
    // UUID格式验证
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    return uuidPattern.test(userId)
  }

  // 验证报告内容
  static validateReportContent(content: string): boolean {
    if (!content || typeof content !== 'string') return false
    
    // 长度限制（防止过大的内容）
    if (content.length > 1000000) return false // 1MB限制
    
    // 检查是否包含恶意内容
    const maliciousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /eval\s*\(/i,
      /expression\s*\(/i
    ]
    
    return !maliciousPatterns.some(pattern => pattern.test(content))
  }

  // 验证语言代码
  static validateLocale(locale: string): boolean {
    if (!locale || typeof locale !== 'string') return false
    
    // 只允许预定义的语言代码
    const allowedLocales = ['zh', 'en', 'zh-CN', 'en-US']
    return allowedLocales.includes(locale)
  }

  // 清理HTML内容
  static sanitizeHtml(html: string): string {
    if (!html || typeof html !== 'string') return ''
    
    // 移除危险的HTML标签和属性
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
      .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
      .replace(/javascript\s*:/gi, '')
  }

  // 验证计划ID
  static validatePlanId(planId: string): boolean {
    if (!planId || typeof planId !== 'string') return false
    
    // 只允许预定义的计划ID
    const allowedPlans = ['basic', 'professional', 'business']
    return allowedPlans.includes(planId)
  }

  // 验证优惠券代码
  static validateCouponCode(couponCode: string): boolean {
    if (!couponCode || typeof couponCode !== 'string') return false
    
    // 长度限制
    if (couponCode.length < 3 || couponCode.length > 20) return false
    
    // 只允许字母、数字、连字符
    const validPattern = /^[A-Za-z0-9-]+$/
    return validPattern.test(couponCode)
  }
}

// 输入验证中间件
export function validateInput<T extends Record<string, any>>(
  data: T,
  rules: Partial<Record<keyof T, (value: any) => boolean>>
): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  for (const [field, validator] of Object.entries(rules)) {
    if (validator && !validator(data[field as keyof T])) {
      errors.push(`Invalid input for field: ${field}`)
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}
