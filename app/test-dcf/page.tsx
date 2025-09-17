'use client'

import React, { useState } from 'react'
import DCFParameterEditor from '../../components/DCFParameterEditor'

interface DCFParameters {
  revenueGrowth: { [year: string]: number }
  operatingMargin: { [year: string]: number }
  taxRate: { [year: string]: number }
  wacc: number
  terminalGrowthRate: number
  terminalMultiple: number
}

export default function TestDCFPage() {
  const [dcfParameters, setDcfParameters] = useState<DCFParameters>({
    revenueGrowth: {
      "2025": 0.25,
      "2026": 0.20,
      "2027": 0.15,
      "2028": 0.10,
      "2029": 0.05
    },
    operatingMargin: {
      "2025": 0.02,
      "2026": 0.05,
      "2027": 0.08,
      "2028": 0.08,
      "2029": 0.08
    },
    taxRate: {
      "2025": 0.25,
      "2026": 0.25,
      "2027": 0.25,
      "2028": 0.25,
      "2029": 0.25
    },
    wacc: 0.095,
    terminalGrowthRate: 0.03,
    terminalMultiple: 15.0
  })

  const [isRecalculating, setIsRecalculating] = useState(false)

  const handleParametersChange = (parameters: DCFParameters) => {
    setDcfParameters(parameters)
    console.log('DCF参数已更新:', parameters)
  }

  const handleRecalculate = async (parameters: DCFParameters) => {
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
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          DCF参数编辑器测试页面
        </h1>
        
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">当前DCF参数</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(dcfParameters, null, 2)}
            </pre>
          </div>

          <DCFParameterEditor
            initialParameters={dcfParameters}
            onParametersChange={handleParametersChange}
            onRecalculate={handleRecalculate}
            isRecalculating={isRecalculating}
            locale="zh"
          />
        </div>
      </div>
    </div>
  )
}
