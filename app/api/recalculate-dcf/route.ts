import { NextRequest, NextResponse } from 'next/server'
import { createApiSupabaseClient } from '@/app/services/database/supabase-server'

// 强制动态渲染
export const dynamic = 'force-dynamic'

// Vercel配置 - 5分钟超时
export const maxDuration = 300

interface DCFParameters {
  revenueGrowth: { [year: string]: number }
  operatingMargin: { [year: string]: number }
  taxRate: { [year: string]: number }
  wacc: number
  terminalGrowthRate: number
  terminalMultiple: number
}

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
    console.log('🔄 开始DCF重新计算...')
    
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

    // 获取请求数据
    const { stockData, dcfParameters, locale = 'zh' } = await request.json()
    console.log('📊 股票数据:', stockData)
    console.log('📈 DCF参数:', dcfParameters)
    console.log('🌍 语言设置:', locale)

    if (!stockData || !dcfParameters) {
      return NextResponse.json(
        { error: 'Missing stock data or DCF parameters' },
        { status: 400 }
      )
    }

    // 首先搜索consensus数据
    console.log('🔍 搜索consensus数据...')
    const consensusData = await searchConsensusData(stockData, locale)
    console.log('📊 Consensus数据:', consensusData)

    // 构建API请求 - 使用Perplexity Sonar模型进行DCF重新计算
    const perplexityRequest = {
      model: 'sonar',
      messages: [
        {
          role: 'system',
          content: buildDCFSystemPrompt(locale)
        },
        {
          role: 'user',
          content: buildDCFUserPrompt(stockData, dcfParameters, locale)
        }
      ],
      max_tokens: 8000,
      temperature: 0.1,
      search_queries: true,
      search_recency_filter: 'month',
      return_citations: true,
      top_p: 0.9,
      presence_penalty: 0.1
    }

    console.log('📤 发送Perplexity Sonar API请求...')

    // 使用Perplexity API端点
    const perplexityApiKey = process.env.PERPLEXITY_API_KEY
    if (!perplexityApiKey) {
      throw new Error('PERPLEXITY_API_KEY environment variable is not set')
    }
    
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(perplexityRequest)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Perplexity API错误:', {
        status: response.status,
        statusText: response.statusText,
        errorText: errorText
      })
      
      return NextResponse.json(
        { 
          error: 'Perplexity API error', 
          details: errorText,
          status: response.status
        },
        { status: response.status }
      )
    }

    const data: PerplexityResponse = await response.json()
    console.log('✅ 收到Perplexity响应')

    // 监控token使用量
    const tokensUsed = data.usage?.total_tokens || 0
    const estimatedCost = (tokensUsed / 1000000) * 0.5 // $0.5 per 1M tokens for sonar model
    console.log(`💰 Token使用: ${tokensUsed}, 预估成本: $${estimatedCost.toFixed(4)}`)

    if (!data.choices && !data.content) {
      console.error('❌ 无效的API响应结构')
      return NextResponse.json(
        { error: 'Invalid API response' },
        { status: 500 }
      )
    }

    const content = data.choices?.[0]?.message?.content || data.content || ''
    console.log('📝 原始内容长度:', content.length)

    // 解析AI响应
    let dcfResults: any
    try {
      // 尝试解析JSON响应
      const responseText = data.choices?.[0]?.message?.content || data.text || data.content || ''
      
      // 清理响应文本
      let cleanedResponse = cleanDCFResponse(responseText)
      
      // 强制检查JSON格式
      if (!cleanedResponse.trim().startsWith('{') || !cleanedResponse.trim().endsWith('}')) {
        console.warn('⚠️ 响应不是有效的JSON格式，尝试修复...')
        const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          cleanedResponse = jsonMatch[0]
        } else {
          throw new Error('无法提取有效的JSON格式')
        }
      }
      
      dcfResults = JSON.parse(cleanedResponse)
    } catch (parseError) {
      console.error('❌ 解析DCF响应失败:', parseError)
      
      // 如果解析失败，返回默认结构
      dcfResults = {
        dcfValue: 0,
        targetPrice: 0,
        reasoning: content || 'DCF重新计算完成，但无法解析详细结果。',
        dcfScenarios: {
          base: 0,
          optimistic: 0,
          pessimistic: 0
        },
        updatedParameters: dcfParameters,
        calculationDetails: {
          presentValue: 0,
          terminalValue: 0,
          enterpriseValue: 0,
          equityValue: 0
        }
      }
    }

    console.log('✅ DCF重新计算完成!')
    
    return NextResponse.json({
      success: true,
      dcfResults,
      updatedParameters: dcfParameters,
      consensusData: consensusData,
      calculationTime: Date.now() - startTime
    })

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('❌ DCF重新计算失败:', errorMessage)
    
    return NextResponse.json({
      error: 'DCF重新计算失败',
      details: errorMessage,
      timestamp: new Date().toISOString(),
      responseTime: Date.now() - startTime
    }, { status: 500 })
  }
}

