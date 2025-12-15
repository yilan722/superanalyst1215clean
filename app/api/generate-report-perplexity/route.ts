
// 使用 Node.js runtime 以避免 Edge Runtime 兼容性问题
export const runtime = "nodejs"

import { NextRequest, NextResponse } from 'next/server'
import { createApiSupabaseClient } from '../../services/database/supabase-server'
import { canGenerateReport, incrementReportUsage, createReport } from '../../services/database/supabase-auth'
import { QueryPlannerAgent } from '../../services/agents/query-planner'
import { InformationCollectorAgent } from '../../services/agents/information-collector'
import { DeepAnalystAgent } from '../../services/agents/deep-analyst'
import { convertMarkdownToHtml } from '../../services/report-formatter'

// 强制动态渲染，因为使用了request.headers和数据库操作
export const dynamic = 'force-dynamic'

// Vercel配置 - 13分钟超时（确保兼容性）
export const maxDuration = 800

interface StockData {
  symbol: string
  name: string
  price: string
  marketCap: string
  peRatio: string
  amount: string
}

interface PerplexityRequestBody {
  model: string
  messages: Array<{
    role: string
    content: string
  }>
  max_tokens?: number
  temperature?: number
  search_queries?: boolean
  search_recency_filter?: string
  return_citations?: boolean
  top_p?: number
  presence_penalty?: number
}

