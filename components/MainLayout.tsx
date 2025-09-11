'use client'

import React, { useState } from 'react'
import Sidebar from './Sidebar'
import DailyAlphaBrief from './DailyAlphaBrief'
import ReportHub from './InsightRefinery/ReportHub'
import { type Locale } from '../lib/i18n'

interface MainLayoutProps {
  locale: Locale
  user: any
  onLogout: () => void
  onLogin: () => void
  onOpenSubscription: () => void
  onOpenReportHistory: () => void
  children: React.ReactNode
}

export default function MainLayout({ 
  locale, 
  user, 
  onLogout, 
  onLogin, 
  onOpenSubscription, 
  onOpenReportHistory, 
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
        onLogout={onLogout}
        onLogin={onLogin}
        onOpenSubscription={onOpenSubscription}
        onOpenReportHistory={onOpenReportHistory}
      />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-slate-900">
                {activeTab === 'home' && (locale === 'zh' ? '专业AI驱动股票研究平台' : 'Professional AI-driven Equity Research Platform')}
                {activeTab === 'daily-alpha' && (locale === 'zh' ? '每日热门股票' : 'Daily Alpha Brief')}
                {activeTab === 'insight-refinery' && (locale === 'zh' ? '洞察精炼器' : 'Insight Refinery')}
              </h1>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {activeTab === 'home' && (locale === 'zh' ? 'SuperAnalyst处理80%的繁琐研究工作，让您100%专注于分析、策略和形成独特见解' : 'SuperAnalyst handles 80% of research that\'s grunt work, so you can spend 100% of your brainpower on analysis, strategy, and forming your own unique thesis')}
                {activeTab === 'daily-alpha' && (locale === 'zh' ? '每日热门股票基本面研究报告' : 'Daily Hot Stock Fundamental Research Report')}
                {activeTab === 'insight-refinery' && (locale === 'zh' ? 'AI深度讨论与报告进化' : 'AI Discussion & Report Evolution')}
              </p>
            </div>
            
            {/* User Info in Top Bar */}
            {user && (
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-900">{user.email?.split('@')[0] || 'User'}</p>
                  <p className="text-xs text-slate-500">Pro Member</p>
                </div>
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user.email?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
              </div>
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
