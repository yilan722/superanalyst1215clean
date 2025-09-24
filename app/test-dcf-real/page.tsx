'use client'

import React, { useState } from 'react'

export default function TestDCFRealPage() {
  const [ticker, setTicker] = useState('000001') // 平安银行
  const [financialData, setFinancialData] = useState<any>(null)
  const [dcfValuation, setDcfValuation] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleTestFinancialData = async () => {
    if (!ticker.trim()) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      console.log(`🔍 测试获取 ${ticker} 的财务数据...`)
      
      const response = await fetch(`/api/dcf-financial-data?ticker=${ticker}`)
      const data = await response.json()
      
      if (data.success) {
        setFinancialData(data.data)
        console.log('✅ 财务数据获取成功:', data.data)
      } else {
        throw new Error(data.error || 'Failed to fetch financial data')
      }
      
    } catch (error) {
      console.error('❌ 财务数据获取失败:', error)
      setError(error instanceof Error ? error.message : String(error))
    } finally {
      setIsLoading(false)
    }
  }

  const handleTestDCFValuation = async () => {
    if (!ticker.trim()) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      console.log(`🚀 测试生成 ${ticker} 的DCF估值...`)
      
      const response = await fetch(`/api/dcf-valuation?ticker=${ticker}`)
      const data = await response.json()
      
      if (data.success) {
        setDcfValuation(data.data)
        console.log('✅ DCF估值生成成功:', data.data)
      } else {
        throw new Error(data.error || 'Failed to generate DCF valuation')
      }
      
    } catch (error) {
      console.error('❌ DCF估值生成失败:', error)
      setError(error instanceof Error ? error.message : String(error))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          DCF估值功能测试页面
        </h1>
        
        <div className="space-y-6">
          {/* 测试控制面板 */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">测试控制面板</h2>
            
            <div className="flex space-x-4 mb-4">
              <input
                type="text"
                value={ticker}
                onChange={(e) => setTicker(e.target.value)}
                placeholder="输入A股代码 (如: 000001, 600036, 300080)"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleTestFinancialData}
                disabled={isLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isLoading ? '获取中...' : '获取财务数据'}
              </button>
              <button
                onClick={handleTestDCFValuation}
                disabled={isLoading}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isLoading ? '计算中...' : '生成DCF估值'}
              </button>
            </div>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                <strong>错误:</strong> {error}
              </div>
            )}
          </div>

          {/* 财务数据显示 */}
          {financialData && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">财务数据</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* 基础信息 */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">基础信息</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">股票代码:</span>
                      <span className="font-medium">{financialData.symbol}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">公司名称:</span>
                      <span className="font-medium">{financialData.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">当前价格:</span>
                      <span className="font-medium">¥{financialData.currentPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">市值:</span>
                      <span className="font-medium">¥{(financialData.marketCap / 100000000).toFixed(2)}亿</span>
                    </div>
                  </div>
                </div>

                {/* 利润表数据 */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-900 mb-2">利润表数据</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">营业收入:</span>
                      <span className="font-medium">¥{(financialData.revenue / 100000000).toFixed(2)}亿</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">净利润:</span>
                      <span className="font-medium">¥{(financialData.netIncome / 100000000).toFixed(2)}亿</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">营业利润:</span>
                      <span className="font-medium">¥{(financialData.operatingIncome / 100000000).toFixed(2)}亿</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">毛利润:</span>
                      <span className="font-medium">¥{(financialData.grossProfit / 100000000).toFixed(2)}亿</span>
                    </div>
                  </div>
                </div>

                {/* 现金流数据 */}
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-purple-900 mb-2">现金流数据</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">经营现金流:</span>
                      <span className="font-medium">¥{(financialData.operatingCashFlow / 100000000).toFixed(2)}亿</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">自由现金流:</span>
                      <span className="font-medium">¥{(financialData.freeCashFlow / 100000000).toFixed(2)}亿</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">资本支出:</span>
                      <span className="font-medium">¥{(financialData.capex / 100000000).toFixed(2)}亿</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">现金及等价物:</span>
                      <span className="font-medium">¥{(financialData.cashAndEquivalents / 100000000).toFixed(2)}亿</span>
                    </div>
                  </div>
                </div>

                {/* 财务比率 */}
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-yellow-900 mb-2">财务比率</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">净利润率:</span>
                      <span className="font-medium">{(financialData.profitMargin * 100).toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">营业利润率:</span>
                      <span className="font-medium">{(financialData.operatingMargin * 100).toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">ROE:</span>
                      <span className="font-medium">{(financialData.roe * 100).toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">ROA:</span>
                      <span className="font-medium">{(financialData.roa * 100).toFixed(2)}%</span>
                    </div>
                  </div>
                </div>

                {/* 估值倍数 */}
                <div className="bg-red-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-red-900 mb-2">估值倍数</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">市盈率:</span>
                      <span className="font-medium">{financialData.peRatio.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">市净率:</span>
                      <span className="font-medium">{financialData.pbRatio.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">市销率:</span>
                      <span className="font-medium">{financialData.psRatio.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">EV/EBITDA:</span>
                      <span className="font-medium">{financialData.evEbitda.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* 数据质量 */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">数据质量</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">完整性:</span>
                      <span className="font-medium">{financialData.dataQuality.completeness}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">可靠性:</span>
                      <span className="font-medium">{financialData.dataQuality.reliability}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">数据来源:</span>
                      <span className="font-medium">{financialData.dataSource}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">最后更新:</span>
                      <span className="font-medium text-xs">
                        {new Date(financialData.lastUpdated).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* DCF估值结果显示 */}
          {dcfValuation && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">DCF估值结果</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                {/* 估值摘要 */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">估值摘要</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">当前价格:</span>
                      <span className="font-medium">¥{dcfValuation.currentPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">公允价值:</span>
                      <span className="font-medium text-blue-600">¥{dcfValuation.fairValue.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">涨跌幅:</span>
                      <span className={`font-medium ${dcfValuation.upsideDownside > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {(dcfValuation.upsideDownside * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">投资建议:</span>
                      <span className={`font-medium px-2 py-1 rounded text-xs ${
                        dcfValuation.recommendation === 'STRONG_BUY' ? 'bg-green-100 text-green-800' :
                        dcfValuation.recommendation === 'BUY' ? 'bg-blue-100 text-blue-800' :
                        dcfValuation.recommendation === 'HOLD' ? 'bg-yellow-100 text-yellow-800' :
                        dcfValuation.recommendation === 'SELL' ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {dcfValuation.recommendation}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 关键假设 */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-900 mb-2">关键假设</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">WACC:</span>
                      <span className="font-medium">{(dcfValuation.assumptions.wacc * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">终端增长率:</span>
                      <span className="font-medium">{(dcfValuation.assumptions.terminalGrowthRate * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">首年收入增长:</span>
                      <span className="font-medium">{(dcfValuation.assumptions.revenueGrowth[0] * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">首年营业利润率:</span>
                      <span className="font-medium">{(dcfValuation.assumptions.operatingMargin[0] * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>

                {/* 估值分析 */}
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-purple-900 mb-2">估值分析</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">现金流现值:</span>
                      <span className="font-medium">¥{(dcfValuation.valuation.presentValueOfCashFlows / 100000000).toFixed(2)}亿</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">终端价值:</span>
                      <span className="font-medium">¥{(dcfValuation.valuation.terminalValue / 100000000).toFixed(2)}亿</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">企业价值:</span>
                      <span className="font-medium">¥{(dcfValuation.valuation.enterpriseValue / 100000000).toFixed(2)}亿</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">每股价值:</span>
                      <span className="font-medium">¥{dcfValuation.valuation.valuePerShare.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* 数据质量 */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">数据质量</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">完整性:</span>
                      <span className="font-medium">{dcfValuation.dataQuality.completeness}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">可靠性:</span>
                      <span className={`font-medium px-2 py-1 rounded text-xs ${
                        dcfValuation.dataQuality.reliability === 'HIGH' ? 'bg-green-100 text-green-800' :
                        dcfValuation.dataQuality.reliability === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {dcfValuation.dataQuality.reliability}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">最后更新:</span>
                      <span className="font-medium text-xs">
                        {new Date(dcfValuation.dataQuality.lastUpdated).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 现金流预测表格 */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">现金流预测</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left">年份</th>
                        <th className="px-4 py-2 text-right">收入</th>
                        <th className="px-4 py-2 text-right">营业利润</th>
                        <th className="px-4 py-2 text-right">净利润</th>
                        <th className="px-4 py-2 text-right">自由现金流</th>
                        <th className="px-4 py-2 text-right">折现现金流</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {dcfValuation.cashFlowProjection.year.map((year: number, index: number) => (
                        <tr key={year}>
                          <td className="px-4 py-2 font-medium">{year}</td>
                          <td className="px-4 py-2 text-right">
                            ¥{(dcfValuation.cashFlowProjection.revenue[index] / 100000000).toFixed(2)}亿
                          </td>
                          <td className="px-4 py-2 text-right">
                            ¥{(dcfValuation.cashFlowProjection.operatingIncome[index] / 100000000).toFixed(2)}亿
                          </td>
                          <td className="px-4 py-2 text-right">
                            ¥{(dcfValuation.cashFlowProjection.netIncome[index] / 100000000).toFixed(2)}亿
                          </td>
                          <td className="px-4 py-2 text-right">
                            ¥{(dcfValuation.cashFlowProjection.freeCashFlow[index] / 100000000).toFixed(2)}亿
                          </td>
                          <td className="px-4 py-2 text-right">
                            ¥{(dcfValuation.cashFlowProjection.discountedCashFlow[index] / 100000000).toFixed(2)}亿
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

