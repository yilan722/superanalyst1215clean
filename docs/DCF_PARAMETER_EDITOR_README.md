# DCF参数编辑器功能说明

## 功能概述

在估值分析部分新增了DCF参数编辑器功能，允许用户调整DCF模型的假设参数，并基于用户输入重新计算估值。这个功能使用Perplexity Sonar模型进行重新计算，无需调用深度研究模型。

**重要说明：**
- **生成报告**：继续使用 `sonar-deep-research` 模型，确保包含完整的DCF表格和图表
- **DCF参数更新**：仅使用 `sonar` 模型进行快速重新计算
- **原始内容保留**：DCF参数编辑器不会影响原始DCF表格的显示

## 功能特点

### 1. 原始参数对比
- **Consensus参数显示**：显示原始报告中的DCF参数作为基准
- **参数对比表格**：实时对比原始参数和调整后的参数
- **变化指示器**：用颜色和符号显示参数变化（绿色=降低，红色=提高）
- **详细对比**：包括WACC、长期增长率、终端倍数和各年份增长率

### 2. 可调整的DCF参数

- **营业收入增长率** (各年份: 2025-2029)
- **营业利润率** (各年份: 2025-2029)  
- **税率** (各年份: 2025-2029)
- **WACC (加权平均资本成本)**
- **长期增长率 (永续增长率)**
- **终端倍数**

### 3. 用户界面

- **参数对比表格**：显示原始参数vs调整参数的对比
- **可折叠的参数编辑面板**：整洁的界面设计
- **直观的数值输入框**：支持百分比和数值输入
- **实时参数更新**：参数变化立即反映在对比表格中
- **重置到默认值功能**：一键恢复原始参数
- **更新DCF估值按钮**：触发重新计算

### 4. 重新计算功能

- 使用Perplexity Sonar模型进行快速计算
- 无需重新调用深度研究模型
- 返回详细的DCF计算结果
- 包含敏感性分析

## 文件结构

### 新增文件

1. **`components/DCFParameterEditor.tsx`**
   - DCF参数编辑器的React组件
   - 支持中英文界面
   - 参数输入和验证

2. **`app/api/recalculate-dcf/route.ts`**
   - DCF重新计算的API端点
   - 使用Perplexity Sonar模型
   - 返回结构化的DCF结果

3. **`app/test-dcf/page.tsx`**
   - DCF参数编辑器的测试页面
   - 用于开发和调试

### 修改文件

1. **`components/ValuationReport.tsx`**
   - 集成DCF参数编辑器
   - 添加重新计算逻辑
   - 显示更新后的估值结果
   - **确保原始DCF表格正常显示**（放在DCF参数编辑器之前）

### 测试文件

1. **`app/test-valuation/page.tsx`**
   - 估值报告测试页面
   - 验证原始DCF表格显示正常
   - 测试DCF参数编辑器功能

## 使用方法

### 1. 在估值分析标签页中

1. 点击"估值分析"标签页
2. 找到"DCF参数调整"面板
3. 点击"展开"按钮打开参数编辑器
4. 调整所需的DCF参数
5. 点击"更新DCF估值"按钮
6. 查看更新后的估值结果

### 2. 参数说明

- **营业收入增长率**: 各年份的营收增长预期 (0-100%)
- **营业利润率**: 各年份的营业利润率 (0-100%)
- **税率**: 各年份的企业所得税率 (0-100%)
- **WACC**: 加权平均资本成本 (0-50%)
- **长期增长率**: 永续增长率 (0-10%)
- **终端倍数**: 终端价值倍数 (1-50)

## API接口

### POST `/api/recalculate-dcf`

**请求参数:**
```json
{
  "stockData": {
    "symbol": "AAPL",
    "name": "Apple Inc.",
    "price": "150.00",
    "marketCap": "2.5T",
    "peRatio": "25.5",
    "amount": "50M"
  },
  "dcfParameters": {
    "revenueGrowth": {
      "2025": 0.25,
      "2026": 0.20,
      "2027": 0.15,
      "2028": 0.10,
      "2029": 0.05
    },
    "operatingMargin": {
      "2025": 0.02,
      "2026": 0.05,
      "2027": 0.08,
      "2028": 0.08,
      "2029": 0.08
    },
    "taxRate": {
      "2025": 0.25,
      "2026": 0.25,
      "2027": 0.25,
      "2028": 0.25,
      "2029": 0.25
    },
    "wacc": 0.095,
    "terminalGrowthRate": 0.03,
    "terminalMultiple": 15.0
  },
  "locale": "zh"
}
```

**响应格式:**
```json
{
  "success": true,
  "dcfResults": {
    "dcfValue": 385.00,
    "targetPrice": 395.00,
    "reasoning": "HTML格式的分析说明",
    "dcfScenarios": {
      "base": 385.00,
      "optimistic": 485.00,
      "pessimistic": 275.00
    },
    "calculationDetails": {
      "presentValue": 300.00,
      "terminalValue": 85.00,
      "enterpriseValue": 385.00,
      "equityValue": 385.00
    },
    "sensitivityAnalysis": {
      "waccSensitivity": [
        {"wacc": 0.08, "dcfValue": 450.00},
        {"wacc": 0.12, "dcfValue": 320.00}
      ],
      "growthSensitivity": [
        {"growth": 0.02, "dcfValue": 300.00},
        {"growth": 0.04, "dcfValue": 420.00}
      ]
    }
  },
  "updatedParameters": {...},
  "calculationTime": 1500
}
```

## 技术实现

### 1. 前端组件

- 使用React Hooks管理状态
- TypeScript类型安全
- 响应式设计
- 实时参数验证

### 2. 后端API

- Next.js API Routes
- Perplexity Sonar模型集成
- 错误处理和日志记录
- 成本监控

### 3. 数据流

1. 用户调整DCF参数
2. 参数实时更新到状态
3. 用户点击"更新DCF估值"
4. 发送API请求到`/api/recalculate-dcf`
5. 使用Perplexity Sonar模型重新计算
6. 返回结构化的DCF结果
7. 更新UI显示新的估值

## 优势

1. **快速计算**: 使用Sonar模型，无需深度研究
2. **用户友好**: 直观的参数调整界面
3. **实时反馈**: 参数变化立即反映
4. **成本效益**: 比深度研究模型更便宜
5. **灵活性**: 用户可以测试不同的假设场景

## 注意事项

1. 确保`PERPLEXITY_API_KEY`环境变量已设置
2. 用户需要登录才能使用此功能
3. 重新计算可能需要几秒钟时间
4. 建议在调整参数后等待计算完成再进行下一步操作

## 测试

访问以下页面进行测试：
- `/test-dcf` - 测试DCF参数编辑器的基本功能
- `/test-valuation` - 测试完整的估值报告显示和DCF参数对比

## 故障排除

### 常见问题

1. **API 404错误**
   - 确保开发服务器在正确的端口运行（通常是3000）
   - 检查API路由文件是否存在：`app/api/recalculate-dcf/route.ts`
   - 重启开发服务器

2. **DCF重新计算失败**
   - 检查浏览器控制台的错误信息
   - 确保用户已登录并有有效的Authorization token
   - 检查`PERPLEXITY_API_KEY`环境变量是否设置

3. **原始参数不显示**
   - 目前使用默认参数，未来版本将从报告内容中提取
   - 确保`originalDCFParameters`状态正确设置

4. **参数对比表格不更新**
   - 检查`onParametersChange`回调是否正确触发
   - 确保参数状态更新正确
