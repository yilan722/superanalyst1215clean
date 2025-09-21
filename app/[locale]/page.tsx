'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Toaster } from 'react-hot-toast'
import MainLayout from '../../components/MainLayout'
import SearchForm from '../../components/SearchForm'
import ValuationReport from '../../components/ValuationReport'
import ReportDemo from '../../components/ReportDemo'
import AuthModal from '../../components/AuthModal'
import SubscriptionModal from '../../components/SubscriptionModal'
import ReportHistory from '../../components/ReportHistory'
import GenerationModal from '../../components/GenerationModal'
import Footer from '../../components/Footer'
import { StockData, ValuationReportData } from '../../src/types'
import { type Locale } from '../../src/services/i18n'

import { useAuthContext } from '../../src/services/auth-context'
import { canGenerateReport } from '../../src/services/supabase-auth'
import { supabase } from '../../src/services/supabase-client'
import toast from 'react-hot-toast'

// 导入Insight Refinery组件
import InsightRefineryButton from '../../components/InsightRefinery/InsightRefineryButton'

interface PageProps {
  params: { locale: Locale }
}

export default function HomePage({ params }: PageProps) {
  const router = useRouter()
  const [stockData, setStockData] = useState<StockData | null>(null)
  const [reportData, setReportData] = useState<ValuationReportData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)
  const [userData, setUserData] = useState<any>(null)
  
  // 使用认证上下文管理用户状态
  const { user: useAuthUser, loading: userLoading, signOut: useAuthSignOut, forceUpdate: useAuthForceUpdate, refreshUserData } = useAuthContext()
  
  // 获取用户数据
  const fetchUserData = async () => {
    if (!useAuthUser?.id) return
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', useAuthUser.id)
        .single()

      if (error) {
        console.error('Error fetching user data:', error)
        return
      }

      setUserData(data)
    } catch (error) {
      console.error('Error fetching user data:', error)
    }
  }
  
  // 添加调试信息 - 只在开发环境和状态变化时打印
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 主页面用户状态:', { 
        useAuthUser: useAuthUser?.id, 
        userLoading,
        useAuthUserId: useAuthUser?.id
      })
    }
  }, [useAuthUser?.id, userLoading]) // 只在关键状态变化时触发

  // 当用户登录时获取用户数据
  useEffect(() => {
    if (useAuthUser?.id) {
      fetchUserData()
    } else {
      setUserData(null)
    }
  }, [useAuthUser?.id])

  // 检查URL参数，如果是支付成功后的刷新，强制刷新用户数据
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.has('refresh')) {
      console.log('🔄 检测到支付成功刷新，强制更新用户数据')
      refreshUserData()
    }
  }, [])
  
  // 强制更新状态
  const [, forceUpdate] = useState({})
  
  // 使用认证上下文的用户状态
  const currentUser = useAuthUser
  
  // 检查是否还在加载中 - 修复逻辑
  // 如果用户已认证但loading仍为true，强制设置为false
  const isUserLoading = userLoading && !useAuthUser
  
  // 减少重复日志，只在真正的状态变化时打印
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 当前用户状态:', { 
        currentUser: currentUser?.id, 
        isUserLoading, 
        userLoading,
        useAuthUser: useAuthUser?.id
      })
    }
  }, [currentUser?.id, isUserLoading]) // 只在关键状态变化时触发
  
  // UI state
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false)
  const [showReportHistory, setShowReportHistory] = useState(false)
  const [showGenerationModal, setShowGenerationModal] = useState(false)


  // 认证状态已由全局上下文管理，无需额外处理

  // 监听用户状态变化，自动关闭登录模态框
  useEffect(() => {
    if (useAuthUser && showAuthModal) {
      console.log('🔒 用户已认证，自动关闭登录模态框')
      setShowAuthModal(false)
    }
  }, [useAuthUser, showAuthModal])

  const handleSearch = async (symbol: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/stock-data?ticker=${symbol}`)
      if (!response.ok) {
        throw new Error(params.locale === 'zh' ? '未找到股票数据' : 'Stock not found')
      }
      const data = await response.json()
      setStockData(data)
      toast.success(params.locale === 'zh' ? '数据已更新' : 'Data updated')
    } catch (error) {
      console.error('Search error:', error)
      toast.error(error instanceof Error ? error.message : (params.locale === 'zh' ? 'API错误' : 'API error'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateReport = async () => {
    console.log('🚀 开始生成报告流程...')
    console.log('📊 当前状态:', {
      stockData: stockData?.symbol,
      currentUser: currentUser?.id,
      currentUserEmail: currentUser?.email,
      isUserLoading,
      userLoading
    })
    
    if (!stockData) {
      console.log('❌ 没有选择股票')
      // 修复TypeScript错误：直接使用内联翻译而不是getTranslation函数
      toast.error(params.locale === 'zh' ? '请先搜索并选择股票' : 'Please search and select a stock first')
      return
    }

    if (!currentUser) {
      console.log('❌ 用户未登录，显示登录模态框')
      setShowAuthModal(true)
      return
    }

    console.log('✅ 用户已登录，开始权限检查...')

    // 检查用户权限
    try {
      console.log('🔍 调用canGenerateReport...')
      const canGenerate = await canGenerateReport(currentUser.id)
      console.log('📋 权限检查结果:', canGenerate)
      
      if (!canGenerate.canGenerate) {
        console.log('❌ 用户无权限，显示订阅模态框')
        
        // Check if it's specifically a free report quota issue
        if (canGenerate.reason === 'No free report quota left') {
          console.log('📋 免费报告配额已用完，显示订阅模态框')
          // You can add a specific state or toast message here if needed
          toast.error(params.locale === 'zh' ? '免费报告配额已用完，请订阅获取更多报告' : 'No free report quota left')
        }
        
        setShowSubscriptionModal(true)
        return
      }
      
      console.log('✅ 用户有权限，继续生成报告...')
    } catch (error) {
      console.error('❌ 权限检查失败:', error)
      toast.error(params.locale === 'zh' ? '权限检查失败' : 'Permission check failed')
      return
    }

    setShowGenerationModal(true)
    setIsGeneratingReport(true)

    try {
      console.log('📡 发送生成报告请求...')
      // 使用完整的报告生成API，支持sonar-deep-research模型（Vercel Pro 800秒超时）
      const response = await fetch('/api/generate-report-perplexity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.id}`, // 添加认证头
        },
        body: JSON.stringify({
          stockData: stockData, // 发送完整的股票数据对象
          userId: currentUser.id, // 用户ID用于认证
          locale: params.locale, // 传递语言参数
        }),
      })

      console.log('📥 收到响应:', response.status, response.statusText)

      if (!response.ok) {
        const errorData = await response.json()
        console.log('❌ 响应错误:', errorData)
        
        if (response.status === 403) {
          console.log('🚫 访问被拒绝，显示订阅模态框')
          if (errorData.needsSubscription) {
            toast.error(params.locale === 'zh' ? '需要订阅' : 'Subscription required')
            setShowSubscriptionModal(true)
          } else {
            toast.error(errorData.reason || (params.locale === 'zh' ? '访问被拒绝' : 'Access denied'))
          }
          return
        }
        throw new Error(errorData.error || (params.locale === 'zh' ? 'API错误' : 'API error'))
      }

      const data = await response.json()
      console.log('✅ 报告生成成功:', data)
      setReportData(data)
      setShowGenerationModal(false)
      toast.success(params.locale === 'zh' ? '报告生成成功' : 'Report generated successfully')
    } catch (error) {
      console.error('❌ 报告生成失败:', error)
      setShowGenerationModal(false)
      
      // 提供更友好的错误信息
      let errorMessage = params.locale === 'zh' ? 'API错误' : 'API error'
      if (error instanceof Error) {
        if (error.message.includes('API quota exhausted')) {
          errorMessage = 'API quota exhausted. Please try again later or contact support.'
        } else if (error.message.includes('Network connection issue')) {
          errorMessage = 'Network connection issue. Please check your internet connection and try again.'
        } else if (error.message.includes('API authentication failed')) {
          errorMessage = 'API authentication failed. Please contact support.'
        } else {
          errorMessage = error.message
        }
      }
      
      toast.error(errorMessage)
    } finally {
      setIsGeneratingReport(false)
    }
  }


  const handleLogin = () => {
    setShowAuthModal(true)
  }

  const handleLogout = async () => {
    try {
      console.log('🚪 主页面开始登出...')
      
      // 先清理本地存储
      if (typeof window !== 'undefined') {
        localStorage.clear()
        sessionStorage.clear()
        console.log('🧹 清理本地存储')
      }
      
      // 使用认证上下文的登出方法
      await useAuthSignOut()
      
      console.log('✅ 主页面登出成功')
    } catch (error) {
      console.error('❌ 主页面登出失败:', error)
      // 即使出错也要清理状态
      setUserData(null)
    }
  }

  const handleAuthSuccess = () => {
    setShowAuthModal(false)
    // 认证上下文会自动处理用户状态更新
  }

  const handleOpenSubscription = () => {
    setShowSubscriptionModal(true)
  }

  const handleOpenReportHistory = () => {
    setShowReportHistory(true)
  }

  const handleOpenAccount = () => {
    router.push(`/${params.locale}/account`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MainLayout
        locale={params.locale}
        user={currentUser}
        userData={userData}
        onLogout={handleLogout}
        onLogin={handleLogin}
        onOpenSubscription={handleOpenSubscription}
        onOpenReportHistory={handleOpenReportHistory}
        onOpenAccount={handleOpenAccount}
      >
        <div className="space-y-6">
          {/* Search Form and Stock Data Display */}
          <div className="space-y-4 sm:space-y-6">
            <SearchForm
              onSearch={handleSearch}
              onGenerateReport={handleGenerateReport}
              isLoading={isUserLoading || isGeneratingReport}
              locale={params.locale}
              isGeneratingReport={isGeneratingReport}
            />
            
            {/* Stock Data Display - Above Demo */}
            {stockData && (
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-amber-500/30 shadow-lg p-3 sm:p-6 mb-6 sm:mb-8">
                <h2 className="text-lg sm:text-2xl font-bold text-white mb-4 sm:mb-6 font-inter text-center sm:text-left">
                  {stockData.name} ({stockData.symbol}) Stock Information
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                        <span className="text-green-400 text-sm sm:text-lg font-bold">$</span>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-blue-200 mb-1 font-inter">Price</p>
                    <p className="text-lg sm:text-2xl font-bold text-white font-inter">${stockData.price}</p>
                    <p className={`text-xs sm:text-sm ${stockData.change >= 0 ? 'text-green-400' : 'text-red-400'} font-inter`}>
                      {stockData.change >= 0 ? '+' : ''}{stockData.change.toFixed(2)} ({stockData.changePercent >= 0 ? '+' : ''}{stockData.changePercent.toFixed(2)}%)
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2zm0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-blue-200 mb-1 font-inter">Market Cap</p>
                    <p className="text-lg sm:text-2xl font-bold text-white font-inter">${(stockData.marketCap / 1e9).toFixed(2)}B</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <div className="w-8 h-8 bg-amber-500/20 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2zm0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-blue-200 mb-1 font-inter">P/E Ratio</p>
                    <p className="text-lg sm:text-2xl font-bold text-white font-inter">{Number(stockData.peRatio).toFixed(2)}</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <div className="w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </div>
                    </div>
                    <p className="text-xs sm:text-sm text-blue-200 mb-1 font-inter">Trading Volume($)</p>
                    <p className="text-lg sm:text-2xl font-bold text-white font-inter">
                      {/* 判断是A股还是美股，A股显示成交量，美股显示成交额 */}
                      {/^[0-9]{6}$/.test(stockData.symbol) || stockData.symbol.startsWith('688') || stockData.symbol.startsWith('300') 
                        ? `${(stockData.volume / 10000).toFixed(2)}万` // A股显示成交量（万股）
                        : `$${(stockData.amount / 1e9).toFixed(2)}B` // 美股显示成交额（十亿美元）
                      }
                    </p>
                  </div>
                </div>

                {/* Insight Refinery按钮区域 */}
                {reportData && currentUser && (
                  <div className="mt-6 pt-6 border-t border-amber-500/30">
                    <div className="flex flex-wrap gap-3 justify-center">
                      <InsightRefineryButton
                        reportId={`report-${Date.now()}`}
                        reportTitle={`${stockData.name} (${stockData.symbol}) 估值分析报告`}
                        userId={currentUser.id}
                        locale={params.locale}
                        variant="primary"
                        size="md"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Report Demo Section - Only show when no report data */}
          {!reportData && (
            <ReportDemo locale={params.locale} />
          )}
          
          {/* Valuation Report - Show when report data exists */}
          {reportData && (
            <ValuationReport
              stockData={stockData}
              reportData={reportData}
              isLoading={isGeneratingReport}
              locale={params.locale}
            />
          )}
        </div>
      </MainLayout>

      {/* Modals */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
        locale={params.locale}
      />

      <SubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        userId={currentUser?.id || ''}
        locale={params.locale}
      />

      <ReportHistory
        isOpen={showReportHistory}
        onClose={() => setShowReportHistory(false)}
        locale={params.locale}
      />

      <GenerationModal
        isOpen={showGenerationModal}
        locale={params.locale}
      />
      
      <Footer />
      <Toaster position="top-right" />
    </div>
  )
} 