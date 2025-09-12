'use client'

import React, { useState } from 'react'
import { useAuth } from '../../lib/useAuth'
import SimpleStripeCheckout from '../../components/SimpleStripeCheckout'

export default function TestCouponWorking() {
  const { user, loading } = useAuth()
  const [testResult, setTestResult] = useState('')

  const handleSuccess = () => {
    setTestResult('🎉 支付成功！')
  }

  const handleError = (error: string) => {
    setTestResult(`❌ 支付失败: ${error}`)
  }

  const handleCancel = () => {
    setTestResult('🚫 用户取消支付')
  }

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
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Coupon功能工作测试
          </h1>

          {/* 用户信息 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">用户信息</h2>
            <p className="text-blue-800">邮箱: {user.email}</p>
            <p className="text-blue-800">用户ID: {user.id}</p>
          </div>

          {/* 测试结果 */}
          {testResult && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">测试结果</h2>
              <pre className="text-sm text-gray-700 whitespace-pre-wrap">{testResult}</pre>
            </div>
          )}

          {/* 支付组件 */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">
              测试支付流程
            </h2>
            
            <SimpleStripeCheckout
              planId="basic"
              planName="Basic Plan"
              planPrice={49}
              userId={user.id}
              locale="zh"
              onSuccess={handleSuccess}
              onError={handleError}
              onCancel={handleCancel}
            />
          </div>

          {/* 说明 */}
          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-yellow-900 mb-4">测试说明</h2>
            <div className="space-y-2 text-sm text-yellow-800">
              <p>1. 这是一个完全修复的支付测试页面</p>
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
              <p>5. 使用完全客户端验证，不调用任何API</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

