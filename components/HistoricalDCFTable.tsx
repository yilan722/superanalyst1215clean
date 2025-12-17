'use client'

import React from 'react'

interface HistoricalDCFData {
  year: number
  equityValue: number
  estimatedValuePerShare: number
  buyPrice: number
}

interface HistoricalDCFTableProps {
  data: HistoricalDCFData[]
  className?: string
}

export default function HistoricalDCFTable({ data, className = '' }: HistoricalDCFTableProps) {
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

  const formatPrice = (price: number | undefined | null) => {
    if (price === undefined || price === null || isNaN(price)) {
      return 'N/A'
    }
    return `$${price.toFixed(2)}`
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="bg-gray-800 text-white px-6 py-4 rounded-t-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            Historical DCF
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Year
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Equity Value
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estimated Value per Share
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Buy Price
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, index) => (
              <tr key={row.year} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {row.year}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                  {formatValue(row.equityValue)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                  {formatPrice(row.estimatedValuePerShare)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                  {formatPrice(row.buyPrice)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 px-6 py-3 rounded-b-lg">
        <div className="flex justify-end">
          <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
            EXPAND
          </button>
        </div>
      </div>
    </div>
  )
}
