'use client'

import React, { useState } from 'react'
import { Tag, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface ClientCouponInputProps {
  onCouponApplied: (coupon: {
    code: string
    discountAmount: number
    finalAmount: number
    description: string
  }) => void
  onCouponRemoved: () => void
  orderAmount: number
  locale: 'zh' | 'en'
}

interface CouponValidation {
  valid: boolean
  code?: string
  description?: string
  discount_amount?: number
  final_amount?: number
  error?: string
}

export default function ClientCouponInput({ 
  onCouponApplied, 
  onCouponRemoved, 
  orderAmount, 
  locale 
}: ClientCouponInputProps) {
  const [couponCode, setCouponCode] = useState('')
  const [isValidating, setIsValidating] = useState(false)
  const [appliedCoupon, setAppliedCoupon] = useState<CouponValidation | null>(null)

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
      if (orderAmount < 49) {
        toast.error('Order amount is below minimum requirement')
        return
      }
      
      // 计算最终金额
      const finalAmount = Math.max(0, orderAmount - coupon.discount_amount)
      
      const result = {
        valid: true,
        code: code.toUpperCase(),
        description: coupon.description,
        discount_amount: coupon.discount_amount,
        final_amount: finalAmount
      }

      if (result.valid) {
        console.log('🎯 Coupon validation successful, setting applied coupon:', result)
        setAppliedCoupon(result)
        
        console.log('🎯 Calling onCouponApplied callback...')
        try {
          onCouponApplied({
            code: result.code!,
            discountAmount: result.discount_amount!,
            finalAmount: result.final_amount!,
            description: result.description!
          })
          console.log('✅ onCouponApplied callback completed successfully')
        } catch (callbackError) {
          console.error('❌ Error in onCouponApplied callback:', callbackError)
        }
        
        toast.success(
          locale === 'zh' 
            ? `优惠券已应用！减免 $${result.discount_amount}` 
            : `Coupon applied! You save $${result.discount_amount}`
        )
      } else {
        console.log('❌ Coupon validation failed:', result.error)
        toast.error(result.error || 'Invalid coupon code')
      }
    } catch (error) {
      console.error('Coupon validation error:', error)
      toast.error(
        locale === 'zh' ? '验证优惠券时出错' : 'Error validating coupon'
      )
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
    onCouponRemoved()
    toast.success(
      locale === 'zh' ? '优惠券已移除' : 'Coupon removed'
    )
  }

  return (
    <div className="space-y-3">
      {!appliedCoupon ? (
        <div className="space-y-3">
          <div className="flex space-x-2">
            <div className="flex-1">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder={locale === 'zh' ? '输入优惠券代码' : 'Enter coupon code'}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                disabled={isValidating}
              />
            </div>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!couponCode.trim() || isValidating}
              className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isValidating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Tag className="w-4 h-4" />
              )}
              <span>
                {isValidating 
                  ? (locale === 'zh' ? '验证中...' : 'Validating...')
                  : (locale === 'zh' ? '应用' : 'Apply')
                }
              </span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-md p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800">
                  {appliedCoupon.code}
                </p>
                <p className="text-sm text-green-600">
                  {appliedCoupon.description}
                </p>
                <p className="text-sm text-green-600">
                  {locale === 'zh' 
                    ? `减免 $${appliedCoupon.discount_amount}，最终价格 $${appliedCoupon.final_amount}`
                    : `Save $${appliedCoupon.discount_amount}, Final price $${appliedCoupon.final_amount}`
                  }
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
  )
}

