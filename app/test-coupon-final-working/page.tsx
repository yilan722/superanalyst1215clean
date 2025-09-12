'use client'

import React, { useState } from 'react'
import ClientCouponInput from '../../components/ClientCouponInput'

export default function TestCouponFinalWorking() {
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null)

  const handleCouponApplied = (coupon: any) => {
    console.log('🎫 Coupon applied:', coupon)
    setAppliedCoupon(coupon)
  }

  const handleCouponRemoved = () => {
    console.log('🗑️ Coupon removed')
    setAppliedCoupon(null)
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-md mx-auto bg-gray-800 rounded-lg p-6">
        <h1 className="text-2xl font-bold text-white mb-6">Coupon Test - Final Working</h1>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Order Amount: $49.00
            </label>
          </div>
          
          <ClientCouponInput
            onCouponApplied={handleCouponApplied}
            onCouponRemoved={handleCouponRemoved}
            orderAmount={49}
            disabled={false}
          />
          
          {appliedCoupon && (
            <div className="mt-4 p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
              <h3 className="text-green-400 font-semibold mb-2">Coupon Applied Successfully!</h3>
              <div className="space-y-1 text-sm text-gray-300">
                <p><strong>Code:</strong> {appliedCoupon.code}</p>
                <p><strong>Description:</strong> {appliedCoupon.description}</p>
                <p><strong>Discount:</strong> ${appliedCoupon.discountAmount}</p>
                <p><strong>Final Amount:</strong> ${appliedCoupon.finalAmount}</p>
              </div>
            </div>
          )}
          
          <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
            <h3 className="text-blue-400 font-semibold mb-2">Test Instructions:</h3>
            <ol className="text-sm text-gray-300 space-y-1">
              <li>1. Try coupon code: <code className="bg-gray-700 px-1 rounded">LIUYILAN45A</code></li>
              <li>2. Try coupon code: <code className="bg-gray-700 px-1 rounded">LIUYILAN20</code></li>
              <li>3. Try invalid code: <code className="bg-gray-700 px-1 rounded">INVALID</code></li>
              <li>4. Check console for any errors</li>
              <li>5. Verify no redirect to homepage occurs</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}