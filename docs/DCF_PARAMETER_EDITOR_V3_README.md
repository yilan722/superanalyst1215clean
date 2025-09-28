# DCF参数编辑器V3 - Old School Value风格

## 功能概述

基于Old School Value的界面设计，创建了一个全新的DCF参数编辑器，提供更直观、更专业的用户体验。

## 主要特性

### 1. 收入来源选择
- **Free Cash Flow**: 适用于现金流稳定或可预测的公司（如JNJ, IBM）
- **Owner Earnings**: 适用于营运资本较高的公司（如AMZN, WMT）
- **EPS (Net Income)**: 适用于高增长或现金流不稳定的公司（如YELP, XOM）
- **Dividends Paid**: 用于金融股的股息折现模型
- **Dividends & Buybacks**: 用于金融股的股息和回购折现模型

### 2. 关键指标显示
- **当前价格** (Current Price): 实时股价
- **公允价值** (Fair Value): DCF计算得出的公允价值
- **买入价格** (Buy Under Price): 考虑安全边际后的买入价格
- **安全边际** (Margin of Safety): 当前安全边际百分比
- **52周高点/低点**: 历史价格区间

### 3. 参数输入界面
- **DCF起始值**: 支持B/M/K单位自动识别
- **增长率**: 预期年增长率
- **反向增长率**: 可选的反向增长率
- **折现率**: 用于折现未来现金流的折现率
- **终端增长率**: 永续增长率
- **安全边际**: 安全边际百分比

### 4. 可视化组件
- **安全边际圆形图表**: 直观显示当前安全边际
- **股价图表**: 股价与公允价值的对比（占位符）
- **历史DCF表格**: 显示历年DCF计算结果

### 5. 用户体验优化
- **工具提示**: 每个参数都有详细的说明
- **实时更新**: 参数变化立即反映在界面上
- **响应式设计**: 适配不同屏幕尺寸
- **中英文支持**: 完整的多语言支持

## 文件结构

### 新增文件
1. **`components/DCFParameterEditorV2.tsx`**
   - 基础版本的DCF参数编辑器
   - 包含收入来源选择和基本参数输入

2. **`components/DCFParameterEditorV3.tsx`**
   - 完整版本的DCF参数编辑器
   - 包含所有Old School Value风格的功能

3. **`app/test-dcf-v2/page.tsx`**
   - DCF参数编辑器V2的测试页面

4. **`app/test-dcf-v3/page.tsx`**
   - DCF参数编辑器V3的测试页面

## 使用方法

### 基本使用
```tsx
import DCFParameterEditorV3 from '../components/DCFParameterEditorV3'

const [dcfParameters, setDcfParameters] = useState({
  incomeSource: 'FreeCashFlow',
  dcfStartValue: -22680000000,
  growthRate: 0.10,
  discountRate: 0.075,
  terminalRate: 0.02,
  marginOfSafety: 0.25
})

<DCFParameterEditorV3
  initialParameters={dcfParameters}
  onParametersChange={setDcfParameters}
  onRecalculate={handleRecalculate}
  isRecalculating={false}
  locale="zh"
  currentPrice={52.23}
  fairValue={-143.47}
  buyUnderPrice={-107.60}
  marginOfSafetyPercent={0.00}
  year52High={52.19}
  year52Low={32.69}
/>
```

### 参数说明

#### DCFParametersV3接口
```typescript
interface DCFParametersV3 {
  incomeSource: 'FreeCashFlow' | 'OwnerEarnings' | 'EPS' | 'DividendsPaid' | 'DividendsAndBuybacks'
  dcfStartValue: number        // DCF起始值（单位：美元）
  growthRate: number          // 增长率（0-1之间的小数）
  reverseGrowth?: number      // 反向增长率（可选）
  discountRate: number        // 折现率（0-1之间的小数）
  terminalRate: number        // 终端增长率（0-1之间的小数）
  marginOfSafety: number      // 安全边际（0-1之间的小数）
}
```

#### 收入来源选择
- **FreeCashFlow**: 自由现金流，适用于稳定现金流公司
- **OwnerEarnings**: 所有者收益，适用于高营运资本公司
- **EPS**: 每股收益，适用于高增长或不稳定现金流公司
- **DividendsPaid**: 已付股息，适用于金融股
- **DividendsAndBuybacks**: 股息和回购，适用于金融股

## 测试页面

访问以下URL查看不同版本的DCF参数编辑器：

- V2版本: `http://localhost:3000/test-dcf-v2`
- V3版本: `http://localhost:3000/test-dcf-v3`

## 设计特点

### 1. Old School Value风格
- 简洁的界面设计
- 清晰的信息层次
- 专业的金融工具外观

### 2. 响应式布局
- 桌面端：两列布局（参数输入 + 可视化）
- 移动端：单列布局，自适应调整

### 3. 交互体验
- 实时参数更新
- 直观的数值格式化
- 丰富的工具提示
- 平滑的动画效果

### 4. 数据可视化
- 安全边际圆形图表
- 历史DCF数据表格
- 股价趋势图表（占位符）

## 未来扩展

1. **真实股价图表**: 集成真实的股价数据图表
2. **敏感性分析**: 添加参数敏感性分析功能
3. **场景分析**: 支持乐观、悲观、基准三种场景
4. **导出功能**: 支持PDF导出和Excel导出
5. **历史对比**: 与历史估值进行对比分析

## 技术栈

- **React**: 前端框架
- **TypeScript**: 类型安全
- **Tailwind CSS**: 样式框架
- **SVG**: 数据可视化
- **响应式设计**: 移动端适配


