'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { type Locale } from '@/lib/i18n'
import { getTranslation } from '@/lib/translations'
import { useAuthContext } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase-client'
import { CreditCard, Check, X, Loader2, AlertCircle, Zap, Star, Crown, TrendingUp, FileText, Clock, Headphones, Users, Wrench } from 'lucide-react'

interface SubscriptionPageProps {
  params: {
    locale: Locale
  }
}

export default function SubscriptionPage({ params }: SubscriptionPageProps) {
  const { locale } = params
  const router = useRouter()
  const { user: authUser, loading: authLoading } = useAuthContext()
  const [userData, setUserData] = useState<any>(null)
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
      isCurrent: userData?.subscription_type === 'free' || !userData?.subscription_type,
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
      isCurrent: userData?.subscription_type === 'basic',
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
      isCurrent: userData?.subscription_type === 'professional',
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
      isCurrent: userData?.subscription_type === 'business',
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
      isCurrent: userData?.subscription_type === 'enterprise',
      color: 'emerald',
      isCustom: true
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-800 mb-4">
            SuperAnalyst - AI-Powered Pro Equity Research
          </h1>
          <p className="text-xl text-slate-600">
            Choose the perfect plan for your investment research needs
          </p>
        </div>

        {/* Current Subscription Status */}
        {userData && (
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
                      <td key={plan.id} className="px-6 py-4 text-center">
                        <div className="flex flex-col items-center">
                          <IconComponent className="w-8 h-8 text-gray-600 mb-2" />
                          <div className="text-lg font-semibold text-gray-900">{plan.name}</div>
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
                    <td key={plan.id} className="px-6 py-4 text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        {plan.price}
                        {plan.period && <span className="text-sm text-gray-500">{plan.period}</span>}
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
                    <td key={plan.id} className="px-6 py-4 text-center">
                      <div className="text-lg font-semibold text-gray-900">
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
                    <td key={plan.id} className="px-6 py-4 text-center">
                      <div className="text-sm text-gray-600">
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
                    <td key={plan.id} className="px-6 py-4 text-center">
                      <div className="text-sm text-gray-600">
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
                    <td key={plan.id} className="px-6 py-4 text-center">
                      <div className="text-sm text-gray-600">
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
                    <td key={plan.id} className="px-6 py-4 text-center">
                      <div className="space-y-1">
                        {plan.features.map((feature, index) => (
                          <div key={index} className="flex items-center justify-center text-sm text-gray-600">
                            <Check className="w-4 h-4 text-green-500 mr-1" />
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
                  {plans.map((plan) => (
                    <td key={plan.id} className="px-6 py-4 text-center">
                      {plan.isCurrent ? (
                        <div className="px-4 py-2 bg-green-100 text-green-600 rounded-lg text-center text-sm font-semibold">
                          Current Plan
                        </div>
                      ) : plan.isCustom ? (
                        <button
                          onClick={() => handleUpgrade(plan.id)}
                          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-semibold"
                        >
                          Contact Sales
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUpgrade(plan.id)}
                          className={`px-4 py-2 rounded-lg transition-colors text-sm font-semibold ${
                            plan.color === 'blue'
                              ? 'bg-blue-600 text-white hover:bg-blue-700'
                              : plan.color === 'purple'
                              ? 'bg-purple-600 text-white hover:bg-purple-700'
                              : plan.color === 'amber'
                              ? 'bg-amber-600 text-white hover:bg-amber-700'
                              : 'bg-gray-600 text-white hover:bg-gray-700'
                          }`}
                        >
                          {plan.price === 'Free' ? 'Get Started' : 'Upgrade'}
                        </button>
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
