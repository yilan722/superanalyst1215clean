'use client'

import React, { useState } from 'react'
import { useAuth } from '../../lib/useAuth'
import ClientCouponInput from '../../components/ClientCouponInput'

export default function TestCouponFixed() {
  const { user, loading } = useAuth()
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string
    discountAmount: number
    finalAmount: number
    description: string
  } | null>(null)

  const planPrice = 49

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
            Coupon功能修复测试
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
                    <div className="text-lg font-bold text-green-600">${appliedCoupon.finalAmount}</div>
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
            <ClientCouponInput
              onCouponApplied={setAppliedCoupon}
              onCouponRemoved={() => setAppliedCoupon(null)}
              orderAmount={planPrice}
              locale="zh"
            />
          </div>

          {/* 支付按钮 */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
            <button
              className="w-full flex justify-center items-center px-4 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              💳 支付 ${appliedCoupon ? appliedCoupon.finalAmount : planPrice}
            </button>
          </div>

          {/* 测试说明 */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-yellow-900 mb-4">测试说明</h2>
            <div className="space-y-2 text-sm text-yellow-800">
              <p>1. 输入以下优惠券代码进行测试：</p>
              <ul className="ml-4 space-y-1">
                <li>• WELCOME20 - 减免$20，最终价格$29</li>
                <li>• LIUYILAN20 - 减免$20，最终价格$29</li>
                <li>• LIUYILAN45A - 减免$45，最终价格$4</li>
                <li>• LIUYILAN45B - 减免$45，最终价格$4</li>
                <li>• LIUYILAN45C - 减免$45，最终价格$4</li>
              </ul>
              <p>2. 点击"应用"按钮</p>
              <p>3. 观察价格是否正确更新</p>
              <p>4. 确认不会跳转到主页</p>
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
