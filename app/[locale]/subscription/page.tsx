'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { type Locale } from '@/app/services/i18n'
import { getTranslation } from '@/app/services/translations'
import { useAuthContext } from '@/app/services/auth-context'
import { SubscriptionPageService, type SubscriptionStatus, type SubscriptionMetrics } from '@/app/services/subscription-page-service'
import { type UserWithSubscription } from '@/app/services/database/user-service'
import { CreditCard, Check, X, Loader2, AlertCircle, Zap, Star, Crown, TrendingUp, FileText, Clock, Headphones, Users, Wrench, ArrowLeft } from 'lucide-react'

interface SubscriptionPageProps {
  params: {
    locale: Locale
  }
}

export default function SubscriptionPage({ params }: SubscriptionPageProps) {
  const { locale } = params
  const router = useRouter()
  const { user: authUser, loading: authLoading } = useAuthContext()
  const [userData, setUserData] = useState<UserWithSubscription | null>(null)
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null)
  const [subscriptionMetrics, setSubscriptionMetrics] = useState<SubscriptionMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    console.log('🔍 订阅页面认证检查:', { user: authUser?.id, loading: authLoading })
    
    // 如果还在加载中，等待
    if (authLoading) {
      console.log('⏳ 认证状态加载中，等待...')
      return
    }
    
    // 如果加载完成但没有用户，重定向
    if (!authUser) {
      console.log('❌ 用户未认证，重定向到主页')
      router.push(`/${locale}`)
      return
    }
    
    // 用户已认证，获取数据
    console.log('✅ 用户已认证，获取用户数据')
    fetchUserData()
  }, [authUser, authLoading, locale, router])

  const fetchUserData = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const data = await SubscriptionPageService.fetchUserSubscriptionData(authUser?.id!)
      
      if (data) {
        setUserData(data)
        
        // Calculate subscription status and metrics
        const status = await SubscriptionPageService.getSubscriptionStatus(data, locale)
        const metrics = await SubscriptionPageService.calculateSubscriptionMetrics(data)
        
        setSubscriptionStatus(status)
        setSubscriptionMetrics(metrics)
      } else {
        setError(locale === 'zh' ? '加载用户数据失败' : 'Failed to load user data')
        setUserData(null)
        setSubscriptionStatus(null)
        setSubscriptionMetrics(null)
      }
    } catch (err) {
      setError(locale === 'zh' ? '加载用户数据失败' : 'Failed to load user data')
      console.error('Unexpected error fetching user data:', err)
      setUserData(null)
      setSubscriptionStatus(null)
      setSubscriptionMetrics(null)
    } finally {
      setIsLoading(false)
    }
  }

  // Get subscription tier details for display
  const subscriptionTierDetails = SubscriptionPageService.getSubscriptionTierDetails(userData)

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
      const result = await SubscriptionPageService.cancelSubscription(userData.subscription_id.toString())
      
      if (result.success) {
        alert(locale === 'zh' ? '订阅已成功取消' : 'Subscription cancelled successfully')
        // Refresh user data
        await fetchUserData()
      } else {
        alert(locale === 'zh' ? `取消订阅失败: ${result.error}` : `Failed to cancel subscription: ${result.error}`)
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

  // 获取订阅等级的数字值
  const getSubscriptionTierValue = (tierName: string) => {
    const tierValues: { [key: string]: number } = {
      'free': 0,
      'basic': 1,
      'pro': 2,
      'professional': 2,
      'business': 3,
      'enterprise': 4
    }
    return tierValues[tierName.toLowerCase()] || 0
  }

  // 获取当前用户的订阅等级值
  const getCurrentUserTierValue = () => {
    if (!userData) return 0
    const currentTier = userData?.subscription_tiers?.name?.toLowerCase()
    return getSubscriptionTierValue(currentTier || 'free')
  }

  const currentUserTierValue = getCurrentUserTierValue()

  const plans = [
    {
      id: 'free',
      name: 'Free Trial',
      icon: FileText,
      price: 'Free',
      reportsPerMonth: 1,
      reportsPerDay: 0.03,
      totalReports: 1,
      averageCost: null,
      additionalCost: null,
      features: [
        'AI-Driven Deep Analysis',
        'Real-time Market Data'
      ],
      isCurrent: !userData?.subscription_id || userData?.subscription_tiers?.name?.toLowerCase() === 'free',
      color: 'slate'
    },
    {
      id: 'basic',
      name: 'Basic',
      icon: Zap,
      price: '$49',
      period: '/month',
      reportsPerMonth: 8,
      reportsPerDay: 0.3,
      totalReports: 8,
      averageCost: '$6.13',
      additionalCost: '$8.13',
      features: [
        'AI-Driven Deep Analysis',
        'Real-time Market Data'
      ],
      isCurrent: userData?.subscription_tiers?.name?.toLowerCase() === 'basic',
      color: 'blue'
    },
    {
      id: 'professional',
      name: 'Professional',
      icon: Star,
      price: '$299',
      period: '/month',
      reportsPerMonth: 60,
      reportsPerDay: 2,
      totalReports: 60,
      averageCost: '$4.98',
      additionalCost: '$6.98',
      features: [
        'AI-Driven Deep Analysis',
        'Real-time Market Data',
        'Priority Customer Support'
      ],
      isCurrent: userData?.subscription_tiers?.name?.toLowerCase() === 'pro',
      color: 'purple',
      isBestValue: true
    },
    {
      id: 'business',
      name: 'Business',
      icon: Crown,
      price: '$599',
      period: '/month',
      reportsPerMonth: 140,
      reportsPerDay: 4.7,
      totalReports: 140,
      averageCost: '$4.28',
      additionalCost: '$6.28',
      features: [
        'AI-Driven Deep Analysis',
        'Real-time Market Data',
        'Priority Customer Support',
        'API Access / Dedicated Account Manager'
      ],
      isCurrent: userData?.subscription_tiers?.name?.toLowerCase() === 'business',
      color: 'amber'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      icon: TrendingUp,
      price: 'Free',
      period: '',
      reportsPerMonth: null,
      reportsPerDay: null,
      totalReports: null,
      averageCost: null,
      additionalCost: null,
      features: [
        'AI-Driven Deep Analysis',
        'Real-time Market Data',
        'Priority Customer Support',
        'API Access / Dedicated Account Manager',
        'Technical Analysis VIP Consulting'
      ],
      isCurrent: userData?.subscription_tiers?.name?.toLowerCase() === 'enterprise',
      color: 'emerald',
      isCustom: true
    }
  ]

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
                {locale === 'zh' ? '订阅管理' : 'Subscription'}
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
        {/* Current Subscription Status */}
        {userData && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-slate-700 mb-4">
              {locale === 'zh' ? '当前订阅状态' : 'Current Subscription Status'}
            </h2>
            
            <div className="flex items-center space-x-4 mb-6">
              <div className={`px-4 py-2 rounded-full ${subscriptionStatus?.bgColor || 'bg-slate-100'}`}>
                <span className={`font-semibold ${subscriptionStatus?.color || 'text-slate-500'}`}>
                  {subscriptionStatus?.name || (locale === 'zh' ? '加载中...' : 'Loading...')}
                </span>
              </div>
              <p className="text-slate-600">{subscriptionStatus?.description || ''}</p>
            </div>

            {/* Subscription Tier Details - Only show for active subscriptions */}
            {subscriptionMetrics?.isSubscriptionActive && subscriptionTierDetails && (
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold text-slate-700 mb-3">
                  {locale === 'zh' ? '订阅详情' : 'Subscription Details'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-600">
                      {locale === 'zh' ? '每月报告限制' : 'Monthly Report Limit'}
                    </p>
                    <p className="font-semibold text-slate-800">
                      {subscriptionTierDetails.monthlyReportLimit }
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">
                      {locale === 'zh' ? '月费' : 'Monthly Price'}
                    </p>
                    <p className="font-semibold text-slate-800">
                      ${subscriptionTierDetails.priceMonthly}
                    </p>
                  </div>
                </div>
                {subscriptionTierDetails.subscriptionEnd && (
                  <div className="mt-4 pt-4 border-t border-blue-200">
                    <p className="text-sm text-slate-600">
                      {locale === 'zh' ? '订阅到期时间' : 'Subscription Expires'}
                    </p>
                    <p className="font-semibold text-slate-800">
                      {new Date(subscriptionTierDetails.subscriptionEnd).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Report Usage */}
            <div className="bg-gray-100 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm text-slate-600">
                  {locale === 'zh' ? '已使用报告' : 'Reports Used'}:{' '}
                  <span className="font-semibold">{subscriptionMetrics?.totalReportsUsed || 0}</span> /{' '}
                  <span className="font-semibold">
                    {subscriptionMetrics?.monthlyReportLimit || 0}
                  </span>
                </p>
                <p className="text-sm font-semibold text-slate-700">
                  {subscriptionMetrics?.reportsRemaining || 0} {locale === 'zh' ? '剩余' : 'left'}
                </p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-amber-500 h-2.5 rounded-full"
                  style={{ width: `${Math.min(100, subscriptionMetrics?.reportUsagePercentage || 0)}%` }}
                ></div>
              </div>
            </div>

            {/* Cancel Subscription Button */}
            {subscriptionMetrics?.isSubscriptionActive && subscriptionTierDetails && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={handleCancelSubscription}
                  className="px-3 py-1.5 bg-gray-400 text-white text-xs rounded-md hover:bg-gray-500 transition-colors"
                >
                  {locale === 'zh' ? '取消订阅' : 'Cancel Subscription'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Subscription Plans Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Free Trial
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Basic
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Professional
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Business
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Enterprise
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {/* Plan Names and Icons */}
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Plan Details
                  </td>
                  {plans.map((plan) => {
                    const IconComponent = plan.icon
                    return (
                      <td key={plan.id} className={`px-6 py-4 text-center ${plan.isCurrent ? 'bg-yellow-50 border-2 border-yellow-300' : ''}`}>
                        <div className="flex flex-col items-center">
                          <IconComponent className={`w-8 h-8 mb-2 ${plan.isCurrent ? 'text-yellow-600' : 'text-gray-600'}`} />
                          <div className={`text-lg font-semibold ${plan.isCurrent ? 'text-yellow-800' : 'text-gray-900'}`}>{plan.name}</div>
                          {plan.isBestValue && (
                            <span className="inline-block px-2 py-1 text-xs font-semibold text-purple-600 bg-purple-100 rounded-full mt-1">
                              Best Value
                            </span>
                          )}
                        </div>
                      </td>
                    )
                  })}
                </tr>

                {/* Pricing */}
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Price
                  </td>
                  {plans.map((plan) => (
                    <td key={plan.id} className={`px-6 py-4 text-center ${plan.isCurrent ? 'bg-yellow-50 border-2 border-yellow-300' : ''}`}>
                      <div className={`text-2xl font-bold ${plan.isCurrent ? 'text-yellow-800' : 'text-gray-900'}`}>
                        {plan.price}
                        {plan.period && <span className={`text-sm ${plan.isCurrent ? 'text-yellow-600' : 'text-gray-500'}`}>{plan.period}</span>}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Reports per Month */}
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Reports per Month
                  </td>
                  {plans.map((plan) => (
                    <td key={plan.id} className={`px-6 py-4 text-center ${plan.isCurrent ? 'bg-yellow-50 border-2 border-yellow-300' : ''}`}>
                      <div className={`text-lg font-semibold ${plan.isCurrent ? 'text-yellow-800' : 'text-gray-900'}`}>
                        {plan.reportsPerMonth ? `${plan.reportsPerMonth} Reports per Month` : 'Custom'}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Reports per Day */}
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Reports per Day
                  </td>
                  {plans.map((plan) => (
                    <td key={plan.id} className={`px-6 py-4 text-center ${plan.isCurrent ? 'bg-yellow-50 border-2 border-yellow-300' : ''}`}>
                      <div className={`text-sm ${plan.isCurrent ? 'text-yellow-700' : 'text-gray-600'}`}>
                        {plan.reportsPerDay ? `${plan.reportsPerDay} | Total: ${plan.totalReports}` : 'Custom'}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Average Cost */}
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Average Cost
                  </td>
                  {plans.map((plan) => (
                    <td key={plan.id} className={`px-6 py-4 text-center ${plan.isCurrent ? 'bg-yellow-50 border-2 border-yellow-300' : ''}`}>
                      <div className={`text-sm ${plan.isCurrent ? 'text-yellow-700' : 'text-gray-600'}`}>
                        {plan.averageCost ? `Average Cost: ${plan.averageCost}/篇` : '-'}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Additional Purchase */}
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Additional Purchase
                  </td>
                  {plans.map((plan) => (
                    <td key={plan.id} className={`px-6 py-4 text-center ${plan.isCurrent ? 'bg-yellow-50 border-2 border-yellow-300' : ''}`}>
                      <div className={`text-sm ${plan.isCurrent ? 'text-yellow-700' : 'text-gray-600'}`}>
                        {plan.additionalCost ? `Additional Purchase: ${plan.additionalCost}/篇` : '-'}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Features */}
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Features
                  </td>
                  {plans.map((plan) => (
                    <td key={plan.id} className={`px-6 py-4 text-center ${plan.isCurrent ? 'bg-yellow-50 border-2 border-yellow-300' : ''}`}>
                      <div className="space-y-1">
                        {plan.features.map((feature, index) => (
                          <div key={index} className={`flex items-center justify-center text-sm ${plan.isCurrent ? 'text-yellow-700' : 'text-gray-600'}`}>
                            <Check className={`w-4 h-4 mr-1 ${plan.isCurrent ? 'text-yellow-600' : 'text-green-500'}`} />
                            {feature}
                          </div>
                        ))}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Action Buttons */}
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Action
                  </td>
                  {plans.map((plan) => {
                    const planTierValue = getSubscriptionTierValue(plan.id)
                    const isLowerTier = planTierValue < currentUserTierValue
                    const isDisabled = isLowerTier && !plan.isCurrent
                    
                    return (
                      <td key={plan.id} className={`px-6 py-4 text-center ${plan.isCurrent ? 'bg-yellow-50 border-2 border-yellow-300' : ''}`}>
                        {plan.isCurrent ? (
                          <div className="px-4 py-2 bg-green-100 text-green-600 rounded-lg text-center text-sm font-semibold">
                            Current Plan
                          </div>
                        ) : (
                          <button
                            onClick={() => !isDisabled && handleUpgrade(plan.id)}
                            disabled={isDisabled}
                            className={`px-4 py-2 rounded-lg transition-colors text-sm font-semibold ${
                              isDisabled
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-yellow-500 text-black hover:bg-yellow-600'
                            }`}
                            title={isDisabled ? 'You already have a higher tier subscription' : ''}
                          >
                            {isDisabled ? 'Downgrade' : 'Upgrade'}
                          </button>
                        )}
                      </td>
                    )
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