interface PerplexityResponse {
  choices?: Array<{
    message: {
      content: string
    }
  }>
  text?: string
  content?: string
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    // 增加超时时间到15分钟，确保有足够时间生成高质量报告
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 900000) // 15分钟超时（Vercel Pro支持）
    
    try {
      console.log('🚀 开始生成报告...')
      
      // 用户认证
      const authHeader = request.headers.get('Authorization')
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json(
          { error: 'Missing or invalid Authorization header' },
          { status: 401 }
        )
      }

      const userId = authHeader.replace('Bearer ', '')
      console.log('🔍 用户ID:', userId)

      // 验证用户（支持测试模式）
      let user = null
      if (userId === 'test-user-id') {
        console.log('🧪 使用测试模式，跳过用户验证')
        user = { id: 'test-user-id', email: 'test@example.com' }
      } else {
        const supabase = createApiSupabaseClient(request)
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single()

        if (userError || !userData) {
          console.error('❌ 用户验证失败:', userError)
          return NextResponse.json(
            { error: 'User not found' },
            { status: 404 }
          )
        }
        user = userData
      }

      // 检查用户是否可以生成报告（测试模式跳过）
      if (userId !== 'test-user-id') {
        const canGenerate = await canGenerateReport(user.id)
        if (!canGenerate.canGenerate) {
          return NextResponse.json(
            { error: 'Report generation limit reached', details: canGenerate.reason },
            { status: 403 }
          )
        }
      }

      // 获取请求数据
      const { stockData, locale = 'zh' } = await request.json()
      console.log('📊 股票数据:', stockData)
      console.log('🌍 语言设置:', locale)

      if (!stockData) {
        return NextResponse.json(
          { error: 'Missing stock data' },
          { status: 400 }
        )
      }

      // 使用新的三阶段报告生成流程（Sonar + Qwen）
      console.log('📤 开始三阶段报告生成流程...')
      
      const companyName = `${stockData.name} (${stockData.symbol})`
      
      try {
        // 阶段1: 查询规划（Qwen轻量调用）
        console.log('\n【阶段1/3】查询规划')
        console.log('-'.repeat(80))
        const queryPlanner = new QueryPlannerAgent()
        const queryPlan = await queryPlanner.generateSearchPlan(companyName, 'valuation')
        
        if (queryPlan.status !== 'success' || !queryPlan.plan) {
          throw new Error('查询规划失败')
        }
        
        console.log(`✅ 生成了 ${queryPlan.plan.queries.length} 个搜索查询`)
        queryPlan.plan.queries.forEach((q, i) => {
          console.log(`   ${i + 1}. [${q.priority}] ${q.purpose}: ${q.query.substring(0, 60)}...`)
        })
        
        // 阶段2: 信息收集（Sonar并行调用）
        console.log('\n【阶段2/3】信息收集')
        console.log('-'.repeat(80))
        const informationCollector = new InformationCollectorAgent()
        const collectionResult = await informationCollector.collectInformation(queryPlan)
        
        if (collectionResult.status !== 'success') {
          throw new Error('信息收集失败')
        }
        
        console.log(`✅ 搜索完成: ${collectionResult.successCount}/${collectionResult.totalQueries} 个查询成功`)
        
        // 格式化信息用于分析
        const formattedInfo = informationCollector.formatForAnalysis(collectionResult)
        
        // 阶段3: 深度分析（Qwen深度推理）
        console.log('\n【阶段3/3】深度分析')
        console.log('-'.repeat(80))
        const deepAnalyst = new DeepAnalystAgent()
        const analysisResult = await deepAnalyst.generateValuationReport(
          companyName,
          formattedInfo,
          'comprehensive'
        )
        
        if (analysisResult.status !== 'success' || !analysisResult.reportJson) {
          const errorMsg = analysisResult.error || '未知错误'
          console.error(`❌ 深度分析错误详情: ${errorMsg}`)
          throw new Error(`深度分析失败: ${errorMsg}`)
        }
        
        console.log('✅ 深度分析完成')
        
        // 收集所有citations
        const allCitations: string[] = []
        if (collectionResult.results) {
          for (const result of collectionResult.results) {
            if (result.status === 'success' && result.citations) {
              for (const citation of result.citations) {
                if (citation && !allCitations.includes(citation)) {
                  allCitations.push(citation)
                }
              }
            }
          }
        }
        
        // 阶段4: 格式转换（Markdown -> HTML）
        console.log('\n【阶段4/4】格式转换')
        console.log('-'.repeat(80))
        const reportJson = analysisResult.reportJson
        const htmlReport = convertMarkdownToHtml(reportJson)
        
        console.log('✅ Markdown转换为HTML完成')
        
        // 验证格式
        const requiredKeys = ['fundamentalAnalysis', 'businessSegments', 'growthCatalysts', 'valuationAnalysis']
        for (const key of requiredKeys) {
          if (!htmlReport[key]) {
            console.warn(`⚠️ 缺少章节: ${key}`)
          } else {
            const tableCount = (htmlReport[key].match(/<table class="metric-table">/g) || []).length
            console.log(`  ✅ ${key}: ${tableCount}个表格`)
          }
        }
        
        // 准备返回的报告内容（保持原有格式兼容）
        const reportContent: any = {
          fundamentalAnalysis: htmlReport.fundamentalAnalysis || '',
          businessSegments: htmlReport.businessSegments || '',
          growthCatalysts: htmlReport.growthCatalysts || '',
          valuationAnalysis: htmlReport.valuationAnalysis || ''
        }
        
        // 如果有AI洞察，也包含进去
        if (htmlReport.aiInsights) {
          reportContent.aiInsights = htmlReport.aiInsights
        }
        
        // 计算总耗时
        const elapsedTime = Date.now() - startTime
        console.log(`\n✅ 报告生成完成! 总耗时: ${(elapsedTime / 1000).toFixed(2)}秒`)
        
        // 验证报告格式
        const validatedContent = validateReportFormat(reportContent)

        console.log('✅ 报告生成成功!')
        
        // 保存报告到数据库
        console.log('💾 保存报告到数据库...')
        
        try {
          await createReport(
            user.id,
            stockData.symbol,
            stockData.name,
            JSON.stringify(validatedContent)
          )
          console.log('✅ 报告保存成功')
          
          // 更新用户使用量
          await incrementReportUsage(user.id)
          console.log('✅ 用户使用量更新成功')
        } catch (dbError) {
          console.error('❌ 保存报告到数据库时出错:', dbError)
          // 即使保存失败，也返回报告数据，不影响用户体验
        }
        
        // 搜索consensus数据
        console.log('🔍 开始搜索consensus数据...')
        let consensusData = null
        try {
          consensusData = await searchConsensusData(stockData, locale)
          console.log('📊 Consensus数据:', consensusData)
        } catch (consensusError) {
          console.error('❌ Consensus数据搜索失败:', consensusError)
          // 即使consensus搜索失败，也继续返回报告
        }
        
        // 返回报告内容和consensus数据
        return NextResponse.json({
          ...validatedContent,
          consensusData: consensusData
        })

      } catch (error) {
        clearTimeout(timeoutId)
        const errorMessage = error instanceof Error ? error.message : String(error)
        console.error('❌ 报告生成失败:', errorMessage)
        
        // 确保返回正确的JSON格式
        return NextResponse.json({
          error: '报告生成失败',
          details: errorMessage,
          timestamp: new Date().toISOString(),
          responseTime: Date.now() - startTime
        }, { status: 500 })
      } finally {
        clearTimeout(timeoutId)
      }
    } finally {
      clearTimeout(timeoutId)
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('❌ 报告生成失败:', errorMessage)
    
    // 确保返回正确的JSON格式
    return NextResponse.json({
      error: '报告生成失败',
      details: errorMessage,
      timestamp: new Date().toISOString(),
      responseTime: Date.now() - startTime
    }, { status: 500 })
  }
}

