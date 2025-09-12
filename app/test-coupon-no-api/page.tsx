'use client'

import React, { useState } from 'react'
import { useAuth } from '../../lib/useAuth'
import { Tag, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function TestCouponNoApi() {
  const { user, loading } = useAuth()
  const [couponCode, setCouponCode] = useState('')
  const [isValidating, setIsValidating] = useState(false)
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const planPrice = 49

  const validateCoupon = async (code: string) => {
    if (!code.trim()) return

    setIsValidating(true)
    try {
      // 完全客户端的coupon验证，不调用任何API
      const validCoupons = {
        'WELCOME20': { discount_amount: 20, description: 'Welcome discount - $20 off' },
        'LIUYILAN20': { discount_amount: 20, description: 'Special discount for liuyilan72@outlook.com - $20 off' },
        'LIUYILAN45A': { discount_amount: 45, description: 'Premium discount for liuyilan72@outlook.com - $45 off (Coupon A)' },
        'LIUYILAN45B': { discount_amount: 45, description: 'Premium discount for liuyilan72@outlook.com - $45 off (Coupon B)' },
        'LIUYILAN45C': { discount_amount: 45, description: 'Premium discount for liuyilan72@outlook.com - $45 off (Coupon C)' }
      }
      
      const coupon = validCoupons[code.toUpperCase()]
      
      if (!coupon) {
        toast.error('Invalid coupon code')
        return
      }
      
      // 检查最低订单金额
      if (planPrice < 49) {
        toast.error('Order amount is below minimum requirement')
        return
      }
      
      // 计算最终金额
      const finalAmount = Math.max(0, planPrice - coupon.discount_amount)
      
      const result = {
        valid: true,
        code: code.toUpperCase(),
        description: coupon.description,
        discount_amount: coupon.discount_amount,
        final_amount: finalAmount
      }

      if (result.valid) {
        setAppliedCoupon(result)
        toast.success(`优惠券已应用！减免 $${result.discount_amount}`)
      } else {
        toast.error(result.error || 'Invalid coupon code')
      }
    } catch (error) {
      console.error('Coupon validation error:', error)
      toast.error('验证优惠券时出错')
    } finally {
      setIsValidating(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (couponCode.trim() && !appliedCoupon) {
      validateCoupon(couponCode)
    }
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setCouponCode('')
    toast.success('优惠券已移除')
  }

  const handlePayment = async () => {
    if (!user) {
      toast.error('请先登录')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      console.log('🚀 开始支付流程...')
      
      // Get current session
      const { data: { session }, error: sessionError } = await import('../../lib/supabase-client').then(m => m.supabase.auth.getSession())
      
      if (sessionError || !session) {
        throw new Error('Authentication required. Please log in again.')
      }

      console.log('✅ 用户认证成功')

      // Create checkout session
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          planId: 'basic',
          successUrl: `${window.location.origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/payment/cancel`,
          couponCode: appliedCoupon?.code,
        }),
      })

      const checkoutSession = await response.json()

      if (!response.ok) {
        throw new Error(checkoutSession.error || 'Failed to create checkout session')
      }

      console.log('✅ Checkout session created:', checkoutSession.sessionId)

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
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const finalPrice = appliedCoupon ? appliedCoupon.finalAmount : planPrice

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">需要登录</h1>
          <p className="text-gray-600">请先登录以测试coupon功能</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            无API Coupon测试
          </h1>

          {/* 用户信息 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">用户信息</h2>
            <p className="text-blue-800">邮箱: {user.email}</p>
            <p className="text-blue-800">用户ID: {user.id}</p>
          </div>

          {/* 价格显示 */}
          <div className="bg-slate-50 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">价格信息</h2>
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-slate-900">Basic Plan</h3>
                <p className="text-sm text-slate-600">每月订阅</p>
              </div>
              <div className="text-right">
                {appliedCoupon ? (
                  <div>
                    <div className="text-sm text-slate-500 line-through">${planPrice}</div>
                    <div className="text-lg font-bold text-green-600">${finalPrice}</div>
                    <div className="text-xs text-green-600">
                      节省 ${appliedCoupon.discountAmount}
                    </div>
                  </div>
                ) : (
                  <div className="text-lg font-bold text-slate-900">${planPrice}</div>
                )}
              </div>
            </div>
          </div>

          {/* Coupon输入 */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">优惠券输入</h2>
            
            {!appliedCoupon ? (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="输入优惠券代码"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    disabled={isValidating}
                  />
                  <button
                    type="submit"
                    disabled={!couponCode.trim() || isValidating}
                    className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {isValidating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Tag className="w-4 h-4" />
                    )}
                    <span>
                      {isValidating ? '验证中...' : '应用'}
                    </span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-md p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-800">{appliedCoupon.code}</p>
                      <p className="text-sm text-green-600">{appliedCoupon.description}</p>
                      <p className="text-sm text-green-600">
                        减免 ${appliedCoupon.discountAmount}，最终价格 ${appliedCoupon.finalAmount}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    className="text-green-600 hover:text-green-800"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 错误显示 */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-8">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    支付错误
                  </h3>
                  <div className="mt-1 text-sm text-red-700">{error}</div>
                </div>
              </div>
            </div>
          )}

          {/* 支付按钮 */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
            <button
              onClick={handlePayment}
              disabled={isLoading}
              className="w-full flex justify-center items-center px-4 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  处理中...
                </>
              ) : (
                <>
                  💳 支付 ${finalPrice}
                </>
              )}
            </button>
          </div>

          {/* 测试说明 */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-yellow-900 mb-4">测试说明</h2>
            <div className="space-y-2 text-sm text-yellow-800">
              <p>1. 这是一个完全无API的测试页面</p>
              <p>2. 支持优惠券功能，可以输入以下测试代码：</p>
              <ul className="ml-4 space-y-1">
                <li>• WELCOME20 - 减免$20，最终价格$29</li>
                <li>• LIUYILAN20 - 减免$20，最终价格$29</li>
                <li>• LIUYILAN45A - 减免$45，最终价格$4</li>
                <li>• LIUYILAN45B - 减免$45，最终价格$4</li>
                <li>• LIUYILAN45C - 减免$45，最终价格$4</li>
              </ul>
              <p>3. 点击支付按钮会重定向到Stripe支付页面</p>
              <p>4. 不会跳转到主页，不会强制登出</p>
              <p>5. 完全使用客户端验证，不调用任何coupon API</p>
            </div>
          </div>

          {/* 调试信息 */}
          {appliedCoupon && (
            <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">调试信息</h3>
              <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                {JSON.stringify(appliedCoupon, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

