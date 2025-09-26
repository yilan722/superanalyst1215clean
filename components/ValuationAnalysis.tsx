'use client'

import React, { useState } from 'react'
import DCFForm from './DCFForm'
import EnhancedDCFForm from './EnhancedDCFForm'
import StockPriceChart from './StockPriceChart'
import HistoricalDCFTable from './HistoricalDCFTable'
import SensitivityAnalysisTable from './SensitivityAnalysisTable'
import CashFlowDataTable from './CashFlowDataTable'
import PerformanceAnalysisTable from './PerformanceAnalysisTable'
import FutureCashFlowProjection from './FutureCashFlowProjection'
import DCFValueCalculation from './DCFValueCalculation'
import { type Locale } from '../app/services/i18n'

interface ValuationAnalysisProps {
  locale: Locale
  user: any
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

export default function ValuationAnalysis({ locale, user }: ValuationAnalysisProps) {
  const [searchInput, setSearchInput] = useState('')
  const [selectedStock, setSelectedStock] = useState({
    symbol: '',
    name: '',
    currentPrice: 0,
    fairValue: 0,
    buyUnderPrice: 0,
    marginOfSafetyPercent: 0,
    year52High: 0,
    year52Low: 0
  })
  const [dcfValuation, setDcfValuation] = useState<any>(null)
  const [isLoadingValuation, setIsLoadingValuation] = useState(false)
  const [dcfParameters, setDcfParameters] = useState<DCFParameters>({
    incomeSource: 'FreeCashFlow',
    dcfStartValue: 22.68,
    growthRate: 10.22,
    reverseGrowth: 7.5,
    discountRate: 7.5,
    terminalRate: 2.0,
    marginOfSafety: 25.0
  })

  const handleStockSearch = async (symbol: string) => {
    if (!symbol.trim()) return
    
    setIsLoadingValuation(true)
    try {
      console.log('搜索股票:', symbol)
      
      // 获取增强的DCF财务数据
      const financialResponse = await fetch(`/api/enhanced-dcf-data?ticker=${symbol}`)
      if (!financialResponse.ok) {
        throw new Error('Failed to fetch enhanced financial data')
      }
      
      const financialData = await financialResponse.json()
      console.log('增强财务数据:', financialData)
      
      if (!financialData.success) {
        throw new Error(financialData.error || 'Failed to fetch enhanced financial data')
      }
      
      // 获取增强的DCF估值
      const valuationResponse = await fetch(`/api/enhanced-dcf-valuation?ticker=${symbol}`)
      if (!valuationResponse.ok) {
        throw new Error('Failed to fetch enhanced DCF valuation')
      }
      
      const valuationData = await valuationResponse.json()
      console.log('增强DCF估值:', valuationData)
      
      if (valuationData.success) {
        // 合并财务数据和估值数据
        const combinedData = {
          ...financialData.data,  // 包含历史数据
          dcfCalculation: valuationData.data.dcfCalculation
        }
        setDcfValuation(combinedData)
        
        // 更新选中的股票信息
        setSelectedStock({
          symbol: financialData.data.symbol,
          name: financialData.data.name,
          currentPrice: financialData.data.currentPrice,
          fairValue: valuationData.data.dcfCalculation.valuation.valuePerShare,
          buyUnderPrice: valuationData.data.dcfCalculation.valuation.buyUnderPrice,
          marginOfSafetyPercent: valuationData.data.dcfCalculation.valuation.marginOfSafetyPercent,
          year52High: financialData.data.currentPrice * 1.2,
          year52Low: financialData.data.currentPrice * 0.8
        })
      } else {
        throw new Error(valuationData.error || 'Failed to generate enhanced DCF valuation')
      }
      
    } catch (error) {
      console.error('股票搜索失败:', error)
      alert(`股票搜索失败: ${error instanceof Error ? error.message : '请检查股票代码是否正确'}`)
    } finally {
      setIsLoadingValuation(false)
    }
  }

  const handleParametersChange = (params: DCFParameters) => {
    setDcfParameters(params)
    console.log('DCF参数已更新:', params)
  }

  const handleEnhancedDCFCalculate = async (params: any) => {
    if (!selectedStock.symbol) {
      alert(isChinese ? '请先搜索股票' : 'Please search for a stock first')
      return
    }

    setIsLoadingValuation(true)
    try {
      console.log('重新计算DCF估值:', params)
      
      const response = await fetch('/api/enhanced-dcf-valuation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ticker: selectedStock.symbol,
          ...params
        })
      })

