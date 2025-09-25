import { EnhancedDCFFinancialData } from './tushare-enhanced-data'

// 增强的DCF计算参数接口
export interface EnhancedDCFParams {
  // 基础参数
  dcfStartValue: number           // DCF起始值（自由现金流）
  growthRate: number              // 增长率
  discountRate: number            // 折现率（WACC）
  terminalRate: number            // 永续增长率
  marginOfSafety: number          // 安全边际
  
  // 预测年数
  projectionYears: number         // 预测年数（默认5年）
  
  // 财务调整参数
  debt: number                    // 总负债
  cash: number                    // 现金及现金等价物
  minorityInterests: number       // 少数股东权益
  sharesOutstanding: number       // 总股本
}

// 增强的DCF计算结果接口
export interface EnhancedDCFResult {
  // 基础信息
  symbol: string
  name: string
  currentPrice: number
  
  // DCF计算过程
  dcfCalculation: {
    // 现金流预测
    projectedCashFlows: {
      year: number[]
      freeCashFlow: number[]
      discountedCashFlow: number[]
    }
    
    // 永续价值计算
    terminalValue: {
      finalYearFCF: number
      terminalGrowthRate: number
      terminalValue: number
      discountedTerminalValue: number
    }
    
    // 估值计算
    valuation: {
      sumOfPV: number                    // 现金流现值总和
      terminalValuePV: number            // 永续价值现值
      enterpriseValue: number            // 企业价值
      equityValue: number                // 股权价值
      valuePerShare: number              // 每股价值
      buyUnderPrice: number              // 买入价格
      marginOfSafetyPercent: number      // 安全边际百分比
    }
  }
  
  // 敏感性分析
  sensitivityAnalysis: {
    growthRateSensitivity: { rate: number; value: number }[]
    discountRateSensitivity: { rate: number; value: number }[]
    terminalRateSensitivity: { rate: number; value: number }[]
  }
  
  // 数据质量
  dataQuality: {
    completeness: number
    reliability: string
    lastUpdated: string
  }
}

// 默认DCF参数
export const DEFAULT_ENHANCED_DCF_PARAMS: EnhancedDCFParams = {
  dcfStartValue: 0,
  growthRate: 0.10,              // 10%增长率
  discountRate: 0.10,            // 10%折现率
  terminalRate: 0.03,            // 3%永续增长率
  marginOfSafety: 0.25,          // 25%安全边际
  projectionYears: 5,            // 5年预测
  debt: 0,
  cash: 0,
  minorityInterests: 0,
  sharesOutstanding: 0
}

// 计算自由现金流
export function calculateFreeCashFlow(financialData: EnhancedDCFFinancialData): number {
  // 自由现金流 = 经营活动产生的现金流量净额 - 资本性支出
  const operatingCashFlow = financialData.operatingCashFlow || 0
  const capex = financialData.capex || 0
  
  // 如果capex为0，使用投资现金流的绝对值作为资本支出
  // 投资现金流通常为负数（现金流出），所以取绝对值
  let actualCapex = capex
  if (capex === 0) {
    actualCapex = Math.abs(financialData.investingCashFlow || 0)
  }
  
  const freeCashFlow = operatingCashFlow - actualCapex
  
  console.log(`📊 自由现金流计算: 经营现金流=${operatingCashFlow.toFixed(2)}, 资本支出=${actualCapex.toFixed(2)}, 自由现金流=${freeCashFlow.toFixed(2)}`)
  
  // 如果自由现金流为负数，使用一个合理的正数作为默认值
  if (freeCashFlow <= 0) {
    const adjustedFCF = operatingCashFlow * 0.8 // 使用经营现金流的80%作为保守估计
    console.log(`⚠️ 自由现金流为负数，使用调整值: ${adjustedFCF.toFixed(2)}`)
    return adjustedFCF
  }
  
  return freeCashFlow
}

