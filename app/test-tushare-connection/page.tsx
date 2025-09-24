'use client'

import React, { useState } from 'react'

export default function TestTushareConnectionPage() {
  const [ticker, setTicker] = useState('300080')
  const [result, setResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleTest = async () => {
    if (!ticker.trim()) return
    
    setIsLoading(true)
    setError(null)
    setResult(null)
    
    try {
      console.log(`🔍 测试Tushare API连接: ${ticker}`)
      
      const response = await fetch(`/api/test-tushare?ticker=${ticker}`)
      const data = await response.json()
      
      if (data.success) {
        setResult(data.data)
        console.log('✅ Tushare API连接成功:', data.data)
      } else {
        throw new Error(data.error || 'API test failed')
      }
      
    } catch (error) {
      console.error('❌ Tushare API连接失败:', error)
      setError(error instanceof Error ? error.message : String(error))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Tushare API连接测试
        </h1>
        
        <div className="space-y-6">
          {/* 测试控制面板 */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">API连接测试</h2>
            
            <div className="flex space-x-4 mb-4">
              <input
                type="text"
                value={ticker}
                onChange={(e) => setTicker(e.target.value)}
                placeholder="输入A股代码 (如: 300080, 000001, 600036)"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleTest}
                disabled={isLoading || !ticker.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isLoading ? '测试中...' : '测试连接'}
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
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">连接成功</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">股票代码</p>
                  <p className="font-semibold text-lg">{result.ts_code}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">公司名称</p>
                  <p className="font-semibold text-lg">{result.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">地区</p>
                  <p className="font-semibold text-lg">{result.area}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">行业</p>
                  <p className="font-semibold text-lg">{result.industry}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">市场</p>
                  <p className="font-semibold text-lg">{result.market}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">上市日期</p>
                  <p className="font-semibold text-lg">{result.list_date}</p>
                </div>
              </div>
            </div>
          )}

          {/* 使用说明 */}
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">使用说明</h3>
            <div className="space-y-2 text-sm text-blue-800">
              <p>• 这个页面用于测试Tushare API的基本连接</p>
              <p>• 输入A股代码（如：300080, 000001, 600036）</p>
              <p>• 点击"测试连接"按钮验证API是否正常工作</p>
              <p>• 如果连接成功，会显示股票的基本信息</p>
              <p>• 如果连接失败，会显示具体的错误信息</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

