'use client'

import React, { useState } from 'react'
import DCFParameterEditorV2 from '../../components/DCFParameterEditorV2'

// 新的DCF参数接口
interface DCFParametersV2 {
  incomeSource: 'FreeCashFlow' | 'OwnerEarnings' | 'EPS' | 'DividendsPaid' | 'DividendsAndBuybacks'
  dcfStartValue: number
  growthRate: number
  reverseGrowth?: number
  discountRate: number
  terminalRate: number
  marginOfSafety: number
}

export default function TestDCFV2Page() {
  const [dcfParameters, setDcfParameters] = useState<DCFParametersV2>({
    incomeSource: 'FreeCashFlow',
    dcfStartValue: -22680000000, // -22.68B
    growthRate: 0.10, // 10%
    reverseGrowth: undefined,
    discountRate: 0.075, // 7.5%
    terminalRate: 0.02, // 2%
    marginOfSafety: 0.25 // 25%
  })

  const [isRecalculating, setIsRecalculating] = useState(false)

  const handleParametersChange = (parameters: DCFParametersV2) => {
    setDcfParameters(parameters)
    console.log('DCF参数已更新:', parameters)
  }

  const handleRecalculate = async (parameters: DCFParametersV2) => {
    setIsRecalculating(true)
    console.log('开始重新计算DCF:', parameters)
    
    // 模拟API调用
    setTimeout(() => {
      console.log('DCF重新计算完成')
      setIsRecalculating(false)
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          DCF参数编辑器V2测试页面
        </h1>
        
        <div className="space-y-6">
          {/* 当前参数显示 */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">当前DCF参数</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-600">收入来源:</span>
                <span className="ml-2 text-gray-900">{dcfParameters.incomeSource}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">DCF起始值:</span>
                <span className="ml-2 text-gray-900">
                  {dcfParameters.dcfStartValue >= 1000000000 
                    ? `${(dcfParameters.dcfStartValue / 1000000000).toFixed(2)}B`
                    : dcfParameters.dcfStartValue >= 1000000
                    ? `${(dcfParameters.dcfStartValue / 1000000).toFixed(2)}M`
                    : dcfParameters.dcfStartValue.toFixed(2)
                  }
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-600">增长率:</span>
                <span className="ml-2 text-gray-900">{(dcfParameters.growthRate * 100).toFixed(1)}%</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">折现率:</span>
                <span className="ml-2 text-gray-900">{(dcfParameters.discountRate * 100).toFixed(1)}%</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">终端增长率:</span>
                <span className="ml-2 text-gray-900">{(dcfParameters.terminalRate * 100).toFixed(1)}%</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">安全边际:</span>
                <span className="ml-2 text-gray-900">{(dcfParameters.marginOfSafety * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>

          {/* DCF参数编辑器V2 */}
          <DCFParameterEditorV2
            initialParameters={dcfParameters}
            onParametersChange={handleParametersChange}
            onRecalculate={handleRecalculate}
            isRecalculating={isRecalculating}
            locale="zh"
          />

          {/* 原始JSON数据 */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">原始JSON数据</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(dcfParameters, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}


