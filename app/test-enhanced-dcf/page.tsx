'use client'

import React, { useState } from 'react'
import EnhancedDCFForm from '../../components/EnhancedDCFForm'

export default function TestEnhancedDCF() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleCalculate = async (params: any) => {
    setLoading(true)
    try {
      console.log('测试DCF计算:', params)
      
      const response = await fetch('/api/enhanced-dcf-valuation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ticker: '300080',
          ...params
        })
      })

      if (!response.ok) {
        throw new Error('Failed to calculate DCF')
      }

      const data = await response.json()
      console.log('DCF计算结果:', data)

      if (data.success) {
        setResult(data.data)
      } else {
        throw new Error(data.error || 'Failed to calculate DCF')
      }
    } catch (error) {
      console.error('DCF计算失败:', error)
      alert(`DCF计算失败: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Enhanced DCF Test</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 参数表单 */}
          <div>
            <EnhancedDCFForm
              onParametersChange={() => {}}
              onCalculate={handleCalculate}
              locale="en"
              initialData={{
                operatingCashFlow: 77199422.68,
                capex: 0,
                freeCashFlow: 77199422.68
              }}
            />
          </div>

          {/* 结果显示 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">DCF Calculation Result</h2>
            
            {loading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Calculating...</p>
              </div>
            )}

            {result && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Symbol</p>
                    <p className="font-semibold">{result.symbol}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Company</p>
                    <p className="font-semibold">{result.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Current Price</p>
                    <p className="font-semibold">¥{result.currentPrice.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Fair Value</p>
                    <p className="font-semibold text-blue-600">¥{result.dcfCalculation.valuation.valuePerShare.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Buy Under Price</p>
                    <p className="font-semibold text-green-600">¥{result.dcfCalculation.valuation.buyUnderPrice.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Margin of Safety</p>
                    <p className="font-semibold">{result.dcfCalculation.valuation.marginOfSafetyPercent.toFixed(2)}%</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-2">Cash Flow Projection</h3>
                  <div className="space-y-2">
                    {result.dcfCalculation.projectedCashFlows.year.map((year: number, index: number) => (
                      <div key={year} className="flex justify-between text-sm">
                        <span>Year {year}</span>
                        <span>¥{result.dcfCalculation.projectedCashFlows.freeCashFlow[index].toFixed(2)}M</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-2">Terminal Value</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Final Year FCF:</span>
                      <span>¥{result.dcfCalculation.terminalValue.finalYearFCF.toFixed(2)}M</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Terminal Value:</span>
                      <span>¥{result.dcfCalculation.terminalValue.terminalValue.toFixed(2)}M</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Discounted Terminal Value:</span>
                      <span>¥{result.dcfCalculation.terminalValue.discountedTerminalValue.toFixed(2)}M</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

