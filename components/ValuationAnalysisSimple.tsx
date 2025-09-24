'use client'

import { useState } from 'react'

interface ValuationAnalysisProps {
  locale: string
  user: any
}

export default function ValuationAnalysisSimple({ locale, user }: ValuationAnalysisProps) {
  const [searchInput, setSearchInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)

  const isChinese = locale === 'zh'

  const handleSearch = async () => {
    if (!searchInput.trim()) return
    
    setLoading(true)
    setError(null)
    setResult(null)
    
    try {
      console.log('搜索股票:', searchInput)
      
      // 测试增强的DCF财务数据API
      const financialResponse = await fetch(`/api/enhanced-dcf-data?ticker=${searchInput}`)
      console.log('财务数据响应状态:', financialResponse.status)
      
      if (!financialResponse.ok) {
        throw new Error(`财务数据API失败: ${financialResponse.status}`)
      }
      
      const financialData = await financialResponse.json()
      console.log('财务数据:', financialData)
      
      if (!financialData.success) {
        throw new Error(financialData.error || 'Failed to fetch enhanced financial data')
      }
      
      // 测试DCF估值API
      const valuationResponse = await fetch(`/api/dcf-valuation?ticker=${searchInput}`)
      console.log('估值响应状态:', valuationResponse.status)
      
      if (!valuationResponse.ok) {
        throw new Error(`估值API失败: ${valuationResponse.status}`)
      }
      
      const valuationData = await valuationResponse.json()
      console.log('估值数据:', valuationData)
      
      if (valuationData.success) {
        setResult({
          financial: financialData.data,
          valuation: valuationData.data
        })
      } else {
        throw new Error(valuationData.error || 'Failed to generate DCF valuation')
      }
      
    } catch (error) {
      console.error('搜索错误:', error)
      setError(error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">
          {isChinese ? '估值分析' : 'Valuation Analysis'}
        </h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {isChinese ? '股票搜索' : 'Stock Search'}
          </h2>
          
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value.toUpperCase())}
              placeholder={isChinese ? '输入股票代码 (如: 300080)' : 'Enter stock ticker (e.g., 300080)'}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? (isChinese ? '搜索中...' : 'Searching...') : (isChinese ? '搜索' : 'Search')}
            </button>
          </div>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <strong>{isChinese ? '错误:' : 'Error:'}</strong> {error}
            </div>
          )}
          
          {result && (
            <div className="space-y-4">
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                <strong>{isChinese ? '成功!' : 'Success!'}</strong> {isChinese ? '数据获取成功' : 'Data fetched successfully'}
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-100 p-4 rounded">
                  <h3 className="font-semibold mb-2">
                    {isChinese ? '财务数据' : 'Financial Data'}
                  </h3>
                  <div className="text-sm space-y-1">
                    <p><strong>{isChinese ? '股票代码:' : 'Symbol:'}</strong> {result.financial.symbol}</p>
                    <p><strong>{isChinese ? '公司名称:' : 'Company Name:'}</strong> {result.financial.name}</p>
                    <p><strong>{isChinese ? '当前价格:' : 'Current Price:'}</strong> ¥{result.financial.currentPrice}</p>
                    <p><strong>{isChinese ? '市值:' : 'Market Cap:'}</strong> ¥{(result.financial.marketCap / 1000000000).toFixed(2)}B</p>
                  </div>
                </div>
                
                <div className="bg-gray-100 p-4 rounded">
                  <h3 className="font-semibold mb-2">
                    {isChinese ? '估值数据' : 'Valuation Data'}
                  </h3>
                  <div className="text-sm space-y-1">
                    <p><strong>{isChinese ? '公允价值:' : 'Fair Value:'}</strong> ¥{result.valuation.fairValue.toFixed(2)}</p>
                    <p><strong>{isChinese ? '上涨空间:' : 'Upside/Downside:'}</strong> {result.valuation.upsideDownside.toFixed(2)}%</p>
                    <p><strong>{isChinese ? '推荐:' : 'Recommendation:'}</strong> {result.valuation.recommendation}</p>
                    <p><strong>{isChinese ? '每股价值:' : 'Value per Share:'}</strong> ¥{result.valuation.valuation.valuePerShare.toFixed(2)}</p>
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