// 构建DCF系统提示
function buildDCFSystemPrompt(locale: string): string {
  const isChinese = locale === 'zh'
  
  if (isChinese) {
    return `您是一位专业的DCF估值分析师。请根据用户提供的DCF参数，重新计算公司的内在价值。

请严格按照以下JSON格式返回结果：

{
  "dcfValue": 数值,
  "targetPrice": 数值,
  "reasoning": "HTML格式的分析说明",
  "dcfScenarios": {
    "base": 数值,
    "optimistic": 数值,
    "pessimistic": 数值
  },
  "calculationDetails": {
    "presentValue": 数值,
    "terminalValue": 数值,
    "enterpriseValue": 数值,
    "equityValue": 数值
  },
  "sensitivityAnalysis": {
    "waccSensitivity": [
      {"wacc": 数值, "dcfValue": 数值},
      {"wacc": 数值, "dcfValue": 数值}
    ],
    "growthSensitivity": [
      {"growth": 数值, "dcfValue": 数值},
      {"growth": 数值, "dcfValue": 数值}
    ]
  }
}

要求：
1. 使用提供的DCF参数进行精确计算
2. 提供详细的计算逻辑和假设说明
3. 包含敏感性分析
4. reasoning字段使用HTML格式，包含专业的数据表格
5. 所有数值保留2位小数
6. 提供乐观、基准、悲观三种情景分析`
  } else {
    return `You are a professional DCF valuation analyst. Please recalculate the company's intrinsic value based on the provided DCF parameters.

Please return results in the following JSON format:

{
  "dcfValue": number,
  "targetPrice": number,
  "reasoning": "HTML formatted analysis explanation",
  "dcfScenarios": {
    "base": number,
    "optimistic": number,
    "pessimistic": number
  },
  "calculationDetails": {
    "presentValue": number,
    "terminalValue": number,
    "enterpriseValue": number,
    "equityValue": number
  },
  "sensitivityAnalysis": {
    "waccSensitivity": [
      {"wacc": number, "dcfValue": number},
      {"wacc": number, "dcfValue": number}
    ],
    "growthSensitivity": [
      {"growth": number, "dcfValue": number},
      {"growth": number, "dcfValue": number}
    ]
  }
}

Requirements:
1. Use the provided DCF parameters for precise calculations
2. Provide detailed calculation logic and assumption explanations
3. Include sensitivity analysis
4. Use HTML format for reasoning field with professional data tables
5. All numbers should be rounded to 2 decimal places
6. Provide optimistic, base, and pessimistic scenario analysis`
  }
}

// 构建DCF用户提示
function buildDCFUserPrompt(stockData: StockData, dcfParameters: DCFParameters, locale: string): string {
  const isChinese = locale === 'zh'
  
  return `${isChinese ? '请基于以下股票数据和DCF参数重新计算估值：' : 'Please recalculate the valuation based on the following stock data and DCF parameters:'}

${isChinese ? '股票数据：' : 'Stock Data:'}
- ${isChinese ? '公司名称' : 'Company'}: ${stockData.name} (${stockData.symbol})
- ${isChinese ? '当前价格' : 'Current Price'}: ${stockData.price}
- ${isChinese ? '市值' : 'Market Cap'}: ${stockData.marketCap}
- ${isChinese ? '市盈率' : 'P/E Ratio'}: ${stockData.peRatio}
- ${isChinese ? '交易金额' : 'Trading Amount'}: ${stockData.amount}

${isChinese ? 'DCF参数：' : 'DCF Parameters:'}
- ${isChinese ? '营业收入增长率' : 'Revenue Growth Rate'}: ${JSON.stringify(dcfParameters.revenueGrowth)}
- ${isChinese ? '营业利润率' : 'Operating Margin'}: ${JSON.stringify(dcfParameters.operatingMargin)}
- ${isChinese ? '税率' : 'Tax Rate'}: ${JSON.stringify(dcfParameters.taxRate)}
- WACC: ${(dcfParameters.wacc * 100).toFixed(2)}%
- ${isChinese ? '长期增长率' : 'Terminal Growth Rate'}: ${(dcfParameters.terminalGrowthRate * 100).toFixed(2)}%
- ${isChinese ? '终端倍数' : 'Terminal Multiple'}: ${dcfParameters.terminalMultiple}

${isChinese ? '请使用这些参数进行DCF计算，并提供详细的分析结果。' : 'Please use these parameters for DCF calculation and provide detailed analysis results.'}`
}

// 清理DCF响应
function cleanDCFResponse(content: string): string {
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

// 搜索consensus数据
async function searchConsensusData(stockData: StockData, locale: string): Promise<DCFParameters | null> {
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
  "terminalMultiple": 18.0
}

请确保数据来源可靠，使用最新的分析师预期数据。`
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
  "terminalMultiple": 18.0
}

Please ensure data sources are reliable and use the latest analyst expectations.`

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
      const cleanedContent = cleanDCFResponse(content)
      const consensusData = JSON.parse(cleanedContent)
      
      // 验证数据格式
      if (consensusData.revenueGrowth && consensusData.operatingMargin && consensusData.taxRate) {
        console.log('✅ Consensus数据解析成功')
        return consensusData as DCFParameters
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