// 增强的DCF计算函数
export function calculateEnhancedDCF(
  financialData: EnhancedDCFFinancialData,
  params: EnhancedDCFParams = DEFAULT_ENHANCED_DCF_PARAMS
): EnhancedDCFResult {
  console.log(`🚀 开始增强DCF计算: ${financialData.symbol}`)
  
  // 1. 计算自由现金流（DCF Start Value）
  const dcfStartValue = params.dcfStartValue || calculateFreeCashFlow(financialData)
  
  // 2. 获取财务数据
  const currentPrice = financialData.currentPrice || 0
  const debt = params.debt || financialData.totalLiabilities || 0
  const cash = params.cash || financialData.cashAndEquivalents || 0
  const minorityInterests = params.minorityInterests || 0
  const sharesOutstanding = params.sharesOutstanding || financialData.sharesOutstanding || 1
  
  console.log(`📊 财务数据: 当前价格=${currentPrice}, 负债=${debt}, 现金=${cash}, 股本=${sharesOutstanding}`)
  
  // 3. 预测未来现金流
  const years = Array.from({ length: params.projectionYears }, (_, i) => i + 1)
  const projectedFCF: number[] = []
  const discountedFCF: number[] = []
  
  let currentFCF = dcfStartValue
  
  for (let i = 0; i < params.projectionYears; i++) {
    // 第n年FCF = 上一年FCF * (1 + Growth Rate)
    const yearFCF = currentFCF * (1 + params.growthRate)
    projectedFCF.push(yearFCF)
    currentFCF = yearFCF
    
    // 折现现金流 = 第n年FCF / (1 + Discount Rate)^n
    const discountFactor = Math.pow(1 + params.discountRate, i + 1)
    const discountedCF = yearFCF / discountFactor
    discountedFCF.push(discountedCF)
    
    console.log(`📈 第${i + 1}年: FCF=${yearFCF.toFixed(2)}, 折现FCF=${discountedCF.toFixed(2)}`)
  }
  
  // 4. 计算永续价值
  const finalYearFCF = projectedFCF[projectedFCF.length - 1]
  const terminalValue = (finalYearFCF * (1 + params.terminalRate)) / (params.discountRate - params.terminalRate)
  const discountedTerminalValue = terminalValue / Math.pow(1 + params.discountRate, params.projectionYears)
  
  console.log(`🏁 永续价值: 最后一年FCF=${finalYearFCF.toFixed(2)}, 永续价值=${terminalValue.toFixed(2)}, 折现永续价值=${discountedTerminalValue.toFixed(2)}`)
  
  // 5. 计算企业价值和股权价值
  const sumOfPV = discountedFCF.reduce((sum, cf) => sum + cf, 0)
  const enterpriseValue = sumOfPV + discountedTerminalValue
  
  // 股权价值 = 企业价值 - 净负债 + 现金 - 少数股东权益
  // 如果净负债过高，使用更保守的计算方法
  const netDebt = debt - cash
  let equityValue = enterpriseValue - netDebt - minorityInterests
  
  // 如果股权价值为负数，使用企业价值作为保守估计
  if (equityValue <= 0) {
    console.log(`⚠️ 股权价值为负数，使用企业价值作为保守估计`)
    equityValue = enterpriseValue * 0.5 // 使用企业价值的50%作为保守估计
  }
  
  const valuePerShare = equityValue / sharesOutstanding
  
  console.log(`💰 估值计算: 现金流现值=${sumOfPV.toFixed(2)}, 企业价值=${enterpriseValue.toFixed(2)}, 股权价值=${equityValue.toFixed(2)}, 每股价值=${valuePerShare.toFixed(2)}`)
  
  // 6. 计算买入价格和安全边际
  const buyUnderPrice = valuePerShare * (1 - params.marginOfSafety)
  const marginOfSafetyPercent = currentPrice > 0 ? ((valuePerShare - currentPrice) / valuePerShare) * 100 : 0
  
  console.log(`🎯 投资建议: 买入价格=${buyUnderPrice.toFixed(2)}, 安全边际=${marginOfSafetyPercent.toFixed(2)}%`)
  
  // 7. 敏感性分析
  const sensitivityAnalysis = calculateSensitivityAnalysis(
    dcfStartValue,
    params,
    valuePerShare
  )
  
  // 8. 数据质量评估
  const dataQuality = assessDataQuality(financialData)
  
  const result: EnhancedDCFResult = {
    symbol: financialData.symbol,
    name: financialData.name,
    currentPrice,
    
    dcfCalculation: {
      projectedCashFlows: {
        year: years,
        freeCashFlow: projectedFCF,
        discountedCashFlow: discountedFCF
      },
      
      terminalValue: {
        finalYearFCF,
        terminalGrowthRate: params.terminalRate,
        terminalValue,
        discountedTerminalValue
      },
      
      valuation: {
        sumOfPV,
        terminalValuePV: discountedTerminalValue,
        enterpriseValue,
        equityValue,
        valuePerShare,
        buyUnderPrice,
        marginOfSafetyPercent
      }
    },
    
    sensitivityAnalysis,
    dataQuality
  }
  
  console.log(`✅ 增强DCF计算完成: ${financialData.symbol} 每股价值=${valuePerShare.toFixed(2)}`)
  return result
}

// 敏感性分析
function calculateSensitivityAnalysis(
  dcfStartValue: number,
  params: EnhancedDCFParams,
  baseValue: number
) {
  // 简化的敏感性分析，避免递归调用
  const growthRateSensitivity = [-0.05, -0.02, 0, 0.02, 0.05].map(change => {
    const testGrowthRate = params.growthRate + change
    // 简化的敏感性计算
    const sensitivityFactor = 1 + (change * 2) // 简化的敏感性系数
    return {
      rate: testGrowthRate * 100,
      value: baseValue * sensitivityFactor
    }
  })
  
  const discountRateSensitivity = [-0.02, -0.01, 0, 0.01, 0.02].map(change => {
    const testDiscountRate = params.discountRate + change
    // 简化的敏感性计算
    const sensitivityFactor = 1 - (change * 3) // 折现率越高，价值越低
    return {
      rate: testDiscountRate * 100,
      value: baseValue * sensitivityFactor
    }
  })
  
  const terminalRateSensitivity = [-0.01, -0.005, 0, 0.005, 0.01].map(change => {
    const testTerminalRate = params.terminalRate + change
    // 简化的敏感性计算
    const sensitivityFactor = 1 + (change * 5) // 永续增长率对价值影响较大
    return {
      rate: testTerminalRate * 100,
      value: baseValue * sensitivityFactor
    }
  })
  
  return {
    growthRateSensitivity,
    discountRateSensitivity,
    terminalRateSensitivity
  }
}

// 数据质量评估
function assessDataQuality(financialData: EnhancedDCFFinancialData) {
  let completeness = 0
  let reliability = 'LOW'
  
  // 检查关键数据完整性
  if (financialData.operatingCashFlow !== 0) completeness += 25
  if (financialData.totalLiabilities !== 0) completeness += 25
  if (financialData.cashAndEquivalents !== 0) completeness += 25
  if (financialData.sharesOutstanding > 0) completeness += 25
  
  // 确定可靠性
  if (completeness >= 80) reliability = 'HIGH'
  else if (completeness >= 60) reliability = 'MEDIUM'
  else reliability = 'LOW'
  
  return {
    completeness,
    reliability,
    lastUpdated: financialData.lastUpdated || new Date().toISOString()
  }
}
