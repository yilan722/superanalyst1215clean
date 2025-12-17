'use client'

import React, { useState, useEffect } from 'react'

interface DCFParameters {
  // 营业收入增长率 (各年份)
  revenueGrowth: {
    [year: string]: number
  }
  // 营业利润率 (各年份)
  operatingMargin: {
    [year: string]: number
  }
  // 税率 (各年份)
  taxRate: {
    [year: string]: number
  }
  // WACC (加权平均资本成本)
  wacc: number
  // 长期增长率 (永续增长率)
  terminalGrowthRate: number
  // 终端倍数
  terminalMultiple: number
}

interface DCFParameterEditorProps {
  initialParameters: DCFParameters
  originalParameters?: DCFParameters  // 原始报告中的DCF参数
  onParametersChange: (parameters: DCFParameters) => void
  onRecalculate: (parameters: DCFParameters) => void
  isRecalculating: boolean
  locale?: string
}

export default function DCFParameterEditor({
  initialParameters,
  originalParameters,
  onParametersChange,
  onRecalculate,
  isRecalculating,
  locale = 'zh'
}: DCFParameterEditorProps) {
  const [parameters, setParameters] = useState<DCFParameters>(initialParameters)
  const [isExpanded, setIsExpanded] = useState(false)

  const isChinese = locale === 'zh'

  // 更新参数
  const updateParameter = (path: string, value: number) => {
    const newParameters = { ...parameters }
    const keys = path.split('.')
    
    if (keys.length === 1) {
      // 顶级参数
      newParameters[keys[0] as keyof DCFParameters] = value as any
    } else if (keys.length === 2) {
      // 嵌套参数 (如 revenueGrowth.2025)
      const [parentKey, childKey] = keys
      if (parentKey in newParameters) {
        const parent = newParameters[parentKey as keyof DCFParameters] as any
        if (typeof parent === 'object' && parent !== null) {
          parent[childKey] = value
        }
      }
    }
    
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

  // 渲染年份输入组
  const renderYearInputs = (
    title: string,
    path: string,
    data: { [year: string]: number },
    unit: string = '%',
    step: number = 0.01
  ) => {
    const years = Object.keys(data).sort()
    
    return (
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">{title}</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {years.map(year => (
            <div key={year} className="space-y-1">
              <label className="text-xs text-gray-600">{year}</label>
              <div className="relative">
                <input
                  type="number"
                  value={data[year] * 100}
                  onChange={(e) => updateParameter(`${path}.${year}`, parseFloat(e.target.value) / 100)}
                  step={step * 100}
                  min="0"
                  max="100"
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
                  {unit}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* 头部 */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">
            {isChinese ? 'DCF参数调整' : 'DCF Parameter Adjustment'}
          </h3>
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

         {/* 原始参数对比表格 */}
         {originalParameters && (
           <div className="p-4 border-b border-gray-200">
             <div className="flex justify-between items-center mb-3">
               <h4 className="text-sm font-semibold text-gray-700">
                 {isChinese ? '原始DCF参数对比' : 'Original DCF Parameters Comparison'}
               </h4>
               {(originalParameters as any).dataSources && (
                 <div className="text-xs text-gray-500">
                   {isChinese ? '数据来源' : 'Data Sources'}: 
                   {(originalParameters as any).dataSources.map((source: any, index: number) => (
                     <span key={index}>
                       {index > 0 && ', '}
                       <a 
                         href={source.sources[0]} 
                         target="_blank" 
                         rel="noopener noreferrer"
                         className="text-blue-600 hover:text-blue-800 underline"
                       >
                         {source.parameter}
                       </a>
                     </span>
                   ))}
                 </div>
               )}
             </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-3 py-2 text-left font-medium text-gray-600">
                    {isChinese ? '参数' : 'Parameter'}
                  </th>
                  <th className="px-3 py-2 text-center font-medium text-gray-600">
                    {isChinese ? '原始值 (Consensus)' : 'Original (Consensus)'}
                  </th>
                  <th className="px-3 py-2 text-center font-medium text-gray-600">
                    {isChinese ? '当前调整值' : 'Current Adjustment'}
                  </th>
                  <th className="px-3 py-2 text-center font-medium text-gray-600">
                    {isChinese ? '变化' : 'Change'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {/* WACC */}
                <tr>
                  <td className="px-3 py-2 font-medium text-gray-700">WACC</td>
                  <td className="px-3 py-2 text-center text-gray-600">
                    {originalParameters.wacc ? (originalParameters.wacc * 100).toFixed(2) : 'N/A'}%
                  </td>
                  <td className="px-3 py-2 text-center text-blue-600">
                    {parameters.wacc ? (parameters.wacc * 100).toFixed(2) : 'N/A'}%
                  </td>
                  <td className={`px-3 py-2 text-center ${
                    originalParameters.wacc && parameters.wacc ? (
                      parameters.wacc > originalParameters.wacc ? 'text-red-600' : 
                      parameters.wacc < originalParameters.wacc ? 'text-green-600' : 'text-gray-600'
                    ) : 'text-gray-600'
                  }`}>
                    {originalParameters.wacc && parameters.wacc ? (
                      <>
                        {parameters.wacc > originalParameters.wacc ? '+' : ''}
                        {((parameters.wacc - originalParameters.wacc) * 100).toFixed(2)}%
                      </>
                    ) : 'N/A'}
                  </td>
                </tr>
                
                {/* 长期增长率 */}
                <tr>
                  <td className="px-3 py-2 font-medium text-gray-700">
                    {isChinese ? '长期增长率' : 'Terminal Growth Rate'}
                  </td>
                  <td className="px-3 py-2 text-center text-gray-600">
                    {originalParameters.terminalGrowthRate ? (originalParameters.terminalGrowthRate * 100).toFixed(2) : 'N/A'}%
                  </td>
                  <td className="px-3 py-2 text-center text-blue-600">
                    {parameters.terminalGrowthRate ? (parameters.terminalGrowthRate * 100).toFixed(2) : 'N/A'}%
                  </td>
                  <td className={`px-3 py-2 text-center ${
                    originalParameters.terminalGrowthRate && parameters.terminalGrowthRate ? (
                      parameters.terminalGrowthRate > originalParameters.terminalGrowthRate ? 'text-red-600' : 
                      parameters.terminalGrowthRate < originalParameters.terminalGrowthRate ? 'text-green-600' : 'text-gray-600'
                    ) : 'text-gray-600'
                  }`}>
                    {originalParameters.terminalGrowthRate && parameters.terminalGrowthRate ? (
                      <>
                        {parameters.terminalGrowthRate > originalParameters.terminalGrowthRate ? '+' : ''}
                        {((parameters.terminalGrowthRate - originalParameters.terminalGrowthRate) * 100).toFixed(2)}%
                      </>
                    ) : 'N/A'}
                  </td>
                </tr>
                
                {/* 终端倍数 */}
                <tr>
                  <td className="px-3 py-2 font-medium text-gray-700">
                    {isChinese ? '终端倍数' : 'Terminal Multiple'}
                  </td>
                  <td className="px-3 py-2 text-center text-gray-600">
                    {originalParameters.terminalMultiple ? originalParameters.terminalMultiple.toFixed(1) : 'N/A'}x
                  </td>
                  <td className="px-3 py-2 text-center text-blue-600">
                    {parameters.terminalMultiple ? parameters.terminalMultiple.toFixed(1) : 'N/A'}x
                  </td>
                  <td className={`px-3 py-2 text-center ${
                    originalParameters.terminalMultiple && parameters.terminalMultiple ? (
                      parameters.terminalMultiple > originalParameters.terminalMultiple ? 'text-red-600' : 
                      parameters.terminalMultiple < originalParameters.terminalMultiple ? 'text-green-600' : 'text-gray-600'
                    ) : 'text-gray-600'
                  }`}>
                    {originalParameters.terminalMultiple && parameters.terminalMultiple ? (
                      <>
                        {parameters.terminalMultiple > originalParameters.terminalMultiple ? '+' : ''}
                        {(parameters.terminalMultiple - originalParameters.terminalMultiple).toFixed(1)}x
                      </>
                    ) : 'N/A'}
                  </td>
                </tr>
                
                {/* 各年份增长率对比 */}
                {Object.keys(parameters.revenueGrowth).map(year => (
                  <tr key={year}>
                    <td className="px-3 py-2 font-medium text-gray-700">
                      {isChinese ? `${year}年增长率` : `${year} Growth Rate`}
                    </td>
                    <td className="px-3 py-2 text-center text-gray-600">
                      {originalParameters.revenueGrowth[year] ? (originalParameters.revenueGrowth[year] * 100).toFixed(2) : 'N/A'}%
                    </td>
                    <td className="px-3 py-2 text-center text-blue-600">
                      {parameters.revenueGrowth[year] ? (parameters.revenueGrowth[year] * 100).toFixed(2) : 'N/A'}%
                    </td>
                    <td className={`px-3 py-2 text-center ${
                      originalParameters.revenueGrowth[year] ? (
                        parameters.revenueGrowth[year] > originalParameters.revenueGrowth[year] ? 'text-red-600' : 
                        parameters.revenueGrowth[year] < originalParameters.revenueGrowth[year] ? 'text-green-600' : 'text-gray-600'
                      ) : 'text-gray-600'
                    }`}>
                      {originalParameters.revenueGrowth[year] ? (
                        <>
                          {parameters.revenueGrowth[year] > originalParameters.revenueGrowth[year] ? '+' : ''}
                          {((parameters.revenueGrowth[year] - originalParameters.revenueGrowth[year]) * 100).toFixed(2)}%
                        </>
                      ) : 'N/A'}
                    </td>
                  </tr>
                ))}
                
                {/* 各年份营业利润率对比 */}
                {Object.keys(parameters.operatingMargin).map(year => (
                  <tr key={`margin-${year}`}>
                    <td className="px-3 py-2 font-medium text-gray-700">
                      {isChinese ? `${year}年营业利润率` : `${year} Operating Margin`}
                    </td>
                    <td className="px-3 py-2 text-center text-gray-600">
                      {originalParameters.operatingMargin[year] ? (originalParameters.operatingMargin[year] * 100).toFixed(2) : 'N/A'}%
                    </td>
                    <td className="px-3 py-2 text-center text-blue-600">
                      {parameters.operatingMargin[year] ? (parameters.operatingMargin[year] * 100).toFixed(2) : 'N/A'}%
                    </td>
                    <td className={`px-3 py-2 text-center ${
                      originalParameters.operatingMargin[year] ? (
                        parameters.operatingMargin[year] > originalParameters.operatingMargin[year] ? 'text-green-600' : 
                        parameters.operatingMargin[year] < originalParameters.operatingMargin[year] ? 'text-red-600' : 'text-gray-600'
                      ) : 'text-gray-600'
                    }`}>
                      {originalParameters.operatingMargin[year] ? (
                        <>
                          {parameters.operatingMargin[year] > originalParameters.operatingMargin[year] ? '+' : ''}
                          {((parameters.operatingMargin[year] - originalParameters.operatingMargin[year]) * 100).toFixed(2)}%
                        </>
                      ) : 'N/A'}
                    </td>
                  </tr>
                ))}
                
                {/* 各年份税率对比 */}
                {Object.keys(parameters.taxRate).map(year => (
                  <tr key={`tax-${year}`}>
                    <td className="px-3 py-2 font-medium text-gray-700">
                      {isChinese ? `${year}年税率` : `${year} Tax Rate`}
                    </td>
                    <td className="px-3 py-2 text-center text-gray-600">
                      {originalParameters.taxRate[year] ? (originalParameters.taxRate[year] * 100).toFixed(2) : 'N/A'}%
                    </td>
                    <td className="px-3 py-2 text-center text-blue-600">
                      {parameters.taxRate[year] ? (parameters.taxRate[year] * 100).toFixed(2) : 'N/A'}%
                    </td>
                    <td className={`px-3 py-2 text-center ${
                      originalParameters.taxRate[year] ? (
                        parameters.taxRate[year] > originalParameters.taxRate[year] ? 'text-red-600' : 
                        parameters.taxRate[year] < originalParameters.taxRate[year] ? 'text-green-600' : 'text-gray-600'
                      ) : 'text-gray-600'
                    }`}>
                      {originalParameters.taxRate[year] ? (
                        <>
                          {parameters.taxRate[year] > originalParameters.taxRate[year] ? '+' : ''}
                          {((parameters.taxRate[year] - originalParameters.taxRate[year]) * 100).toFixed(2)}%
                        </>
                      ) : 'N/A'}
                    </td>
                  </tr>
                ))}
               </tbody>
             </table>
           </div>
           
           {/* 数据来源详细信息 */}
           {(originalParameters as any).dataSources && (
             <div className="mt-4 p-3 bg-gray-50 rounded-lg">
               <h5 className="text-xs font-semibold text-gray-600 mb-2">
                 {isChinese ? '详细数据来源' : 'Detailed Data Sources'}
               </h5>
               <div className="space-y-1">
                 {(originalParameters as any).dataSources.map((source: any, index: number) => (
                   <div key={index} className="text-xs text-gray-600">
                     <span className="font-medium">{source.parameter}:</span>
                     {source.sources.map((url: string, urlIndex: number) => (
                       <span key={urlIndex}>
                         {urlIndex > 0 && ', '}
                         <a 
                           href={url} 
                           target="_blank" 
                           rel="noopener noreferrer"
                           className="text-blue-600 hover:text-blue-800 underline ml-1"
                         >
                           {url}
                         </a>
                       </span>
                     ))}
                   </div>
                 ))}
                 {(originalParameters as any).lastUpdated && (
                   <div className="text-xs text-gray-500 mt-2">
                     {isChinese ? '最后更新' : 'Last Updated'}: {(originalParameters as any).lastUpdated}
                   </div>
                 )}
                 {(originalParameters as any).summary && (
                   <div className="text-xs text-gray-500 mt-1">
                     {(originalParameters as any).summary}
                   </div>
                 )}
               </div>
             </div>
           )}
         </div>
         )}

      {/* 参数编辑区域 */}
      {isExpanded && (
        <div className="p-4 space-y-6">
          {/* 营业收入增长率 */}
          {renderYearInputs(
            isChinese ? '营业收入增长率' : 'Revenue Growth Rate',
            'revenueGrowth',
            parameters.revenueGrowth,
            '%',
            0.01
          )}

          {/* 营业利润率 */}
          {renderYearInputs(
            isChinese ? '营业利润率' : 'Operating Margin',
            'operatingMargin',
            parameters.operatingMargin,
            '%',
            0.01
          )}

          {/* 税率 */}
          {renderYearInputs(
            isChinese ? '税率' : 'Tax Rate',
            'taxRate',
            parameters.taxRate,
            '%',
            0.01
          )}

          {/* WACC */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">
              {isChinese ? 'WACC (加权平均资本成本)' : 'WACC (Weighted Average Cost of Capital)'}
            </h4>
            <div className="w-32">
              <div className="relative">
                <input
                  type="number"
                  value={parameters.wacc * 100}
                  onChange={(e) => updateParameter('wacc', parseFloat(e.target.value) / 100)}
                  step="0.1"
                  min="0"
                  max="50"
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
                  %
                </span>
              </div>
            </div>
          </div>

          {/* 长期增长率 */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">
              {isChinese ? '长期增长率 (永续增长率)' : 'Terminal Growth Rate'}
            </h4>
            <div className="w-32">
              <div className="relative">
                <input
                  type="number"
                  value={parameters.terminalGrowthRate * 100}
                  onChange={(e) => updateParameter('terminalGrowthRate', parseFloat(e.target.value) / 100)}
                  step="0.1"
                  min="0"
                  max="10"
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
                  %
                </span>
              </div>
            </div>
          </div>

          {/* 终端倍数 */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">
              {isChinese ? '终端倍数' : 'Terminal Multiple'}
            </h4>
            <div className="w-32">
              <div className="relative">
                <input
                  type="number"
                  value={parameters.terminalMultiple}
                  onChange={(e) => updateParameter('terminalMultiple', parseFloat(e.target.value))}
                  step="0.1"
                  min="1"
                  max="50"
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex space-x-3 pt-4 border-t border-gray-200">
            <button
              onClick={handleRecalculate}
              disabled={isRecalculating}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isRecalculating 
                ? (isChinese ? '重新计算中...' : 'Recalculating...')
                : (isChinese ? '更新DCF估值' : 'Update DCF Valuation')
              }
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              {isChinese ? '重置' : 'Reset'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
