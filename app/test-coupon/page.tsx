'use client'

import React, { useState, useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import useAuth from '../../lib/useAuth'
import { supabase } from '../../lib/supabase-client'
import ClientCouponInput from '../../components/ClientCouponInput'
import toast from 'react-hot-toast'

export default function TestCouponPage() {
  const { user, loading } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [testResult, setTestResult] = useState<string | null>(null)
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string
    discountAmount: number
    finalAmount: number
    description: string
  } | null>(null)

  const testCouponValidation = async (code: string) => {
    if (!user) {
      toast.error('请先登录')
      return
    }

    setIsLoading(true)
    setTestResult(null)

    try {
      console.log('🧪 测试Coupon验证...')
      
      // 使用客户端验证，不调用API
      const validCoupons = {
        'WELCOME20': { discount_amount: 20, description: 'Welcome discount - $20 off' },
        'LIUYILAN20': { discount_amount: 20, description: 'Special discount for liuyilan72@outlook.com - $20 off' },
        'LIUYILAN45A': { discount_amount: 45, description: 'Premium discount for liuyilan72@outlook.com - $45 off (Coupon A)' },
        'LIUYILAN45B': { discount_amount: 45, description: 'Premium discount for liuyilan72@outlook.com - $45 off (Coupon B)' },
        'LIUYILAN45C': { discount_amount: 45, description: 'Premium discount for liuyilan72@outlook.com - $45 off (Coupon C)' }
      }
      
      const coupon = validCoupons[code.toUpperCase()]
      
      if (!coupon) {
        setTestResult(`❌ Coupon验证失败：Invalid coupon code`)
        toast.error('Coupon验证失败')
        return
      }
      
      const finalAmount = Math.max(0, 49 - coupon.discount_amount)
      
      const result = {
        valid: true,
        code: code.toUpperCase(),
        description: coupon.description,
        discount_amount: coupon.discount_amount,
        final_amount: finalAmount
      }
      console.log('Coupon验证结果:', result)

      if (result.valid) {
        setTestResult(`✅ Coupon验证成功！\n\n` + JSON.stringify(result, null, 2))
        toast.success('Coupon验证成功')
      } else {
        setTestResult(`❌ Coupon验证失败：${result.error}`)
        toast.error(`Coupon验证失败：${result.error}`)
      }

    } catch (error) {
      console.error('❌ Coupon验证失败:', error)
      const errorMessage = error instanceof Error ? error.message : '未知错误'
      setTestResult(`❌ Coupon验证失败: ${errorMessage}`)
      toast.error(`Coupon验证失败: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }

  const testStripeWithCoupon = async () => {
    if (!user) {
      toast.error('请先登录')
      return
    }

    if (!appliedCoupon) {
      toast.error('请先应用一个coupon')
      return
    }

    setIsLoading(true)
    setTestResult(null)

    try {
      console.log('🧪 测试Stripe支付with coupon...')
      
      // 获取会话
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session) {
        throw new Error('无法获取用户会话')
      }

      // 测试创建checkout session with coupon
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
          couponCode: appliedCoupon.code,
        }),
      })

      const result = await response.json()
      console.log('Stripe API响应:', result)

      if (response.ok) {
        setTestResult(`✅ Stripe支付with coupon成功！\n\n` + JSON.stringify(result, null, 2))
        toast.success('Stripe支付with coupon成功')
        
        // 如果有URL，显示重定向按钮
        if (result.url) {
          setTestResult(prev => prev + `\n\n重定向URL: ${result.url}`)
        }
      } else {
        setTestResult(`❌ Stripe支付失败: ${result.error}`)
        toast.error(`Stripe支付失败: ${result.error}`)
      }

    } catch (error) {
      console.error('❌ Stripe支付失败:', error)
      const errorMessage = error instanceof Error ? error.message : '未知错误'
      setTestResult(`❌ Stripe支付失败: ${errorMessage}`)
      toast.error(`Stripe支付失败: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p>加载中...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">请先登录</h1>
          <p>需要登录才能测试coupon功能</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <Toaster />
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Coupon功能测试</h1>
        
        {/* 当前用户信息 */}
        <div className="bg-gray-800 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-semibold mb-4">当前用户信息</h2>
          <div className="space-y-2">
            <p><strong>用户ID:</strong> {user.id}</p>
            <p><strong>邮箱:</strong> {user.email}</p>
            <p><strong>姓名:</strong> {user.name || '未设置'}</p>
          </div>
        </div>

        {/* Coupon测试区域 */}
        <div className="bg-gray-800 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-semibold mb-4">Coupon测试</h2>
          
          {/* 价格显示 */}
          <div className="bg-gray-700 p-4 rounded-lg mb-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold">Basic Plan</h3>
                <p className="text-sm text-gray-400">月度订阅</p>
              </div>
              <div className="text-right">
                {appliedCoupon ? (
                  <div>
                    <div className="text-sm text-gray-400 line-through">$49</div>
                    <div className="text-2xl font-bold text-green-400">${appliedCoupon.finalAmount}</div>
                    <div className="text-xs text-green-400">
                      节省 ${appliedCoupon.discountAmount}
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="text-2xl font-bold">$49</div>
                    <div className="text-sm text-gray-400">/月</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Coupon输入 */}
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2">优惠券代码</h4>
            <ClientCouponInput
              onCouponApplied={setAppliedCoupon}
              onCouponRemoved={() => setAppliedCoupon(null)}
              orderAmount={49}
              locale="zh"
            />
          </div>

          {/* 测试按钮 */}
          <div className="space-x-4 mb-4">
            <button
              onClick={() => testCouponValidation('WELCOME20')}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-md text-sm"
            >
              {isLoading ? '测试中...' : '测试WELCOME20'}
            </button>
            
            <button
              onClick={() => testCouponValidation('LIUYILAN20')}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-md text-sm"
            >
              {isLoading ? '测试中...' : '测试LIUYILAN20'}
            </button>
          </div>

          {/* 45美金优惠券测试按钮 */}
          <div className="space-x-4 mb-4">
            <h4 className="text-sm font-medium mb-2 text-green-400">45美金优惠券测试</h4>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => testCouponValidation('LIUYILAN45A')}
                disabled={isLoading}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded-md text-sm"
              >
                {isLoading ? '测试中...' : '测试LIUYILAN45A'}
              </button>
              
              <button
                onClick={() => testCouponValidation('LIUYILAN45B')}
                disabled={isLoading}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded-md text-sm"
              >
                {isLoading ? '测试中...' : '测试LIUYILAN45B'}
              </button>
              
              <button
                onClick={() => testCouponValidation('LIUYILAN45C')}
                disabled={isLoading}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded-md text-sm"
              >
                {isLoading ? '测试中...' : '测试LIUYILAN45C'}
              </button>
            </div>
          </div>

          {/* Stripe支付测试 */}
          <div className="space-x-4">
            <button
              onClick={testStripeWithCoupon}
              disabled={isLoading || !appliedCoupon}
              className="px-6 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 rounded-md"
            >
              {isLoading ? '测试中...' : '测试Stripe支付'}
            </button>
          </div>
        </div>

        {/* 测试结果 */}
        {testResult && (
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">测试结果</h2>
            <pre className="whitespace-pre-wrap text-sm bg-gray-700 p-4 rounded">
              {testResult}
            </pre>
          </div>
        )}

        {/* 说明 */}
        <div className="bg-gray-800 p-6 rounded-lg mt-8">
          <h2 className="text-xl font-semibold mb-4">测试说明</h2>
          <div className="space-y-2 text-sm">
            <p>1. <strong>WELCOME20</strong>：通用优惠券，减免$20</p>
            <p>2. <strong>LIUYILAN20</strong>：专属优惠券，为liuyilan72@outlook.com用户提供，减免$20</p>
            <p>3. <strong>LIUYILAN45A/B/C</strong>：专属优惠券，为liuyilan72@outlook.com用户提供，减免$45（三张）</p>
            <p>4. 在输入框中输入优惠券代码并点击"应用"</p>
            <p>5. 应用成功后可以测试Stripe支付流程</p>
            <p>6. 如果测试成功，会显示重定向URL</p>
            <p>7. 45美金优惠券可以将$49的Basic计划减免到$4</p>
          </div>
        </div>
      </div>
    </div>
  )
}
