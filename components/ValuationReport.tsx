'use client'

import React, { useState, useEffect } from 'react'
import { DollarSign, TrendingUp, BarChart3, TrendingDown, Download } from 'lucide-react'
import { StockData, ValuationReportData } from '../src/types'
import { type Locale } from '../src/services/i18n'
import { getTranslation } from '../src/services/translations'
import toast from 'react-hot-toast'
import DCFParameterEditor from './DCFParameterEditor'
import { useAuthContext } from '../src/services/auth-context'

interface ValuationReportProps {
  stockData: StockData | null
  reportData: ValuationReportData | null
  isLoading: boolean
  locale: Locale
}

interface DCFParameters {
  revenueGrowth: { [year: string]: number }
  operatingMargin: { [year: string]: number }
  taxRate: { [year: string]: number }
  wacc: number
  terminalGrowthRate: number
  terminalMultiple: number
}

export default function ValuationReport({ stockData, reportData, isLoading, locale }: ValuationReportProps) {
  const [activeTab, setActiveTab] = useState('fundamental')
  const [isDownloading, setIsDownloading] = useState(false)
  const [dcfParameters, setDCFParameters] = useState<DCFParameters | null>(null)
  const [originalDCFParameters, setOriginalDCFParameters] = useState<DCFParameters | null>(null)
  const [isRecalculating, setIsRecalculating] = useState(false)
  const [updatedValuationData, setUpdatedValuationData] = useState<any>(null)
  
  // 使用认证上下文获取用户信息
  const { user } = useAuthContext()

  // 初始化DCF参数
  useEffect(() => {
    if (reportData && stockData) {
      // 从报告数据中提取DCF参数，如果没有则使用默认值
      const defaultParameters: DCFParameters = {
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
      }
      
      // 首先检查报告数据中是否包含consensus数据
      if ((reportData as any).consensusData) {
        console.log('✅ 使用报告中的consensus数据:', (reportData as any).consensusData)
        setOriginalDCFParameters((reportData as any).consensusData)
        setDCFParameters((reportData as any).consensusData)
      } else {
        // 尝试从报告内容中提取原始DCF参数
        const extractedParams = extractDCFParametersFromReport(reportData.valuationAnalysis)
        if (extractedParams) {
          setOriginalDCFParameters(extractedParams)
          setDCFParameters(extractedParams) // 使用提取的参数作为初始值
        } else {
          // 如果无法从报告提取，则搜索consensus数据
          searchConsensusDataForInitialization()
          setOriginalDCFParameters(defaultParameters)
          setDCFParameters(defaultParameters)
        }
      }
    }
  }, [reportData, stockData])

  // 搜索consensus数据的函数（用于初始化）
  const searchConsensusDataForInitialization = async () => {
    if (!stockData || !user?.id) {
      console.log('无法搜索consensus数据：缺少股票数据或用户ID')
      return
    }

    try {
      console.log('🔍 开始搜索consensus数据用于初始化...')
      
      const response = await fetch('/api/recalculate-dcf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.id}`
        },
        body: JSON.stringify({
          stockData,
          dcfParameters: {
            revenueGrowth: { "2025": 0.25, "2026": 0.20, "2027": 0.15 },
            operatingMargin: { "2025": 0.02, "2026": 0.05, "2027": 0.08 },
            taxRate: { "2025": 0.25, "2026": 0.25, "2027": 0.25 },
            wacc: 0.095,
            terminalGrowthRate: 0.03,
            terminalMultiple: 15.0
          },
          locale
        })
      })

      if (response.ok) {
        const result = await response.json()
        if (result.consensusData) {
          console.log('✅ 获取到consensus数据:', result.consensusData)
          setOriginalDCFParameters(result.consensusData)
        }
      } else {
        console.log('⚠️ 无法获取consensus数据，使用默认值')
      }
    } catch (error) {
      console.error('❌ 搜索consensus数据失败:', error)
    }
  }

  // 从报告内容中提取DCF参数的函数
  const extractDCFParametersFromReport = (valuationAnalysis: string): DCFParameters | null => {
    try {
      // 创建临时DOM元素来解析HTML
      const parser = new DOMParser()
      const doc = parser.parseFromString(valuationAnalysis, 'text/html')
      
      // 提取DCF参数的逻辑
      const extractedParams: Partial<DCFParameters> = {}
      
      // 查找包含DCF参数的表格
      const tables = doc.querySelectorAll('table')
      
      for (const table of tables) {
        const rows = table.querySelectorAll('tr')
        
        for (const row of rows) {
          const cells = row.querySelectorAll('td, th')
          if (cells.length >= 2) {
            const label = cells[0].textContent?.toLowerCase() || ''
            const value = cells[1].textContent || ''
            
            // 提取WACC
            if (label.includes('wacc') || label.includes('加权平均资本成本')) {
              const waccMatch = value.match(/(\d+\.?\d*)/)
              if (waccMatch) {
                extractedParams.wacc = parseFloat(waccMatch[1]) / 100
              }
            }
            
            // 提取长期增长率
            if (label.includes('长期增长率') || label.includes('terminal growth') || label.includes('永续增长率')) {
              const growthMatch = value.match(/(\d+\.?\d*)/)
              if (growthMatch) {
                extractedParams.terminalGrowthRate = parseFloat(growthMatch[1]) / 100
              }
            }
            
            // 提取终端倍数
            if (label.includes('终端倍数') || label.includes('terminal multiple')) {
              const multipleMatch = value.match(/(\d+\.?\d*)/)
              if (multipleMatch) {
                extractedParams.terminalMultiple = parseFloat(multipleMatch[1])
              }
            }
          }
        }
      }
      
      // 查找包含年份数据的表格
      for (const table of tables) {
        const rows = Array.from(table.querySelectorAll('tr'))
        
        // 查找表头行，确定年份列
        let headerRow = null
        let yearColumns: { [key: string]: number } = {}
        
        for (let i = 0; i < rows.length; i++) {
          const cells = rows[i].querySelectorAll('td, th')
          const cellTexts = Array.from(cells).map(cell => cell.textContent?.trim() || '')
          
          // 检查是否包含年份
          const yearIndices = cellTexts.map((text, index) => {
            const yearMatch = text.match(/20(2[5-9]|3[0-9])/)
            return yearMatch ? index : -1
          }).filter(index => index !== -1)
          
          if (yearIndices.length > 0) {
            headerRow = i
            yearIndices.forEach(index => {
              const year = cellTexts[index].match(/20(2[5-9]|3[0-9])/)?.[0]
              if (year) {
                yearColumns[year] = index
              }
            })
            break
          }
        }
        
        if (headerRow !== null && Object.keys(yearColumns).length > 0) {
          // 提取各年份数据
          for (let i = headerRow + 1; i < rows.length; i++) {
            const cells = rows[i].querySelectorAll('td, th')
            const cellTexts = Array.from(cells).map(cell => cell.textContent?.trim() || '')
            
            // 检查第一列是否包含参数名称
            const firstCell = cellTexts[0]?.toLowerCase() || ''
            
            if (firstCell.includes('营业收入增长率') || firstCell.includes('revenue growth')) {
              if (!extractedParams.revenueGrowth) extractedParams.revenueGrowth = {}
              Object.entries(yearColumns).forEach(([year, colIndex]) => {
                const value = cellTexts[colIndex]
                const percentMatch = value.match(/(\d+\.?\d*)/)
                if (percentMatch) {
                  extractedParams.revenueGrowth![year] = parseFloat(percentMatch[1]) / 100
                }
              })
            }
            
            if (firstCell.includes('营业利润率') || firstCell.includes('operating margin')) {
              if (!extractedParams.operatingMargin) extractedParams.operatingMargin = {}
              Object.entries(yearColumns).forEach(([year, colIndex]) => {
                const value = cellTexts[colIndex]
                const percentMatch = value.match(/(\d+\.?\d*)/)
                if (percentMatch) {
                  extractedParams.operatingMargin![year] = parseFloat(percentMatch[1]) / 100
                }
              })
            }
            
            if (firstCell.includes('税率') || firstCell.includes('tax rate')) {
              if (!extractedParams.taxRate) extractedParams.taxRate = {}
              Object.entries(yearColumns).forEach(([year, colIndex]) => {
                const value = cellTexts[colIndex]
                const percentMatch = value.match(/(\d+\.?\d*)/)
                if (percentMatch) {
                  extractedParams.taxRate![year] = parseFloat(percentMatch[1]) / 100
                }
              })
            }
          }
        }
      }
      
      // 如果提取到了任何参数，返回提取的参数，否则返回null
      if (Object.keys(extractedParams).length > 0) {
        // 确保所有必需的字段都有默认值
        const result: DCFParameters = {
          revenueGrowth: extractedParams.revenueGrowth || { "2025": 0.25, "2026": 0.20, "2027": 0.15 },
          operatingMargin: extractedParams.operatingMargin || { "2025": 0.02, "2026": 0.05, "2027": 0.08 },
          taxRate: extractedParams.taxRate || { "2025": 0.25, "2026": 0.25, "2027": 0.25 },
          wacc: extractedParams.wacc || 0.095,
          terminalGrowthRate: extractedParams.terminalGrowthRate || 0.03,
          terminalMultiple: extractedParams.terminalMultiple || 15.0
        }
        
        console.log('提取到的DCF参数:', result)
        return result
      }
      
      return null
    } catch (error) {
      console.error('提取DCF参数失败:', error)
      return null
    }
  }

  // DCF参数变化处理
  const handleDCFParametersChange = (parameters: DCFParameters) => {
    setDCFParameters(parameters)
  }

  // DCF重新计算
  const handleDCFRecalculate = async (parameters: DCFParameters) => {
    if (!stockData || !user?.id) {
      toast.error(locale === 'zh' ? '请先登录' : 'Please login first')
      return
    }

    setIsRecalculating(true)
    try {
      console.log('开始DCF重新计算...', { stockData, parameters, locale, userId: user.id })
      
      const response = await fetch('/api/recalculate-dcf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.id}`
        },
        body: JSON.stringify({
          stockData,
          dcfParameters: parameters,
          locale
        })
      })

      console.log('API响应状态:', response.status, response.statusText)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API错误响应:', errorText)
        throw new Error(`DCF重新计算失败: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()
      console.log('DCF重新计算结果:', result)
      setUpdatedValuationData(result.dcfResults)
      
      // 更新consensus数据
      if (result.consensusData) {
        console.log('更新consensus数据:', result.consensusData)
        setOriginalDCFParameters(result.consensusData)
      }
      
      toast.success(locale === 'zh' ? 'DCF估值已更新' : 'DCF valuation updated')
    } catch (error) {
      console.error('DCF重新计算失败:', error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      toast.error(locale === 'zh' ? `DCF重新计算失败: ${errorMessage}` : `DCF recalculation failed: ${errorMessage}`)
    } finally {
      setIsRecalculating(false)
    }
  }

  const formatNumber = (num: number, withCurrency = true) => {
    const prefix = withCurrency ? '$' : ''
    if (num >= 1e9) return `${prefix}${(num / 1e9).toFixed(2)}B`
    if (num >= 1e6) return `${prefix}${(num / 1e6).toFixed(2)}M`
    if (num >= 1e3) return `${prefix}${(num / 1e3).toFixed(2)}K`
    return `${prefix}${num.toFixed(2)}`
  }

  const formatAmount = (num: number) => {
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`
    return num.toLocaleString()
  }

  const handleDownloadPDF = async () => {
    if (!reportData || !stockData) return

    setIsDownloading(true)
    try {
      const response = await fetch('/api/download-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reportData,
          stockName: stockData.name,
          stockSymbol: stockData.symbol,
          locale: locale
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate report')
      }

      // Get the HTML content
      const htmlContent = await response.text()
      
      // Create a new window with the HTML content
      const printWindow = window.open('', '_blank')
      if (!printWindow) {
        throw new Error('Unable to open print window. Please allow popups.')
      }
      
      printWindow.document.write(htmlContent)
      printWindow.document.close()
      
      // Wait for content to load, then trigger print
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print()
          // Close the window after printing (optional)
          // printWindow.close()
        }, 500)
      }
      
      // Show success message
      toast.success('报告已准备打印，请使用浏览器的打印功能保存为PDF')
    } catch (error) {
      console.error('Download error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Download failed'
      toast.error(errorMessage)
    } finally {
      setIsDownloading(false)
    }
  }

  if (!stockData) return null

  return (
    <div className="bg-white rounded-lg shadow-md p-3 sm:p-6 relative">
      {/* Watermark - 移到右上角避免与内容重叠 */}
      <div className="absolute top-4 right-4 z-10 bg-white/95 px-3 py-1 rounded shadow-sm border border-gray-200">
        <a 
          href="https://superanalyst.pro" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 text-xs font-medium"
        >
          Click superanalyst.pro for more professional research
        </a>
      </div>
      
      {/* Stock Information Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 space-y-3 sm:space-y-0 pt-8">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
            {stockData.name} ({stockData.symbol})
          </h2>
          <p className="text-sm text-gray-600">{getTranslation(locale, 'stockInformation')}</p>
        </div>
        {reportData && (
          <button
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="w-full sm:w-auto flex items-center justify-center sm:justify-start space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>{isDownloading ? getTranslation(locale, 'generatingPDF') : getTranslation(locale, 'downloadPDF')}</span>
          </button>
        )}
      </div>

      {/* Stock Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <DollarSign className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-gray-600">{getTranslation(locale, 'price')}</span>
          </div>
          <p className="text-lg font-semibold text-gray-900">
            ${stockData.price.toFixed(2)}
          </p>
          <p className={`text-sm ${stockData.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {stockData.change >= 0 ? '+' : ''}{stockData.change.toFixed(2)} ({stockData.changePercent.toFixed(2)}%)
          </p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-600">{getTranslation(locale, 'marketCap')}</span>
          </div>
          <p className="text-lg font-semibold text-gray-900">
            {formatNumber(stockData.marketCap)}
          </p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <BarChart3 className="h-4 w-4 text-amber-500" />
            <span className="text-sm font-medium text-gray-600">{getTranslation(locale, 'peRatio')}</span>
          </div>
          <p className="text-lg font-semibold text-gray-900">
            {Number(stockData.peRatio).toFixed(2)}
          </p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingDown className="h-4 w-4 text-orange-600" />
            <span className="text-sm font-medium text-gray-600">{getTranslation(locale, 'tradingVolume')}</span>
          </div>
          <p className="text-lg font-semibold text-gray-900">
            {formatAmount(stockData.amount)}
          </p>
        </div>
      </div>

      {/* Report Content */}
      {reportData && (
        <div className="space-y-6">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'fundamental', label: getTranslation(locale, 'fundamentalAnalysis') },
                { id: 'segments', label: getTranslation(locale, 'businessSegments') },
                { id: 'catalysts', label: getTranslation(locale, 'growthCatalysts') },
                { id: 'valuation', label: getTranslation(locale, 'valuationAnalysis') }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="min-h-[400px]">
            {activeTab === 'fundamental' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-2">{getTranslation(locale, 'fundamentalAnalysis')}</h3>
                <div className="prose max-w-none report-content">
                  <div dangerouslySetInnerHTML={{ __html: reportData.fundamentalAnalysis }} />
                </div>
              </div>
            )}

            {activeTab === 'segments' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-2">{getTranslation(locale, 'businessSegments')}</h3>
                <div className="prose max-w-none report-content">
                  <div dangerouslySetInnerHTML={{ __html: reportData.businessSegments }} />
                </div>
              </div>
            )}

            {activeTab === 'catalysts' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-2">{getTranslation(locale, 'growthCatalysts')}</h3>
                <div className="prose max-w-none report-content">
                  <div dangerouslySetInnerHTML={{ __html: reportData.growthCatalysts }} />
                </div>
              </div>
            )}

            {activeTab === 'valuation' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-2">{getTranslation(locale, 'valuationAnalysis')}</h3>
                
                {/* 原始估值分析内容 - 确保DCF表格正常显示 */}
                <div className="prose max-w-none report-content">
                  <div dangerouslySetInnerHTML={{ __html: reportData.valuationAnalysis }} />
                </div>

                {/* DCF参数调整区域 - 放在原始内容之后 */}
                <div className="mt-8 border-t border-gray-200 pt-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">
                    {locale === 'zh' ? 'DCF参数调整' : 'DCF Parameter Adjustment'}
                  </h4>
                  
                  {/* DCF参数编辑器 */}
                  {dcfParameters && (
                    <DCFParameterEditor
                      initialParameters={dcfParameters}
                      originalParameters={originalDCFParameters || undefined}
                      onParametersChange={handleDCFParametersChange}
                      onRecalculate={handleDCFRecalculate}
                      isRecalculating={isRecalculating}
                      locale={locale}
                    />
                  )}

                  {/* 更新后的估值数据 */}
                  {updatedValuationData && (
                    <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h5 className="text-lg font-semibold text-blue-800 mb-3">
                        {locale === 'zh' ? '更新后的DCF估值结果' : 'Updated DCF Valuation Results'}
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="bg-white p-3 rounded border">
                          <div className="text-sm text-gray-600">
                            {locale === 'zh' ? 'DCF估值' : 'DCF Value'}
                          </div>
                          <div className="text-xl font-bold text-green-600">
                            ${updatedValuationData.dcfValue?.toFixed(2) || 'N/A'}
                          </div>
                        </div>
                        <div className="bg-white p-3 rounded border">
                          <div className="text-sm text-gray-600">
                            {locale === 'zh' ? '目标价格' : 'Target Price'}
                          </div>
                          <div className="text-xl font-bold text-blue-600">
                            ${updatedValuationData.targetPrice?.toFixed(2) || 'N/A'}
                          </div>
                        </div>
                        <div className="bg-white p-3 rounded border">
                          <div className="text-sm text-gray-600">
                            {locale === 'zh' ? '基准情景' : 'Base Scenario'}
                          </div>
                          <div className="text-xl font-bold text-gray-600">
                            ${updatedValuationData.dcfScenarios?.base?.toFixed(2) || 'N/A'}
                          </div>
                        </div>
                      </div>
                      <div className="prose max-w-none report-content">
                        <div dangerouslySetInnerHTML={{ __html: updatedValuationData.reasoning || '' }} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {isLoading && (
        <div className="text-center py-8">
          <div className="inline-flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            <span className="text-gray-600">{getTranslation(locale, 'loading')}</span>
          </div>
        </div>
      )}
    </div>
  )
} 