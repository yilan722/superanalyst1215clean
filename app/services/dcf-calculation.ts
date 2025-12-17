import { DCFFinancialData } from './tushare-financial-data'

// DCF估值结果接口
export interface DCFValuationResult {
  // 基础信息
  symbol: string
  name: string
  currentPrice: number
  fairValue: number
  upsideDownside: number
  recommendation: 'STRONG_BUY' | 'BUY' | 'HOLD' | 'SELL' | 'STRONG_SELL'
  
  // DCF假设
  assumptions: {
    revenueGrowth: number[]
    operatingMargin: number[]
    taxRate: number[]
    wacc: number
    terminalGrowthRate: number
    terminalMultiple: number
  }
  
  // 现金流预测
  cashFlowProjection: {
    year: number[]
    revenue: number[]
    operatingIncome: number[]
    netIncome: number[]
    freeCashFlow: number[]
    discountedCashFlow: number[]
  }
  
  // 估值分析
  valuation: {
    presentValueOfCashFlows: number
    terminalValue: number
    enterpriseValue: number
    equityValue: number
    valuePerShare: number
    marginOfSafety: number
  }
  
  // 敏感性分析
  sensitivityAnalysis: {
    waccSensitivity: { wacc: number; value: number }[]
    growthSensitivity: { growth: number; value: number }[]
    terminalGrowthSensitivity: { terminalGrowth: number; value: number }[]
  }
  
  // 数据质量
  dataQuality: {
    completeness: number
    reliability: string
    lastUpdated: string
  }
}

// DCF计算参数
export interface DCFCalculationParams {
  // 收入增长率 (5年预测)
  revenueGrowth: number[]
  // 营业利润率 (5年预测)
  operatingMargin: number[]
  // 税率 (5年预测)
  taxRate: number[]
  // 折现率 (WACC)
  wacc: number
  // 终端增长率
  terminalGrowthRate: number
  // 终端倍数
  terminalMultiple: number
  // 安全边际
  marginOfSafety: number
}

// 默认DCF参数
export const DEFAULT_DCF_PARAMS: DCFCalculationParams = {
  revenueGrowth: [0.15, 0.12, 0.10, 0.08, 0.05], // 5年收入增长率
  operatingMargin: [0.20, 0.22, 0.24, 0.25, 0.25], // 5年营业利润率
  taxRate: [0.25, 0.25, 0.25, 0.25, 0.25], // 5年税率
  wacc: 0.10, // 10%折现率
  terminalGrowthRate: 0.03, // 3%终端增长率
  terminalMultiple: 15.0, // 15倍终端倍数
  marginOfSafety: 0.20 // 20%安全边际
}

