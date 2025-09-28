# StockTwits 集成说明

## 概述

本项目集成了 StockTwits 的 most-active 页面爬虫功能，可以自动获取每天最活跃的前10只股票，并替换 daily alpha brief 中的固定股票列表。

## 功能特性

- 🚀 自动爬取 StockTwits most-active 页面
- 📊 获取实时股票价格和涨跌数据
- 🎯 智能分析股票表现原因
- 🔄 自动回退机制（StockTwits 失败时使用默认数据）
- 🧪 完整的测试页面和脚本

## 文件结构

```
├── app/api/stocktwits-most-active/route.ts    # StockTwits API 端点
├── app/api/hot-stocks/route.ts                # 修改后的热门股票 API
├── app/test-stocktwits/page.tsx               # 测试页面
├── scripts/stocktwits-scraper.js              # 独立爬虫脚本
├── scripts/test-stocktwits.js                 # 测试脚本
└── STOCKTWITS_INTEGRATION.md                  # 本文档
```

## 使用方法

### 1. 通过 API 使用

#### 获取 StockTwits 数据（默认）
```bash
GET /api/hot-stocks
```

#### 强制使用 StockTwits
```bash
GET /api/hot-stocks?useStockTwits=true
```

#### 使用默认股票列表
```bash
GET /api/hot-stocks?useStockTwits=false
```

#### 使用指定股票列表
```bash
GET /api/hot-stocks?symbols=NVDA,TSLA,AAPL,AMD,MSFT
```

### 2. 通过测试页面

访问 `/test-stocktwits` 页面来测试功能：

- 点击"使用 StockTwits"按钮测试爬虫功能
- 点击"使用默认数据"按钮测试回退机制
- 查看实时股票数据和信心等级

### 3. 通过独立脚本

#### 运行爬虫脚本
```bash
cd scripts
node stocktwits-scraper.js
```

#### 运行测试脚本
```bash
cd scripts
node test-stocktwits.js
```

## API 响应格式

```json
{
  "success": true,
  "data": [
    {
      "symbol": "NVDA",
      "name": "NVIDIA Corporation",
      "price": 875.28,
      "change": 45.32,
      "changePercent": 5.47,
      "volume": 125000000,
      "marketCap": 2150000000000,
      "peRatio": 65.4,
      "rank": 1,
      "sector": "Technology",
      "reason": "Strong Q4 earnings beat with AI chip demand surge",
      "confidence": "high"
    }
  ],
  "source": "stocktwits",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## 配置说明

### 环境变量

确保在 `.env.local` 中设置：

```env
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 依赖项

项目已包含必要的依赖：

```json
{
  "puppeteer": "^24.16.0"
}
```

## 爬虫策略

### 多重选择器策略

爬虫使用多种策略来确保数据获取的可靠性：

1. **方法1**: 查找 `[data-symbol]`, `.symbol`, `.ticker`, `.stock-symbol` 属性
2. **方法2**: 解析表格行和列表项中的股票符号
3. **方法3**: 全文搜索匹配股票符号模式

### 数据验证

- 股票符号长度限制（1-5个字符）
- 去重处理
- 最多获取前10只股票

## 错误处理

### 自动回退机制

1. **StockTwits 爬虫失败** → 使用默认股票列表
2. **Yahoo Finance API 失败** → 使用模拟数据
3. **网络超时** → 30秒超时保护

### 日志记录

所有关键操作都有详细的日志记录：

```javascript
console.log('正在访问 StockTwits most-active 页面...')
console.log('找到的股票符号:', stocks)
console.log('成功从 StockTwits 获取 X 只股票数据')
```

## 性能优化

### 并行处理

- 股票数据获取使用 `Promise.all()` 并行处理
- 爬虫和 API 调用分离，避免阻塞

### 缓存策略

- 建议在生产环境中添加 Redis 缓存
- 设置合理的缓存过期时间（如15分钟）

### 请求限制

- 股票详情获取间隔1秒，避免API限制
- 使用合理的超时设置

## 部署注意事项

### Cloudflare Workers

如果部署到 Cloudflare Workers，需要：

1. 使用 `@cloudflare/workers-types`
2. 配置 Puppeteer 的 Cloudflare 兼容版本
3. 调整超时设置

### Vercel

Vercel 部署时：

1. 确保 Puppeteer 依赖正确安装
2. 可能需要增加函数执行时间限制
3. 考虑使用 Vercel 的 Edge Functions

## 监控和维护

### 健康检查

定期检查以下端点：

```bash
# 检查 StockTwits API
curl http://localhost:3000/api/stocktwits-most-active

# 检查热门股票 API
curl http://localhost:3000/api/hot-stocks
```

### 数据质量监控

- 监控股票数据获取成功率
- 检查价格数据的合理性
- 验证信心等级分配的准确性

## 故障排除

### 常见问题

1. **Puppeteer 启动失败**
   - 检查系统依赖
   - 确保有足够的内存

2. **StockTwits 页面结构变化**
   - 更新选择器策略
   - 调整等待时间

3. **Yahoo Finance API 限制**
   - 添加请求间隔
   - 使用备用数据源

### 调试模式

启用详细日志：

```javascript
// 在 scraper 中启用调试
await page.setViewport({ width: 1920, height: 1080 })
await page.screenshot({ path: 'debug-screenshot.png' })
```

## 未来改进

1. **多数据源支持**: 集成更多股票数据源
2. **智能分析**: 使用 AI 生成更准确的分析原因
3. **实时更新**: 实现 WebSocket 实时数据推送
4. **用户偏好**: 允许用户自定义股票列表
5. **历史数据**: 保存和分析历史最活跃股票

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 创建 Pull Request

## 许可证

本项目遵循 MIT 许可证。
