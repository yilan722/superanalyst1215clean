'use client'

import React, { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { CreditCard, CheckCircle, AlertCircle, Zap, TrendingUp, Crown } from 'lucide-react'

// Initialize Stripe
const stripePromise = typeof window !== 'undefined' 
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
  : null

// Test plans
const TEST_PLANS = {
  basic: {
    id: 'basic',
    name: 'Basic Plan',
    description: 'Perfect for individual investors',
    price: 49,
    icon: <Zap className="w-6 h-6" />,
    features: ['5 reports per month', 'Basic analysis features', 'Email support']
  },
  professional: {
    id: 'professional',
    name: 'Professional Plan',
    description: 'Ideal for active traders and analysts',
    price: 299,
    icon: <TrendingUp className="w-6 h-6" />,
    features: ['30 reports per month', 'Advanced analysis tools', 'Priority support']
  },
  business: {
    id: 'business',
    name: 'Business Plan',
    description: 'Comprehensive solution for teams',
    price: 599,
    icon: <Crown className="w-6 h-6" />,
    features: ['Unlimited reports', 'All analysis features', 'Dedicated support']
  }
}

function CheckoutForm({ planId, onSuccess, onError }: { planId: string, onSuccess: () => void, onError: (error: string) => void }) {
  const stripe = useStripe()
  const elements = useElements()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const plan = TEST_PLANS[planId as keyof typeof TEST_PLANS]

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
              <h3 className="font-semibold text-slate-900">{plan.name}</h3>
              <p className="text-sm text-slate-600">Monthly subscription</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-slate-900">${plan.price}</div>
              <div className="text-sm text-slate-600">/month</div>
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
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-green-800 text-sm font-medium">Secure Payment</p>
              <p className="text-green-700 text-xs">
                Your payment information is securely processed by Stripe.
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
                <span>Processing...</span>
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4" />
                <span>Continue to Payment</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default function TestStripePage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [showCheckout, setShowCheckout] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId)
    setShowCheckout(true)
    setMessage(null)
  }

  const handleSuccess = () => {
    setMessage('Payment successful! Your subscription has been activated.')
    setShowCheckout(false)
  }

  const handleError = (error: string) => {
    setMessage(`Payment failed: ${error}`)
    setShowCheckout(false)
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Stripe Integration Test
          </h1>
          <p className="text-xl text-slate-600">
            Test the Stripe payment integration with our subscription plans
          </p>
        </div>

        {/* Message Display */}
        {message && (
          <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800">{message}</p>
          </div>
        )}

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {Object.values(TEST_PLANS).map((plan) => (
            <div
              key={plan.id}
              className="bg-white rounded-lg shadow-lg p-6 border border-slate-200 hover:shadow-xl transition-shadow"
            >
              <div className="text-center mb-6">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
                    {plan.icon}
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                <p className="text-slate-600 mb-4">{plan.description}</p>
                <div className="text-4xl font-bold text-slate-900 mb-2">
                  ${plan.price}
                  <span className="text-lg font-normal text-slate-600">/month</span>
                </div>
              </div>

              <div className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-slate-600">{feature}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handlePlanSelect(plan.id)}
                className="w-full bg-amber-600 text-white py-3 px-4 rounded-lg hover:bg-amber-700 transition-colors font-medium"
              >
                Test {plan.name}
              </button>
            </div>
          ))}
        </div>

        {/* Checkout Form */}
        {showCheckout && selectedPlan && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  Complete Payment
                </h2>
                <p className="text-slate-600">
                  You will be redirected to Stripe Checkout to complete your payment
                </p>
              </div>

              {stripePromise ? (
                <Elements stripe={stripePromise}>
                  <CheckoutForm
                    planId={selectedPlan}
                    onSuccess={handleSuccess}
                    onError={handleError}
                  />
                </Elements>
              ) : (
                <div className="text-center p-6">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto mb-4"></div>
                  <p className="text-slate-600">Loading payment system...</p>
                </div>
              )}

              <div className="mt-6 text-center">
                <button
                  onClick={() => setShowCheckout(false)}
                  className="text-slate-600 hover:text-slate-800 underline"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-12 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Test Instructions</h2>
          <div className="space-y-4 text-slate-600">
            <p>1. Click on any plan to start the payment process</p>
            <p>2. You will be redirected to Stripe Checkout</p>
            <p>3. Use Stripe test card: 4242 4242 4242 4242</p>
            <p>4. Use any future expiry date and any CVC</p>
            <p>5. Complete the payment to test the full flow</p>
            <p>6. Check the webhook logs in Stripe Dashboard</p>
          </div>
        </div>
      </div>
    </div>
  )
}

