'use client'

import React, { useState } from 'react'
import ClientCouponInput from '../../components/ClientCouponInput'

export default function TestCouponUI() {
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string
    discountAmount: number
    finalAmount: number
    description: string
  } | null>(null)

  const planPrice = 49

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Coupon UI 测试
          </h1>

          {/* 价格显示 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-blue-900 mb-4">价格信息</h2>
            <div className="space-y-2">
              <p className="text-blue-800">原价: ${planPrice}</p>
              {appliedCoupon ? (
                <div>
                  <p className="text-green-600">优惠券: {appliedCoupon.code}</p>
                  <p className="text-green-600">减免: ${appliedCoupon.discountAmount}</p>
                  <p className="text-green-600 font-bold">最终价格: ${appliedCoupon.finalAmount}</p>
                </div>
              ) : (
                <p className="text-blue-800">最终价格: ${planPrice}</p>
              )}
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

          {/* 测试按钮 */}
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
              <p>4. 如果价格没有更新，说明coupon验证有问题</p>
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
