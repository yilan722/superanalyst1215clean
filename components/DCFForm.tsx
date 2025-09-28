'use client'

import React, { useState } from 'react'

interface DCFFormProps {
  onParametersChange: (params: DCFParameters) => void
  onReset: () => void
  locale: 'zh' | 'en'
}

interface DCFParameters {
  incomeSource: 'FreeCashFlow' | 'OwnerEarnings' | 'EPS' | 'DividendsPaid' | 'DividendsAndBuybacks'
  dcfStartValue: number
  growthRate: number
  reverseGrowth: number
  discountRate: number
  terminalRate: number
  marginOfSafety: number
}

const incomeSourceOptions = [
  { value: 'FreeCashFlow', label: 'Free Cash Flow', description: 'Select FCF for companies with steady or projectable FCF. E.g., JNJ, IBM' },
  { value: 'OwnerEarnings', label: 'Owner Earnings', description: 'Select Owner Earnings for companies with high working capital. e.g. AMZN, WMT' },
  { value: 'EPS', label: 'EPS (Net Income)', description: 'Select EPS (Net Income) for companies with high growth or unstable FCF and owner earnings. e.g.YELP, XOM.' },
  { value: 'DividendsPaid', label: 'Dividends Paid', description: 'Use Dividends Paid or Dividends & Buybacks to run a Dividend Discount Model valuation for financials.' },
  { value: 'DividendsAndBuybacks', label: 'Dividends & Buybacks', description: 'Use Dividends Paid or Dividends & Buybacks to run a Dividend Discount Model valuation for financials.' }
]

export default function DCFForm({ onParametersChange, onReset, locale }: DCFFormProps) {
  const [parameters, setParameters] = useState<DCFParameters>({
    incomeSource: 'FreeCashFlow',
    dcfStartValue: 22.68, // 22.68B
    growthRate: 10.22,
    reverseGrowth: 7.5,
    discountRate: 7.5,
    terminalRate: 2.0,
    marginOfSafety: 25.0
  })

  const [selectedIncomeSource, setSelectedIncomeSource] = useState(incomeSourceOptions[0])

  const handleParameterChange = (field: keyof DCFParameters, value: number | string) => {
    const newParams = { ...parameters, [field]: value }
    setParameters(newParams)
    onParametersChange(newParams)
  }

  const handleIncomeSourceChange = (value: string) => {
    const option = incomeSourceOptions.find(opt => opt.value === value)
    if (option) {
      setSelectedIncomeSource(option)
      handleParameterChange('incomeSource', value as any)
    }
  }

  const isChinese = locale === 'zh'

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="bg-gray-800 text-white px-6 py-4 rounded-t-lg">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {isChinese ? '更新DCF和反向DCF输入' : 'UPDATE DCF & REVERSE DCF INPUTS'}
          </h2>
          <div className="flex items-center space-x-4">
            <button
              onClick={onReset}
              className="text-sm text-blue-300 hover:text-blue-200 underline"
            >
              {isChinese ? '重置所有输入' : 'reset all inputs'}
            </button>
            <button className="text-gray-300 hover:text-white">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Income Source Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {isChinese ? '收入来源' : 'Income Source'}
              </label>
              <div className="relative">
                <select
                  value={parameters.incomeSource}
                  onChange={(e) => handleIncomeSourceChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  {incomeSourceOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <button className="absolute right-2 top-2 text-gray-400 hover:text-gray-600">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {selectedIncomeSource.description}
              </p>
            </div>

            {/* DCF Start Value */}
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <label className="text-sm font-medium text-gray-700">
                  {isChinese ? 'DCF起始值' : 'DCF Start Value'}
                </label>
                <button className="text-gray-400 hover:text-gray-600">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              <div className="relative">
                <input
                  type="number"
                  value={parameters.dcfStartValue}
                  onChange={(e) => handleParameterChange('dcfStartValue', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  step="0.01"
                />
                <span className="absolute right-3 top-2 text-sm text-gray-500">B</span>
              </div>
            </div>

            {/* Growth Rate */}
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <label className="text-sm font-medium text-gray-700">
                  {isChinese ? '增长率' : 'Growth Rate'}
                </label>
                <button className="text-gray-400 hover:text-gray-600">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              <div className="relative">
                <input
                  type="number"
                  value={parameters.growthRate}
                  onChange={(e) => handleParameterChange('growthRate', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  step="0.01"
                />
                <span className="absolute right-3 top-2 text-sm text-gray-500">%</span>
              </div>
            </div>

            {/* Reverse Growth */}
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <label className="text-sm font-medium text-gray-700">
                  {isChinese ? '反向增长' : 'Reverse Growth'}
                </label>
                <button className="text-gray-400 hover:text-gray-600">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              <div className="relative">
                <input
                  type="number"
                  value={parameters.reverseGrowth}
                  onChange={(e) => handleParameterChange('reverseGrowth', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  step="0.01"
                />
                <span className="absolute right-3 top-2 text-sm text-gray-500">%</span>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Discount Rate */}
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <label className="text-sm font-medium text-gray-700">
                  {isChinese ? '折现率' : 'Discount Rate'}
                </label>
                <button className="text-gray-400 hover:text-gray-600">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              <div className="relative">
                <input
                  type="number"
                  value={parameters.discountRate}
                  onChange={(e) => handleParameterChange('discountRate', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  step="0.01"
                />
                <span className="absolute right-3 top-2 text-sm text-gray-500">%</span>
              </div>
            </div>

            {/* Terminal Rate */}
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <label className="text-sm font-medium text-gray-700">
                  {isChinese ? '终值增长率' : 'Terminal Rate'}
                </label>
                <button className="text-gray-400 hover:text-gray-600">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              <div className="relative">
                <input
                  type="number"
                  value={parameters.terminalRate}
                  onChange={(e) => handleParameterChange('terminalRate', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  step="0.01"
                />
                <span className="absolute right-3 top-2 text-sm text-gray-500">%</span>
              </div>
            </div>

            {/* Margin of Safety */}
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <label className="text-sm font-medium text-gray-700">
                  {isChinese ? '安全边际' : 'Margin of Safety'}
                </label>
                <button className="text-gray-400 hover:text-gray-600">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              <div className="relative">
                <input
                  type="number"
                  value={parameters.marginOfSafety}
                  onChange={(e) => handleParameterChange('marginOfSafety', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  step="0.01"
                />
                <span className="absolute right-3 top-2 text-sm text-gray-500">%</span>
              </div>
            </div>

            {/* Margin of Safety Visual */}
            <div className="flex items-center justify-center">
              <div className="w-24 h-24 relative">
                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#3b82f6"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${(parameters.marginOfSafety / 100) * 251.2} 251.2`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-semibold text-gray-700">
                    {parameters.marginOfSafety.toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
