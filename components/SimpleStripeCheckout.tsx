'use client'

import React, { useState } from 'react'
import { CreditCard, Lock, CheckCircle, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase-client'
import useAuth from '../lib/useAuth'
import ClientCouponInput from './ClientCouponInput'

interface SimpleStripeCheckoutProps {
  planId: string
  planName: string
  planPrice: number
  userId: string
  locale: 'zh' | 'en'
  onSuccess: () => void
  onError: (error: string) => void
  onCancel: () => void
}

export default function SimpleStripeCheckout({ 
  planId, 
  planName, 
  planPrice, 
  userId, 
  locale, 
  onSuccess, 
  onError, 
  onCancel 
}: SimpleStripeCheckoutProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { session, user } = useAuth()
  
  // 添加调试信息
  console.log('🔍 SimpleStripeCheckout useAuth状态:', { session: session ? '存在' : 'null', user: user ? '存在' : 'null' })
  const [error, setError] = useState<string | null>(null)
  
  // 添加调试信息
  console.log('🔍 SimpleStripeCheckout render - session:', session ? 'exists' : 'null', 'user:', user ? 'exists' : 'null')
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string
    discountAmount: number
    finalAmount: number
    description: string
  } | null>(null)

  // 添加调试用的setAppliedCoupon包装函数
  const handleCouponApplied = (coupon: {
    code: string
    discountAmount: number
    finalAmount: number
    description: string
  }) => {
    console.log('🎯 SimpleStripeCheckout received coupon:', coupon)
    setAppliedCoupon(coupon)
    console.log('✅ SimpleStripeCheckout coupon state updated')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      console.log('🚀 开始支付流程...')
      console.log('🎯 当前appliedCoupon状态:', appliedCoupon)
      console.log('🎯 最终价格:', finalPrice)
      
      // 直接使用传入的userId，不依赖session检查
      console.log('🔄 使用传入的userId进行支付:', userId)
      
      if (!userId) {
        console.error('❌ 认证失败: 没有用户ID')
        throw new Error('Authentication required. Please log in again.')
      }
      
      console.log('✅ 使用用户ID进行支付:', userId)

      // 准备请求数据
      const requestData = {
        planId,
        successUrl: `${window.location.origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/payment/cancel`,
        couponCode: appliedCoupon?.code,
      }
      console.log('🎯 发送到API的数据:', requestData)

      // Create checkout session using cookies only (no Authorization header needed)
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // 确保cookies被发送
        body: JSON.stringify(requestData),
      })

      console.log('🎯 API响应状态:', response.status)

      const checkoutSession = await response.json()
      console.log('🎯 API响应数据:', checkoutSession)

      if (!response.ok) {
        console.error('❌ API错误响应:', checkoutSession)
        throw new Error(checkoutSession.error || 'Failed to create checkout session')
      }

      console.log('✅ Checkout session created:', checkoutSession.sessionId)
      console.log('🎯 Checkout URL:', checkoutSession.url)

      // Redirect to Stripe Checkout using window.location
      if (checkoutSession.url) {
        console.log('🔄 重定向到Stripe支付页面...')
        window.location.href = checkoutSession.url
      } else {
        throw new Error('No checkout URL received')
      }

    } catch (error) {
      console.error('❌ 支付错误:', error)
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      setError(errorMessage)
      onError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const finalPrice = appliedCoupon ? appliedCoupon.finalAmount : planPrice

  return (
    <div className="max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Plan Summary */}
        <div className="bg-slate-50 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-slate-900">{planName}</h3>
              <p className="text-sm text-slate-600">
                {locale === 'zh' ? '每月订阅' : 'Monthly subscription'}
              </p>
            </div>
            <div className="text-right">
              {appliedCoupon ? (
                <div>
                  <div className="text-sm text-slate-500 line-through">${planPrice}</div>
                  <div className="text-lg font-bold text-green-600">${finalPrice}</div>
                  <div className="text-xs text-green-600">
                    {locale === 'zh' ? `节省 $${appliedCoupon.discountAmount}` : `Save $${appliedCoupon.discountAmount}`}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {locale === 'zh' ? `优惠券: ${appliedCoupon.code}` : `Coupon: ${appliedCoupon.code}`}
                  </div>
                </div>
              ) : (
                <div className="text-lg font-bold text-slate-900">${planPrice}</div>
              )}
            </div>
          </div>
        </div>

        {/* Coupon Input */}
        <div>
          <h4 className="text-sm font-medium text-slate-700 mb-2">
            {locale === 'zh' ? '优惠券' : 'Coupon Code'}
          </h4>
          <ClientCouponInput
            onCouponApplied={handleCouponApplied}
            onCouponRemoved={() => setAppliedCoupon(null)}
            orderAmount={planPrice}
            locale={locale}
          />
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  {locale === 'zh' ? '支付错误' : 'Payment Error'}
                </h3>
                <div className="mt-1 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center items-center px-4 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {locale === 'zh' ? '处理中...' : 'Processing...'}
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4 mr-2" />
              {locale === 'zh' ? `支付 $${finalPrice}` : `Pay $${finalPrice}`}
            </>
          )}
        </button>

        {/* Security Notice */}
        <div className="flex items-center justify-center text-xs text-slate-500">
          <Lock className="h-3 w-3 mr-1" />
          {locale === 'zh' ? '安全支付，由Stripe提供支持' : 'Secure payment powered by Stripe'}
        </div>

        {/* Cancel Button */}
        <button
          type="button"
          onClick={onCancel}
          className="w-full text-sm text-slate-500 hover:text-slate-700"
        >
          {locale === 'zh' ? '取消' : 'Cancel'}
        </button>
      </form>
    </div>
  )
}
