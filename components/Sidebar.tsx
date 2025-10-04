'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Home, TrendingUp, Brain, BarChart3, Settings, User, Calculator, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, LogOut, CreditCard, FileText } from 'lucide-react'
import { type Locale } from '../app/services/i18n'
import { getTranslation } from '../app/services/translations'
import SuperAnalystLogo from './SuperAnalystLogo'
import UserDropdown from './UserDropdown'
import { useAuthContext } from '../app/services/auth-context'

interface SidebarProps {
  locale: Locale
  activeTab: 'home' | 'daily-alpha' | 'insight-refinery' | 'valuation' | 'user-profile'
  onTabChange: (tab: 'home' | 'daily-alpha' | 'insight-refinery' | 'valuation' | 'user-profile') => void
  user: any
  userData?: {
    name?: string | null
    email?: string
    subscription_type: string | null
    subscription_tiers?: {
      name: string
    } | null
    monthly_report_limit: number
    paid_reports_used: number
    free_reports_used: number
  } | null
  onLogout: () => void
  onLogin: () => void
  onOpenSubscription: () => void
  onOpenReportHistory: () => void
  onOpenAccount?: () => void
  onCollapseChange?: (isCollapsed: boolean) => void
}

export default function Sidebar({ 
  locale, 
  activeTab, 
  onTabChange, 
  user, 
  userData,
  onLogout, 
  onLogin, 
  onOpenSubscription, 
  onOpenReportHistory,
  onOpenAccount,
  onCollapseChange 
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isUserProfileExpanded, setIsUserProfileExpanded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { signOut } = useAuthContext()

  // 当侧边栏折叠时，自动关闭用户菜单
  useEffect(() => {
    if (isCollapsed) {
      setIsUserProfileExpanded(false)
    }
  }, [isCollapsed])

  const handleCollapseToggle = () => {
    const newCollapsed = !isCollapsed
    setIsCollapsed(newCollapsed)
    onCollapseChange?.(newCollapsed)
  }

  // 与右上角UserDropdown完全一致的路由处理函数
  const handleManageSubscription = () => {
    setIsUserProfileExpanded(false)
    router.push(`/${locale}/subscription`)
  }

  const handleReportHub = () => {
    setIsUserProfileExpanded(false)
    onTabChange('insight-refinery')
  }

  const handleAccount = () => {
    setIsUserProfileExpanded(false)
    router.push(`/${locale}/account`)
  }

  const handleLogout = async () => {
    setIsLoading(true)
    try {
      await signOut()
      router.push(`/${locale}`)
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setIsLoading(false)
    }
  }
  const getSubscriptionStatus = () => {
    // 检查是否有订阅信息
    const subscriptionType = userData?.subscription_type
    const subscriptionTier = userData?.subscription_tiers?.name?.toLowerCase()
    
    if (!subscriptionType && !subscriptionTier) {
      return {
        name: locale === 'zh' ? '免费用户' : 'Free User',
        color: 'text-slate-400'
      }
    }

    // 优先使用新的subscription_tiers系统
    if (subscriptionTier) {
      switch (subscriptionTier) {
        case 'free':
          return {
            name: locale === 'zh' ? '免费用户' : 'Free User',
            color: 'text-slate-400'
          }
        case 'basic':
          return {
            name: locale === 'zh' ? '基础会员' : 'Basic Member',
            color: 'text-blue-400'
          }
        case 'pro':
          return {
            name: locale === 'zh' ? '专业会员' : 'Pro Member',
            color: 'text-purple-400'
          }
        case 'business':
          return {
            name: locale === 'zh' ? '企业会员' : 'Business Member',
            color: 'text-amber-400'
          }
        case 'enterprise':
          return {
            name: locale === 'zh' ? '企业会员' : 'Enterprise Member',
            color: 'text-amber-400'
          }
        default:
          return {
            name: locale === 'zh' ? '未知会员' : 'Unknown Member',
            color: 'text-slate-400'
          }
      }
    }

    // 回退到旧的subscription_type系统
    switch (subscriptionType) {
      case 'basic':
        return {
          name: locale === 'zh' ? '基础会员' : 'Basic Member',
          color: 'text-blue-400'
        }
      case 'professional':
        return {
          name: locale === 'zh' ? '专业会员' : 'Pro Member',
          color: 'text-purple-400'
        }
      case 'business':
        return {
          name: locale === 'zh' ? '企业会员' : 'Business Member',
          color: 'text-amber-400'
        }
      default:
        return {
          name: locale === 'zh' ? '未知会员' : 'Unknown Member',
          color: 'text-slate-400'
        }
    }
  }

  const subscriptionStatus = getSubscriptionStatus()

  const getReportsRemaining = () => {
    if (!userData) return 0
    const used = (userData.paid_reports_used || 0) + (userData.free_reports_used || 0)
    return Math.max(0, (userData.monthly_report_limit || 0) - used)
  }

  const navigationItems = [
    {
      id: 'home' as const,
      name: getTranslation(locale, 'home'),
      icon: Home,
      description: getTranslation(locale, 'homeDescription'),
      hoverDescription: getTranslation(locale, 'homeDescription')
    },
    {
      id: 'daily-alpha' as const,
      name: getTranslation(locale, 'dailyAlphaBrief'),
      icon: TrendingUp,
      description: getTranslation(locale, 'dailyAlphaDescription'),
      hoverDescription: getTranslation(locale, 'dailyAlphaDescription')
    },
    {
      id: 'insight-refinery' as const,
      name: getTranslation(locale, 'insightRefinery'),
      icon: Brain,
      description: getTranslation(locale, 'insightRefineryDescription'),
      hoverDescription: `${getTranslation(locale, 'insightRefineryDescription')} (BETA)`,
      isBeta: true
    },
    {
      id: 'valuation' as const,
      name: locale === 'zh' ? '估值分析' : 'Valuation Analysis',
      icon: Calculator,
      description: locale === 'zh' ? 'DCF估值模型和参数调整' : 'DCF Valuation Model & Parameter Adjustment',
      hoverDescription: locale === 'zh' ? 'DCF估值模型和参数调整 (BETA)' : 'DCF Valuation Model & Parameter Adjustment (BETA)',
      isBeta: true
    }
  ]

  return (
    <div className={`${isCollapsed ? 'w-16' : 'w-56'} bg-slate-900 border-r border-slate-700 min-h-screen flex flex-col fixed left-0 top-0 z-40 transition-all duration-300`}>
      {/* Logo Section */}
      <div className="p-1 border-b border-slate-700">
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          {!isCollapsed && (
            <div className="flex items-center justify-center flex-1 px-1">
              <SuperAnalystLogo size="sm" showSubtitle={false} />
            </div>
          )}
          <button
            onClick={handleCollapseToggle}
            className="p-1 rounded bg-slate-700 hover:bg-slate-600 border border-slate-600 transition-colors flex-shrink-0"
          >
            {isCollapsed ? (
              <ChevronRight className="w-3.5 h-3.5 text-white" />
            ) : (
              <ChevronLeft className="w-3.5 h-3.5 text-white" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-2 space-y-1">
        {navigationItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} p-3 rounded-lg transition-all duration-200 group ${
                isActive 
                  ? 'bg-amber-500/20 border border-amber-500/30 text-amber-300' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
              title={isCollapsed ? item.hoverDescription : undefined}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${
                isActive ? 'text-amber-400' : 'text-slate-400 group-hover:text-slate-300'
              }`} />
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <p className={`font-medium text-sm whitespace-nowrap ${
                      isActive ? 'text-amber-300' : 'text-slate-300 group-hover:text-white'
                    }`}>
                      {item.name}
                    </p>
                    {item.isBeta && (
                      <span className="px-1.5 py-0.5 text-xs font-medium bg-purple-600 text-white rounded flex-shrink-0">
                        BETA
                      </span>
                    )}
                  </div>
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* User Section - 固定在底部 */}
      <div className="border-t border-slate-700 mt-auto relative">
        {user ? (
          <div>
            {/* User Profile Header - 整个区域可点击 */}
            <div className="p-2">
              {!isCollapsed ? (
                <button
                  onClick={() => setIsUserProfileExpanded(!isUserProfileExpanded)}
                  className="w-full flex items-center justify-between hover:bg-slate-800 rounded-lg p-2 transition-colors"
                >
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    <div className="w-6 h-6 bg-slate-700 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-3 h-3 text-slate-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-200 truncate">
                        {userData?.name || userData?.email || (user.email ? user.email.split('@')[0] : 'User')}
                      </p>
                      <p className={`text-xs truncate ${subscriptionStatus.color}`}>
                        {subscriptionStatus.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    {isUserProfileExpanded ? (
                      <ChevronUp className="w-3 h-3 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-3 h-3 text-slate-400" />
                    )}
                  </div>
                </button>
              ) : (
                <div className="flex items-center justify-center">
                  <button
                    onClick={() => setIsUserProfileExpanded(!isUserProfileExpanded)}
                    className="w-6 h-6 bg-slate-700 rounded-full flex items-center justify-center hover:bg-slate-600 transition-colors"
                    title={locale === 'zh' ? '用户资料' : 'User Profile'}
                  >
                    <User className="w-3 h-3 text-slate-300" />
                  </button>
                </div>
              )}
            </div>

            {/* Expanded User Profile Menu - 向上展开 */}
            {isUserProfileExpanded && (
              <div className="px-2 pb-2">
                {isCollapsed ? (
                  // 折叠状态：只显示图标，无背景容器
                  <div className="flex flex-col space-y-1 absolute bottom-full left-0 right-0 mb-2">
                    {/* My Account */}
                    <button
                      onClick={handleAccount}
                      className="w-full flex items-center justify-center p-3 text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
                      title={locale === 'zh' ? '我的账户' : 'My Account'}
                    >
                      <Settings className="w-4 h-4" />
                    </button>

                    {/* Manage Subscription */}
                    <button
                      onClick={handleManageSubscription}
                      className="w-full flex items-center justify-center p-3 text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
                      title={locale === 'zh' ? '订阅管理' : 'Manage Subscription'}
                    >
                      <CreditCard className="w-4 h-4" />
                    </button>

                    {/* Report Hub */}
                    <button
                      onClick={handleReportHub}
                      className="w-full flex items-center justify-center p-3 text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
                      title={locale === 'zh' ? '报告中心' : 'Report Hub'}
                    >
                      <BarChart3 className="w-4 h-4" />
                    </button>

                  </div>
                ) : (
                  // 展开状态：显示图标和文字，有背景容器
                  <div className="bg-slate-800 rounded-lg p-1 space-y-0.5 absolute bottom-full left-0 right-0 mb-2">
                      {/* My Account */}
                      <button
                        onClick={handleAccount}
                        className="w-full flex items-center space-x-3 p-3 text-slate-300 hover:bg-slate-700 rounded-lg transition-colors"
                      >
                        <Settings className="w-4 h-4 flex-shrink-0" />
                        <span className="text-sm font-medium truncate">{locale === 'zh' ? '我的账户' : 'My Account'}</span>
                      </button>

                      {/* Manage Subscription */}
                      <button
                        onClick={handleManageSubscription}
                        className="w-full flex items-center space-x-3 p-3 text-slate-300 hover:bg-slate-700 rounded-lg transition-colors"
                      >
                        <CreditCard className="w-4 h-4 flex-shrink-0" />
                        <span className="text-sm font-medium truncate">{locale === 'zh' ? '订阅管理' : 'Manage Subscription'}</span>
                      </button>

                      {/* Report Hub */}
                      <button
                        onClick={handleReportHub}
                        className="w-full flex items-center space-x-3 p-3 text-slate-300 hover:bg-slate-700 rounded-lg transition-colors"
                      >
                        <BarChart3 className="w-4 h-4 flex-shrink-0" />
                        <span className="text-sm font-medium truncate">{locale === 'zh' ? '报告中心' : 'Report Hub'}</span>
                      </button>

                    </div>
                  )}
              </div>
            )}
          </div>
        ) : (
          !isCollapsed && (
            <div className="p-2">
              <div className="text-center">
                <p className="text-sm text-slate-400 mb-2">
                  {getTranslation(locale, 'loginPrompt')}
                </p>
                <p className="text-xs text-slate-500">
                  {locale === 'zh' ? '请使用右上角登录按钮' : 'Please use the login button in the top right'}
                </p>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  )
}
