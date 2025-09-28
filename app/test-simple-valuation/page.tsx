'use client'

import React, { useState } from 'react'

export default function TestSimpleValuation() {
  const [ticker, setTicker] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async () => {
    if (!ticker.trim()) return
    
    setLoading(true)
    setError(null)
    setResult(null)
    
    try {
      console.log('搜索股票:', ticker)
      
      // 测试增强的DCF财务数据API
      const financialResponse = await fetch(`/api/enhanced-dcf-data?ticker=${ticker}`)
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
      const valuationResponse = await fetch(`/api/dcf-valuation?ticker=${ticker}`)
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
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Simple Valuation Test</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
              placeholder="输入股票代码 (如: 300080)"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? '搜索中...' : '搜索'}
            </button>
          </div>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <strong>错误:</strong> {error}
            </div>
          )}
          
          {result && (
            <div className="space-y-4">
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                <strong>成功!</strong> 数据获取成功
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-100 p-4 rounded">
                  <h3 className="font-semibold mb-2">财务数据</h3>
                  <pre className="text-sm overflow-auto max-h-64">
                    {JSON.stringify(result.financial, null, 2)}
                  </pre>
                </div>
                
                <div className="bg-gray-100 p-4 rounded">
                  <h3 className="font-semibold mb-2">估值数据</h3>
                  <pre className="text-sm overflow-auto max-h-64">
                    {JSON.stringify(result.valuation, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

