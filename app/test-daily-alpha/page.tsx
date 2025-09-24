'use client'

import React, { useState, useEffect } from 'react'

interface HotStock {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  marketCap: number
  peRatio: number
  sector: string
  reason: string
  confidence: 'high' | 'medium' | 'low'
}

export default function TestDailyAlphaPage() {
  const [hotStocks, setHotStocks] = useState<HotStock[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchHotStocks = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/hot-stocks')
      const data = await response.json()
      
      if (data.success) {
        setHotStocks(data.data)
        console.log('获取到的股票数据:', data.data.map((s: HotStock) => s.symbol))
      } else {
        setError(data.error || 'Failed to fetch data')
      }
    } catch (err) {
      setError('Network error: ' + (err as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchHotStocks()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Daily Alpha Brief 数据测试
          </h1>
          
          <div className="mb-4">
            <button
              onClick={fetchHotStocks}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? '加载中...' : '刷新数据'}
            </button>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              <strong>错误:</strong> {error}
            </div>
          )}

          {isLoading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          )}

          {!isLoading && hotStocks.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                股票列表 ({hotStocks.length} 只)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {hotStocks.map((stock, index) => (
                  <div key={stock.symbol} className="bg-gray-50 rounded-lg p-4 border">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-gray-900">{stock.symbol}</h3>
                      <span className={`px-2 py-1 rounded text-xs ${
                        stock.confidence === 'high' ? 'bg-green-100 text-green-800' :
                        stock.confidence === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {stock.confidence}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <div>价格: ${stock.price.toFixed(2)}</div>
                      <div className={`${stock.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        涨跌: {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                      </div>
                      <div>成交量: {stock.volume.toLocaleString()}</div>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      {stock.reason}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!isLoading && hotStocks.length === 0 && !error && (
            <div className="text-center py-12">
              <p className="text-gray-600">暂无数据</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
