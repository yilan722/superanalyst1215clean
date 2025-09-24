'use client'

import React from 'react'

interface StockPriceChartProps {
  currentPrice: number
  fairValue: number
  buyUnderPrice: number
  year52High: number
  year52Low: number
  priceChange: number
  className?: string
}

export default function StockPriceChart({
  currentPrice,
  fairValue,
  buyUnderPrice,
  year52High,
  year52Low,
  priceChange,
  className = ''
}: StockPriceChartProps) {
  // 生成模拟的历史数据
  const generateHistoricalData = () => {
    const data = []
    const startDate = new Date('2015-01-02')
    const endDate = new Date('2024-04-22')
    const days = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    
    for (let i = 0; i <= days; i += 30) { // 每月一个数据点
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000)
      const progress = i / days
      
      // 模拟股价波动
      const basePrice = 10 + (currentPrice - 10) * progress
      const volatility = Math.sin(progress * Math.PI * 4) * 5 + Math.random() * 3 - 1.5
      const stockPrice = Math.max(5, basePrice + volatility)
      
      // 模拟公允价值和买入价的增长
      const fairValuePrice = 15 + (fairValue - 15) * progress
      const buyPrice = fairValuePrice * 0.8
      
      data.push({
        date: date.toISOString().split('T')[0],
        stockPrice: Math.round(stockPrice * 100) / 100,
        fairValue: Math.round(fairValuePrice * 100) / 100,
        buyPrice: Math.round(buyPrice * 100) / 100
      })
    }
    
    return data
  }

  const historicalData = generateHistoricalData()
  const maxPrice = Math.max(...historicalData.map(d => Math.max(d.stockPrice, d.fairValue, d.buyPrice)))
  const minPrice = Math.min(...historicalData.map(d => Math.min(d.stockPrice, d.fairValue, d.buyPrice)))
  const priceRange = maxPrice - minPrice
  const padding = priceRange * 0.1

  const chartWidth = 600
  const chartHeight = 300
  const margin = { top: 20, right: 20, bottom: 40, left: 60 }

  const xScale = (index: number) => (index / (historicalData.length - 1)) * (chartWidth - margin.left - margin.right) + margin.left
  const yScale = (price: number) => chartHeight - margin.bottom - ((price - minPrice + padding) / (priceRange + padding * 2)) * (chartHeight - margin.top - margin.bottom)

  const createPath = (data: any[], key: string) => {
    return data.map((point, index) => {
      const x = xScale(index)
      const y = yScale(point[key])
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
    }).join(' ')
  }

  const stockPath = createPath(historicalData, 'stockPrice')
  const fairValuePath = createPath(historicalData, 'fairValue')
  const buyPricePath = createPath(historicalData, 'buyPrice')

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="bg-gray-800 text-white px-6 py-4 rounded-t-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            Stock Price vs Fair Value and Buy Price
          </h3>
          <div className="flex items-center space-x-4">
            <span className="text-sm">
              Price Change: {priceChange > 0 ? '+' : ''}{(priceChange || 0).toFixed(1)}%
            </span>
            <button className="text-gray-300 hover:text-white">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="p-6">
        <div className="relative">
          <svg width={chartWidth} height={chartHeight} className="overflow-visible">
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
              const y = margin.top + ratio * (chartHeight - margin.top - margin.bottom)
              const price = minPrice + (1 - ratio) * (priceRange + padding * 2) - padding
              return (
                <g key={ratio}>
                  <line
                    x1={margin.left}
                    y1={y}
                    x2={chartWidth - margin.right}
                    y2={y}
                    stroke="#f3f4f6"
                    strokeWidth="1"
                  />
                  <text
                    x={margin.left - 10}
                    y={y + 4}
                    textAnchor="end"
                    className="text-xs fill-gray-500"
                  >
                    ${(price || 0).toFixed(0)}
                  </text>
                </g>
              )
            })}

            {/* X-axis labels */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
              const x = margin.left + ratio * (chartWidth - margin.left - margin.right)
              const dateIndex = Math.floor(ratio * (historicalData.length - 1))
              const date = historicalData[dateIndex]?.date
              return (
                <text
                  key={ratio}
                  x={x}
                  y={chartHeight - 10}
                  textAnchor="middle"
                  className="text-xs fill-gray-500"
                >
                  {date ? new Date(date).getFullYear() : ''}
                </text>
              )
            })}

            {/* Stock price line */}
            <path
              d={stockPath}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
            />

            {/* Fair value line (stepped) */}
            <path
              d={fairValuePath}
              fill="none"
              stroke="#ef4444"
              strokeWidth="2"
              strokeDasharray="5,5"
            />

            {/* Buy price line (stepped) */}
            <path
              d={buyPricePath}
              fill="none"
              stroke="#10b981"
              strokeWidth="2"
              strokeDasharray="5,5"
            />

            {/* Current price indicator */}
            <circle
              cx={xScale(historicalData.length - 1)}
              cy={yScale(currentPrice)}
              r="4"
              fill="#3b82f6"
            />
          </svg>

          {/* Legend */}
          <div className="flex items-center justify-center space-x-6 mt-4">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-0.5 bg-blue-500"></div>
              <span className="text-sm text-gray-600">Stock Price</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-0.5 bg-red-500 border-dashed border-t-2"></div>
              <span className="text-sm text-gray-600">Fair Value</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-0.5 bg-green-500 border-dashed border-t-2"></div>
              <span className="text-sm text-gray-600">Buy Price</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}