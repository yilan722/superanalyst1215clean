'use client'

import React, { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase-client'
import { signOut } from '../../lib/supabase-auth'

export default function DebugSessionPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [testResults, setTestResults] = useState<{[key: string]: any}>({})

  useEffect(() => {
    async function checkSession() {
      try {
        // Check current user
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        console.log('User data:', user)
        console.log('User error:', userError)
        setUser(user)
        
        if (userError) {
          setError(userError.message)
        }

        // Test session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        console.log('Session data:', session)
        console.log('Session error:', sessionError)

        // Test payment API
        try {
          const response = await fetch('/api/stripe/create-checkout-session', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session?.access_token}`,
            },
            body: JSON.stringify({
              planId: 'basic',
              successUrl: 'https://example.com/success',
              cancelUrl: 'https://example.com/cancel'
            }),
          })
          const data = await response.json()
          console.log('Payment API response:', data)
          setTestResults(prev => ({ ...prev, payment: { status: response.status, data } }))
        } catch (apiError) {
          console.error('Payment API error:', apiError)
          setTestResults(prev => ({ ...prev, payment: { error: apiError instanceof Error ? apiError.message : 'Unknown error' } }))
        }

      } catch (err) {
        console.error('Session check error:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    checkSession()
  }, [])

  const handleLogout = async () => {
    try {
      console.log('Testing logout...')
      await signOut()
      console.log('Logout successful')
      window.location.reload()
    } catch (error) {
      console.error('Logout error:', error)
      setError(error instanceof Error ? error.message : 'Logout failed')
    }
  }

  if (loading) {
    return <div className="p-8 text-center">Loading session status...</div>
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Session Debug</h1>
      
      <div className="space-y-6">
        {/* User Status */}
        <div className="bg-white border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-3">User Status</h2>
          {user ? (
            <div className="space-y-2">
              <p><strong>ID:</strong> {user.id}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Created:</strong> {user.created_at}</p>
              <div className="text-green-600 font-medium">✅ User is authenticated</div>
            </div>
          ) : (
            <div className="text-red-600 font-medium">❌ No user found</div>
          )}
          {error && (
            <div className="text-red-600 mt-2">Error: {error}</div>
          )}
        </div>

        {/* Payment Test */}
        <div className="bg-white border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-3">Payment API Test</h2>
          {testResults.payment ? (
            <div className="space-y-2">
              <p><strong>Status:</strong> {testResults.payment.status || 'N/A'}</p>
              <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
                {JSON.stringify(testResults.payment.data || testResults.payment.error, null, 2)}
              </pre>
            </div>
          ) : (
            <div>Loading payment test...</div>
          )}
        </div>

        {/* Actions */}
        <div className="bg-white border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-3">Actions</h2>
          <div className="space-x-4">
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Test Logout
            </button>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
