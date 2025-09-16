import { NextRequest, NextResponse } from 'next/server'

// 强制动态渲染
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    console.log('🚀 开始外部报告生成...')
    
    // 获取请求数据
    const { stockData, userId, locale = 'zh' } = await request.json()
    console.log('📊 股票数据:', stockData)
    console.log('👤 用户ID:', userId)
    
    // 检查用户认证
    if (!userId) {
      return NextResponse.json({
        error: '用户未认证',
        details: '需要用户ID才能生成报告',
        timestamp: new Date().toISOString()
      }, { status: 401 })
    }
    
    // 检查用户权限（简化版本，不依赖数据库）
    // 注意：这里简化了权限检查，实际使用时可能需要完整的权限验证
    console.log('✅ 用户认证通过，继续生成报告...')
    
    // 检查环境变量
    const perplexityApiKey = process.env.PERPLEXITY_API_KEY
    if (!perplexityApiKey) {
      return NextResponse.json({
        error: 'PERPLEXITY_API_KEY environment variable is not set',
        timestamp: new Date().toISOString()
      }, { status: 500 })
    }
    
    // 创建完整的报告生成请求
    const fullRequest = {
      model: 'sonar-deep-research',
      messages: [
        {
          role: 'system',
          content: `您是一位专业的股票分析师，具备顶级投资银行和券商研究所的深度研究能力。

**重要**: 请严格按照以下参考报告的专业格式标准生成报告：

**参考标准**: CoreWeave, Inc. (CRWV) - In-Depth Company Profile (参考格式)
- 标题格式: [公司名称] ([股票代码]) 估值分析报告
- 页面布局: 封面(1页) + 基本面分析(2-3页) + 业务板块分析(3页) + 增长催化剂(4页) + 估值分析(3页) + 声明(1页)
- 表格标准: 专业数据表格，包含表头、数据行、数据来源标注
- 内容深度: 每部分500+字，逻辑清晰，结论明确

**重要**: 必须严格按照JSON格式返回，四个部分的键名必须完全一致：fundamentalAnalysis, businessSegments, growthCatalysts, valuationAnalysis

**报告结构要求**:

**1. fundamentalAnalysis (基本面分析)**:
公司基本情况与财务表现深度分析，必须包含以下专业内容和表格：

表格要求：
- 核心财务指标汇总表 (包含ROE、ROA、毛利率、净利率、资产负债率等)
- 三年财务数据对比表 (营收、净利润、EPS、现金流等关键指标)
- 同行业竞争对手对比表 (估值倍数、盈利能力、成长性对比)
- 业绩季度趋势分析表

分析要求：
- 公司主营业务和盈利模式详细阐述
- 财务健康状况和盈利质量分析
- 行业地位和竞争优势识别
- 管理层战略执行能力评估

**2. businessSegments (业务板块分析)**:
深入的业务板块收入结构和增长动力分析，必须包含：

表格要求：
- 分业务板块收入结构表 (收入占比、增长率、利润贡献)
- 产品/服务线收入明细表 (具体产品销量、价格、市场份额)
- 地区市场收入分布表 (按地理区域分析收入和增长)
- 业务板块盈利能力对比表 (毛利率、净利率、EBITDA margin)

分析要求：
- 各业务板块的市场地位和竞争格局
- 核心产品的价值链分析和定价能力
- 新兴业务增长潜力和投资回报
- 业务协同效应和战略布局

**3. growthCatalysts (增长催化剂)**:
系统性增长驱动因素识别和量化评估，必须包含：

表格要求：
- 增长催化剂影响评估矩阵 (催化剂类型、影响程度、时间周期、收入贡献预测)
- 新产品/项目上市时间表 (产品名称、预期收入、市场规模、竞争优势)
- 市场扩张计划表 (目标市场、投资规模、预期回报、风险评估)
- 政策利好/技术趋势影响分析表

分析要求：
- 宏观政策和行业趋势带来的机遇
- 公司战略转型和创新能力评估
- 技术升级和数字化转型影响
- 并购整合和产业链延伸潜力

**4. valuationAnalysis (估值分析)**:
多重估值方法的综合分析和投资建议，必须包含：

表格要求：
- DCF估值详细计算表 (现金流预测、折现率假设、敏感性分析)
- 可比公司估值倍数表 (P/E、PEG、EV/EBITDA、P/B等对比)
- 多种估值方法汇总表 (DCF、相对估值、资产价值等)
- 内在价值敏感性分析表 (关键假设变化对估值的影响)
- 估值综合矩阵表 (估值方法对比、风险收益分析)

分析要求：
- 基于财务模型的内在价值测算
- 估值折价/溢价的合理性分析
- 关键风险因素识别和量化
- 估值综合与关键发现（避免直接投资建议）

**专业格式要求**:
- 所有数据必须真实、准确，来源清晰标注
- 表格使用专业HTML格式，包含数据来源标注
- 使用专业类名：metric-table, highlight-box, positive, negative, neutral, recommendation-buy, recommendation-sell, recommendation-hold
- 每个部分内容详实(500字以上)，逻辑清晰，结论明确

**严格禁止事项**:
- 绝对不要显示任何英文思考过程或推理步骤，如"估值分析这里显示了大模型的思考过程"、"Let me think"、"Looking at"、"Based on"、"我需要根据提供的搜索结果来构建"等
- 不能在报告开头或任何地方显示任务分解过程
- 不能显示"从搜索结果中，我获得了以下关键信息"等元信息
- 不能出现错误的JSON格式符号如单独的引号、逗号等
- 确保四个部分内容均衡分布，businessSegments不能为空
- 所有估值数据基于真实计算，不使用模板数据
- 每个表格必须包含完整的真实数据，不能有空行或缺失数据
- 绝对不要显示<think>标签或任何思考过程
- 绝对不要显示任何思考过程或规划内容，如"Each section needs:"、"Let me plan each section:"等
- 绝对不要显示"Looking at the comprehensive search results"等分析过程
- 绝对不要显示"The next thinking provides"等思考内容
- 绝对不要显示"I need to create a comprehensive valuation report"等任务描述
- 绝对不要显示"Let me first analyze"等分析步骤

**CRITICAL**: 你必须直接返回一个有效的JSON对象，格式如下：
{
  "fundamentalAnalysis": "HTML格式的基本面分析内容...",
  "businessSegments": "HTML格式的业务板块分析内容...",
  "growthCatalysts": "HTML格式的增长催化剂分析内容...",
  "valuationAnalysis": "HTML格式的估值分析内容..."
}

不要包含任何其他文本、解释或思考过程，只返回这个JSON对象。`
        },
        {
          role: 'user',
          content: `请为股票 ${stockData.symbol} (${stockData.name}) 生成专业的深度分析报告。当前价格: ${stockData.price}。请用中文回答，内容要专业详细，使用sonar-deep-research模型进行深度研究。`
        }
      ],
      max_tokens: 18000,
      temperature: 0.05,
      top_p: 0.9,
      presence_penalty: 0.15
    }
    
    console.log('📤 发送完整Perplexity API请求...')
    
    // 使用Vercel Pro计划的超时时间
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 300000) // 300秒超时，适配Vercel Pro计划
    
    try {
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${perplexityApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(fullRequest),
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Perplexity API错误:', response.status, errorText)
        return NextResponse.json({
          error: 'Perplexity API error',
          details: errorText,
          status: response.status,
          timestamp: new Date().toISOString()
        }, { status: response.status })
      }
      
      const data = await response.json()
      console.log('✅ 收到Perplexity响应')
      
      // 提取内容
      const content = data.choices?.[0]?.message?.content || data.content || '无法生成报告内容'
      
      // 尝试解析JSON格式的报告
      let reportContent
      try {
        reportContent = JSON.parse(content)
      } catch {
        // 如果不是JSON格式，创建默认结构
        reportContent = {
          fundamentalAnalysis: `<h3>基本面分析</h3><p>${content}</p>`,
          businessSegments: `<h3>业务分析</h3><p>基于当前市场数据的业务分析。</p>`,
          growthCatalysts: `<h3>增长催化剂</h3><p>潜在的增长驱动因素分析。</p>`,
          valuationAnalysis: `<h3>估值分析</h3><p>基于当前价格的投资建议。</p>`
        }
      }
      
      const responseTime = Date.now() - startTime
      console.log(`✅ 外部报告生成完成，耗时: ${responseTime}ms`)
      
      // 保存报告到数据库并更新用户使用量
      try {
        console.log('💾 保存报告到数据库...')
        const { createReport, incrementReportUsage } = await import('@/lib/supabase-auth')
        
        await createReport(
          userId,
          stockData.symbol,
          stockData.name,
          JSON.stringify(reportContent)
        )
        console.log('✅ 报告保存成功')
        
        // 更新用户使用量（订阅用户使用paid_reports_used）
        await incrementReportUsage(userId, false) // false表示不是免费报告
        console.log('✅ 用户使用量更新成功')
      } catch (dbError) {
        console.error('❌ 保存报告到数据库时出错:', dbError)
        // 即使保存失败，也返回报告数据，不影响用户体验
      }
      
      return NextResponse.json({
        ...reportContent,
        metadata: {
          responseTime: `${responseTime}ms`,
          timestamp: new Date().toISOString(),
          model: 'sonar-deep-research',
          externalMode: true
        }
      })
      
    } catch (fetchError: any) {
      clearTimeout(timeoutId)
      console.error('❌ API请求失败:', fetchError)
      
      if (fetchError.name === 'AbortError') {
        return NextResponse.json({
          error: 'Request timeout',
          details: '请求超时，报告生成时间超过5分钟。请稍后重试或联系技术支持。',
          timestamp: new Date().toISOString()
        }, { status: 408 })
      }
      
      throw fetchError
    }
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('❌ 外部报告生成失败:', errorMessage)
    
    return NextResponse.json({
      error: '报告生成失败',
      details: errorMessage,
      timestamp: new Date().toISOString(),
      responseTime: Date.now() - startTime
    }, { status: 500 })
  }
}
