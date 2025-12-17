'use client'

import React from 'react'

interface SensitivityAnalysisTableProps {
  title: string
  data: {
    growthRates: number[]
    discountRates: number[]
    values: number[][]
    highlightRow: number
    highlightCol: number
  }
  isMarginOfSafety?: boolean
  className?: string
}

export default function SensitivityAnalysisTable({ 
  title, 
  data, 
  isMarginOfSafety = false, 
  className = '' 
}: SensitivityAnalysisTableProps) {
  const formatValue = (value: number | undefined | null) => {
    if (value === undefined || value === null || isNaN(value)) {
      return 'N/A'
    }
    if (isMarginOfSafety) {
      return `${value.toFixed(2)}%`
    } else {
      return `$${value.toFixed(2)}`
    }
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="bg-gray-800 text-white px-6 py-4 rounded-t-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            {title}
          </h3>
          <button className="text-gray-300 hover:text-white">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Growth Rate
              </th>
              {data.discountRates.map((rate) => (
                <th key={rate} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {rate.toFixed(1)}%
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.growthRates.map((growthRate, rowIndex) => (
              <tr key={growthRate}>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                  {growthRate.toFixed(1)}%
                </td>
                {data.discountRates.map((discountRate, colIndex) => {
                  const value = data.values[rowIndex][colIndex]
                  const isHighlighted = rowIndex === data.highlightRow && colIndex === data.highlightCol
                  
                  return (
                    <td
                      key={`${rowIndex}-${colIndex}`}
                      className={`px-4 py-3 whitespace-nowrap text-sm text-center ${
                        isHighlighted 
                          ? 'bg-red-100 text-red-900 font-semibold' 
                          : 'text-gray-900'
                      }`}
                    >
                      {formatValue(value)}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
