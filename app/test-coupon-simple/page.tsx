'use client'

import React, { useState } from 'react'
import { useAuth } from '../../lib/useAuth'

export default function TestCouponSimple() {
  const { user, loading } = useAuth()
  const [couponCode, setCouponCode] = useState('')
  const [isValidating, setIsValidating] = useState(false)
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null)
  const [error, setError] = useState('')

  const planPrice = 49

  const validateCoupon = async () => {
    if (!couponCode.trim()) return

    setIsValidating(true)
    setError('')
    
    try {
      // 简化的coupon验证（不依赖API）
      const validCoupons = {
        'WELCOME20': { discount_amount: 20, description: 'Welcome discount - $20 off' },
        'LIUYILAN20': { discount_amount: 20, description: 'Special discount for liuyilan72@outlook.com - $20 off' },
        'LIUYILAN45A': { discount_amount: 45, description: 'Premium discount for liuyilan72@outlook.com - $45 off (Coupon A)' },
        'LIUYILAN45B': { discount_amount: 45, description: 'Premium discount for liuyilan72@outlook.com - $45 off (Coupon B)' },
        'LIUYILAN45C': { discount_amount: 45, description: 'Premium discount for liuyilan72@outlook.com - $45 off (Coupon C)' }
      }
      
      const coupon = validCoupons[couponCode.toUpperCase()]
      
      if (!coupon) {
        setError('Invalid coupon code')
        return
      }
      
      const finalAmount = Math.max(0, planPrice - coupon.discount_amount)
      
      setAppliedCoupon({
        code: couponCode.toUpperCase(),
        discountAmount: coupon.discount_amount,
        finalAmount: finalAmount,
        description: coupon.description
      })
      
    } catch (error) {
      setError('Error validating coupon')
    } finally {
      setIsValidating(false)
    }
  }

  const removeCoupon = () => {
    setAppliedCoupon(null)
    setCouponCode('')
    setError('')
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

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            简化Coupon测试
          </h1>

          {/* 用户信息 */}
          {user && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
              <h2 className="text-lg font-semibold text-blue-900 mb-2">用户信息</h2>
              <p className="text-blue-800">邮箱: {user.email}</p>
            </div>
          )}

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
              <div className="space-y-3">
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
                    onClick={validateCoupon}
                    disabled={!couponCode.trim() || isValidating}
                    className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isValidating ? '验证中...' : '应用'}
                  </button>
                </div>
                
                {error && (
                  <div className="text-red-600 text-sm">{error}</div>
                )}
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-md p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-green-800">{appliedCoupon.code}</p>
                    <p className="text-sm text-green-600">{appliedCoupon.description}</p>
                    <p className="text-sm text-green-600">
                      减免 ${appliedCoupon.discountAmount}，最终价格 ${appliedCoupon.finalAmount}
                    </p>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-green-600 hover:text-green-800"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 支付按钮 */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <button
              className="w-full flex justify-center items-center px-4 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              💳 支付 ${finalPrice}
            </button>
          </div>

          {/* 测试说明 */}
          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
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
              <p>4. 点击支付按钮查看最终价格</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

