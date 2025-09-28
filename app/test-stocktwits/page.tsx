'use client'

import React, { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, BarChart3, DollarSign, Users, Calendar, ExternalLink, FileText, Lock, Eye, Share2 } from 'lucide-react'

interface HotStock {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  marketCap: number
  peRatio: number
  rank: number
  sector: string
  reason: string
  confidence: 'high' | 'medium' | 'low'
}

export default function TestStockTwitsPage() {
  const [hotStocks, setHotStocks] = useState<HotStock[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [source, setSource] = useState<string>('')

  const fetchHotStocks = async (useStockTwits = true) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const url = useStockTwits 
        ? '/api/hot-stocks' 
        : '/api/hot-stocks?useStockTwits=false'
      
      const response = await fetch(url)
      const data = await response.json()
      
      if (data.success) {
        setHotStocks(data.data)
        setSource(data.source || 'unknown')
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

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'bg-green-100 text-green-800 border-green-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`
    return num.toFixed(0)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  StockTwits Most-Active 测试页面
                </h1>
                <p className="text-slate-300">
                  测试从 StockTwits 获取最活跃股票数据
                </p>
              </div>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => fetchHotStocks(true)}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? '加载中...' : '使用 StockTwits'}
              </button>
              <button
                onClick={() => fetchHotStocks(false)}
                disabled={isLoading}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
              >
                {isLoading ? '加载中...' : '使用默认数据'}
              </button>
            </div>
          </div>
          
          <div className="flex items-center space-x-6 text-sm text-slate-400 mt-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>{new Date().toLocaleDateString('zh-CN')}</span>
            </div>
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>{hotStocks.length} 只热门股票</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-500">
                数据源: {source}
              </span>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <strong>错误:</strong> {error}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Stock Cards */}
        {!isLoading && hotStocks.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {hotStocks.map((stock, index) => (
              <div key={stock.symbol} className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
                {/* Stock Header */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{stock.symbol}</h3>
                    <p className="text-sm text-gray-600 truncate">{stock.name}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getConfidenceColor(stock.confidence)}`}>
                      {stock.confidence === 'high' ? '高信心' : stock.confidence === 'medium' ? '中等信心' : '低信心'}
                    </span>
                  </div>
                </div>

                {/* Price and Change */}
                <div className="mb-4">
                  <div className="text-2xl font-bold text-gray-900">
                    ${stock.price.toFixed(2)}
                  </div>
                  <div className={`flex items-center text-sm font-medium ${
                    stock.changePercent >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stock.changePercent >= 0 ? (
                      <TrendingUp className="w-4 h-4 mr-1" />
                    ) : (
                      <TrendingDown className="w-4 h-4 mr-1" />
                    )}
                    {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                  </div>
                </div>

                {/* Additional Info */}
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex justify-between">
                    <span>市值:</span>
                    <span>{formatNumber(stock.marketCap)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>P/E:</span>
                    <span>{stock.peRatio.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>成交量:</span>
                    <span>{formatNumber(stock.volume)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>排名:</span>
                    <span>#{stock.rank}</span>
                  </div>
                </div>

                {/* Analysis Reason */}
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {stock.reason}
                  </p>
                </div>

                {/* Action Button */}
                <div className="mt-4">
                  <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                    生成分析报告
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Data State */}
        {!isLoading && hotStocks.length === 0 && !error && (
          <div className="text-center py-12">
            <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无数据</h3>
            <p className="text-gray-600">请点击上方按钮重新加载数据</p>
          </div>
        )}
      </div>
    </div>
  )
}