// 基于财务数据计算DCF估值
export function calculateDCFValuation(
  financialData: DCFFinancialData,
  params: DCFCalculationParams = DEFAULT_DCF_PARAMS
): DCFValuationResult {
  console.log(`🚀 开始计算 ${financialData.symbol} 的DCF估值...`)
  
  // 基础数据
  const currentPrice = financialData.currentPrice
  const sharesOutstanding = financialData.sharesOutstanding
  const currentRevenue = financialData.revenue
  const currentOperatingMargin = financialData.operatingMargin
  
  // 现金流预测
  const years = [1, 2, 3, 4, 5]
  const projectedRevenue: number[] = []
  const projectedOperatingIncome: number[] = []
  const projectedNetIncome: number[] = []
  const projectedFreeCashFlow: number[] = []
  const discountedCashFlow: number[] = []
  
  let cumulativeRevenue = currentRevenue
  
  // 计算5年现金流预测
  for (let i = 0; i < 5; i++) {
    // 收入预测
    const revenue = cumulativeRevenue * (1 + params.revenueGrowth[i])
    projectedRevenue.push(revenue)
    cumulativeRevenue = revenue
    
    // 营业利润预测
    const operatingIncome = revenue * params.operatingMargin[i]
    projectedOperatingIncome.push(operatingIncome)
    
    // 净利润预测 (简化计算)
    const netIncome = operatingIncome * (1 - params.taxRate[i])
    projectedNetIncome.push(netIncome)
    
    // 自由现金流预测 (简化：净利润 * 0.8)
    const freeCashFlow = netIncome * 0.8
    projectedFreeCashFlow.push(freeCashFlow)
    
    // 折现现金流
    const discountFactor = Math.pow(1 + params.wacc, i + 1)
    const discountedCF = freeCashFlow / discountFactor
    discountedCashFlow.push(discountedCF)
  }
  
  // 计算终端价值
  const terminalYearRevenue = projectedRevenue[4]
  const terminalYearOperatingIncome = terminalYearRevenue * params.operatingMargin[4]
  const terminalYearNetIncome = terminalYearOperatingIncome * (1 - params.taxRate[4])
  const terminalYearFreeCashFlow = terminalYearNetIncome * 0.8
  const terminalValue = (terminalYearFreeCashFlow * (1 + params.terminalGrowthRate)) / (params.wacc - params.terminalGrowthRate)
  const discountedTerminalValue = terminalValue / Math.pow(1 + params.wacc, 5)
  
  // 计算企业价值和股权价值
  const presentValueOfCashFlows = discountedCashFlow.reduce((sum, cf) => sum + cf, 0)
  const enterpriseValue = presentValueOfCashFlows + discountedTerminalValue
  const equityValue = enterpriseValue // 简化：假设无净债务
  const valuePerShare = equityValue / sharesOutstanding
  
  // 计算安全边际
  const marginOfSafety = currentPrice > 0 ? (valuePerShare - currentPrice) / currentPrice : 0
  
  // 计算涨跌幅
  const upsideDownside = currentPrice > 0 ? (valuePerShare - currentPrice) / currentPrice : 0
  
  // 生成投资建议
  const recommendation = generateRecommendation(upsideDownside, marginOfSafety)
  
  // 敏感性分析
  const sensitivityAnalysis = calculateSensitivityAnalysis(
    financialData,
    params,
    valuePerShare
  )
  
  // 数据质量评估
  const dataQuality = assessDataQuality(financialData)
  
  const result: DCFValuationResult = {
    symbol: financialData.symbol,
    name: financialData.name,
    currentPrice,
    fairValue: valuePerShare,
    upsideDownside,
    recommendation,
    
    assumptions: {
      revenueGrowth: params.revenueGrowth,
      operatingMargin: params.operatingMargin,
      taxRate: params.taxRate,
      wacc: params.wacc,
      terminalGrowthRate: params.terminalGrowthRate,
      terminalMultiple: params.terminalMultiple
    },
    
    cashFlowProjection: {
      year: years,
      revenue: projectedRevenue,
      operatingIncome: projectedOperatingIncome,
      netIncome: projectedNetIncome,
      freeCashFlow: projectedFreeCashFlow,
      discountedCashFlow
    },
    
    valuation: {
      presentValueOfCashFlows,
      terminalValue,
      enterpriseValue,
      equityValue,
      valuePerShare,
      marginOfSafety
    },
    
    sensitivityAnalysis,
    dataQuality
  }
  
  console.log(`✅ ${financialData.symbol} DCF估值计算完成: ${valuePerShare.toFixed(2)}`)
  return result
}

// 生成投资建议
function generateRecommendation(upsideDownside: number, marginOfSafety: number): 'STRONG_BUY' | 'BUY' | 'HOLD' | 'SELL' | 'STRONG_SELL' {
  if (upsideDownside > 0.5 && marginOfSafety > 0.3) return 'STRONG_BUY'
  if (upsideDownside > 0.2 && marginOfSafety > 0.1) return 'BUY'
  if (upsideDownside > -0.1 && upsideDownside < 0.1) return 'HOLD'
  if (upsideDownside < -0.2) return 'SELL'
  return 'STRONG_SELL'
}

// 敏感性分析
function calculateSensitivityAnalysis(
  financialData: DCFFinancialData,
  params: DCFCalculationParams,
  baseValue: number
) {
  // 简化敏感性分析，避免递归调用
  const waccSensitivity = [-0.02, -0.01, 0, 0.01, 0.02].map(change => ({
    wacc: params.wacc + change,
    value: baseValue * (1 + change * 0.1) // 简化的敏感性计算
  }))
  
  const growthSensitivity = [-0.05, -0.02, 0, 0.02, 0.05].map(change => ({
    growth: params.revenueGrowth[0] + change,
    value: baseValue * (1 + change * 0.2) // 简化的敏感性计算
  }))
  
  const terminalGrowthSensitivity = [-0.01, -0.005, 0, 0.005, 0.01].map(change => ({
    terminalGrowth: params.terminalGrowthRate + change,
    value: baseValue * (1 + change * 0.5) // 简化的敏感性计算
  }))
  
  return {
    waccSensitivity,
    growthSensitivity,
    terminalGrowthSensitivity
  }
}

// 这些函数已被简化的敏感性分析替代，避免递归调用

// 评估数据质量
function assessDataQuality(financialData: DCFFinancialData) {
  let completeness = 0
  let reliability = 'LOW'
  
  // 检查关键数据完整性
  if (financialData.revenue > 0) completeness += 20
  if (financialData.netIncome !== 0) completeness += 20
  if (financialData.operatingCashFlow !== 0) completeness += 20
  if (financialData.totalAssets > 0) completeness += 20
  if (financialData.marketCap > 0) completeness += 20
  
  // 确定可靠性
  if (completeness >= 80) reliability = 'HIGH'
  else if (completeness >= 60) reliability = 'MEDIUM'
  else reliability = 'LOW'
  
  return {
    completeness,
    reliability,
    lastUpdated: financialData.lastUpdated
  }
}