// 验证报告格式的函数
function validateReportFormat(reportContent: any): any {
  console.log('🔍 开始验证报告格式...')
  
  // 检查必需的四个部分
  const requiredSections = ['fundamentalAnalysis', 'businessSegments', 'growthCatalysts', 'valuationAnalysis']
  for (const section of requiredSections) {
    if (!reportContent[section]) {
      console.error(`❌ 缺少必需的部分: ${section}`)
      throw new Error(`Missing required section: ${section}`)
    }
  }
  
  // 验证每个部分的格式
  for (const section of requiredSections) {
    let content = reportContent[section]
    if (typeof content !== 'string') {
      console.error(`❌ 部分内容格式错误: ${section}`)
      throw new Error(`Invalid content format for section: ${section}`)
    }
    
    // 检查表格数量（每个部分应该恰好3个表格）
    const tableMatches = content.match(/<table class="metric-table">/g)
    const tableCount = tableMatches ? tableMatches.length : 0
    if (tableCount !== 3) {
      console.warn(`⚠️ 部分 ${section} 表格数量不正确: ${tableCount}/3`)
    }
    
    // 检查图表数量（每个部分应该恰好3个图表）
    const chartMatches = content.match(/<div class="chart-container">/g)
    const chartCount = chartMatches ? chartMatches.length : 0
    if (chartCount !== 3) {
      console.warn(`⚠️ 部分 ${section} 图表数量不正确: ${chartCount}/3`)
      // 不再自动添加重复的图表内容，避免产生无意义的重复
    }
    
    // 检查内容长度（每个部分最少500字）
    const textContent = content.replace(/<[^>]*>/g, '').trim()
    if (textContent.length < 500) {
      console.warn(`⚠️ 部分 ${section} 内容过短: ${textContent.length}/500`)
    }
  }
  
  console.log('✅ 报告格式验证完成')
  return reportContent
}

// 以下函数已不再使用（旧系统遗留代码）
// function buildDetailedUserPrompt - 已删除
// function parseNaturalLanguageReport - 已删除

// 以下函数已不再使用（旧系统遗留代码）
// function buildDetailedUserPrompt - 已删除
// function parseNaturalLanguageReport - 已删除

