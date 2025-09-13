'use client'

import React, { useEffect, useState, Suspense } from 'react'
import { CheckCircle, ArrowRight, Home } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

function PaymentSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [orderDetails, setOrderDetails] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const sessionId = searchParams.get('session_id')
    const orderID = searchParams.get('token')
    const PayerID = searchParams.get('PayerID')
    
    console.log('🔍 支付成功页面参数:', { sessionId, orderID, PayerID })
    
    if (sessionId) {
      // Stripe支付成功
      console.log('✅ Stripe支付成功，session_id:', sessionId)
      setOrderDetails({ sessionId, type: 'stripe' })
      
      // 触发页面刷新以更新用户订阅状态
      setTimeout(() => {
        console.log('🔄 触发页面刷新以更新订阅状态')
        window.location.href = '/en/account'
      }, 3000)
    } else if (orderID) {
      // PayPal支付成功
      console.log('✅ PayPal支付成功，orderID:', orderID)
      setOrderDetails({ orderID, PayerID, type: 'paypal' })
    }
    
    setIsLoading(false)
  }, [searchParams])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Processing payment...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {/* Success Icon */}
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>

        {/* Success Message */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Payment Successful!
        </h1>
        
        <p className="text-gray-600 mb-6">
          Thank you for your subscription! Your account has been upgraded and you now have access to premium features.
        </p>

        {/* Order Details */}
        {orderDetails && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-medium text-gray-900 mb-2">Payment Details</h3>
            <div className="text-sm text-gray-600 space-y-1">
              {orderDetails.type === 'stripe' ? (
                <p><span className="font-medium">Session ID:</span> {orderDetails.sessionId}</p>
              ) : (
                <>
                  <p><span className="font-medium">Order ID:</span> {orderDetails.orderID}</p>
                  {orderDetails.PayerID && (
                    <p><span className="font-medium">Payer ID:</span> {orderDetails.PayerID}</p>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link
            href="/en"
            className="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Home className="h-4 w-4 mr-2" />
            Go to Dashboard
          </Link>
          
          <button
            onClick={() => router.back()}
            className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowRight className="h-4 w-4 mr-2" />
            Back to Previous Page
          </button>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-xs text-gray-500">
          <p>You will receive a confirmation email shortly.</p>
          <p>If you have any questions, please contact our support team.</p>
        </div>
      </div>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  )
} 