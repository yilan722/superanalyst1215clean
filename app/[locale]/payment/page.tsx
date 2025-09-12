'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { type Locale } from '@/lib/i18n'
import { useAuthContext } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase-client'
import { ArrowLeft, Loader2, AlertCircle, CreditCard, Check } from 'lucide-react'
import SimpleStripeCheckout from '@/components/SimpleStripeCheckout'

interface PaymentPageProps {
  params: {
    locale: Locale
  }
}

export default function PaymentPage({ params }: PaymentPageProps) {
  const { locale } = params
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user: authUser, loading: authLoading } = useAuthContext()
  const [userData, setUserData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

  const planDetails = {
    free: {
      name: 'Free Trial',
      price: 0,
      reports: 1,
      description: 'Perfect for trying out our service'
    },
    basic: {
      name: 'Basic',
      price: 49,
      reports: 8,
      description: 'Great for individual investors'
    },
    professional: {
      name: 'Professional',
      price: 299,
      reports: 60,
      description: 'Best value for active traders'
    },
    business: {
      name: 'Business',
      price: 599,
      reports: 140,
      description: 'Perfect for investment firms'
    },
    enterprise: {
      name: 'Enterprise',
      price: 0,
      reports: null,
      description: 'Custom solutions for large organizations'
    }
  }

  useEffect(() => {
    console.log('🔍 支付页面认证检查:', { user: authUser?.id, loading: authLoading })
    
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

  useEffect(() => {
    const plan = searchParams.get('plan')
    if (plan) {
      setSelectedPlan(plan)
      console.log('📋 选择的计划:', plan)
    }
  }, [searchParams])

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

  const handlePaymentSuccess = () => {
    console.log('✅ 支付成功，跳转到成功页面')
    router.push(`/${locale}/payment/success`)
  }

  const handlePaymentError = (error: string) => {
    console.error('❌ 支付错误:', error)
    setError(error)
  }

  const handlePaymentCancel = () => {
    console.log('🚫 支付取消，返回订阅页面')
    router.push(`/${locale}/subscription`)
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
          <button
            onClick={() => router.push(`/${locale}/subscription`)}
            className="mt-4 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            {locale === 'zh' ? '返回订阅页面' : 'Back to Subscription'}
          </button>
        </div>
      </div>
    )
  }

  if (!selectedPlan) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-500">{locale === 'zh' ? '未选择订阅计划' : 'No subscription plan selected'}</p>
          <button
            onClick={() => router.push(`/${locale}/subscription`)}
            className="mt-4 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            {locale === 'zh' ? '返回订阅页面' : 'Back to Subscription'}
          </button>
        </div>
      </div>
    )
  }

  const plan = planDetails[selectedPlan as keyof typeof planDetails]

  if (!plan) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-500">{locale === 'zh' ? '无效的订阅计划' : 'Invalid subscription plan'}</p>
          <button
            onClick={() => router.push(`/${locale}/subscription`)}
            className="mt-4 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            {locale === 'zh' ? '返回订阅页面' : 'Back to Subscription'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push(`/${locale}/subscription`)}
            className="flex items-center text-slate-600 hover:text-slate-800 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            {locale === 'zh' ? '返回订阅页面' : 'Back to Subscription'}
          </button>
          
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            {locale === 'zh' ? '完成订阅' : 'Complete Subscription'}
          </h1>
          <p className="text-slate-600">
            {locale === 'zh' ? '选择您的支付方式并完成订阅' : 'Choose your payment method and complete your subscription'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Plan Summary */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">
              {locale === 'zh' ? '订阅计划详情' : 'Subscription Plan Details'}
            </h2>
            
            <div className="border rounded-lg p-4 mb-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-slate-800">{plan.name}</h3>
                <div className="text-right">
                  <div className="text-2xl font-bold text-slate-800">
                    {plan.price === 0 ? 'Free' : `$${plan.price}`}
                    {plan.price > 0 && <span className="text-sm text-slate-500">/month</span>}
                  </div>
                </div>
              </div>
              
              <p className="text-slate-600 mb-4">{plan.description}</p>
              
              <div className="space-y-2">
                <div className="flex items-center text-slate-600">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  {plan.reports ? `${plan.reports} reports per month` : 'Unlimited reports'}
                </div>
                <div className="flex items-center text-slate-600">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  AI-Driven Deep Analysis
                </div>
                <div className="flex items-center text-slate-600">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  Real-time Market Data
                </div>
                {selectedPlan === 'professional' && (
                  <div className="flex items-center text-slate-600">
                    <Check className="w-4 h-4 text-green-500 mr-2" />
                    Priority Customer Support
                  </div>
                )}
                {selectedPlan === 'business' && (
                  <>
                    <div className="flex items-center text-slate-600">
                      <Check className="w-4 h-4 text-green-500 mr-2" />
                      Priority Customer Support
                    </div>
                    <div className="flex items-center text-slate-600">
                      <Check className="w-4 h-4 text-green-500 mr-2" />
                      API Access / Dedicated Account Manager
                    </div>
                  </>
                )}
                {selectedPlan === 'enterprise' && (
                  <>
                    <div className="flex items-center text-slate-600">
                      <Check className="w-4 h-4 text-green-500 mr-2" />
                      Priority Customer Support
                    </div>
                    <div className="flex items-center text-slate-600">
                      <Check className="w-4 h-4 text-green-500 mr-2" />
                      API Access / Dedicated Account Manager
                    </div>
                    <div className="flex items-center text-slate-600">
                      <Check className="w-4 h-4 text-green-500 mr-2" />
                      Technical Analysis VIP Consulting
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Current User Info */}
            {userData && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-slate-700 mb-2">
                  {locale === 'zh' ? '当前用户' : 'Current User'}
                </h4>
                <p className="text-slate-600">{userData.email}</p>
                <p className="text-sm text-slate-500">
                  {locale === 'zh' ? '当前计划' : 'Current Plan'}: {userData.subscription_type || 'Free'}
                </p>
              </div>
            )}
          </div>

          {/* Payment Form */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">
              {locale === 'zh' ? '支付信息' : 'Payment Information'}
            </h2>
            
            {selectedPlan === 'enterprise' ? (
              <div className="text-center py-8">
                <CreditCard className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-800 mb-2">
                  {locale === 'zh' ? '企业定制方案' : 'Enterprise Custom Solution'}
                </h3>
                <p className="text-slate-600 mb-6">
                  {locale === 'zh' 
                    ? '请联系我们的销售团队获取定制报价和解决方案。' 
                    : 'Please contact our sales team for custom pricing and solutions.'
                  }
                </p>
                <button
                  onClick={() => window.open('mailto:sales@superanalyst.com', '_blank')}
                  className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  {locale === 'zh' ? '联系销售' : 'Contact Sales'}
                </button>
              </div>
            ) : (
              <SimpleStripeCheckout
                planId={selectedPlan}
                planName={plan.name}
                planPrice={plan.price}
                userId={authUser?.id || ''}
                locale={locale}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
                onCancel={handlePaymentCancel}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
