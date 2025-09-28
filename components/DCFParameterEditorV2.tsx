'use client'

import React, { useState, useEffect } from 'react'

// 收入来源类型
type IncomeSource = 'FreeCashFlow' | 'OwnerEarnings' | 'EPS' | 'DividendsPaid' | 'DividendsAndBuybacks'

interface DCFParametersV2 {
  // 收入来源
  incomeSource: IncomeSource
  // DCF起始值 (单位: 百万美元)
  dcfStartValue: number
  // 增长率
  growthRate: number
  // 反向增长率 (可选)
  reverseGrowth?: number
  // 折现率
  discountRate: number
  // 终端增长率
  terminalRate: number
  // 安全边际
  marginOfSafety: number
}

interface DCFParameterEditorV2Props {
  initialParameters: DCFParametersV2
  onParametersChange: (parameters: DCFParametersV2) => void
  onRecalculate: (parameters: DCFParametersV2) => void
  isRecalculating: boolean
  locale?: string
}

// 收入来源选项配置
const incomeSourceOptions = [
  {
    value: 'FreeCashFlow' as IncomeSource,
    label: 'Free Cash Flow',
    description: 'Select FCF for companies with steady or projectable FCF. E.g., JNJ, IBM'
  },
  {
    value: 'OwnerEarnings' as IncomeSource,
    label: 'Owner Earnings',
    description: 'Select Owner Earnings for companies with high working capital. e.g. AMZN, WMT'
  },
  {
    value: 'EPS' as IncomeSource,
    label: 'EPS (Net Income)',
    description: 'Select EPS (Net Income) for companies with high growth or unstable FCF and owner earnings. e.g.YELP, XOM.'
  },
  {
    value: 'DividendsPaid' as IncomeSource,
    label: 'Dividends Paid',
    description: 'Use Dividends Paid or Dividends & Buybacks to run a Dividend Discount Model valuation for financials.'
  },
  {
    value: 'DividendsAndBuybacks' as IncomeSource,
    label: 'Dividends & Buybacks',
    description: 'Use Dividends Paid or Dividends & Buybacks to run a Dividend Discount Model valuation for financials.'
  }
]

