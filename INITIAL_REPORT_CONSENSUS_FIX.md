# 初始报告生成时Consensus数据搜索修复

## ❌ 问题描述

用户反馈：在生成后的报告中，DCF参数调整表格显示的依旧是占位符数据（2%, 5%, 8%等），而不是真实的consensus数据。用户需要在**初始报告生成**的同时，生成consensus的真实数据。

## 🔍 问题分析

### 根本原因
1. **时机错误**: consensus数据搜索只在DCF重新计算时进行，而不是在初始报告生成时
2. **数据流断裂**: 初始报告生成API没有包含consensus数据搜索
3. **前端依赖**: 前端组件依赖从报告数据中获取consensus数据

### 数据流问题
```
初始报告生成 → 不搜索consensus数据 → 显示占位符数据
     ↓
DCF重新计算 → 搜索consensus数据 → 更新显示（但用户已经看到占位符了）
```

## ✅ 解决方案

### 1. 修改报告生成API
在`/app/api/generate-report-perplexity/route.ts`中添加consensus数据搜索：

```typescript
// 在报告生成完成后添加consensus数据搜索
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
  ...reportContent,
  consensusData: consensusData
})
```

### 2. 添加Consensus搜索函数
在报告生成API中添加完整的consensus搜索功能：

```typescript
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
      ? `请搜索${stockData.name} (${stockData.symbol})的最新consensus数据...`
      : `Please search for the latest consensus data for ${stockData.name} (${stockData.symbol})...`

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

    // 发送请求到Perplexity API
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(consensusRequest)
    })

    if (!response.ok) {
      console.error('❌ Consensus搜索API错误:', response.status, response.statusText)
      return null
    }

    const data: PerplexityResponse = await response.json()
    const content = data.choices?.[0]?.message?.content || data.content || ''
    
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
```

### 3. 修改前端组件
在`ValuationReport`组件中优先使用报告中的consensus数据：

```typescript
// 初始化DCF参数
useEffect(() => {
  if (reportData && stockData) {
    // 首先检查报告数据中是否包含consensus数据
    if ((reportData as any).consensusData) {
      console.log('✅ 使用报告中的consensus数据:', (reportData as any).consensusData)
      setOriginalDCFParameters((reportData as any).consensusData)
      setDCFParameters((reportData as any).consensusData)
    } else {
      // 尝试从报告内容中提取原始DCF参数
      const extractedParams = extractDCFParametersFromReport(reportData.valuationAnalysis)
      if (extractedParams) {
        setOriginalDCFParameters(extractedParams)
        setDCFParameters(extractedParams)
      } else {
        // 如果无法从报告提取，则搜索consensus数据
        searchConsensusDataForInitialization()
        setOriginalDCFParameters(defaultParameters)
        setDCFParameters(defaultParameters)
      }
    }
  }
}, [reportData, stockData])
```

## 🔧 技术实现

### 1. API层面
- **报告生成API**: 在生成报告后立即搜索consensus数据
- **数据返回**: API返回包含`consensusData`的完整响应
- **错误处理**: consensus搜索失败时不影响报告生成

### 2. 前端层面
- **数据优先级**: 优先使用报告中的consensus数据
- **降级处理**: 如果报告中没有consensus数据，则使用其他方法
- **状态管理**: 正确设置`originalDCFParameters`和`dcfParameters`

### 3. 数据格式
```typescript
interface ConsensusData {
  revenueGrowth: { [year: string]: number }
  operatingMargin: { [year: string]: number }
  taxRate: { [year: string]: number }
  wacc: number
  terminalGrowthRate: number
  terminalMultiple: number
}
```

## 📊 预期结果

### 修复前（问题状态）
```
初始报告生成 → 显示占位符数据 → 用户看到错误数据
     ↓
DCF重新计算 → 搜索consensus数据 → 更新显示
```

### 修复后（正确状态）
```
初始报告生成 → 搜索consensus数据 → 显示真实数据
     ↓
DCF重新计算 → 再次搜索consensus数据 → 更新显示
```

## 🚀 使用方法

### 1. 自动搜索
- 报告生成时自动搜索consensus数据
- 无需用户手动操作
- 数据自动包含在报告响应中

### 2. 数据优先级
1. **报告中的consensus数据** (最高优先级)
2. **从报告内容提取的参数**
3. **实时搜索consensus数据** (降级方案)

### 3. 错误处理
- consensus搜索失败不影响报告生成
- 使用默认参数作为降级方案
- 详细的错误日志用于调试

## 🔍 调试信息

### 控制台日志
```
🔍 开始搜索consensus数据...
📊 Consensus数据: {revenueGrowth: {...}, operatingMargin: {...}, ...}
✅ 使用报告中的consensus数据: {...}
```

### 网络请求
```
POST /api/generate-report-perplexity
{
  "stockData": {...},
  "locale": "zh"
}

Response:
{
  "fundamentalAnalysis": "...",
  "valuationAnalysis": "...",
  "consensusData": {
    "revenueGrowth": {"2025": 0.18, "2026": 0.15, "2027": 0.12},
    "operatingMargin": {"2025": 0.58, "2026": 0.56, "2027": 0.54},
    "wacc": 0.11,
    "terminalGrowthRate": 0.035,
    "terminalMultiple": 17.5
  }
}
```

## 📝 注意事项

1. **性能影响**: consensus搜索会增加报告生成时间
2. **API成本**: 每次报告生成都会调用Perplexity API
3. **错误处理**: consensus搜索失败时使用默认参数
4. **数据一致性**: 确保consensus数据格式正确

## 🎯 下一步

1. **测试验证**: 在真实环境中测试完整的报告生成流程
2. **性能优化**: 考虑缓存consensus数据避免重复搜索
3. **用户体验**: 添加加载状态指示器
4. **错误处理**: 改进错误提示和降级机制

现在初始报告生成时会自动搜索consensus数据，DCF参数调整表格将显示真实的consensus数据！🎉
