'use client'

import React, { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { CreditCard, Lock, CheckCircle, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = typeof window !== 'undefined' 
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
  : null

interface StripeCheckoutProps {
  planId: string
  planName: string
  planPrice: number
  userId: string
  locale: 'zh' | 'en'
  onSuccess: () => void
  onError: (error: string) => void
  onCancel: () => void
}

function CheckoutForm({ 
  planId, 
  planName, 
  planPrice, 
  userId, 
  locale, 
  onSuccess, 
  onError, 
  onCancel 
}: StripeCheckoutProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Create checkout session
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          successUrl: `${window.location.origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/payment/cancel`,
        }),
      })

      const session = await response.json()

      if (!response.ok) {
        throw new Error(session.error || 'Failed to create checkout session')
      }

      // Redirect to Stripe Checkout
      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId: session.sessionId,
      })

      if (stripeError) {
        throw new Error(stripeError.message)
      }

    } catch (error) {
      console.error('Checkout error:', error)
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      setError(errorMessage)
      onError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Plan Summary */}
        <div className="bg-slate-50 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-slate-900">{planName}</h3>
              <p className="text-sm text-slate-600">
                {locale === 'zh' ? '月度订阅' : 'Monthly subscription'}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-slate-900">${planPrice}</div>
              <div className="text-sm text-slate-600">
                {locale === 'zh' ? '/月' : '/month'}
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Security Notice */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Lock className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-green-800 text-sm font-medium">
                {locale === 'zh' ? '安全支付' : 'Secure Payment'}
              </p>
              <p className="text-green-700 text-xs">
                {locale === 'zh' 
                  ? '您的支付信息通过Stripe安全处理，我们不会存储您的信用卡信息。'
                  : 'Your payment information is securely processed by Stripe. We do not store your credit card details.'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            type="submit"
            disabled={!stripe || isLoading}
            className="w-full bg-amber-600 text-white py-3 px-4 rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>
                  {locale === 'zh' ? '处理中...' : 'Processing...'}
                </span>
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4" />
                <span>
                  {locale === 'zh' ? '继续支付' : 'Continue to Payment'}
                </span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="w-full bg-slate-100 text-slate-700 py-3 px-4 rounded-lg hover:bg-slate-200 transition-colors font-medium"
          >
            {locale === 'zh' ? '取消' : 'Cancel'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default function StripeCheckout(props: StripeCheckoutProps) {
  if (!stripePromise) {
    return (
      <div className="max-w-md mx-auto p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto mb-4"></div>
        <p className="text-slate-600">Loading payment system...</p>
      </div>
    )
  }

  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm {...props} />
    </Elements>
  )
}