export default function DCFParameterEditorV2({
  initialParameters,
  onParametersChange,
  onRecalculate,
  isRecalculating,
  locale = 'zh'
}: DCFParameterEditorV2Props) {
  const [parameters, setParameters] = useState<DCFParametersV2>(initialParameters)
  const [showTooltip, setShowTooltip] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)

  const isChinese = locale === 'zh'

  // 更新参数
  const updateParameter = (key: keyof DCFParametersV2, value: any) => {
    const newParameters = { ...parameters, [key]: value }
    setParameters(newParameters)
    onParametersChange(newParameters)
  }

  // 重新计算
  const handleRecalculate = () => {
    onRecalculate(parameters)
  }

  // 重置参数
  const handleReset = () => {
    setParameters(initialParameters)
    onParametersChange(initialParameters)
  }

  // 格式化数值显示
  const formatValue = (value: number, type: 'currency' | 'percentage' | 'number' = 'number') => {
    if (type === 'currency') {
      if (Math.abs(value) >= 1000000000) {
        return `${(value / 1000000000).toFixed(2)}B`
      } else if (Math.abs(value) >= 1000000) {
        return `${(value / 1000000).toFixed(2)}M`
      } else if (Math.abs(value) >= 1000) {
        return `${(value / 1000).toFixed(2)}K`
      }
      return value.toFixed(2)
    } else if (type === 'percentage') {
      return `${(value * 100).toFixed(1)}%`
    }
    return value.toFixed(2)
  }

  // 解析输入值
  const parseValue = (input: string, type: 'currency' | 'percentage' | 'number' = 'number') => {
    if (type === 'currency') {
      const cleanInput = input.replace(/[BMK]/gi, '').trim()
      const num = parseFloat(cleanInput)
      if (input.toLowerCase().includes('b')) return num * 1000000000
      if (input.toLowerCase().includes('m')) return num * 1000000
      if (input.toLowerCase().includes('k')) return num * 1000
      return num
    } else if (type === 'percentage') {
      return parseFloat(input.replace('%', '')) / 100
    }
    return parseFloat(input)
  }

  // 渲染工具提示
  const renderTooltip = (content: string, position: 'top' | 'bottom' = 'top') => (
    <div className={`absolute z-10 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg whitespace-normal max-w-xs ${
      position === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
    } left-1/2 transform -translate-x-1/2`}>
      {content}
      <div className={`absolute left-1/2 transform -translate-x-1/2 ${
        position === 'top' ? 'top-full' : 'bottom-full'
      } w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900`}></div>
    </div>
  )

  // 渲染输入字段
  const renderInputField = (
    label: string,
    value: number,
    onChange: (value: number) => void,
    type: 'currency' | 'percentage' | 'number' = 'number',
    placeholder?: string,
    tooltip?: string,
    disabled?: boolean
  ) => (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {tooltip && (
          <button
            type="button"
            className="ml-1 text-gray-400 hover:text-gray-600"
            onMouseEnter={() => setShowTooltip(tooltip)}
            onMouseLeave={() => setShowTooltip(null)}
          >
            ?
          </button>
        )}
      </label>
      <div className="relative">
        <input
          type="text"
          value={formatValue(value, type)}
          onChange={(e) => {
            try {
              const newValue = parseValue(e.target.value, type)
              if (!isNaN(newValue)) {
                onChange(newValue)
              }
            } catch (error) {
              // 忽略无效输入
            }
          }}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            disabled ? 'bg-gray-100 cursor-not-allowed' : ''
          }`}
        />
        {type === 'percentage' && (
          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
            %
          </span>
        )}
      </div>
      {showTooltip === tooltip && tooltip && renderTooltip(tooltip)}
    </div>
  )

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* 头部 */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">
            {isChinese ? 'DCF参数调整' : 'UPDATE DCF & REVERSE DCF INPUTS'}
          </h3>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleReset}
              className="text-sm text-gray-600 hover:text-gray-800 flex items-center space-x-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
              <span>{isChinese ? '重置所有输入' : 'reset all inputs'}</span>
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              {isExpanded 
                ? (isChinese ? '收起' : 'Collapse') 
                : (isChinese ? '展开' : 'Expand')
              }
            </button>
          </div>
        </div>
      </div>

      {/* 参数输入区域 */}
      {isExpanded && (
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 左侧：参数输入 */}
            <div className="space-y-6">
              {/* 收入来源选择 */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isChinese ? '选择DCF' : 'Select DCF'}
                  <button
                    type="button"
                    className="ml-1 text-gray-400 hover:text-gray-600"
                    onMouseEnter={() => setShowTooltip('选择最适合的收入来源进行DCF计算')}
                    onMouseLeave={() => setShowTooltip(null)}
                  >
                    ?
                  </button>
                </label>
                <select
                  value={parameters.incomeSource}
                  onChange={(e) => updateParameter('incomeSource', e.target.value as IncomeSource)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {incomeSourceOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {showTooltip === '选择最适合的收入来源进行DCF计算' && renderTooltip(
                  incomeSourceOptions.find(opt => opt.value === parameters.incomeSource)?.description || ''
                )}
              </div>

              {/* 第一行参数 */}
              <div className="grid grid-cols-2 gap-4">
                {renderInputField(
                  isChinese ? 'DCF起始值' : 'DCF Start Value',
                  parameters.dcfStartValue,
                  (value) => updateParameter('dcfStartValue', value),
                  'currency',
                  '-22.68B',
                  'DCF计算的起始现金流值'
                )}
                {renderInputField(
                  isChinese ? '增长率' : 'Growth Rate',
                  parameters.growthRate,
                  (value) => updateParameter('growthRate', value),
                  'percentage',
                  '10%',
                  '预期年增长率'
                )}
              </div>

              {/* 第二行参数 */}
              <div className="grid grid-cols-2 gap-4">
                {renderInputField(
                  isChinese ? '反向增长率' : 'Reverse Growth',
                  parameters.reverseGrowth || 0,
                  (value) => updateParameter('reverseGrowth', value),
                  'percentage',
                  'N/A',
                  '反向增长率（可选）',
                  true
                )}
                {renderInputField(
                  isChinese ? '折现率' : 'Discount Rate',
                  parameters.discountRate,
                  (value) => updateParameter('discountRate', value),
                  'percentage',
                  '7.5%',
                  '用于折现未来现金流的折现率'
                )}
              </div>

              {/* 第三行参数 */}
              <div className="grid grid-cols-2 gap-4">
                {renderInputField(
                  isChinese ? '终端增长率' : 'Terminal Rate',
                  parameters.terminalRate,
                  (value) => updateParameter('terminalRate', value),
                  'percentage',
                  '2%',
                  '永续增长率'
                )}
                {renderInputField(
                  isChinese ? '安全边际' : 'Margin of Safety',
                  parameters.marginOfSafety,
                  (value) => updateParameter('marginOfSafety', value),
                  'percentage',
                  '25%',
                  '安全边际百分比'
                )}
              </div>
            </div>

            {/* 右侧：安全边际可视化 */}
            <div className="flex flex-col items-center justify-center">
              <div className="relative w-48 h-48 mb-4">
                {/* 安全边际圆形图表 */}
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  {/* 背景圆 */}
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                  />
                  {/* 进度圆 */}
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke={parameters.marginOfSafety > 0 ? "#10b981" : "#ef4444"}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 45 * parameters.marginOfSafety} ${2 * Math.PI * 45}`}
                    className="transition-all duration-300"
                  />
                </svg>
                {/* 中心文字 */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-2xl font-bold text-gray-800">
                    {formatValue(parameters.marginOfSafety, 'percentage')}
                  </div>
                  <div className="text-sm text-gray-600">
                    {isChinese ? '安全边际' : 'Margin of Safety'}
                  </div>
                </div>
              </div>
              
              {/* 当前价格和公允价值显示 */}
              <div className="text-center space-y-2">
                <div className="text-sm text-gray-600">
                  {isChinese ? '当前价格' : 'Current Price'}
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  $52.23
                </div>
                <div className="text-sm text-gray-600">
                  {isChinese ? '公允价值' : 'Fair Value'}
                </div>
                <div className="text-2xl font-bold text-red-600">
                  $-143.47
                </div>
              </div>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={handleReset}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              {isChinese ? '重置' : 'Reset'}
            </button>
            <button
              onClick={handleRecalculate}
              disabled={isRecalculating}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isRecalculating 
                ? (isChinese ? '重新计算中...' : 'Recalculating...')
                : (isChinese ? '更新DCF估值' : 'Update DCF Valuation')
              }
            </button>
          </div>
        </div>
      )}
    </div>
  )
}


