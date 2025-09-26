'use client'

import React from 'react'
import { User, Crown, FileText, CreditCard, Plus, CheckCircle } from 'lucide-react'
import { type Locale } from '../app/services/i18n'

interface UserProfileProps {
  locale: Locale
  user: any
  userData?: {
    subscription_type: string | null
    monthly_report_limit: number
    paid_reports_used: number
    free_reports_used: number
  } | null
  onOpenSubscription: () => void
  onOpenReportHistory: () => void
  onLogin: () => void
}

export default function UserProfile({
  locale,
  user,
  userData,
  onOpenSubscription,
  onOpenReportHistory,
  onLogin
}: UserProfileProps) {
  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            {locale === 'zh' ? '请先登录' : 'Please Login First'}
          </h2>
          <p className="text-slate-600 mb-6">
            {locale === 'zh' ? '登录后即可查看用户资料' : 'Login to view your user profile'}
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
  }

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-slate-900">
                    { user.email}
                  </h2>
                  <p className="text-slate-600">{user.name}</p>
                  <div className="flex items-center mt-2">
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      userData?.subscription_type 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {userData?.subscription_type || (locale === 'zh' ? '免费用户' : 'Free User')}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Subscription Status */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                {locale === 'zh' ? '订阅状态' : 'Subscription Status'}
              </h3>
              
              {userData?.subscription_type ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">
                      {locale === 'zh' ? '订阅类型' : 'Subscription Type'}
                    </span>
                    <span className="font-medium">{userData.subscription_type}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">
                      {locale === 'zh' ? '状态' : 'Status'}
                    </span>
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                      <span className="font-medium text-green-500">
                        {locale === 'zh' ? '活跃' : 'Active'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Crown className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600 mb-4">
                    {locale === 'zh' 
                      ? '您还没有订阅任何计划' 
                      : 'You don\'t have any active subscription'
                    }
                  </p>
                  <button
                    onClick={onOpenSubscription}
                    className="bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700 transition-colors"
                  >
                    {locale === 'zh' ? '查看订阅计划' : 'View Subscription Plans'}
                  </button>
                </div>
              )}
            </div>

            {/* Report Usage */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                {locale === 'zh' ? '报告使用情况' : 'Report Usage'}
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">
                    {locale === 'zh' ? '本月报告限制' : 'Monthly Report Limit'}
                  </span>
                  <span className="font-medium">{userData?.monthly_report_limit || 0}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">
                    {locale === 'zh' ? '已使用报告' : 'Reports Used'}
                  </span>
                  <span className="font-medium">
                    {userData ? (userData.paid_reports_used || 0) + (userData.free_reports_used || 0) : 0}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">
                    {locale === 'zh' ? '剩余报告' : 'Reports Remaining'}
                  </span>
                  <span className={`font-medium ${
                    (userData?.monthly_report_limit || 0) - ((userData?.paid_reports_used || 0) + (userData?.free_reports_used || 0)) === 0 ? 'text-red-500' : 'text-green-500'
                  }`}>
                    {Math.max(0, (userData?.monthly_report_limit || 0) - ((userData?.paid_reports_used || 0) + (userData?.free_reports_used || 0)))}
                  </span>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-amber-500 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${(userData?.monthly_report_limit || 0) > 0 ? (((userData?.paid_reports_used || 0) + (userData?.free_reports_used || 0)) / (userData?.monthly_report_limit || 1)) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                {locale === 'zh' ? '快速操作' : 'Quick Actions'}
              </h3>
              
              <div className="space-y-3">
                <button
                  onClick={onOpenReportHistory}
                  className="w-full flex items-center justify-center space-x-2 bg-slate-100 text-slate-700 py-3 px-4 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  <span>{locale === 'zh' ? '查看报告历史' : 'View Report History'}</span>
                </button>
                
                <button
                  onClick={onOpenSubscription}
                  className="w-full flex items-center justify-center space-x-2 bg-amber-600 text-white py-3 px-4 rounded-lg hover:bg-amber-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>{locale === 'zh' ? '购买更多报告' : 'Buy More Reports'}</span>
                </button>
                
                <button
                  onClick={onOpenSubscription}
                  className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>{locale === 'zh' ? '管理订阅' : 'Manage Subscription'}</span>
                </button>
              </div>
            </div>

            {/* Account Stats */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                {locale === 'zh' ? '账户统计' : 'Account Statistics'}
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">
                    {locale === 'zh' ? '总报告数' : 'Total Reports'}
                  </span>
                  <span className="font-medium">
                    {userData ? (userData.paid_reports_used || 0) + (userData.free_reports_used || 0) : 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
