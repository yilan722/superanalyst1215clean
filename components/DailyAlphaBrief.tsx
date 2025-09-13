'use client'

import React, { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, BarChart3, DollarSign, Users, Calendar, ExternalLink, FileText, Lock, Eye, Share2 } from 'lucide-react'
import { type Locale } from '../lib/i18n'
import { getTranslation } from '../lib/translations'
import toast from 'react-hot-toast'
import LinkedInShareTool from './LinkedInShareTool'
import ShareAnalytics from './ShareAnalytics'

interface HotStock {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  marketCap: number
  peRatio: number
  sector: string
  reason: string
  confidence: 'high' | 'medium' | 'low'
}

interface TodaysReport {
  id: string
  title: string
  company: string
  symbol: string
  date: string
  summary: string
  pdfPath: string
  isPublic: boolean
  isPublicVersion?: boolean
  message?: string
}

interface DailyAlphaBriefProps {
  locale: Locale
  user: any
}

export default function DailyAlphaBrief({ locale, user }: DailyAlphaBriefProps) {
  const [hotStocks, setHotStocks] = useState<HotStock[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedStock, setSelectedStock] = useState<HotStock | null>(null)
  const [showAnalysis, setShowAnalysis] = useState(false)
  const [todaysReport, setTodaysReport] = useState<TodaysReport | null>(null)
  const [isLoadingReport, setIsLoadingReport] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [showShareTool, setShowShareTool] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)

  // 模拟热门股票数据
  const mockHotStocks: HotStock[] = [
    {
      symbol: 'NVDA',
      name: 'NVIDIA Corporation',
      price: 875.28,
      change: 45.32,
      changePercent: 5.47,
      volume: 125000000,
      marketCap: 2150000000000,
      peRatio: 65.4,
      sector: 'Technology',
      reason: 'Strong Q4 earnings beat with AI chip demand surge',
      confidence: 'high'
    },
    {
      symbol: 'TSLA',
      name: 'Tesla, Inc.',
      price: 248.50,
      change: -12.30,
      changePercent: -4.72,
      volume: 89000000,
      marketCap: 790000000000,
      peRatio: 45.2,
      sector: 'Automotive',
      reason: 'Production concerns and delivery miss expectations',
      confidence: 'medium'
    },
    {
      symbol: 'AAPL',
      name: 'Apple Inc.',
      price: 192.53,
      change: 3.25,
      changePercent: 1.72,
      volume: 45000000,
      marketCap: 3000000000000,
      peRatio: 28.9,
      sector: 'Technology',
      reason: 'iPhone 15 Pro sales exceed expectations in China',
      confidence: 'high'
    },
    {
      symbol: 'AMD',
      name: 'Advanced Micro Devices',
      price: 142.67,
      change: 8.45,
      changePercent: 6.30,
      volume: 67000000,
      marketCap: 230000000000,
      peRatio: 38.5,
      sector: 'Technology',
      reason: 'Data center revenue growth and AI processor demand',
      confidence: 'high'
    },
    {
      symbol: 'MSFT',
      name: 'Microsoft Corporation',
      price: 415.26,
      change: 12.84,
      changePercent: 3.19,
      volume: 32000000,
      marketCap: 3100000000000,
      peRatio: 32.1,
      sector: 'Technology',
      reason: 'Azure cloud growth and AI integration progress',
      confidence: 'medium'
    }
  ]

  // 获取真实股票数据
  const fetchHotStocks = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/hot-stocks?symbols=NVDA,TSLA,AAPL,AMD,MSFT')
      const data = await response.json()
      
      if (data.success) {
        setHotStocks(data.data)
      } else {
        // 如果API失败，使用模拟数据
        setHotStocks(mockHotStocks)
        toast.error(locale === 'zh' ? '无法获取实时数据，显示模拟数据' : 'Unable to fetch real-time data, showing mock data')
      }
    } catch (error) {
      console.error('Error fetching hot stocks:', error)
      setHotStocks(mockHotStocks)
      toast.error(locale === 'zh' ? '数据获取失败，显示模拟数据' : 'Failed to fetch data, showing mock data')
    } finally {
      setIsLoading(false)
    }
  }

  // 获取今日报告
  const fetchTodaysReport = async () => {
    setIsLoadingReport(true)
    try {
      const response = await fetch('/api/todays-report')
      const data = await response.json()
      
      if (data.success) {
        setTodaysReport(data.data)
      }
    } catch (error) {
      console.error('Error fetching today\'s report:', error)
    } finally {
      setIsLoadingReport(false)
    }
  }

  useEffect(() => {
    fetchHotStocks()
    fetchTodaysReport()
  }, [])

  const handleStockClick = (stock: HotStock) => {
    setSelectedStock(stock)
    setShowAnalysis(true)
  }

  const handleTodaysReportClick = () => {
    if (todaysReport) {
      setShowReportModal(true)
    }
  }

  const handleDownloadReport = async () => {
    if (!todaysReport) return
    
    try {
      const isPublic = !user // 如果用户未登录，使用公开版本
      const response = await fetch(`/api/todays-report-pdf?id=${todaysReport.id}&public=${isPublic}`)
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${todaysReport.title}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        toast.error(locale === 'zh' ? '下载失败' : 'Download failed')
      }
    } catch (error) {
      console.error('Download error:', error)
      toast.error(locale === 'zh' ? '下载错误' : 'Download error')
    }
  }

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'text-green-400 bg-green-400/10'
      case 'medium': return 'text-yellow-400 bg-yellow-400/10'
      case 'low': return 'text-red-400 bg-red-400/10'
      default: return 'text-gray-400 bg-gray-400/10'
    }
  }

  const getConfidenceText = (confidence: string) => {
    switch (confidence) {
      case 'high': return getTranslation(locale, 'highConfidence')
      case 'medium': return getTranslation(locale, 'mediumConfidence')
      case 'low': return getTranslation(locale, 'lowConfidence')
      default: return getTranslation(locale, 'unknownConfidence')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">
              {getTranslation(locale, 'dailyAlphaBrief')}
            </h1>
            <p className="text-slate-300">
              {getTranslation(locale, 'dailyAlphaSubtitle')}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-6 text-sm text-slate-400">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>{new Date().toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US')}</span>
          </div>
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4" />
            <span>{hotStocks.length} {getTranslation(locale, 'hotStocks')}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-500">
              {locale === 'zh' ? '实时数据' : 'Real-time Data'}
            </span>
          </div>
        </div>
      </div>

      {/* Today's Must-Read Report */}
      {todaysReport && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-6 border border-amber-200 dark:border-amber-800">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {locale === 'zh' ? '今日必读报告' : 'Today\'s Must-Read'}
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {locale === 'zh' ? '每日一篇，解锁市场' : 'One report. Every day. Unlock the market'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowShareTool(!showShareTool)}
                className="flex items-center space-x-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {locale === 'zh' ? '分享' : 'Share'}
                </span>
              </button>
              <button
                onClick={() => setShowAnalytics(!showAnalytics)}
                className="flex items-center space-x-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-md hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
              >
                <BarChart3 className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {locale === 'zh' ? '统计' : 'Analytics'}
                </span>
              </button>
              {!user && (
                <div className="flex items-center space-x-1 text-amber-600 dark:text-amber-400">
                  <Lock className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {locale === 'zh' ? '注册查看完整版' : 'Register for full access'}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <div 
            onClick={handleTodaysReportClick}
            className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700 hover:border-amber-300 dark:hover:border-amber-600 transition-colors cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  {todaysReport.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {todaysReport.company} ({todaysReport.symbol})
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Eye className="w-4 h-4 text-slate-400 group-hover:text-amber-500 transition-colors" />
                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-amber-500 transition-colors" />
              </div>
            </div>
            
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              {todaysReport.summary}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(todaysReport.date).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US')}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <FileText className="w-3 h-3" />
                  <span>PDF Report</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDownloadReport()
                  }}
                  className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-md hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors text-sm font-medium"
                >
                  {locale === 'zh' ? '下载' : 'Download'}
                </button>
                {!user && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      // 这里可以添加注册/登录逻辑
                      toast.success(locale === 'zh' ? '请注册以查看完整报告' : 'Please register to view full report')
                    }}
                    className="px-3 py-1 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors text-sm font-medium"
                  >
                    {locale === 'zh' ? '注册查看' : 'Register'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LinkedIn Share Tool */}
      {showShareTool && todaysReport && (
        <div className="mb-6">
          <LinkedInShareTool
            reportId={todaysReport.id}
            reportTitle={todaysReport.title}
            company={todaysReport.company}
            symbol={todaysReport.symbol}
            locale={locale}
          />
        </div>
      )}

      {/* Share Analytics */}
      {showAnalytics && todaysReport && (
        <div className="mb-6">
          <ShareAnalytics
            reportId={todaysReport.id}
            locale={locale}
          />
        </div>
      )}

      {/* Hot Stocks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {hotStocks.map((stock) => (
          <div
            key={stock.symbol}
            onClick={() => handleStockClick(stock)}
            className="bg-slate-800 border border-slate-700 rounded-lg p-4 hover:bg-slate-750 hover:border-amber-500/30 transition-all duration-200 cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-lg font-semibold text-white group-hover:text-amber-300 transition-colors">
                  {stock.symbol}
                </h3>
                <p className="text-sm text-slate-400 truncate">{stock.name}</p>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(stock.confidence)}`}>
                {getConfidenceText(stock.confidence)}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-white">${stock.price}</span>
                <div className={`flex items-center space-x-1 ${
                  stock.change >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {stock.change >= 0 ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  <span className="font-semibold">
                    {stock.change >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
                <div className="flex items-center space-x-1">
                  <DollarSign className="w-3 h-3" />
                  <span>${(stock.marketCap / 1e9).toFixed(1)}B</span>
                </div>
                <div className="flex items-center space-x-1">
                  <BarChart3 className="w-3 h-3" />
                  <span>P/E {stock.peRatio}</span>
                </div>
              </div>

              <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                {stock.reason}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Analysis Modal */}
      {showAnalysis && selectedStock && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-slate-700">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {selectedStock.symbol} - {selectedStock.name}
                  </h2>
                  <p className="text-slate-400">{selectedStock.sector}</p>
                </div>
                <button
                  onClick={() => setShowAnalysis(false)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-700 rounded-lg p-4">
                  <p className="text-sm text-slate-400">Price</p>
                  <p className="text-2xl font-bold text-white">${selectedStock.price}</p>
                </div>
                <div className="bg-slate-700 rounded-lg p-4">
                  <p className="text-sm text-slate-400">Change</p>
                  <p className={`text-2xl font-bold ${
                    selectedStock.change >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {selectedStock.change >= 0 ? '+' : ''}{selectedStock.changePercent.toFixed(2)}%
                  </p>
                </div>
                <div className="bg-slate-700 rounded-lg p-4">
                  <p className="text-sm text-slate-400">Market Cap</p>
                  <p className="text-2xl font-bold text-white">${(selectedStock.marketCap / 1e9).toFixed(1)}B</p>
                </div>
                <div className="bg-slate-700 rounded-lg p-4">
                  <p className="text-sm text-slate-400">P/E Ratio</p>
                  <p className="text-2xl font-bold text-white">{Number(selectedStock.peRatio).toFixed(2)}</p>
                </div>
              </div>

              {/* Analysis */}
              <div className="bg-slate-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-3">
                  {getTranslation(locale, 'analysis')}
                </h3>
                <p className="text-slate-300 leading-relaxed">
                  {selectedStock.reason}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${getConfidenceColor(selectedStock.confidence)}`}>
                    {getConfidenceText(selectedStock.confidence)}
                  </div>
                  <button className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors flex items-center space-x-2">
                    <ExternalLink className="w-4 h-4" />
                    <span>{getTranslation(locale, 'generateFullReport')}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Today's Report Modal */}
      {showReportModal && todaysReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    {todaysReport.title}
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400">
                    {todaysReport.company} ({todaysReport.symbol}) • {new Date(todaysReport.date).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US')}
                  </p>
                </div>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Report Summary */}
              <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
                  {locale === 'zh' ? '报告摘要' : 'Report Summary'}
                </h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {todaysReport.summary}
                </p>
              </div>

              {/* Access Control */}
              {!user && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6">
                  <div className="flex items-start space-x-3">
                    <Lock className="w-6 h-6 text-amber-600 dark:text-amber-400 mt-1" />
                    <div>
                      <h4 className="text-lg font-semibold text-amber-900 dark:text-amber-100 mb-2">
                        {locale === 'zh' ? '注册查看完整报告' : 'Register to View Full Report'}
                      </h4>
                      <p className="text-amber-700 dark:text-amber-300 mb-4">
                        {locale === 'zh' 
                          ? '完整报告包含详细的估值分析、投资建议和风险提示。注册后即可查看完整内容。'
                          : 'Full report includes detailed valuation analysis, investment recommendations, and risk assessments. Register to access complete content.'
                        }
                      </p>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => {
                            // 这里可以添加注册逻辑
                            toast.success(locale === 'zh' ? '请注册以查看完整报告' : 'Please register to view full report')
                          }}
                          className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                        >
                          {locale === 'zh' ? '立即注册' : 'Register Now'}
                        </button>
                        <button
                          onClick={handleDownloadReport}
                          className="px-4 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-lg hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors"
                        >
                          {locale === 'zh' ? '下载预览版' : 'Download Preview'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Full Access for Registered Users */}
              {user && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                      {locale === 'zh' ? '完整报告' : 'Full Report'}
                    </h3>
                    <button
                      onClick={handleDownloadReport}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                    >
                      <FileText className="w-4 h-4" />
                      <span>{locale === 'zh' ? '下载完整版' : 'Download Full Report'}</span>
                    </button>
                  </div>
                  
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <div className="flex items-center space-x-2 text-green-700 dark:text-green-300">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="font-medium">
                        {locale === 'zh' ? '您已注册，可以查看完整报告内容' : 'You are registered and can view the full report content'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
