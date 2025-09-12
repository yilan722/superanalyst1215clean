'use client'

import React, { useState } from 'react'
import { useAuth } from '../../lib/useAuth'
import SubscriptionModal from '../../components/SubscriptionModal'
import { Locale } from '../../lib/i18n'

export default function TestPaymentFlowComplete() {
  const { user, loading } = useAuth()
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">请先登录</h1>
          <p className="text-gray-600">需要登录才能测试支付流程</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            完整支付流程测试
          </h1>

          {/* 用户信息 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">用户信息</h2>
            <p className="text-blue-800">邮箱: {user.email}</p>
            <p className="text-blue-800">用户ID: {user.id}</p>
          </div>

          {/* 测试说明 */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
            <h2 className="text-lg font-semibold text-yellow-900 mb-2">测试步骤</h2>
            <ol className="text-yellow-800 space-y-2">
              <li>1. 点击下面的"打开订阅模态框"按钮</li>
              <li>2. 选择一个付费计划（Basic Plan $49/月 或 Pro Plan $99/月）</li>
              <li>3. 确认用户协议</li>
              <li>4. 在支付页面输入优惠券码：<code className="bg-yellow-200 px-2 py-1 rounded">LIUYILAN45A</code></li>
              <li>5. 点击应用优惠券，应该会显示折扣后的价格</li>
              <li>6. 点击支付按钮，应该会跳转到Stripe支付页面</li>
            </ol>
          </div>

          {/* 测试按钮 */}
          <div className="text-center">
            <button
              onClick={() => setShowSubscriptionModal(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              打开订阅模态框
            </button>
          </div>

          {/* 订阅模态框 */}
          <SubscriptionModal
            isOpen={showSubscriptionModal}
            onClose={() => setShowSubscriptionModal(false)}
            userId={user.id}
            locale="zh" as Locale
          />
        </div>
      </div>
    </div>
  )
}
