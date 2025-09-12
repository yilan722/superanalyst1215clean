'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase-client'
import toast from 'react-hot-toast'

export default function TestCouponWithAuth() {
  const [isLoading, setIsLoading] = useState(false)
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [isAuthLoading, setIsAuthLoading] = useState(true)

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (session) {
          setUser(session.user)
        }
      } catch (error) {
        console.error('Auth check error:', error)
      } finally {
        setIsAuthLoading(false)
      }
    }

    checkAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogin = async () => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: 'liuyilan72@outlook.com',
        password: 'test123'  // You'll need to use your actual password
      })
      
      if (error) {
        // If login fails, try to sign up
        const { error: signUpError } = await supabase.auth.signUp({
          email: 'liuyilan72@outlook.com',
          password: 'test123',
          options: {
            data: {
              name: 'Test User'
            }
          }
        })
        
        if (signUpError) {
          throw signUpError
        }
        
        toast.success('Account created! Please check your email to verify.')
      } else {
        toast.success('Logged in successfully!')
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error('Login failed: ' + (error as any).message)
    } finally {
      setIsLoading(false)
    }
  }

  const validateCouponClientSide = (code: string) => {
    const validCoupons = {
      'WELCOME20': { discount_amount: 20, description: 'Welcome discount - $20 off' },
      'LIUYILAN20': { discount_amount: 20, description: 'Special discount for liuyilan72@outlook.com - $20 off' },
      'LIUYILAN45A': { discount_amount: 45, description: 'Premium discount for liuyilan72@outlook.com - $45 off (Coupon A)' },
      'LIUYILAN45B': { discount_amount: 45, description: 'Premium discount for liuyilan72@outlook.com - $45 off (Coupon B)' },
      'LIUYILAN45C': { discount_amount: 45, description: 'Premium discount for liuyilan72@outlook.com - $45 off (Coupon C)' }
    }
    
    const coupon = validCoupons[code.toUpperCase()]
    
    if (!coupon) {
      return null
    }
    
    const finalAmount = Math.max(0, 49 - coupon.discount_amount)
    
    return {
      valid: true,
      code: code.toUpperCase(),
      description: coupon.description,
      discount_amount: coupon.discount_amount,
      final_amount: finalAmount
    }
  }

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code')
      return
    }

    const result = validateCouponClientSide(couponCode)
    
    if (!result) {
      toast.error('Invalid coupon code')
      return
    }

    setAppliedCoupon(result)
    toast.success(`Coupon applied! You save $${result.discount_amount}`)
  }

  const handlePayment = async () => {
    if (!user) {
      toast.error('Please log in first')
      return
    }

    setIsLoading(true)
    
    try {
      console.log('🚀 Starting payment flow...')
      
      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session) {
        throw new Error('Authentication required. Please log in again.')
      }

      console.log('✅ User authenticated successfully')

      // Create checkout session
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          planId: 'basic',
          successUrl: `${window.location.origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/payment/cancel`,
          couponCode: appliedCoupon?.code || null,
        }),
      })

      const checkoutSession = await response.json()

      if (!response.ok) {
        throw new Error(checkoutSession.error || 'Failed to create checkout session')
      }

      console.log('✅ Checkout session created:', checkoutSession.sessionId)
      console.log('🔄 Redirecting to Stripe...')

      // Redirect to Stripe Checkout
      if (checkoutSession.url) {
        window.location.href = checkoutSession.url
      } else {
        throw new Error('No checkout URL received')
      }

    } catch (error) {
      console.error('❌ Payment error:', error)
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Coupon Test with Authentication</h1>
        
        {!user ? (
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6 mb-6">
            <h2 className="text-red-400 font-semibold mb-4">Not Logged In</h2>
            <p className="text-gray-300 mb-4">You need to log in to test the payment flow.</p>
            <button
              onClick={handleLogin}
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Logging in...' : 'Login as liuyilan72@outlook.com'}
            </button>
          </div>
        ) : (
          <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-6 mb-6">
            <h2 className="text-green-400 font-semibold mb-2">Logged In</h2>
            <p className="text-gray-300">Email: {user.email}</p>
            <p className="text-gray-300">User ID: {user.id}</p>
          </div>
        )}
        
        {user && (
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">Test Payment Flow:</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Original Price: $49.00
                </label>
              </div>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Enter coupon code (e.g., LIUYILAN45A)"
                  className="flex-1 px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                />
                <button
                  onClick={handleApplyCoupon}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Apply
                </button>
              </div>
              
              {appliedCoupon && (
                <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
                  <h3 className="text-green-400 font-semibold mb-2">Coupon Applied!</h3>
                  <div className="space-y-1 text-sm text-gray-300">
                    <p><strong>Code:</strong> {appliedCoupon.code}</p>
                    <p><strong>Description:</strong> {appliedCoupon.description}</p>
                    <p><strong>Discount:</strong> ${appliedCoupon.discount_amount}</p>
                    <p><strong>Final Amount:</strong> ${appliedCoupon.final_amount}</p>
                  </div>
                </div>
              )}
              
              <div className="pt-4">
                <button
                  onClick={handlePayment}
                  disabled={isLoading}
                  className="w-full px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Processing...' : `Pay $${appliedCoupon?.final_amount || 49}`}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
