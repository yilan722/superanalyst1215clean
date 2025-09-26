'use client'

import React, { useState, useEffect } from 'react'
import { type Locale } from '@/app/services/i18n'
import { useAuthContext } from '@/app/services/auth-context'
import { supabase } from '@/app/services/database/supabase-client'
import { RefreshCw, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'

interface DebugSubscriptionPageProps {
  params: {
    locale: Locale
  }
}

export default function DebugSubscriptionPage({ params }: DebugSubscriptionPageProps) {
  const { locale } = params
  const { user, refreshUserData } = useAuthContext()
  const [webhookData, setWebhookData] = useState<any>(null)
  const [userData, setUserData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchWebhookData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/debug-webhook')
      const data = await response.json()
      setWebhookData(data)
    } catch (err) {
      setError('Failed to fetch webhook data')
      console.error('Error fetching webhook data:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchUserData = async () => {
    if (!user?.id) return
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          subscription_tiers!subscription_id(
            id,
            name,
            monthly_report_limit,
            price_monthly,
            features
          )
        `)
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Error fetching user data:', error)
        setUserData(null)
      } else {
        setUserData(data)
      }
    } catch (err) {
      console.error('Error fetching user data:', err)
      setUserData(null)
    }
  }

  const updateSubscription = async (planId: string) => {
    if (!user?.email) {
      alert('User email not found')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/manual-subscription-update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          planId: planId
        })
      })

      const data = await response.json()
      
      if (data.success) {
        alert('Subscription updated successfully!')
        await fetchUserData()
        await refreshUserData()
      } else {
        alert('Failed to update subscription: ' + data.error)
      }
    } catch (err) {
      alert('Error updating subscription: ' + err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchWebhookData()
    fetchUserData()
  }, [user])

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-500">Please log in to access this page</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-800 mb-8">
          Subscription Debug Tool
        </h1>

        {/* User Data */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-slate-700">Current User Data</h2>
            <button
              onClick={fetchUserData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
          
          {userData ? (
            <div className="bg-gray-50 rounded-lg p-4">
              <pre className="text-sm text-gray-700 overflow-auto">
                {JSON.stringify(userData, null, 2)}
              </pre>
            </div>
          ) : (
            <p className="text-gray-500">No user data found</p>
          )}
        </div>

        {/* Webhook Data */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-slate-700">Recent Webhook Events</h2>
            <button
              onClick={fetchWebhookData}
              disabled={isLoading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              <span>Refresh</span>
            </button>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-600">{error}</p>
            </div>
          )}
          
          {webhookData ? (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-slate-700 mb-2">Recent Sessions</h3>
                <pre className="text-sm text-gray-700 overflow-auto max-h-40">
                  {JSON.stringify(webhookData.recent_sessions, null, 2)}
                </pre>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-slate-700 mb-2">Recent Subscriptions</h3>
                <pre className="text-sm text-gray-700 overflow-auto max-h-40">
                  {JSON.stringify(webhookData.recent_subscriptions, null, 2)}
                </pre>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-slate-700 mb-2">Users with Subscriptions</h3>
                <pre className="text-sm text-gray-700 overflow-auto max-h-40">
                  {JSON.stringify(webhookData.users_with_subscriptions, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No webhook data available</p>
          )}
        </div>

        {/* Manual Update */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-slate-700 mb-4">Manual Subscription Update</h2>
          <p className="text-gray-600 mb-4">
            Use this to manually update your subscription for testing purposes.
          </p>
          
          <div className="flex space-x-4">
            <button
              onClick={() => updateSubscription('basic')}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              Set to Basic
            </button>
            <button
              onClick={() => updateSubscription('professional')}
              disabled={isLoading}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              Set to Professional
            </button>
            <button
              onClick={() => updateSubscription('business')}
              disabled={isLoading}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50"
            >
              Set to Business
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
