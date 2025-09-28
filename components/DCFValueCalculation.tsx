'use client'

import React, { useState } from 'react'

interface DCFValueCalculationProps {
  data: {
    sumOfPV: number
    debtAndLeases: number
    minorityInterests: number
    cash: number
    equityValue: number
    sharesOutstanding: number
    perShareValue: number
    desiredMarginOfSafety: number
    buyUnderPrice: number
    currentPrice: number
    actualMarginOfSafety: number
    growthRate: number
  }
  className?: string
}

export default function DCFValueCalculation({ data, className = '' }: DCFValueCalculationProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const formatValue = (value: number | undefined | null) => {
    if (value === undefined || value === null || isNaN(value)) {
      return 'N/A'
    }
    if (value >= 1000000000) {
      return `$${(value / 1000000000).toFixed(2)}B`
    } else if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`
    } else {
      return `$${value.toFixed(2)}`
    }
  }

  const formatPrice = (price: number | undefined | null) => {
    if (price === undefined || price === null || isNaN(price)) {
      return 'N/A'
    }
    return `$${price.toFixed(2)}`
  }

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
            DCF VALUE CALCULATION
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

      {/* Calculation Details */}
      {isExpanded && (
        <div className="p-6">
          <div className="space-y-4">
            {/* Sum of PV */}
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-700">Sum of PV (Value of Operations)</span>
              <span className="text-sm font-medium text-gray-900">{formatValue(data.sumOfPV)}</span>
            </div>

            {/* Debt and Leases */}
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-700">- Debt and Capital Lease Obligations</span>
              <span className="text-sm font-medium text-gray-900">{formatValue(data.debtAndLeases)}</span>
            </div>

            {/* Minority Interests */}
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-700">- Minority Interests</span>
              <span className="text-sm font-medium text-gray-900">{formatValue(data.minorityInterests)}</span>
            </div>

            {/* Cash */}
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-700">+ Cash</span>
              <span className="text-sm font-medium text-gray-900">{formatValue(data.cash)}</span>
            </div>

            {/* Equity Value */}
            <div className="flex justify-between items-center py-2 border-b-2 border-gray-300">
              <span className="text-sm font-semibold text-gray-900">Equity Value</span>
              <span className="text-sm font-bold text-gray-900">{formatValue(data.equityValue)}</span>
            </div>

            {/* Shares Outstanding */}
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-700">Shares Outstanding</span>
              <span className="text-sm font-medium text-gray-900">{formatValue(data.sharesOutstanding)}</span>
            </div>

            {/* Per Share Value */}
            <div className="flex justify-between items-center py-2 border-b-2 border-gray-300">
              <span className="text-sm font-semibold text-gray-900">Per Share Value</span>
              <span className="text-sm font-bold text-gray-900">{formatPrice(data.perShareValue)}</span>
            </div>

            {/* Desired Margin of Safety */}
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-700">Desired Margin of Safety</span>
              <span className="text-sm font-medium text-gray-900">{formatPercentage(data.desiredMarginOfSafety)}</span>
            </div>

            {/* Buy Under Price */}
            <div className="flex justify-between items-center py-2 border-b-2 border-gray-300">
              <span className="text-sm font-semibold text-gray-900">Buy Under Price</span>
              <span className="text-sm font-bold text-gray-900">{formatPrice(data.buyUnderPrice)}</span>
            </div>

            {/* Current Price */}
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-700">Current Price</span>
              <span className="text-sm font-medium text-gray-900">{formatPrice(data.currentPrice)}</span>
            </div>

            {/* Actual Margin of Safety */}
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-700">Actual Margin of Safety</span>
              <span className={`text-sm font-medium ${
                data.actualMarginOfSafety > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatPercentage(data.actualMarginOfSafety)}
              </span>
            </div>

            {/* Growth Rate */}
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-700">Growth Rate</span>
              <span className="text-sm font-medium text-gray-900">{formatPercentage(data.growthRate)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
