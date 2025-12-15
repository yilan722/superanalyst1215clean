/**
 * Perplexity Sonar API客户端 - 实时信息搜索
 * 从Python转换而来，使用fetch实现异步搜索
 */
interface SonarSearchResult {
  query: string
  content?: string
  citations?: string[]
  error?: string
  status: 'success' | 'error'
}

interface SonarSearchOptions {
  temperature?: number
  maxTokens?: number
}

import { PERPLEXITY_CONFIG } from './report-generation-config'

export class SonarClient {
  private apiKey: string
  private apiUrl: string
  private model: string

  constructor(apiKey?: string) {
    this.apiKey = apiKey || PERPLEXITY_CONFIG.apiKey
    this.apiUrl = PERPLEXITY_CONFIG.apiUrl
    this.model = PERPLEXITY_CONFIG.model
  }

  private getHeaders(): Record<string, string> {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    }
  }

  /**
   * 异步搜索单个查询
   */
  async searchAsync(
    query: string,
    options: SonarSearchOptions = {}
  ): Promise<SonarSearchResult> {
    const { temperature = 0.2, maxTokens = 2000 } = options

    const payload = {
      model: this.model,
      messages: [
        {
          role: 'system',
          content: 'You are a precise research assistant. Provide factual, up-to-date information with sources.'
        },
        {
          role: 'user',
          content: query
        }
      ],
      temperature,
      max_tokens: maxTokens
    }

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 60000) // 60秒超时

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorText = await response.text()
        const errorMsg = `API错误 ${response.status}: ${errorText.substring(0, 200)}`
        console.error(`  ⚠️  查询失败: ${query.substring(0, 50)}... - ${errorMsg}`)
        return {
          query,
          error: errorMsg,
          status: 'error'
        }
      }

      const result = await response.json()

      // 检查响应格式
      if (!result.choices || result.choices.length === 0) {
        return {
          query,
          error: 'API响应格式错误：缺少choices',
          status: 'error'
        }
      }

      const message = result.choices[0].message

      // 提取citations（如果存在）
      let citations: string[] = []
      if (result.citations) {
        citations = result.citations
      } else if (message.citations) {
        citations = message.citations
      }

      // 检查content是否存在
      if (!message.content) {
        return {
          query,
          error: 'API响应格式错误：缺少content',
          status: 'error'
        }
      }

      return {
        query,
        content: message.content,
        citations,
        status: 'success'
      }
    } catch (error: any) {
      let errorMsg = '未知错误'
      
      if (error.name === 'AbortError') {
        errorMsg = `查询超时: ${query.substring(0, 50)}...`
      } else if (error.message) {
        errorMsg = `异常: ${error.message}`
      }

      console.error(`  ⚠️  查询异常: ${query.substring(0, 50)}... - ${errorMsg}`)
      return {
        query,
        error: errorMsg,
        status: 'error'
      }
    }
  }

  /**
   * 批量并行搜索多个查询
   */
  async batchSearchAsync(
    queries: string[],
    maxConcurrent: number = 5
  ): Promise<SonarSearchResult[]> {
    const results: SonarSearchResult[] = []
    const semaphore = maxConcurrent

    // 分批处理，控制并发数
    for (let i = 0; i < queries.length; i += semaphore) {
      const batch = queries.slice(i, i + semaphore)
      const batchResults = await Promise.all(
        batch.map(query => this.searchAsync(query))
      )
      results.push(...batchResults)
    }

    return results
  }

  /**
   * 同步搜索（便捷方法）
   */
  async search(query: string, options?: SonarSearchOptions): Promise<SonarSearchResult> {
    return this.searchAsync(query, options)
  }

  /**
   * 同步批量搜索（便捷方法）
   */
  async batchSearch(
    queries: string[],
    maxConcurrent?: number
  ): Promise<SonarSearchResult[]> {
    return this.batchSearchAsync(queries, maxConcurrent)
  }
}