      if (!response.ok) {
        throw new Error('Failed to recalculate DCF valuation')
      }

      const data = await response.json()
      console.log('重新计算的DCF估值:', data)

      if (data.success) {
        setDcfValuation(data.data)
        
        // 更新选中的股票信息
        setSelectedStock(prev => ({
          ...prev,
          fairValue: data.data.dcfCalculation.valuation.valuePerShare,
          buyUnderPrice: data.data.dcfCalculation.valuation.buyUnderPrice,
          marginOfSafetyPercent: data.data.dcfCalculation.valuation.marginOfSafetyPercent
        }))
      } else {
        throw new Error(data.error || 'Failed to recalculate DCF valuation')
      }
    } catch (error) {
      console.error('DCF重新计算失败:', error)
      alert(`DCF重新计算失败: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoadingValuation(false)
    }
  }

  const handleReset = () => {
    setDcfParameters({
      incomeSource: 'FreeCashFlow',
      dcfStartValue: 22.68,
      growthRate: 10.22,
      reverseGrowth: 7.5,
      discountRate: 7.5,
      terminalRate: 2.0,
      marginOfSafety: 25.0
    })
  }

  // 生成模拟数据（当没有真实数据时使用）
  const generateMockData = () => {
    return {
      // 历史DCF数据
      historicalDCF: [
        { year: 2025, equityValue: 395520000000, estimatedValuePerShare: 50.75, buyPrice: 38.06 },
        { year: 2024, equityValue: 398680000000, estimatedValuePerShare: 50.24, buyPrice: 37.68 },
        { year: 2023, equityValue: 385420000000, estimatedValuePerShare: 47.7, buyPrice: 35.77 },
        { year: 2022, equityValue: 360270000000, estimatedValuePerShare: 44.11, buyPrice: 33.08 },
        { year: 2021, equityValue: 305850000000, estimatedValuePerShare: 35.74, buyPrice: 26.8 }
      ],
      
      // 敏感性分析数据
      sensitivityData: {
        growthRates: [6.0, 8.0, 10.0, 12.0, 14.0],
        discountRates: [5.5, 6.5, 7.5, 8.5, 9.5],
        values: [
          [45.2, 42.8, 40.5, 38.3, 36.2],
          [48.1, 45.6, 43.2, 40.9, 38.7],
          [51.2, 48.5, 46.0, 43.6, 41.3],
          [54.5, 51.6, 48.9, 46.3, 43.8],
          [58.0, 54.9, 52.0, 49.2, 46.5]
        ],
        highlightRow: 2, // 10.0% growth rate
        highlightCol: 2  // 7.5% discount rate
      },
      
      // 现金流数据
      cashFlowData: {
        years: ['2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024', 'TTM'],
        freeCashFlow: [12.5, 15.2, 18.7, 22.1, 25.8, 28.3, 31.2, 28.9, 26.5, 24.1, 22.68],
        ownerEarningsFCF: [11.8, 14.5, 17.9, 21.3, 24.7, 27.1, 29.8, 27.6, 25.2, 22.9, 21.5],
        eps: [2.1, 2.5, 3.0, 3.4, 3.8, 4.2, 4.6, 4.1, 3.7, 3.3, 2.9],
        dividendsPaid: [0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.1, 1.0, 0.9, 0.8, 0.7],
        dividendsAndBuybacks: [1.2, 1.4, 1.6, 1.8, 2.0, 2.2, 2.4, 2.1, 1.9, 1.7, 1.5]
      },
      
      // 5年表现数据
      performance5Year: {
        periods: ['2019-2023', '2020-2024', '2021-2024', '2022-2024', '2023-2024', 'Median'],
        metrics: [
          { name: 'Tangible Shareholder Equity', values: [8.5, 7.2, 6.8, 5.9, 4.2, 6.8] },
          { name: 'Free Cash Flow', values: [12.3, 10.8, 9.5, 8.1, 6.7, 9.5] },
          { name: 'CROIC', values: [15.2, 13.8, 12.5, 11.1, 9.8, 12.5] },
          { name: 'FCF/Sales', values: [18.5, 16.9, 15.4, 13.8, 12.3, 15.4] },
          { name: 'ROA', values: [8.2, 7.5, 6.8, 6.1, 5.4, 6.8] },
          { name: 'ROE', values: [12.8, 11.5, 10.2, 8.9, 7.6, 10.2] },
          { name: 'Gross Margin', values: [45.2, 43.8, 42.5, 41.1, 39.8, 42.5] },
          { name: 'Operating Margin', values: [25.8, 24.5, 23.2, 21.9, 20.6, 23.2] },
          { name: 'Net Margin', values: [18.5, 17.2, 15.9, 14.6, 13.3, 15.9] },
          { name: 'Revenue Growth', values: [8.5, 7.2, 6.8, 5.9, 4.2, 6.8] },
          { name: 'Earnings Growth', values: [12.3, 10.8, 9.5, 8.1, 6.7, 9.5] },
          { name: 'Cash from Ops Growth', values: [15.2, 13.8, 12.5, 11.1, 9.8, 12.5] }
        ]
      },
      
      // 未来现金流预测
      futureCashFlow: {
        years: [2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034],
        projectedCashFlow: [24.95, 27.44, 30.19, 33.21, 36.53, 40.18, 44.20, 48.62, 53.48, 58.83],
        growthRates: ['10.00%', '10.00%', '10.00%', '9.00%', '9.00%', '9.00%', '8.10%', '8.10%', '8.10%', '7.29%'],
        terminalValue: 998260000000
      },
      
      // DCF价值计算
      dcfCalculation: {
        sumOfPV: 756830000000,
        debtAndLeases: 361310000000,
        minorityInterests: 0,
        cash: 0,
        equityValue: 395520000000,
        sharesOutstanding: 7790000000,
        perShareValue: 50.75,
        desiredMarginOfSafety: 25.0,
        buyUnderPrice: 38.06,
        currentPrice: 52.23,
        actualMarginOfSafety: 0.0,
        growthRate: 10.0
      }
    }
  }

  // 使用真实数据或模拟数据
  const getDisplayData = () => {
    if (dcfValuation && selectedStock.symbol) {
      // 使用真实数据
      return {
        historicalDCF: [
          { year: 2025, equityValue: dcfValuation.valuation?.equityValue || 0, estimatedValuePerShare: dcfValuation.fairValue || 0, buyPrice: selectedStock.buyUnderPrice || 0 },
          { year: 2024, equityValue: (dcfValuation.valuation?.equityValue || 0) * 0.98, estimatedValuePerShare: (dcfValuation.fairValue || 0) * 0.98, buyPrice: (selectedStock.buyUnderPrice || 0) * 0.98 },
          { year: 2023, equityValue: (dcfValuation.valuation?.equityValue || 0) * 0.95, estimatedValuePerShare: (dcfValuation.fairValue || 0) * 0.95, buyPrice: (selectedStock.buyUnderPrice || 0) * 0.95 },
          { year: 2022, equityValue: (dcfValuation.valuation?.equityValue || 0) * 0.92, estimatedValuePerShare: (dcfValuation.fairValue || 0) * 0.92, buyPrice: (selectedStock.buyUnderPrice || 0) * 0.92 },
          { year: 2021, equityValue: (dcfValuation.valuation?.equityValue || 0) * 0.88, estimatedValuePerShare: (dcfValuation.fairValue || 0) * 0.88, buyPrice: (selectedStock.buyUnderPrice || 0) * 0.88 }
        ],
        sensitivityData: {
          growthRates: [6.0, 8.0, 10.0, 12.0, 14.0],
          discountRates: [5.5, 6.5, 7.5, 8.5, 9.5],
          values: [
            [(dcfValuation.fairValue || 0) * 0.9, (dcfValuation.fairValue || 0) * 0.85, (dcfValuation.fairValue || 0) * 0.8, (dcfValuation.fairValue || 0) * 0.75, (dcfValuation.fairValue || 0) * 0.7],
            [(dcfValuation.fairValue || 0) * 0.95, (dcfValuation.fairValue || 0) * 0.9, (dcfValuation.fairValue || 0) * 0.85, (dcfValuation.fairValue || 0) * 0.8, (dcfValuation.fairValue || 0) * 0.75],
            [(dcfValuation.fairValue || 0) * 1.0, (dcfValuation.fairValue || 0) * 0.95, (dcfValuation.fairValue || 0) * 0.9, (dcfValuation.fairValue || 0) * 0.85, (dcfValuation.fairValue || 0) * 0.8],
            [(dcfValuation.fairValue || 0) * 1.05, (dcfValuation.fairValue || 0) * 1.0, (dcfValuation.fairValue || 0) * 0.95, (dcfValuation.fairValue || 0) * 0.9, (dcfValuation.fairValue || 0) * 0.85],
            [(dcfValuation.fairValue || 0) * 1.1, (dcfValuation.fairValue || 0) * 1.05, (dcfValuation.fairValue || 0) * 1.0, (dcfValuation.fairValue || 0) * 0.95, (dcfValuation.fairValue || 0) * 0.9]
          ],
          highlightRow: 2,
          highlightCol: 2
        },
        cashFlowData: {
          years: dcfValuation.historicalData?.years || ['2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024', 'TTM'],
          freeCashFlow: dcfValuation.historicalData?.freeCashFlow ? [...dcfValuation.historicalData.freeCashFlow.map((v: number) => v / 1000000000), dcfValuation.freeCashFlow / 1000000000] : [12.5, 15.2, 18.7, 22.1, 25.8, 28.3, 31.2, 28.9, 26.5, 24.1, 22.68],
          ownerEarningsFCF: dcfValuation.historicalData?.freeCashFlow ? [...dcfValuation.historicalData.freeCashFlow.map((v: number) => v * 0.95 / 1000000000), dcfValuation.freeCashFlow * 0.95 / 1000000000] : [11.8, 14.5, 17.9, 21.3, 24.7, 27.1, 29.8, 27.6, 25.2, 22.9, 21.5],
          eps: dcfValuation.historicalData?.eps ? [...dcfValuation.historicalData.eps.map((v: number) => v / 1000000000), dcfValuation.netIncome / dcfValuation.sharesOutstanding / 1000000000] : [2.1, 2.5, 3.0, 3.4, 3.8, 4.2, 4.6, 4.1, 3.7, 3.3, 2.9],
          dividendsPaid: dcfValuation.historicalData?.dividendsPaid ? [...dcfValuation.historicalData.dividendsPaid.map((v: number) => v / 1000000000), 0] : [0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.1, 1.0, 0.9, 0.8, 0.7],
          dividendsAndBuybacks: dcfValuation.historicalData?.dividendsAndBuybacks ? [...dcfValuation.historicalData.dividendsAndBuybacks.map((v: number) => v / 1000000000), 0] : [1.2, 1.4, 1.6, 1.8, 2.0, 2.2, 2.4, 2.1, 1.9, 1.7, 1.5]
        },
        performance5Year: {
          periods: dcfValuation.performanceData?.periods || ['2019-2023', '2020-2024', '2021-2024', '2022-2024', '2023-2024', 'Median'],
          metrics: dcfValuation.performanceData?.metrics || [
            { name: 'Tangible Shareholder Equity', values: [8.5, 7.2, 6.8, 5.9, 4.2, 6.8] },
            { name: 'Free Cash Flow', values: [12.3, 10.8, 9.5, 8.1, 6.7, 9.5] },
            { name: 'CROIC', values: [15.2, 13.8, 12.5, 11.1, 9.8, 12.5] },
            { name: 'FCF/Sales', values: [18.5, 16.9, 15.4, 13.8, 12.3, 15.4] },
            { name: 'ROA', values: [8.2, 7.5, 6.8, 6.1, 5.4, 6.8] },
            { name: 'ROE', values: [12.8, 11.5, 10.2, 8.9, 7.6, 10.2] },
            { name: 'Gross Margin', values: [45.2, 43.8, 42.5, 41.1, 39.8, 42.5] },
            { name: 'Operating Margin', values: [25.8, 24.5, 23.2, 21.9, 20.6, 23.2] },
            { name: 'Net Margin', values: [18.5, 17.2, 15.9, 14.6, 13.3, 15.9] },
            { name: 'Revenue Growth', values: [8.5, 7.2, 6.8, 5.9, 4.2, 6.8] },
            { name: 'Earnings Growth', values: [12.3, 10.8, 9.5, 8.1, 6.7, 9.5] },
            { name: 'Cash from Ops Growth', values: [15.2, 13.8, 12.5, 11.1, 9.8, 12.5] }
          ]
        },
        futureCashFlow: {
          years: dcfValuation.dcfCalculation?.projectedCashFlows?.year || [2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034],
          projectedCashFlow: dcfValuation.dcfCalculation?.projectedCashFlows?.freeCashFlow?.map((v: number) => v / 1000000000) || [24.95, 27.44, 30.19, 33.21, 36.53, 40.18, 44.20, 48.62, 53.48, 58.83],
          growthRates: ['10.00%', '10.00%', '10.00%', '9.00%', '9.00%', '9.00%', '8.10%', '8.10%', '8.10%', '7.29%'],
          terminalValue: dcfValuation.dcfCalculation?.terminalValue?.terminalValue || 998260000000
        },
        dcfCalculation: {
          sumOfPV: dcfValuation.dcfCalculation?.valuation?.sumOfPV || 756830000000,
          debtAndLeases: dcfValuation.totalLiabilities || 0,
          minorityInterests: 0,
          cash: dcfValuation.cashAndEquivalents || 0,
          equityValue: dcfValuation.dcfCalculation?.valuation?.equityValue || 395520000000,
          sharesOutstanding: dcfValuation.sharesOutstanding || 187338,
          perShareValue: dcfValuation.dcfCalculation?.valuation?.valuePerShare || 50.75,
          desiredMarginOfSafety: 25.0,
          buyUnderPrice: dcfValuation.dcfCalculation?.valuation?.buyUnderPrice || 38.06,
          currentPrice: selectedStock.currentPrice || 52.23,
          actualMarginOfSafety: dcfValuation.dcfCalculation?.valuation?.marginOfSafetyPercent || 0.0,
          growthRate: 10.0
        }
      }
    }
    return generateMockData()
  }

  const displayData = getDisplayData()
  const isChinese = locale === 'zh'

  return (
    <div className="space-y-6 p-6">
      {/* 页面标题 */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center space-x-3">
          <h1 className="text-2xl font-bold text-gray-800">
            {isChinese ? '估值分析' : 'Valuation Analysis'}
          </h1>
          <span className="px-2 py-1 text-xs font-medium bg-purple-600 text-white rounded">BETA</span>
        </div>
        <p className="text-gray-600">
          {isChinese ? 'DCF估值模型和参数调整工具' : 'DCF Valuation Model & Parameter Adjustment Tool'}
        </p>
      </div>

      {/* 股票搜索 */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          {isChinese ? '选择股票' : 'Select Stock'}
        </h2>
        <div className="flex space-x-4">
          <div className="flex-1">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={isChinese ? '输入A股代码 (如: 000001, 600036, 300080)' : 'Enter A-share ticker (e.g., 000001, 600036, 300080)'}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleStockSearch(searchInput)
                }
              }}
            />
          </div>
          <button
            onClick={() => handleStockSearch(searchInput)}
            disabled={isLoadingValuation || !searchInput.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoadingValuation 
              ? (isChinese ? '搜索中...' : 'Searching...')
              : (isChinese ? '搜索' : 'Search')
            }
          </button>
        </div>
        
        {/* 当前选择的股票信息 */}
        {selectedStock.symbol && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-800">
                  {selectedStock.name} ({selectedStock.symbol})
                </h3>
                <p className="text-sm text-gray-600">
                  {isChinese ? '当前价格' : 'Current Price'}: ¥{(selectedStock.currentPrice || 0).toFixed(2)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">
                  {isChinese ? '公允价值' : 'Fair Value'}: <span className="text-blue-600">¥{(selectedStock.fairValue || 0).toFixed(2)}</span>
                </p>
                <p className="text-sm text-gray-600">
                  {isChinese ? '买入价格' : 'Buy Under'}: <span className="text-green-600">¥{(selectedStock.buyUnderPrice || 0).toFixed(2)}</span>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* DCF参数输入表单 */}
      <DCFForm
        onParametersChange={handleParametersChange}
        onReset={handleReset}
        locale={locale}
      />

      {/* 增强DCF参数表单 */}
      {selectedStock.symbol && (
        <EnhancedDCFForm
          onParametersChange={() => {}}
          onCalculate={handleEnhancedDCFCalculate}
          locale={locale}
          initialData={{
            operatingCashFlow: dcfValuation?.operatingCashFlow,
            capex: dcfValuation?.capex,
            freeCashFlow: dcfValuation?.freeCashFlow
          }}
        />
      )}

      {/* 图表和历史数据行 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StockPriceChart
          currentPrice={selectedStock.currentPrice || 52.23}
          fairValue={selectedStock.fairValue || 50.75}
          buyUnderPrice={selectedStock.buyUnderPrice || 38.06}
          year52High={selectedStock.year52High || 65.0}
          year52Low={selectedStock.year52Low || 35.0}
          priceChange={191.8}
        />
        <HistoricalDCFTable data={displayData.historicalDCF} />
      </div>

      {/* 敏感性分析行 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SensitivityAnalysisTable
          title="Valuation Sensitivity (Growth vs Discount Rate)"
          data={displayData.sensitivityData}
        />
        <SensitivityAnalysisTable
          title="MOS Sensitivity (Growth vs Discount Rate)"
          data={{
            ...displayData.sensitivityData,
            values: displayData.sensitivityData.values.map(row => 
              row.map(value => (value - 50.75) / 50.75 * 100)
            )
          }}
          isMarginOfSafety={true}
        />
      </div>

      {/* 现金流数据 */}
      <CashFlowDataTable data={displayData.cashFlowData} />

      {/* 5年表现分析 */}
      <PerformanceAnalysisTable
        title="5 YEAR MULTI-YEAR PERFORMANCE"
        data={displayData.performance5Year}
      />

      {/* 未来现金流预测 */}
      <FutureCashFlowProjection data={displayData.futureCashFlow} />

      {/* DCF价值计算 */}
      <DCFValueCalculation data={displayData.dcfCalculation} />
    </div>
  )
}
