'use client'

import React, { useState, useEffect } from 'react'

interface EnhancedDCFParameters {
  dcfStartValue: number
  growthRate: number
  discountRate: number
  terminalRate: number
  marginOfSafety: number
  projectionYears: number
}

interface EnhancedDCFFormProps {
  onParametersChange: (params: EnhancedDCFParameters) => void
  onCalculate: (params: EnhancedDCFParameters) => void
  locale: string
  className?: string
  initialData?: {
    operatingCashFlow?: number
    capex?: number
    freeCashFlow?: number
  }
}

export default function EnhancedDCFForm({
  onParametersChange,
  onCalculate,
  locale,
  className = '',
  initialData
}: EnhancedDCFFormProps) {
  const isChinese = locale === 'zh'
  
  const [parameters, setParameters] = useState<EnhancedDCFParameters>({
    dcfStartValue: initialData?.freeCashFlow || 0,
    growthRate: 0.10,
    discountRate: 0.10,
    terminalRate: 0.03,
    marginOfSafety: 0.25,
    projectionYears: 5
  })

  const [isCalculating, setIsCalculating] = useState(false)

  // 当初始数据变化时更新DCF起始值
  useEffect(() => {
    if (initialData?.freeCashFlow && initialData.freeCashFlow !== 0) {
      setParameters(prev => ({
        ...prev,
        dcfStartValue: initialData.freeCashFlow || 0
      }))
    }
  }, [initialData])

  // 当参数变化时通知父组件
  useEffect(() => {
    onParametersChange(parameters)
  }, [parameters, onParametersChange])

  const handleInputChange = (field: keyof EnhancedDCFParameters, value: number) => {
    setParameters(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleCalculate = async () => {
    setIsCalculating(true)
    try {
      await onCalculate(parameters)
    } finally {
      setIsCalculating(false)
    }
  }

  const resetToDefaults = () => {
    setParameters({
      dcfStartValue: initialData?.freeCashFlow || 0,
      growthRate: 0.10,
      discountRate: 0.10,
      terminalRate: 0.03,
      marginOfSafety: 0.25,
      projectionYears: 5
    })
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="bg-gray-800 text-white px-6 py-4 rounded-t-lg">
        <h3 className="text-lg font-semibold">
          {isChinese ? 'DCF参数设置' : 'DCF Parameters'}
        </h3>
        <p className="text-sm text-gray-300 mt-1">
          {isChinese ? '调整参数以重新计算DCF估值' : 'Adjust parameters to recalculate DCF valuation'}
        </p>
      </div>

      {/* Form */}
      <div className="p-6 space-y-6">
        {/* DCF起始值 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {isChinese ? 'DCF起始值 (自由现金流)' : 'DCF Start Value (Free Cash Flow)'}
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">¥</span>
            <input
              type="number"
              value={parameters.dcfStartValue}
              onChange={(e) => handleInputChange('dcfStartValue', parseFloat(e.target.value) || 0)}
              className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={isChinese ? '输入自由现金流' : 'Enter free cash flow'}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {isChinese ? '经营活动产生的现金流量净额 - 资本性支出' : 'Operating Cash Flow - Capital Expenditures'}
          </p>
        </div>

        {/* 增长率 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {isChinese ? '增长率 (Growth Rate)' : 'Growth Rate'}
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.01"
              min="0"
              max="1"
              value={parameters.growthRate}
              onChange={(e) => handleInputChange('growthRate', parseFloat(e.target.value) || 0)}
              className="w-full pr-8 pl-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.10"
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {isChinese ? '未来N年自由现金流年增长率' : 'Annual growth rate for future N years'}
          </p>
        </div>

        {/* 折现率 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {isChinese ? '折现率 (WACC)' : 'Discount Rate (WACC)'}
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.01"
              min="0"
              max="1"
              value={parameters.discountRate}
              onChange={(e) => handleInputChange('discountRate', parseFloat(e.target.value) || 0)}
              className="w-full pr-8 pl-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.10"
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {isChinese ? '加权平均资本成本' : 'Weighted Average Cost of Capital'}
          </p>
        </div>

        {/* 永续增长率 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {isChinese ? '永续增长率 (Terminal Rate)' : 'Terminal Growth Rate'}
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.01"
              min="0"
              max="0.1"
              value={parameters.terminalRate}
              onChange={(e) => handleInputChange('terminalRate', parseFloat(e.target.value) || 0)}
              className="w-full pr-8 pl-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.03"
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {isChinese ? '预测期结束后的永久增长率' : 'Permanent growth rate after projection period'}
          </p>
        </div>

        {/* 安全边际 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {isChinese ? '安全边际 (Margin of Safety)' : 'Margin of Safety'}
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.01"
              min="0"
              max="1"
              value={parameters.marginOfSafety}
              onChange={(e) => handleInputChange('marginOfSafety', parseFloat(e.target.value) || 0)}
              className="w-full pr-8 pl-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.25"
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {isChinese ? '用于计算买入价的折扣' : 'Discount used to calculate buy price'}
          </p>
        </div>

        {/* 预测年数 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {isChinese ? '预测年数' : 'Projection Years'}
          </label>
          <select
            value={parameters.projectionYears}
            onChange={(e) => handleInputChange('projectionYears', parseInt(e.target.value) || 5)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={3}>3 {isChinese ? '年' : 'Years'}</option>
            <option value={5}>5 {isChinese ? '年' : 'Years'}</option>
            <option value={7}>7 {isChinese ? '年' : 'Years'}</option>
            <option value={10}>10 {isChinese ? '年' : 'Years'}</option>
          </select>
        </div>

        {/* 按钮组 */}
        <div className="flex space-x-4 pt-4">
          <button
            onClick={handleCalculate}
            disabled={isCalculating}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isCalculating 
              ? (isChinese ? '计算中...' : 'Calculating...') 
              : (isChinese ? '重新计算DCF' : 'Recalculate DCF')
            }
          </button>
          
          <button
            onClick={resetToDefaults}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            {isChinese ? '重置' : 'Reset'}
          </button>
        </div>
      </div>
    </div>
  )
}

