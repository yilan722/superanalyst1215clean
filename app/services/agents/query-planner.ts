/**
 * 查询规划Agent - 第一层：成本优化的查询生成
 * 使用Qwen轻量调用，生成精确的搜索查询计划
 */
import { QwenClient } from '../qwen-client'
import { REPORT_GENERATION_CONFIG } from '../report-generation-config'

interface Query {
  query: string
  purpose: string
  priority: 'high' | 'medium' | 'low'
}

interface QueryPlan {
  queries: Query[]
}

interface QueryPlanResult {
  status: 'success' | 'error'
  plan?: QueryPlan
  company?: string
  error?: string
  note?: string
}

const MAX_SONAR_QUERIES = REPORT_GENERATION_CONFIG.maxSonarQueries
const QUERY_PLANNER_MAX_TOKENS = REPORT_GENERATION_CONFIG.queryPlannerMaxTokens

export class QueryPlannerAgent {
  private qwenClient: QwenClient

  constructor(qwenClient?: QwenClient) {
    this.qwenClient = qwenClient || new QwenClient()
  }

  /**
   * 生成搜索计划
   */
  async generateSearchPlan(
    companyOrTopic: string,
    analysisType: string = 'valuation'
  ): Promise<QueryPlanResult> {
    const systemPrompt = `你是一个专业的投资研究助手。你的任务是将研究需求分解为${REPORT_GENERATION_CONFIG.maxSonarQueries}个精确的搜索查询。

目标：
1. 每个查询必须独特且不重叠
2. 查询应涵盖估值分析的关键维度
3. 优先获取最新的实时信息
4. 查询应该具体、可搜索
5. **必须包含股票当前价格和市值的查询**（高优先级）
6. **所有估值指标查询必须明确要求"截止今日"或"最新"数据**
7. **必须包含至少一个专门针对近期增发/融资事件的查询**（例如 secondary offering、equity financing、capital raise、rights issue、private placement、convertible bonds 等），需要获取每次融资的日期、发行方式、发行价格、发行规模以及募集资金用途

重要规则：
- 必须有一个查询专门获取股票当前价格和市值（使用 "current stock price", "market cap", "today", "latest" 等关键词）
- 必须有一个查询专门聚焦最近的增发/融资事件及条款（使用 "secondary offering", "equity financing", "capital raise", "rights issue", "private placement", "convertible bonds", "fundraising round" 等关键词，并结合公司名称）
- 所有估值指标（PE、PS、PB等）查询必须包含时间限定词（"latest", "current", "as of today", "截止今日" 等）
- 使用英文进行查询

输出格式（必须是有效的JSON）：
{
    "queries": [
        {"query": "具体查询内容", "purpose": "查询目的", "priority": "high/medium/low"},
        ...
    ]
}`

    const userPrompt = `请为以下研究主题生成${REPORT_GENERATION_CONFIG.maxSonarQueries}个搜索查询：

研究对象：${companyOrTopic}
分析类型：${analysisType}

对于估值分析，请涵盖以下维度（必须包含）：
1. **股票当前价格和市值**（高优先级）：当前股价、市值、交易量等实时数据
2. **公司基本介绍**（高优先级）：公司成立背景、发展历史、核心团队、管理层背景
3. 公司基本面（最新财务数据、营收、利润）
4. **竞争和合作关系**（高优先级）：主要竞争对手、战略合作伙伴、合作关系
5. **供应链关系**（中优先级）：主要供应商、客户关系、供应链稳定性
6. 行业地位和竞争优势
7. 最新新闻和重大事件
8. **增发/融资事件（高优先级）**：secondary offerings、equity financing、capital raise、rights issue、private placement、convertible bonds 等，重点获取每次融资的时间、方式、发行价格相对当时股价的折价/溢价、发行规模、认购对象以及募集资金用途
9. **市场估值指标（截止今日最新数据）**：PE市盈率、PS市销率、PB市净率等估值指标，必须明确要求 "截止今日" 或 "最新" 数据
10. 未来增长预期和战略方向
11. 风险因素和挑战
12. 分析师观点和评级
13. 行业趋势和宏观环境

重要要求：
- 必须包含一个查询专门获取股票当前价格和市值（作为高优先级查询）
- 必须包含一个查询专门获取公司基本介绍（成立背景、团队、管理层）
- 必须包含一个查询专门获取竞争和合作关系（竞争对手、合作伙伴）
- 必须包含一个查询专门获取供应链关系（供应商、客户关系）
- 必须包含一个查询专门获取最近几次增发/融资事件及关键条款（发行日期、方式、价格、规模、认购对象、募集资金用途等），用于评估融资压力、管理层议价能力和对现有股东的摊薄影响
- 所有估值指标相关的查询必须明确包含 "截止今日"、"最新"、"current"、"latest" 等时间限定词
- 查询应该具体、可搜索，使用英文

请生成精确、可搜索的查询。只返回JSON，不要其他内容。`

    try {
      const response = await this.qwenClient.simplePrompt(userPrompt, {
        systemPrompt,
        temperature: 0.3, // 低温度保证结构化输出
        maxTokens: QUERY_PLANNER_MAX_TOKENS
      })

      // 解析JSON响应
      let cleanedResponse = response.trim()
      
      // 尝试提取JSON（有时模型会添加额外文本）
      if (cleanedResponse.includes('```json')) {
        const jsonMatch = cleanedResponse.match(/```json\s*([\s\S]*?)\s*```/)
        if (jsonMatch) {
          cleanedResponse = jsonMatch[1].trim()
        }
      } else if (cleanedResponse.includes('```')) {
        const jsonMatch = cleanedResponse.match(/```\s*([\s\S]*?)\s*```/)
        if (jsonMatch) {
          cleanedResponse = jsonMatch[1].trim()
        }
      }

      // 尝试找到JSON对象
      const startIdx = cleanedResponse.indexOf('{')
      const endIdx = cleanedResponse.lastIndexOf('}')
      if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
        cleanedResponse = cleanedResponse.substring(startIdx, endIdx + 1)
      }

      const plan = JSON.parse(cleanedResponse) as { queries?: any[] }

      // 验证和限制查询数量
      if (plan.queries && Array.isArray(plan.queries)) {
        const queries = plan.queries.slice(0, MAX_SONAR_QUERIES)

        // 标准化查询格式：如果是字符串，转换为字典
        const normalizedQueries: Query[] = []
        for (let i = 0; i < queries.length; i++) {
          const q = queries[i]
          if (typeof q === 'string') {
            // 字符串格式，转换为字典
            normalizedQueries.push({
              query: q,
              purpose: `查询 ${i + 1}`,
              priority: i < 3 ? 'high' : (i < 6 ? 'medium' : 'low')
            })
          } else if (q && typeof q === 'object' && 'query' in q) {
            // 已经是字典格式
            normalizedQueries.push({
              query: q.query || '',
              purpose: q.purpose || `查询 ${i + 1}`,
              priority: (q.priority || 'medium') as 'high' | 'medium' | 'low'
            })
          }
        }

        return {
          status: 'success',
          plan: { queries: normalizedQueries },
          company: companyOrTopic
        }
      } else {
        throw new Error("响应中缺少'queries'字段")
      }
    } catch (error: any) {
      // 如果JSON解析失败，返回默认查询计划
      console.warn(`⚠️ 查询规划失败: ${error.message}`)
      console.log(`✅ 使用备用查询计划`)
      return this.getFallbackPlan(companyOrTopic, analysisType)
    }
  }

  /**
   * 备用查询计划（当AI生成失败时）
   */
  private getFallbackPlan(
    companyOrTopic: string,
    analysisType: string
  ): QueryPlanResult {
    const fallbackQueries: Query[] = [
      {
        query: `${companyOrTopic} current stock price market cap market capitalization today latest`,
        purpose: '股票当前价格和市值',
        priority: 'high'
      },
      {
        query: `${companyOrTopic} company background founding history management team executives leadership`,
        purpose: '公司基本介绍（成立背景、团队）',
        priority: 'high'
      },
      {
        query: `${companyOrTopic} latest financial results revenue profit 2024 2025`,
        purpose: '最新财务数据',
        priority: 'high'
      },
      {
        query: `${companyOrTopic} competitors competitive landscape strategic partnerships alliances`,
        purpose: '竞争和合作关系',
        priority: 'high'
      },
      {
        query: `${companyOrTopic} secondary offering equity financing capital raise rights issue private placement convertible bonds fundraising round details`,
        purpose: '最近的增发/股权融资/配股/可转债等融资事件及关键条款（日期、方式、价格、规模、用途）',
        priority: 'high'
      },
      {
        query: `${companyOrTopic} supply chain suppliers customers key relationships`,
        purpose: '供应链关系',
        priority: 'medium'
      },
      {
        query: `${companyOrTopic} PE ratio PS ratio PB ratio valuation metrics latest current as of today`,
        purpose: '估值指标（截止今日最新数据）',
        priority: 'high'
      },
      {
        query: `${companyOrTopic} recent news major events announcements`,
        purpose: '最新新闻',
        priority: 'medium'
      },
      {
        query: `${companyOrTopic} growth forecast future outlook strategy`,
        purpose: '增长预期',
        priority: 'medium'
      }
    ]

    return {
      status: 'success',
      plan: { queries: fallbackQueries.slice(0, REPORT_GENERATION_CONFIG.maxSonarQueries) },
      company: companyOrTopic,
      note: '使用备用查询计划'
    }
  }
}

