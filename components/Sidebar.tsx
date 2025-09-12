'use client'

import React from 'react'
import { Home, TrendingUp, Brain, BarChart3, Settings, User } from 'lucide-react'
import { type Locale } from '../lib/i18n'
import { getTranslation } from '../lib/translations'
import UserDropdown from './UserDropdown'

interface SidebarProps {
  locale: Locale
  activeTab: 'home' | 'daily-alpha' | 'insight-refinery'
  onTabChange: (tab: 'home' | 'daily-alpha' | 'insight-refinery') => void
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
  onOpenAccount
}: SidebarProps) {
  const getSubscriptionStatus = () => {
    if (!userData?.subscription_type) {
      return {
        name: locale === 'zh' ? '免费用户' : 'Free User',
        color: 'text-slate-400'
      }
    }

    switch (userData.subscription_type) {
      case 'basic':
        return {
          name: locale === 'zh' ? '基础会员' : 'Basic Member',
          color: 'text-blue-400'
        }
      case 'professional':
        return {
          name: locale === 'zh' ? '专业会员' : 'Professional Member',
          color: 'text-purple-400'
        }
      case 'business':
        return {
          name: locale === 'zh' ? '企业会员' : 'Business Member',
          color: 'text-amber-400'
        }
      default:
        return {
          name: locale === 'zh' ? '会员' : 'Member',
          color: 'text-slate-400'
        }
    }
  }

  const getReportsRemaining = () => {
    if (!userData) return 0
    const used = (userData.paid_reports_used || 0) + (userData.free_reports_used || 0)
    return Math.max(0, (userData.monthly_report_limit || 0) - used)
  }

  const subscriptionStatus = getSubscriptionStatus()

  const navigationItems = [
    {
      id: 'home' as const,
      name: getTranslation(locale, 'home'),
      icon: Home,
      description: getTranslation(locale, 'homeDescription')
    },
    {
      id: 'daily-alpha' as const,
      name: getTranslation(locale, 'dailyAlphaBrief'),
      icon: TrendingUp,
      description: getTranslation(locale, 'dailyAlphaDescription')
    },
    {
      id: 'insight-refinery' as const,
      name: getTranslation(locale, 'insightRefinery'),
      icon: Brain,
      description: getTranslation(locale, 'insightRefineryDescription')
    }
  ]

  return (
    <div className="w-64 bg-slate-900 border-r border-slate-700 min-h-screen flex flex-col">
      {/* Logo Section */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">SuperAnalyst</h1>
            <p className="text-xs text-slate-400">Pro Equity Research</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-start space-x-3 p-3 rounded-lg transition-all duration-200 group ${
                isActive 
                  ? 'bg-amber-500/20 border border-amber-500/30 text-amber-300' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                isActive ? 'text-amber-400' : 'text-slate-400 group-hover:text-slate-300'
              }`} />
              <div className="flex-1 min-w-0">
                <p className={`font-medium text-sm ${
                  isActive ? 'text-amber-300' : 'text-slate-300 group-hover:text-white'
                }`}>
                  {item.name}
                </p>
                <p className={`text-xs mt-1 ${
                  isActive ? 'text-amber-400/70' : 'text-slate-500 group-hover:text-slate-400'
                }`}>
                  {item.description}
                </p>
              </div>
            </button>
          )
        })}
      </div>

      {/* User Section */}
      <div className="p-4 border-t border-slate-700">
        {user ? (
          <div className="space-y-3">
            {/* User Dropdown */}
            <UserDropdown userData={userData} locale={locale} />
            
            {/* Reports Remaining Info */}
            {userData && (
              <div className="text-center">
                <p className="text-xs text-slate-500">
                  {getReportsRemaining()} {locale === 'zh' ? '报告剩余' : 'reports left'}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-center">
              <p className="text-sm text-slate-400 mb-3">
                {getTranslation(locale, 'loginPrompt')}
              </p>
              <button
                onClick={onLogin}
                className="w-full px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium"
              >
                {getTranslation(locale, 'login')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
