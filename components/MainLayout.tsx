'use client'

import React, { useState } from 'react'
import Sidebar from './Sidebar'
import DailyAlphaBrief from './DailyAlphaBrief'
import ReportHub from './InsightRefinery/ReportHub'
import UserDropdown from './UserDropdown'
import ValuationAnalysis from './ValuationAnalysis'
import UserProfile from './UserProfile'
import LanguageSelector from './LanguageSelector'
import SuperAnalystLogo from './SuperAnalystLogo'
import Footer from './Footer'
import { type Locale } from '../app/services/i18n'

interface MainLayoutProps {
  locale: Locale
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
  onLocaleChange: (locale: Locale) => void
  children: React.ReactNode
}

export default function MainLayout({ 
  locale, 
  user, 
  userData,
  onLogout, 
  onLogin, 
  onOpenSubscription, 
  onOpenReportHistory,
  onLocaleChange,
  children 
}: MainLayoutProps) {
  const [activeTab, setActiveTab] = useState<'home' | 'daily-alpha' | 'insight-refinery' | 'valuation' | 'user-profile'>('home')
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  const handleTabChange = (tab: 'home' | 'daily-alpha' | 'insight-refinery' | 'valuation' | 'user-profile') => {
    setActiveTab(tab)
  }

  const handleOpenAccount = () => {
    setActiveTab('user-profile')
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'daily-alpha':
        return <DailyAlphaBrief locale={locale} user={user} />
      case 'insight-refinery':
        return user && user.id ? (
          <ReportHub userId={user.id} locale={locale} />
        ) : (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">
                {locale === 'zh' ? '请先登录' : 'Please Login First'}
              </h2>
              <p className="text-slate-600 mb-6">
                {locale === 'zh' ? '登录后即可使用洞察精炼器功能' : 'Login to access Insight Refinery features'}
              </p>
              <button
                onClick={onLogin}
                className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
              >
                {locale === 'zh' ? '立即登录' : 'Login Now'}
              </button>
            </div>
          </div>
        )
        case 'valuation':
          return <ValuationAnalysis locale={locale} user={user} />
      case 'user-profile':
        return (
          <UserProfile
            locale={locale}
            user={user}
            userData={userData}
            onOpenSubscription={onOpenSubscription}
            onOpenReportHistory={onOpenReportHistory}
            onLogin={onLogin}
          />
        )
      case 'home':
      default:
        return children
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        locale={locale}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        user={user}
        userData={userData}
        onLogout={onLogout}
        onLogin={onLogin}
        onOpenSubscription={onOpenSubscription}
        onOpenReportHistory={onOpenReportHistory}
        onOpenAccount={handleOpenAccount}
        onCollapseChange={setIsSidebarCollapsed}
      />
      
      {/* Main Content */}
      <div className={`${isSidebarCollapsed ? 'ml-16' : 'ml-56'} flex flex-col min-h-screen transition-all duration-300`}>
        {/* Top Bar - Fixed */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            {/* Left side - Title and Tagline (only show on home page, aligned to left edge) */}
            {activeTab === 'home' ? (
              <div className="flex-1 text-left pl-0">
                <h1 className="text-base font-semibold text-gray-900">
                  {locale === 'zh' ? '专业AI驱动股票研究平台' : 'Professional AI-driven Equity Research Platform'}
                </h1>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                  {locale === 'zh' 
                    ? 'SuperAnalyst处理80%的繁琐研究工作，让您100%专注于分析、策略和形成独特见解' 
                    : 'SuperAnalyst handles 80% of research that\'s grunt work, so you can spend 100% of your brainpower on analysis, strategy, and forming your own unique thesis'}
                </p>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <SuperAnalystLogo size="md" showSubtitle={false} />
              </div>
            )}
            
            {/* Right side - Language Selector and Login */}
            <div className="flex items-center space-x-4 ml-4">
              <LanguageSelector 
                currentLocale={locale} 
                onLocaleChange={onLocaleChange} 
              />
              {user ? (
                <UserDropdown userData={userData} locale={locale} />
              ) : (
                <button
                  onClick={onLogin}
                  className="flex items-center space-x-2 px-4 py-2 bg-amber-600 text-white hover:bg-amber-700 rounded-lg transition-colors font-medium"
                >
                  <span>{locale === 'zh' ? '登录' : 'Login'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          {renderContent()}
        </div>
      </div>
      
      {/* Footer */}
      <Footer isSidebarCollapsed={isSidebarCollapsed} />
    </div>
  )
}
