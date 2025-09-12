'use client'

import React, { useState } from 'react'
import SimpleStripeCheckout from '../../components/SimpleStripeCheckout'

export default function TestPaymentFlow() {
  const [showCheckout, setShowCheckout] = useState(false)

  const handleSuccess = () => {
    console.log('✅ Payment successful!')
    alert('Payment successful!')
  }

  const handleError = (error: string) => {
    console.error('❌ Payment error:', error)
    alert(`Payment error: ${error}`)
  }

  const handleCancel = () => {
    console.log('❌ Payment cancelled')
    alert('Payment cancelled')
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Payment Flow Test</h1>
        
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Test Instructions:</h2>
          <ol className="text-gray-300 space-y-2">
            <li>1. Click "Start Payment Test" to open the checkout modal</li>
            <li>2. Try applying coupon code: <code className="bg-gray-700 px-2 py-1 rounded">LIUYILAN45A</code></li>
            <li>3. Verify the price shows as $4.00 (original $49 - $45 discount)</li>
            <li>4. Click "Pay Now" to proceed to Stripe</li>
            <li>5. Check console for any errors</li>
          </ol>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => setShowCheckout(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
          >
            Start Payment Test
          </button>
          
          <button
            onClick={() => window.location.href = '/'}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold"
          >
            Back to Home
          </button>
        </div>

        {showCheckout && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Payment Test</h3>
                <button
                  onClick={() => setShowCheckout(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <SimpleStripeCheckout
                planId="basic"
                planName="Basic Plan"
                planPrice={49}
                userId="test-user-id"
                locale="en"
                onSuccess={handleSuccess}
                onError={handleError}
                onCancel={handleCancel}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
