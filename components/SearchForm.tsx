'use client'

import { useState } from 'react'
import { Search, ArrowRight } from 'lucide-react'
import { type Locale } from '../app/services/i18n'
import { getTranslation } from '../app/services/translations'

interface SearchFormProps {
  onSearch: (symbol: string) => void
  onGenerateReport: () => void
  isLoading: boolean
  locale: Locale
  isGeneratingReport?: boolean
}

export default function SearchForm({ onSearch, onGenerateReport, isLoading, locale, isGeneratingReport }: SearchFormProps) {
  const [symbol, setSymbol] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (symbol.trim()) {
      onSearch(symbol.trim().toUpperCase())
    }
  }

  const isChinese = locale === 'zh'

  return (
    <div className="bg-gray-300 min-h-[60vh] flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 主标题 */}
          <h2 className="text-4xl font-bold text-white text-center mb-2">
            {isChinese ? '今天想研究哪家公司？' : 'Which company do you want to research today?'}
          </h2>
          
          {/* 副标题 */}
          <p className="text-gray-500 text-center text-sm mb-4">
            {isChinese ? '只需输入股票代码即可开始生成' : 'Start generating with a simple ticker input.'}
          </p>
          
          {/* 支持说明 */}
          <p className="text-yellow-500 text-center text-sm mb-6">
            {isChinese 
              ? '目前支持美股、A股和港股（例如：AAPL, 002915, 1347.HK）' 
              : 'Currently supports US stocks, A-shares and HK stocks (e.g., AAPL, 002915, 1347.HK).'}
          </p>
          
          {/* 输入框 */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              id="symbol"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              placeholder={isChinese ? '输入股票代码（例如：AAPL, 002915, 1347.HK）' : 'Input Company Ticker Here (e.g., AAPL, 002915, 1347.HK)'}
              className="w-full pl-12 pr-4 py-4 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-white placeholder-gray-400 text-lg"
              disabled={isLoading}
            />
          </div>
          
          {/* 按钮组 */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              type="submit"
              disabled={!symbol.trim() || isLoading}
              className="flex-1 bg-amber-600 hover:bg-amber-700 text-slate-900 font-semibold px-6 py-3 rounded-lg focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-colors"
            >
              <Search className="h-5 w-5" />
              <span>{isChinese ? '搜索' : 'Search'}</span>
            </button>
            
            <button
              type="button"
              onClick={onGenerateReport}
              disabled={isLoading}
              className="flex-1 sm:flex-none bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-lg focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-colors"
            >
              <span>{isChinese ? '生成报告' : 'Generate Report'}</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
          
          {/* Progress Bar for Report Generation */}
          {isGeneratingReport && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm text-amber-200 mb-2">
                <span className="font-medium">Generating Report...</span>
                <span className="text-amber-400">AI Analysis in Progress</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full animate-pulse">
                  <div className="h-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 rounded-full animate-pulse" 
                       style={{
                         width: '100%',
                         background: 'linear-gradient(90deg, #fbbf24, #f59e0b, #d97706)',
                         backgroundSize: '200% 100%',
                         animation: 'shimmer 2s ease-in-out infinite'
                       }}
                  />
                </div>
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-2">
                <span>Analyzing financial data...</span>
                <span>Processing market trends...</span>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  )
} 