'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { type Locale } from '@/lib/i18n'
import { getTranslation } from '@/lib/translations'
import useAuth from '@/lib/useAuth'
import { supabase } from '@/lib/supabase-client'
import { CreditCard, Check, X, Loader2, AlertCircle } from 'lucide-react'

interface SubscriptionPageProps {
  params: {
    locale: Locale
  }
}

export default function SubscriptionPage({ params }: SubscriptionPageProps) {
  const { locale } = params
  const router = useRouter()
  const { user: authUser, loading: authLoading } = useAuth()
  const [userData, setUserData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    console.log('🔍 订阅页面认证检查:', { user: authUser?.id, loading: authLoading })
    
    if (!authLoading) {
      if (!authUser) {
        console.log('❌ 用户未认证，重定向到主页')
        router.push(`/${locale}`) // Redirect to home if not logged in
        return
      }
      console.log('✅ 用户已认证，获取用户数据')
      fetchUserData()
    }
  }, [authUser, authLoading, locale, router])

  const fetchUserData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser?.id)
        .single()

      if (error) {
        setError(error.message)
        console.error('Error fetching user data:', error)
        setUserData(null)
      } else {
        setUserData(data)
      }
    } catch (err) {
      setError(locale === 'zh' ? '加载用户数据失败' : 'Failed to load user data')
      console.error('Unexpected error fetching user data:', err)
      setUserData(null)
    } finally {
      setIsLoading(false)
    }
  }

  const getSubscriptionStatus = () => {
    if (!userData?.subscription_type) {
      return {
        name: locale === 'zh' ? '免费用户' : 'Free User',
        color: 'text-slate-500',
        bgColor: 'bg-slate-100',
        description: locale === 'zh' ? '您目前是免费用户。' : 'You are currently on the Free plan.'
      }
    }

    switch (userData.subscription_type) {
      case 'basic':
        return {
          name: locale === 'zh' ? '基础会员' : 'Basic Member',
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
          description: locale === 'zh' ? '享受基础报告功能。' : 'Access to basic report features.'
        }
      case 'professional':
        return {
          name: locale === 'zh' ? '专业会员' : 'Pro Member',
          color: 'text-purple-600',
          bgColor: 'bg-purple-100',
          description: locale === 'zh' ? '解锁更多高级分析。' : 'Unlock more advanced analytics.'
        }
      case 'business':
        return {
          name: locale === 'zh' ? '企业会员' : 'Business Member',
          color: 'text-amber-600',
          bgColor: 'bg-amber-100',
          description: locale === 'zh' ? '获得所有企业级功能。' : 'Gain access to all enterprise-grade features.'
        }
      default:
        return {
          name: locale === 'zh' ? '未知会员' : 'Unknown Member',
          color: 'text-slate-500',
          bgColor: 'bg-slate-100',
          description: locale === 'zh' ? '您的会员状态未知。' : 'Your membership status is unknown.'
        }
    }
  }

  const subscriptionStatus = getSubscriptionStatus()
  const monthlyReportLimit = userData?.monthly_report_limit || 0
  const paidReportsUsed = userData?.paid_reports_used || 0
  const freeReportsUsed = userData?.free_reports_used || 0
  const totalReportsUsed = paidReportsUsed + freeReportsUsed
  const reportsRemaining = Math.max(0, (monthlyReportLimit || 0) - totalReportsUsed)
  const reportUsagePercentage = monthlyReportLimit > 0 ? (totalReportsUsed / monthlyReportLimit) * 100 : 0

  const handleUpgrade = (planType: string) => {
    // Redirect to payment page with selected plan
    router.push(`/${locale}/payment?plan=${planType}`)
  }

  const handleCancelSubscription = async () => {
    if (!userData?.subscription_id) {
      alert(locale === 'zh' ? '没有找到订阅信息' : 'No subscription found')
      return
    }

    const confirmed = confirm(
      locale === 'zh' 
        ? '确定要取消订阅吗？取消后您将失去所有付费功能。' 
        : 'Are you sure you want to cancel your subscription? You will lose access to all paid features.'
    )

    if (!confirmed) return

    try {
      const response = await fetch('/api/stripe/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          subscriptionId: userData.subscription_id
        })
      })

      const result = await response.json()

      if (result.success) {
        alert(locale === 'zh' ? '订阅已成功取消' : 'Subscription cancelled successfully')
        // Refresh the page to update user data
        window.location.reload()
      } else {
        throw new Error(result.error || 'Failed to cancel subscription')
      }
    } catch (error) {
      console.error('Cancel subscription error:', error)
      alert(locale === 'zh' ? '取消订阅失败，请重试' : 'Failed to cancel subscription, please try again')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-amber-500 h-8 w-8" />
        <p className="ml-3 text-slate-700">{locale === 'zh' ? '加载中...' : 'Loading...'}</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-800 mb-8">
          {locale === 'zh' ? '订阅管理' : 'Subscription Management'}
        </h1>

        {/* Current Subscription Status */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-slate-700 mb-4">
            {locale === 'zh' ? '当前订阅状态' : 'Current Subscription Status'}
          </h2>
          
          <div className="flex items-center space-x-4 mb-6">
            <div className={`px-4 py-2 rounded-full ${subscriptionStatus.bgColor}`}>
              <span className={`font-semibold ${subscriptionStatus.color}`}>
                {subscriptionStatus.name}
              </span>
            </div>
            <p className="text-slate-600">{subscriptionStatus.description}</p>
          </div>

          {/* Report Usage */}
          <div className="bg-gray-100 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-slate-600">
                {locale === 'zh' ? '已使用报告' : 'Reports Used'}:{' '}
                <span className="font-semibold">{totalReportsUsed}</span> /{' '}
                <span className="font-semibold">{monthlyReportLimit === 0 ? '∞' : monthlyReportLimit}</span>
              </p>
              <p className="text-sm font-semibold text-slate-700">
                {reportsRemaining} {locale === 'zh' ? '剩余' : 'left'}
              </p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-amber-500 h-2.5 rounded-full"
                style={{ width: `${Math.min(100, reportUsagePercentage)}%` }}
              ></div>
            </div>
          </div>

          {/* Cancel Subscription Button */}
          {userData?.subscription_type && userData?.subscription_type !== 'free' && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={handleCancelSubscription}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                {locale === 'zh' ? '取消订阅' : 'Cancel Subscription'}
              </button>
            </div>
          )}
        </div>

        {/* Available Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Free Plan */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-slate-800 mb-2">
              {locale === 'zh' ? '免费计划' : 'Free Plan'}
            </h3>
            <div className="text-3xl font-bold text-slate-800 mb-4">$0</div>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center text-slate-600">
                <Check className="w-5 h-5 text-green-500 mr-2" />
                {locale === 'zh' ? '3个免费报告/月' : '3 free reports/month'}
              </li>
              <li className="flex items-center text-slate-600">
                <Check className="w-5 h-5 text-green-500 mr-2" />
                {locale === 'zh' ? '基础分析功能' : 'Basic analysis features'}
              </li>
              <li className="flex items-center text-slate-600">
                <X className="w-5 h-5 text-red-500 mr-2" />
                {locale === 'zh' ? '无高级功能' : 'No advanced features'}
              </li>
            </ul>
            {userData?.subscription_type === 'free' ? (
              <div className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-center">
                {locale === 'zh' ? '当前计划' : 'Current Plan'}
              </div>
            ) : (
              <button
                onClick={() => handleUpgrade('free')}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {locale === 'zh' ? '降级到免费' : 'Downgrade to Free'}
              </button>
            )}
          </div>

          {/* Basic Plan */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-blue-200">
            <h3 className="text-xl font-semibold text-slate-800 mb-2">
              {locale === 'zh' ? '基础计划' : 'Basic Plan'}
            </h3>
            <div className="text-3xl font-bold text-slate-800 mb-4">$4<span className="text-lg text-slate-500">/月</span></div>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center text-slate-600">
                <Check className="w-5 h-5 text-green-500 mr-2" />
                {locale === 'zh' ? '8个报告/月' : '8 reports/month'}
              </li>
              <li className="flex items-center text-slate-600">
                <Check className="w-5 h-5 text-green-500 mr-2" />
                {locale === 'zh' ? '基础分析功能' : 'Basic analysis features'}
              </li>
              <li className="flex items-center text-slate-600">
                <Check className="w-5 h-5 text-green-500 mr-2" />
                {locale === 'zh' ? '邮件支持' : 'Email support'}
              </li>
            </ul>
            {userData?.subscription_type === 'basic' ? (
              <div className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg text-center">
                {locale === 'zh' ? '当前计划' : 'Current Plan'}
              </div>
            ) : (
              <button
                onClick={() => handleUpgrade('basic')}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {locale === 'zh' ? '升级到基础' : 'Upgrade to Basic'}
              </button>
            )}
          </div>

          {/* Professional Plan */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-slate-800 mb-2">
              {locale === 'zh' ? '专业计划' : 'Professional Plan'}
            </h3>
            <div className="text-3xl font-bold text-slate-800 mb-4">$10<span className="text-lg text-slate-500">/月</span></div>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center text-slate-600">
                <Check className="w-5 h-5 text-green-500 mr-2" />
                {locale === 'zh' ? '20个报告/月' : '20 reports/month'}
              </li>
              <li className="flex items-center text-slate-600">
                <Check className="w-5 h-5 text-green-500 mr-2" />
                {locale === 'zh' ? '高级分析功能' : 'Advanced analysis features'}
              </li>
              <li className="flex items-center text-slate-600">
                <Check className="w-5 h-5 text-green-500 mr-2" />
                {locale === 'zh' ? '优先支持' : 'Priority support'}
              </li>
            </ul>
            {userData?.subscription_type === 'professional' ? (
              <div className="px-4 py-2 bg-purple-100 text-purple-600 rounded-lg text-center">
                {locale === 'zh' ? '当前计划' : 'Current Plan'}
              </div>
            ) : (
              <button
                onClick={() => handleUpgrade('professional')}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                {locale === 'zh' ? '升级到专业' : 'Upgrade to Professional'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
