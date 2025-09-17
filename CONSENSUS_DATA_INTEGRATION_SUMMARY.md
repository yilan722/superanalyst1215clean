# Consensus数据集成功能总结

## ✅ 已完成的功能

### 1. Consensus数据搜索功能
- **使用Sonar模型**: 利用Perplexity Sonar模型搜索最新的consensus数据
- **实时数据获取**: 搜索最近一个月的最新分析师预期数据
- **多语言支持**: 支持中英文consensus数据搜索

### 2. 搜索的数据类型
- **营业收入增长率**: 2025-2027年分析师预期
- **营业利润率 (Operating Margin)**: 2025-2027年分析师预期
- **税率 (Tax Rate)**: 2025-2027年分析师预期
- **WACC**: 分析师对加权平均资本成本的预期
- **长期增长率**: 分析师对终端增长率的预期
- **终端倍数**: 分析师对终端倍数的预期

### 3. API集成
- **DCF重新计算API**: 在DCF重新计算时自动搜索consensus数据
- **数据返回**: API返回包含consensus数据的完整响应
- **错误处理**: 搜索失败时优雅降级，不影响DCF计算

## 🔧 技术实现

### 1. Consensus数据搜索函数
```typescript
async function searchConsensusData(stockData: StockData, locale: string): Promise<DCFParameters | null> {
  // 使用Perplexity Sonar模型搜索consensus数据
  // 返回标准化的DCFParameters格式
}
```

### 2. API请求配置
```typescript
const consensusRequest = {
  model: 'sonar',
  messages: [...],
  max_tokens: 2000,
  temperature: 0.1,
  search_queries: true,
  search_recency_filter: 'month',
  return_citations: true
}
```

### 3. 数据解析和验证
- **JSON解析**: 自动解析AI返回的JSON格式数据
- **格式验证**: 确保consensus数据包含所有必需字段
- **错误处理**: 解析失败时返回null，不影响主流程

## 📊 数据流程

### 1. 用户触发DCF重新计算
```
用户点击"更新DCF估值"按钮
↓
调用 /api/recalculate-dcf API
↓
首先搜索consensus数据 (使用Sonar模型)
↓
然后进行DCF重新计算 (使用Sonar模型)
↓
返回consensus数据 + DCF计算结果
```

### 2. 前端数据更新
```
API返回consensus数据
↓
更新originalDCFParameters状态
↓
DCFParameterEditor显示真实consensus数据
↓
用户可以看到真实vs调整的对比
```

## 🎯 功能特点

### 1. 真实数据来源
- **分析师预期**: 基于真实的分析师consensus数据
- **最新数据**: 搜索最近一个月的最新数据
- **可靠来源**: 使用Perplexity的搜索功能获取权威数据

### 2. 智能搜索
- **公司特定**: 针对特定公司搜索consensus数据
- **参数完整**: 搜索所有DCF相关参数
- **格式标准**: 返回标准化的DCFParameters格式

### 3. 用户体验
- **自动更新**: 无需手动输入consensus数据
- **实时对比**: 显示真实consensus vs 用户调整的对比
- **错误容错**: 搜索失败时使用默认数据

## 📈 数据示例

### NVIDIA Corporation Consensus数据
```json
{
  "revenueGrowth": {
    "2025": 1.25,  // 125% (AI芯片需求爆发)
    "2026": 0.60,  // 60% (分析师预期)
    "2027": 0.35   // 35% (分析师预期)
  },
  "operatingMargin": {
    "2025": 0.624, // 62.4% (真实数据)
    "2026": 0.60,  // 60% (分析师预期)
    "2027": 0.58   // 58% (分析师预期)
  },
  "taxRate": {
    "2025": 0.15,  // 15% (AI公司典型税率)
    "2026": 0.15,  // 15%
    "2027": 0.15   // 15%
  },
  "wacc": 0.125,           // 12.5% (AI公司WACC)
  "terminalGrowthRate": 0.04, // 4% (成熟期增长率)
  "terminalMultiple": 18.0    // 18.0x (高增长公司倍数)
}
```

## 🚀 使用方法

### 1. 正常使用流程
1. **生成报告**: 正常生成包含DCF分析的估值报告
2. **调整参数**: 在DCF参数调整表格中修改参数
3. **重新计算**: 点击"更新DCF估值"按钮
4. **自动搜索**: 系统自动搜索consensus数据
5. **显示对比**: 表格显示真实consensus vs 调整后的对比

### 2. 数据更新机制
- **实时搜索**: 每次DCF重新计算时都会搜索最新consensus数据
- **自动更新**: consensus数据自动更新到参数对比表格
- **用户友好**: 用户无需手动输入consensus数据

## 🔍 技术细节

### 1. 搜索提示词
- **中文**: "请搜索NVIDIA Corporation (NVDA)的最新consensus数据..."
- **英文**: "Please search for the latest consensus data for NVIDIA Corporation (NVDA)..."
- **具体要求**: 包含所有DCF参数的详细搜索要求

### 2. 数据验证
```typescript
// 验证数据格式
if (consensusData.revenueGrowth && consensusData.operatingMargin && consensusData.taxRate) {
  return consensusData as DCFParameters
} else {
  return null // 数据不完整时返回null
}
```

### 3. 错误处理
- **API错误**: 搜索失败时返回null，不影响DCF计算
- **解析错误**: JSON解析失败时返回null
- **格式错误**: 数据格式不完整时返回null

## 📝 注意事项

1. **API成本**: 每次DCF重新计算会调用两次Perplexity API（consensus搜索 + DCF计算）
2. **数据延迟**: consensus数据搜索可能需要几秒钟
3. **网络依赖**: 需要稳定的网络连接访问Perplexity API
4. **数据准确性**: 依赖Perplexity搜索结果的准确性

## 🎯 下一步优化

1. **缓存机制**: 缓存consensus数据，避免重复搜索
2. **数据源扩展**: 支持更多数据源（如Bloomberg、Reuters等）
3. **历史数据**: 支持consensus数据的历史趋势
4. **数据验证**: 增加数据合理性验证
5. **性能优化**: 并行搜索consensus数据和DCF计算

现在DCF参数调整表格将显示真实的consensus数据，而不是默认的占位符数据！🎉
