'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase-client'

export default function TestPaymentPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [testResults, setTestResults] = useState<any>({})
  const [envStatus, setEnvStatus] = useState<any>(null)

  useEffect(() => {
    const checkUser = async () => {
      setLoading(true)
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      setUser(currentUser)
      setLoading(false)
    }
    checkUser()
  }, [])

  const testEnvironment = async () => {
    try {
      const response = await fetch('/api/simple-debug')
      const data = await response.json()
      setEnvStatus(data)
    } catch (error) {
      console.error('Environment test failed:', error)
      setEnvStatus({ error: error instanceof Error ? error.message : 'Unknown error' })
    }
  }

  const testPaymentAPI = async () => {
    if (!user) {
      setTestResults({ error: 'User not logged in' })
      return
    }

    setTestResults({ status: 'testing' })
    try {
      const session = await supabase.auth.getSession()
      if (!session.data.session) {
        throw new Error('No active session found')
      }

      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.data.session.access_token}`
        },
        body: JSON.stringify({
          planId: 'basic',
          successUrl: `${window.location.origin}/payment/success`,
          cancelUrl: `${window.location.origin}/payment/cancel`,
        }),
      })

      const data = await response.json()
      setTestResults({ 
        status: response.ok ? 'success' : 'error',
        response: data,
        statusCode: response.status
      })
    } catch (error) {
      console.error('Payment test failed:', error)
      setTestResults({ 
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Payment Integration Test</h1>
      
      {/* User Status */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h2 className="text-xl font-semibold text-blue-800 mb-2">User Authentication Status</h2>
        {user ? (
          <div className="text-blue-700">
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>User ID:</strong> {user.id}</p>
            <p><strong>Created:</strong> {new Date(user.created_at).toLocaleString()}</p>
          </div>
        ) : (
          <p className="text-red-700">Not logged in. Please log in to test payment.</p>
        )}
      </div>

      {/* Environment Status */}
      <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
        <h2 className="text-xl font-semibold text-green-800 mb-2">Environment Variables</h2>
        <button
          onClick={testEnvironment}
          className="mb-4 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
        >
          Test Environment
        </button>
        {envStatus && (
          <pre className="bg-white p-3 rounded text-sm overflow-x-auto">
            {JSON.stringify(envStatus, null, 2)}
          </pre>
        )}
      </div>

      {/* Payment Test */}
      <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
        <h2 className="text-xl font-semibold text-purple-800 mb-2">Payment API Test</h2>
        <button
          onClick={testPaymentAPI}
          disabled={!user || testResults.status === 'testing'}
          className="mb-4 bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 disabled:opacity-50"
        >
          {testResults.status === 'testing' ? 'Testing...' : 'Test Payment API'}
        </button>
        {testResults.status && (
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Test Results:</h3>
            <pre className="bg-white p-3 rounded text-sm overflow-x-auto">
              {JSON.stringify(testResults, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Instructions</h2>
        <ol className="list-decimal list-inside space-y-2 text-gray-700">
          <li>Make sure you're logged in (check User Authentication Status above)</li>
          <li>Click "Test Environment" to check if all environment variables are set</li>
          <li>Click "Test Payment API" to test the payment flow</li>
          <li>Check the console logs for detailed debugging information</li>
        </ol>
      </div>
    </div>
  )
}
