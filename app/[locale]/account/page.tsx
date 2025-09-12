'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User, Crown, FileText, CreditCard, Settings, ArrowLeft, Plus, CheckCircle } from 'lucide-react'
import { type Locale } from '@/lib/i18n'
import { getTranslation } from '@/lib/translations'
import useAuth from '@/lib/useAuth'
import { supabase } from '@/lib/supabase-client'
import toast from 'react-hot-toast'

interface UserData {
  id: string
  email: string
  name: string
  subscription_type: string | null
  subscription_end: string | null
  monthly_report_limit: number
  paid_reports_used: number
  free_reports_used: number
  created_at: string
}

interface SuccessPageProps {
  params: {
    locale: Locale
  }
}

export default function AccountPage({ params }: SuccessPageProps) {
  const router = useRouter()
  const { locale } = params
  const { user, loading } = useAuth()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)

  useEffect(() => {
    console.log('🔍 账户页面认证检查:', { user: user?.id, loading })
    
    if (!loading && !user) {
      console.log('❌ 用户未认证，重定向到主页')
      router.push(`/${locale}`)
      return
    }

    if (user) {
      console.log('✅ 用户已认证，获取用户数据')
      fetchUserData()
    }
  }, [user, loading, locale, router])

  const fetchUserData = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user?.id)
        .single()

      if (error) {
        console.error('Error fetching user data:', error)
        toast.error('Failed to load account information')
        return
      }

      setUserData(data)
    } catch (error) {
      console.error('Error fetching user data:', error)
      toast.error('Failed to load account information')
    } finally {
      setIsLoading(false)
    }
  }

  const getSubscriptionStatus = () => {
    if (!userData?.subscription_type) {
      return {
        type: 'free',
        name: locale === 'zh' ? '免费用户' : 'Free User',
        color: 'text-slate-500',
        bgColor: 'bg-slate-100',
        icon: User
      }
    }

    const isActive = userData.subscription_end && new Date(userData.subscription_end) > new Date()
    
    if (!isActive) {
      return {
        type: 'expired',
        name: locale === 'zh' ? '订阅已过期' : 'Subscription Expired',
        color: 'text-red-500',
        bgColor: 'bg-red-100',
        icon: User
      }
    }

    switch (userData.subscription_type) {
      case 'basic':
        return {
          type: 'basic',
          name: locale === 'zh' ? '基础会员' : 'Basic Member',
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
          icon: Crown
        }
      case 'professional':
        return {
          type: 'professional',
          name: locale === 'zh' ? '专业会员' : 'Professional Member',
          color: 'text-purple-600',
          bgColor: 'bg-purple-100',
          icon: Crown
        }
      case 'business':
        return {
          type: 'business',
          name: locale === 'zh' ? '企业会员' : 'Business Member',
          color: 'text-amber-600',
          bgColor: 'bg-amber-100',
          icon: Crown
        }
      default:
        return {
          type: 'unknown',
          name: locale === 'zh' ? '未知订阅' : 'Unknown Subscription',
          color: 'text-slate-500',
          bgColor: 'bg-slate-100',
          icon: User
        }
    }
  }

  const getReportLimit = () => {
    if (!userData) return 0
    return userData.monthly_report_limit || 0
  }

  const getReportsUsed = () => {
    if (!userData) return 0
    return (userData.paid_reports_used || 0) + (userData.free_reports_used || 0)
  }

  const getReportsRemaining = () => {
    return Math.max(0, getReportLimit() - getReportsUsed())
  }

  const subscriptionStatus = getSubscriptionStatus()
  const IconComponent = subscriptionStatus.icon

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-slate-600">
            {locale === 'zh' ? '加载中...' : 'Loading...'}
          </p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push(`/${locale}`)}
                className="flex items-center text-slate-600 hover:text-slate-900"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                {locale === 'zh' ? '返回首页' : 'Back to Home'}
              </button>
              <h1 className="text-xl font-semibold text-slate-900">
                {locale === 'zh' ? '我的账户' : 'My Account'}
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Info Card */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-slate-900">
                    {userData?.name || userData?.email}
                  </h2>
                  <p className="text-slate-600">{userData?.email}</p>
                  <div className="flex items-center mt-2">
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${subscriptionStatus.bgColor} ${subscriptionStatus.color}`}>
                      <IconComponent className="w-4 h-4 inline mr-1" />
                      {subscriptionStatus.name}
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
                    <span className="font-medium">{subscriptionStatus.name}</span>
                  </div>
                  
                  {userData.subscription_end && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">
                        {locale === 'zh' ? '到期时间' : 'Expires On'}
                      </span>
                      <span className="font-medium">
                        {new Date(userData.subscription_end).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">
                      {locale === 'zh' ? '状态' : 'Status'}
                    </span>
                    <div className="flex items-center">
                      <CheckCircle className={`w-4 h-4 mr-1 ${
                        subscriptionStatus.type === 'expired' ? 'text-red-500' : 'text-green-500'
                      }`} />
                      <span className={`font-medium ${
                        subscriptionStatus.type === 'expired' ? 'text-red-500' : 'text-green-500'
                      }`}>
                        {subscriptionStatus.type === 'expired' 
                          ? (locale === 'zh' ? '已过期' : 'Expired')
                          : (locale === 'zh' ? '活跃' : 'Active')
                        }
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
                    onClick={() => router.push(`/${locale}/subscription`)}
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
                  <span className="font-medium">{getReportLimit()}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">
                    {locale === 'zh' ? '已使用报告' : 'Reports Used'}
                  </span>
                  <span className="font-medium">{getReportsUsed()}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">
                    {locale === 'zh' ? '剩余报告' : 'Reports Remaining'}
                  </span>
                  <span className={`font-medium ${
                    getReportsRemaining() === 0 ? 'text-red-500' : 'text-green-500'
                  }`}>
                    {getReportsRemaining()}
                  </span>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-amber-500 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${getReportLimit() > 0 ? (getReportsUsed() / getReportLimit()) * 100 : 0}%` 
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
                  onClick={() => router.push(`/${locale}/reports`)}
                  className="w-full flex items-center justify-center space-x-2 bg-slate-100 text-slate-700 py-3 px-4 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  <span>{locale === 'zh' ? '查看报告历史' : 'View Report History'}</span>
                </button>
                
                <button
                  onClick={() => setShowPurchaseModal(true)}
                  className="w-full flex items-center justify-center space-x-2 bg-amber-600 text-white py-3 px-4 rounded-lg hover:bg-amber-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>{locale === 'zh' ? '购买更多报告' : 'Buy More Reports'}</span>
                </button>
                
                <button
                  onClick={() => router.push(`/${locale}/subscription`)}
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
                    {locale === 'zh' ? '注册时间' : 'Member Since'}
                  </span>
                  <span className="font-medium">
                    {userData?.created_at ? new Date(userData.created_at).toLocaleDateString() : '-'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">
                    {locale === 'zh' ? '总报告数' : 'Total Reports'}
                  </span>
                  <span className="font-medium">{getReportsUsed()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
