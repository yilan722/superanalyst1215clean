/**
 * 信息收集Agent - 第二层：并行实时信息搜索
 * 使用Sonar API并行执行多个查询，快速收集全面信息
 */
import { SonarClient } from '../sonar-client'
import { REPORT_GENERATION_CONFIG } from '../report-generation-config'

interface QueryInfo {
  query: string
  purpose: string
  priority: 'high' | 'medium' | 'low'
}

interface QueryPlan {
  queries: QueryInfo[]
}

interface QueryPlanResult {
  status: 'success' | 'error'
  plan?: QueryPlan
  company?: string
  error?: string
}

interface OrganizedResult {
  query: string
  purpose: string
  priority: 'high' | 'medium' | 'low'
  content?: string
  citations?: string[]
  error?: string
  status: 'success' | 'error'
}

interface CollectionResult {
  status: 'success' | 'error'
  company?: string
  results?: OrganizedResult[]
  successCount?: number
  totalQueries?: number
  error?: string
}

const MAX_CONCURRENT_SEARCHES = REPORT_GENERATION_CONFIG.maxConcurrentSearches

export class InformationCollectorAgent {
  private sonarClient: SonarClient

  constructor(sonarClient?: SonarClient) {
    this.sonarClient = sonarClient || new SonarClient()
  }

  /**
   * 根据查询计划收集信息
   */
  async collectInformation(queryPlan: QueryPlanResult): Promise<CollectionResult> {
    // 验证查询计划格式
    if (!queryPlan || typeof queryPlan !== 'object') {
      return {
        status: 'error',
        error: `查询计划格式错误: 期望对象，得到 ${typeof queryPlan}`
      }
    }

    if (queryPlan.status !== 'success') {
      return {
        status: 'error',
        error: '无效的查询计划'
      }
    }

    if (!queryPlan.plan || !queryPlan.plan.queries) {
      return {
        status: 'error',
        error: '查询计划缺少必需字段'
      }
    }

    const queries = queryPlan.plan.queries
    const queryStrings = queries.map(q => q.query)

    console.log(`🔍 开始并行搜索 ${queryStrings.length} 个查询...`)

    // 并行执行所有查询（成本优化：节省时间）
    try {
      const results = await this.sonarClient.batchSearchAsync(
        queryStrings,
        MAX_CONCURRENT_SEARCHES
      )

      // 组织结果
      const organizedResults: OrganizedResult[] = []
      let successCount = 0

      for (let i = 0; i < results.length; i++) {
        const result = results[i]
        const queryInfo = queries[i]

        if (result.status === 'success') {
          organizedResults.push({
            query: result.query || queryInfo.query,
            purpose: queryInfo.purpose,
            priority: queryInfo.priority,
            content: result.content || '',
            citations: result.citations || [],
            status: 'success'
          })
          successCount++
        } else {
          const errorMsg = result.error || '未知错误'
          console.error(`  ❌ 查询失败: ${queryInfo.query.substring(0, 50)}... - ${errorMsg}`)
          organizedResults.push({
            query: result.query || queryInfo.query,
            purpose: queryInfo.purpose,
            priority: queryInfo.priority,
            error: errorMsg,
            status: 'error'
          })
        }
      }

      console.log(`✅ 搜索完成: ${successCount}/${queryStrings.length} 个查询成功`)

      // 如果所有查询都失败，显示警告
      if (successCount === 0) {
        console.warn(`\n⚠️  警告: 所有查询都失败了！`)
        console.warn(`   可能的原因:`)
        console.warn(`   1. API Key无效或过期`)
        console.warn(`   2. 网络连接问题`)
        console.warn(`   3. API限制或配额用完`)
        console.warn(`   4. 查询格式问题`)
        console.warn(`\n   请检查:`)
        console.warn(`   - 环境变量中的 PERPLEXITY_API_KEY`)
        console.warn(`   - 网络连接`)
        console.warn(`   - Perplexity API 账户状态`)
      }

      return {
        status: 'success',
        company: queryPlan.company,
        results: organizedResults,
        successCount,
        totalQueries: queryStrings.length
      }
    } catch (error: any) {
      console.error(`❌ 批量搜索异常: ${error.message}`)
      if (error.stack) {
        console.error(`   详细错误: ${error.stack.substring(0, 200)}`)
      }
      return {
        status: 'error',
        company: queryPlan.company,
        error: `批量搜索失败: ${error.message}`,
        results: [],
        successCount: 0,
        totalQueries: queryStrings.length
      }
    }
  }

  /**
   * 将收集的信息格式化为分析用的文本
   */
  formatForAnalysis(collectionResult: CollectionResult): string {
    if (collectionResult.status !== 'success') {
      return '信息收集失败'
    }

    let formattedText = `# ${collectionResult.company || 'Unknown'} - 实时信息汇总\n\n`
    formattedText += `收集时间: 当前\n`
    formattedText += `成功查询: ${collectionResult.successCount || 0}/${collectionResult.totalQueries || 0}\n\n`

    // 按优先级组织信息
    const priorities: Array<'high' | 'medium' | 'low'> = ['high', 'medium', 'low']
    const priorityLabels = {
      high: '核心信息',
      medium: '重要信息',
      low: '补充信息'
    }

    for (const priority of priorities) {
      const priorityResults = (collectionResult.results || []).filter(
        r => r.priority === priority && r.status === 'success'
      )

      if (priorityResults.length > 0) {
        formattedText += `## ${priorityLabels[priority]}\n\n`

        for (const result of priorityResults) {
          formattedText += `### ${result.purpose}\n`
          formattedText += `查询: ${result.query}\n\n`
          formattedText += `${result.content || ''}\n\n`

          // 添加引用来源
          const citations = result.citations || []
          if (citations.length > 0) {
            formattedText += '**引用来源:**\n'
            citations.forEach((citation, idx) => {
              formattedText += `${idx + 1}. ${citation}\n`
            })
            formattedText += '\n'
          }

          formattedText += '---\n\n'
        }
      }
    }

    return formattedText
  }
}

