'use client'

import React, { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { CreditCard, Lock, CheckCircle, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '../app/services/supabase-client'
import ClientCouponInput from './ClientCouponInput'

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = typeof window !== 'undefined' && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, {
      stripeAccount: undefined,
    })
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
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string
    discountAmount: number
    finalAmount: number
    description: string
  } | null>(null)
  
  // Use the same Supabase client instance as the rest of the app
  // This will be passed as a prop from the parent component

  // Debug logging
  console.log('CheckoutForm render:', {
    stripe: !!stripe,
    elements: !!elements,
    isLoading,
    error,
    planId,
    userId
  })

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Get current session and access token
      console.log('Attempting to get Supabase session...')
      let { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      console.log('Session error:', sessionError)
      console.log('Session data:', session)
      console.log('Auth session found:', !!session)
      console.log('Access token available:', !!session?.access_token)
      
      if (sessionError) {
        console.error('Session error details:', sessionError)
        throw new Error(`Session error: ${sessionError.message}`)
      }
      
      if (!session) {
        console.log('No session found, trying to get user...')
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        console.log('User error:', userError)
        console.log('User data:', user)
        
        if (userError || !user) {
          throw new Error('Authentication required. Please log in again.')
        }
        
        // If we have a user but no session, try to refresh
        console.log('User found but no session, attempting refresh...')
        const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession()
        console.log('Refresh error:', refreshError)
        console.log('Refreshed session:', refreshedSession)
        
        if (refreshError || !refreshedSession) {
          throw new Error('Authentication required. Please log in again.')
        }
        
        // Use refreshed session
        session = refreshedSession
      }
      
      // Create checkout session
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          planId,
          successUrl: `${window.location.origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/payment/cancel`,
          couponCode: appliedCoupon?.code,
        }),
      })

      const checkoutSession = await response.json()

      if (!response.ok) {
        throw new Error(checkoutSession.error || 'Failed to create checkout session')
      }

      // Redirect to Stripe Checkout using window.location
      if (checkoutSession.url) {
        window.location.href = checkoutSession.url
      } else {
        throw new Error('No checkout URL received')
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
              {appliedCoupon ? (
                <div>
                  <div className="text-sm text-slate-500 line-through">${planPrice}</div>
                  <div className="text-2xl font-bold text-green-600">${appliedCoupon.finalAmount}</div>
                  <div className="text-xs text-green-600">
                    {locale === 'zh' ? `节省 $${appliedCoupon.discountAmount}` : `Save $${appliedCoupon.discountAmount}`}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="text-2xl font-bold text-slate-900">${planPrice}</div>
                  <div className="text-sm text-slate-600">
                    {locale === 'zh' ? '/月' : '/month'}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Coupon Input */}
        <div>
          <h4 className="text-sm font-medium text-slate-700 mb-2">
            {locale === 'zh' ? '优惠券' : 'Coupon Code'}
          </h4>
          <ClientCouponInput
            onCouponApplied={setAppliedCoupon}
            onCouponRemoved={() => setAppliedCoupon(null)}
            orderAmount={planPrice}
            locale={locale}
          />
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
            disabled={!stripe || !elements || isLoading}
            className="w-full bg-amber-600 text-white py-3 px-4 rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center space-x-2"
            onClick={() => console.log('Button clicked:', { stripe: !!stripe, elements: !!elements, isLoading })}
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
  // Debug logging
  console.log('StripeCheckout render:', {
    stripePromise: !!stripePromise,
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    props
  })

  if (!stripePromise) {
    return (
      <div className="max-w-md mx-auto p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto mb-4"></div>
        <p className="text-slate-600">Loading payment system...</p>
        <p className="text-xs text-slate-500 mt-2">
          Stripe key: {process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? 'Loaded' : 'Missing'}
        </p>
        <p className="text-xs text-red-500 mt-1">
          If this persists, please refresh the page
        </p>
      </div>
    )
  }

  return (
    <Elements 
      stripe={stripePromise}
      options={{
        appearance: {
          theme: 'stripe',
        },
      }}
    >
      <CheckoutForm {...props} />
    </Elements>
  )
}
