'use client'

import React, { useState } from 'react'
import Sidebar from './Sidebar'
import DailyAlphaBrief from './DailyAlphaBrief'
import ReportHub from './InsightRefinery/ReportHub'
import HeaderUserDropdown from './HeaderUserDropdown'
import { type Locale } from '../app/services/i18n'

interface MainLayoutProps {
  locale: Locale
  user: any
  userData?: {
    subscription_type: string | null
    monthly_report_limit: number
    paid_reports_used: number
    free_reports_used: number
  } | null
  onLogout: () => void
  onLogin: () => void
  onOpenSubscription: () => void
  onOpenReportHistory: () => void
  onOpenAccount?: () => void
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
  onOpenAccount,
  children 
}: MainLayoutProps) {
  const [activeTab, setActiveTab] = useState<'home' | 'daily-alpha' | 'insight-refinery'>('home')

  const handleTabChange = (tab: 'home' | 'daily-alpha' | 'insight-refinery') => {
    setActiveTab(tab)
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'daily-alpha':
        return <DailyAlphaBrief locale={locale} user={user} />
      case 'insight-refinery':
        return user ? (
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
      case 'home':
      default:
        return children
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
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
        onOpenAccount={onOpenAccount}
      />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-sm font-semibold text-gray-600">
                {activeTab === 'home' && (locale === 'zh' ? '专业AI驱动股票研究平台' : 'Professional AI-driven Equity Research Platform')}
                {activeTab === 'daily-alpha' && (locale === 'zh' ? '每日热门股票' : 'Daily Alpha Brief')}
                {activeTab === 'insight-refinery' && (locale === 'zh' ? '洞察精炼器' : 'Insight Refinery')}
              </h1>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                {activeTab === 'home' && (locale === 'zh' ? 'SuperAnalyst处理80%的繁琐研究工作，让您100%专注于分析、策略和形成独特见解' : 'SuperAnalyst handles 80% of research that\'s grunt work, so you can spend 100% of your brainpower on analysis, strategy, and forming your own unique thesis')}
                {activeTab === 'daily-alpha' && (locale === 'zh' ? '每日热门股票基本面研究报告' : 'Daily Hot Stock Fundamental Research Report')}
                {activeTab === 'insight-refinery' && (locale === 'zh' ? 'AI深度讨论与报告进化' : 'Enrich AI Reports with Your Data & Insights')}
              </p>
            </div>
            
            {/* User Dropdown in Top Bar */}
            {user ? (
              <HeaderUserDropdown userData={userData} locale={locale} />
            ) : (
              <button
                onClick={onLogin}
                className="flex items-center space-x-2 px-4 py-2 bg-amber-600 text-white hover:bg-amber-700 rounded-lg transition-colors font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                <span>{locale === 'zh' ? '登录' : 'Login'}</span>
              </button>
            )}
          </div>
        </div>
        
        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  )
}
