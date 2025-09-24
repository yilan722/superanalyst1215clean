'use client'

import React, { useState } from 'react'

interface PerformanceAnalysisTableProps {
  title: string
  data: {
    periods: string[]
    metrics: {
      name: string
      values: number[]
    }[]
  }
  className?: string
}

export default function PerformanceAnalysisTable({ title, data, className = '' }: PerformanceAnalysisTableProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const formatPercentage = (value: number | undefined | null) => {
    if (value === undefined || value === null || isNaN(value)) {
      return 'N/A'
    }
    return `${value.toFixed(2)}%`
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="bg-gray-800 text-white px-6 py-4 rounded-t-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            {title}
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
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Metric
              </th>
                {data.periods.map((period) => (
                  <th key={period} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {period}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.metrics.map((metric, index) => (
                <tr key={metric.name} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    {metric.name}
                  </td>
                  {metric.values.map((value, valueIndex) => (
                    <td key={valueIndex} className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-center">
                      {formatPercentage(value)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