// 搜索consensus数据
async function searchConsensusData(stockData: StockData, locale: string): Promise<any> {
  try {
    console.log('🔍 开始搜索consensus数据...')
    
    const isChinese = locale === 'zh'
    const perplexityApiKey = process.env.PERPLEXITY_API_KEY
    if (!perplexityApiKey) {
      throw new Error('PERPLEXITY_API_KEY environment variable is not set')
    }

    const consensusPrompt = isChinese 
      ? `请搜索${stockData.name} (${stockData.symbol})的最新consensus数据，包括：
1. 分析师对2025-2027年营业收入增长率的预期
2. 分析师对2025-2027年营业利润率(Operating Margin)的预期
3. 分析师对2025-2027年税率的预期
4. 分析师对WACC的预期
5. 分析师对长期增长率的预期
6. 分析师对终端倍数的预期

请以JSON格式返回，格式如下：
{
  "revenueGrowth": {"2025": 0.25, "2026": 0.20, "2027": 0.15},
  "operatingMargin": {"2025": 0.62, "2026": 0.60, "2027": 0.58},
  "taxRate": {"2025": 0.15, "2026": 0.15, "2027": 0.15},
  "wacc": 0.125,
  "terminalGrowthRate": 0.04,
  "terminalMultiple": 18.0,
  "dataSources": [
    {
      "parameter": "revenueGrowth",
      "sources": ["https://example.com/analyst-report-1", "https://example.com/analyst-report-2"]
    },
    {
      "parameter": "operatingMargin", 
      "sources": ["https://example.com/analyst-report-3"]
    }
  ],
  "lastUpdated": "2025-01-16",
  "summary": "基于多家券商研报和分析师预期的consensus数据"
}

请确保数据来源可靠，使用最新的分析师预期数据，并提供具体的数据来源链接。`
      : `Please search for the latest consensus data for ${stockData.name} (${stockData.symbol}), including:
1. Analyst expectations for revenue growth rates for 2025-2027
2. Analyst expectations for operating margins for 2025-2027
3. Analyst expectations for tax rates for 2025-2027
4. Analyst expectations for WACC
5. Analyst expectations for terminal growth rate
6. Analyst expectations for terminal multiple

Please return in JSON format as follows:
{
  "revenueGrowth": {"2025": 0.25, "2026": 0.20, "2027": 0.15},
  "operatingMargin": {"2025": 0.62, "2026": 0.60, "2027": 0.58},
  "taxRate": {"2025": 0.15, "2026": 0.15, "2027": 0.15},
  "wacc": 0.125,
  "terminalGrowthRate": 0.04,
  "terminalMultiple": 18.0,
  "dataSources": [
    {
      "parameter": "revenueGrowth",
      "sources": ["https://example.com/analyst-report-1", "https://example.com/analyst-report-2"]
    },
    {
      "parameter": "operatingMargin", 
      "sources": ["https://example.com/analyst-report-3"]
    }
  ],
  "lastUpdated": "2025-01-16",
  "summary": "Consensus data based on multiple analyst reports and expectations"
}

Please ensure data sources are reliable and use the latest analyst expectations, and provide specific data source links.`

    const consensusRequest = {
      model: 'sonar',
      messages: [
        {
          role: 'system',
          content: isChinese 
            ? '您是一位专业的金融数据分析师，擅长搜索和分析股票consensus数据。请提供准确、最新的分析师预期数据。'
            : 'You are a professional financial data analyst specializing in searching and analyzing stock consensus data. Please provide accurate and up-to-date analyst expectations.'
        },
        {
          role: 'user',
          content: consensusPrompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.1,
      search_queries: true,
      search_recency_filter: 'month',
      return_citations: true,
      top_p: 0.9,
      presence_penalty: 0.1
    }

    console.log('🔍 发送consensus搜索请求到Perplexity...')
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(consensusRequest)
    })

    console.log('📡 Consensus搜索响应状态:', response.status)
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Consensus搜索API错误:', response.status, response.statusText, errorText)
      return null
    }

    const data: PerplexityResponse = await response.json()
    const content = data.choices?.[0]?.message?.content || data.content || ''
    
    console.log('📊 Consensus搜索结果:', content)

    // 解析consensus数据
    try {
      const cleanedContent = cleanConsensusResponse(content)
      const consensusData = JSON.parse(cleanedContent)
      
      // 验证数据格式
      if (consensusData.revenueGrowth && consensusData.operatingMargin && consensusData.taxRate) {
        console.log('✅ Consensus数据解析成功')
        return consensusData
      } else {
        console.warn('⚠️ Consensus数据格式不完整')
        return null
      }
    } catch (parseError) {
      console.error('❌ Consensus数据解析失败:', parseError)
      return null
    }

  } catch (error) {
    console.error('❌ Consensus数据搜索失败:', error)
    return null
  }
}

// 清理consensus响应内容
function cleanConsensusResponse(content: string): string {
  // 首先尝试提取markdown代码块中的JSON
  const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/)
  if (jsonMatch) {
    return jsonMatch[1].trim()
  }
  
  // 如果没有找到markdown代码块，尝试提取纯JSON
  const jsonStart = content.indexOf('{')
  const jsonEnd = content.lastIndexOf('}')
  if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
    return content.substring(jsonStart, jsonEnd + 1).trim()
  }
  
  // 如果都没有找到，返回原始内容（去除markdown标记）
  return content
    .replace(/```json\s*/g, '')
    .replace(/```\s*/g, '')
    .replace(/^[\s]*```[\s]*$/gm, '')
    .replace(/^[\s]*```json[\s]*$/gm, '')
    .trim()
}
