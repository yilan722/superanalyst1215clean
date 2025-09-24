'use client'

import React, { useState } from 'react'

export default function TestValuationSearchPage() {
  const [searchInput, setSearchInput] = useState('')
  const [result, setResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async () => {
    if (!searchInput.trim()) return
    
    setIsLoading(true)
    setError(null)
    setResult(null)
    
    try {
      console.log(`🔍 测试搜索股票: ${searchInput}`)
      
      // 获取财务数据
      const financialResponse = await fetch(`/api/dcf-financial-data?ticker=${searchInput}`)
      const financialData = await financialResponse.json()
      
      if (!financialData.success) {
        throw new Error(financialData.error || 'Failed to fetch financial data')
      }
      
      console.log('✅ 财务数据获取成功:', financialData.data)
      
      // 获取DCF估值
      const valuationResponse = await fetch(`/api/dcf-valuation?ticker=${searchInput}`)
      const valuationData = await valuationResponse.json()
      
      if (!valuationData.success) {
        throw new Error(valuationData.error || 'Failed to generate DCF valuation')
      }
      
      console.log('✅ DCF估值生成成功:', valuationData.data)
      
      setResult({
        financial: financialData.data,
        valuation: valuationData.data
      })
      
    } catch (error) {
      console.error('❌ 搜索失败:', error)
      setError(error instanceof Error ? error.message : String(error))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          估值分析搜索测试
        </h1>
        
        <div className="space-y-6">
          {/* 搜索控制面板 */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">股票搜索测试</h2>
            
            <div className="flex space-x-4 mb-4">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="输入A股代码 (如: 000001, 600036, 300080)"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch()
                  }
                }}
              />
              <button
                onClick={handleSearch}
                disabled={isLoading || !searchInput.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isLoading ? '搜索中...' : '搜索'}
              </button>
            </div>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                <strong>错误:</strong> {error}
              </div>
            )}
          </div>

          {/* 结果显示 */}
          {result && (
            <div className="space-y-6">
              {/* 公司信息 */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">公司信息</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">股票代码</p>
                    <p className="font-semibold text-lg">{result.financial.symbol}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">公司名称</p>
                    <p className="font-semibold text-lg">{result.financial.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">当前价格</p>
                    <p className="font-semibold text-lg">¥{result.financial.currentPrice.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">市值</p>
                    <p className="font-semibold text-lg">¥{(result.financial.marketCap / 100000000).toFixed(2)}亿</p>
                  </div>
                </div>
              </div>

              {/* 财务数据摘要 */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">财务数据摘要</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-900 mb-2">利润表</h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>营业收入:</span>
                        <span>¥{(result.financial.revenue / 100000000).toFixed(2)}亿</span>
                      </div>
                      <div className="flex justify-between">
                        <span>净利润:</span>
                        <span>¥{(result.financial.netIncome / 100000000).toFixed(2)}亿</span>
                      </div>
                      <div className="flex justify-between">
                        <span>净利润率:</span>
                        <span>{(result.financial.profitMargin * 100).toFixed(2)}%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-green-900 mb-2">现金流</h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>经营现金流:</span>
                        <span>¥{(result.financial.operatingCashFlow / 100000000).toFixed(2)}亿</span>
                      </div>
                      <div className="flex justify-between">
                        <span>自由现金流:</span>
                        <span>¥{(result.financial.freeCashFlow / 100000000).toFixed(2)}亿</span>
                      </div>
                      <div className="flex justify-between">
                        <span>资本支出:</span>
                        <span>¥{(result.financial.capex / 100000000).toFixed(2)}亿</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-purple-900 mb-2">估值倍数</h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>市盈率:</span>
                        <span>{result.financial.peRatio.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>市净率:</span>
                        <span>{result.financial.pbRatio.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>市销率:</span>
                        <span>{result.financial.psRatio.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* DCF估值结果 */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">DCF估值结果</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-900 mb-2">估值摘要</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>当前价格:</span>
                        <span>¥{result.valuation.currentPrice.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>公允价值:</span>
                        <span className="text-blue-600">¥{result.valuation.fairValue.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>涨跌幅:</span>
                        <span className={result.valuation.upsideDownside > 0 ? 'text-green-600' : 'text-red-600'}>
                          {(result.valuation.upsideDownside * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>投资建议:</span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          result.valuation.recommendation === 'STRONG_BUY' ? 'bg-green-100 text-green-800' :
                          result.valuation.recommendation === 'BUY' ? 'bg-blue-100 text-blue-800' :
                          result.valuation.recommendation === 'HOLD' ? 'bg-yellow-100 text-yellow-800' :
                          result.valuation.recommendation === 'SELL' ? 'bg-orange-100 text-orange-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {result.valuation.recommendation}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-green-900 mb-2">关键假设</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>WACC:</span>
                        <span>{(result.valuation.assumptions.wacc * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>终端增长率:</span>
                        <span>{(result.valuation.assumptions.terminalGrowthRate * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>首年收入增长:</span>
                        <span>{(result.valuation.assumptions.revenueGrowth[0] * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>首年营业利润率:</span>
                        <span>{(result.valuation.assumptions.operatingMargin[0] * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

