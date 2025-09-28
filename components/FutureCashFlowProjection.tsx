'use client'

import React, { useState } from 'react'

interface FutureCashFlowProjectionProps {
  data: {
    years: number[]
    projectedCashFlow: number[]
    growthRates: string[]
    terminalValue: number
  }
  className?: string
}

export default function FutureCashFlowProjection({ data, className = '' }: FutureCashFlowProjectionProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const formatValue = (value: number | undefined | null) => {
    if (value === undefined || value === null || isNaN(value)) {
      return 'N/A'
    }
    if (value >= 1000000000) {
      return `${(value / 1000000000).toFixed(2)}B`
    } else if (value >= 1000000) {
      return `${(value / 1000000).toFixed(2)}M`
    } else {
      return value.toFixed(2)
    }
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="bg-gray-800 text-white px-6 py-4 rounded-t-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            PROJECTION OF FUTURE FREE CASH FLOW
          </h3>
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-300 hover:text-white transition-transform"
          >
            <svg 
              className={`w-4 h-4 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      {/* Table */}
      {isExpanded && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Year
              </th>
                {data.years.map((year) => (
                  <th key={year} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {year}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 text-center">
                  Projected Free Cash Flow
                </td>
                {data.projectedCashFlow.map((value, index) => (
                  <td key={index} className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-center">
                    {formatValue(value)}
                  </td>
                ))}
              </tr>
              <tr className="bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 text-center">
                  Growth Rate
                </td>
                {data.growthRates.map((rate, index) => (
                  <td key={index} className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-center">
                    {rate}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
          
          {/* Terminal Value */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Terminal Value</span>
              <span className="text-lg font-semibold text-gray-900">
                {formatValue(data.terminalValue)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
