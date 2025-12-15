/**
 * 报告生成系统配置文件
 * 整合Sonar + Qwen API设置和参数配置
 */

/**
 * Perplexity Sonar API配置
 */
export const PERPLEXITY_CONFIG = {
  apiKey: process.env.PERPLEXITY_API_KEY || '',
  apiUrl: process.env.PERPLEXITY_API_URL || 'https://api.perplexity.ai/chat/completions',
  model: process.env.SONAR_MODEL || 'sonar',
  timeout: parseInt(process.env.API_TIMEOUT || '300', 10) * 1000, // 转换为毫秒
  maxRetries: parseInt(process.env.MAX_RETRIES || '3', 10)
}

/**
 * Qwen API配置
 */
export const QWEN_CONFIG = {
  apiKey: process.env.QWEN_API_KEY || '',
  apiUrl: process.env.QWEN_API_URL || 'https://api.nuwaapi.com/v1/chat/completions',
  model: process.env.QWEN_MODEL || 'gemini-3-pro-preview',
  timeout: parseInt(process.env.API_TIMEOUT || '300', 10) * 1000, // 转换为毫秒
  maxRetries: parseInt(process.env.MAX_RETRIES || '3', 10)
}

/**
 * 报告生成参数配置
 */
export const REPORT_GENERATION_CONFIG = {
  // 查询规划参数
  maxSonarQueries: parseInt(process.env.MAX_SONAR_QUERIES || '8', 10),
  queryPlannerMaxTokens: parseInt(process.env.QUERY_PLANNER_MAX_TOKENS || '500', 10),
  
  // 深度分析参数
  deepAnalysisMaxTokens: parseInt(process.env.DEEP_ANALYSIS_MAX_TOKENS || '16000', 10),
  
  // 并发设置
  maxConcurrentSearches: parseInt(process.env.MAX_CONCURRENT_SEARCHES || '5', 10),
  
  // 缓存设置
  enableCache: process.env.ENABLE_CACHE === 'true' || process.env.ENABLE_CACHE === undefined,
  cacheExpiryHours: parseInt(process.env.CACHE_EXPIRY_HOURS || '6', 10)
}

/**
 * 验证配置完整性
 */
export function validateConfig(): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!PERPLEXITY_CONFIG.apiKey) {
    errors.push('PERPLEXITY_API_KEY is required')
  }
  
  if (!QWEN_CONFIG.apiKey) {
    errors.push('QWEN_API_KEY is required')
  }
  
  if (REPORT_GENERATION_CONFIG.maxSonarQueries < 1 || REPORT_GENERATION_CONFIG.maxSonarQueries > 20) {
    errors.push('MAX_SONAR_QUERIES should be between 1 and 20')
  }
  
  if (REPORT_GENERATION_CONFIG.maxConcurrentSearches < 1 || REPORT_GENERATION_CONFIG.maxConcurrentSearches > 10) {
    errors.push('MAX_CONCURRENT_SEARCHES should be between 1 and 10')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * 获取完整配置信息（用于日志和调试）
 */
export function getConfigSummary() {
  return {
    perplexity: {
      apiUrl: PERPLEXITY_CONFIG.apiUrl,
      model: PERPLEXITY_CONFIG.model,
      hasApiKey: !!PERPLEXITY_CONFIG.apiKey,
      timeout: PERPLEXITY_CONFIG.timeout,
      maxRetries: PERPLEXITY_CONFIG.maxRetries
    },
    qwen: {
      apiUrl: QWEN_CONFIG.apiUrl,
      model: QWEN_CONFIG.model,
      hasApiKey: !!QWEN_CONFIG.apiKey,
      timeout: QWEN_CONFIG.timeout,
      maxRetries: QWEN_CONFIG.maxRetries
    },
    reportGeneration: {
      maxSonarQueries: REPORT_GENERATION_CONFIG.maxSonarQueries,
      queryPlannerMaxTokens: REPORT_GENERATION_CONFIG.queryPlannerMaxTokens,
      deepAnalysisMaxTokens: REPORT_GENERATION_CONFIG.deepAnalysisMaxTokens,
      maxConcurrentSearches: REPORT_GENERATION_CONFIG.maxConcurrentSearches,
      enableCache: REPORT_GENERATION_CONFIG.enableCache,
      cacheExpiryHours: REPORT_GENERATION_CONFIG.cacheExpiryHours
    }
  }
}

