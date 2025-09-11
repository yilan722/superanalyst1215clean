'use client'

import React, { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

export default function DebugAuthPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [authTest, setAuthTest] = useState<any>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    async function checkAuth() {
      try {
        // Check current user
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        console.log('User data:', user)
        console.log('User error:', userError)
        setUser(user)
        
        if (userError) {
          setError(userError.message)
        }

        // Test API call
        try {
          const response = await fetch('/api/stripe/test-config')
          const data = await response.json()
          console.log('API test response:', data)
          setAuthTest({ status: response.status, data })
        } catch (apiError) {
          console.error('API test error:', apiError)
          setAuthTest({ error: apiError instanceof Error ? apiError.message : 'Unknown error' })
        }

      } catch (err) {
        console.error('Auth check error:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [supabase])

  if (loading) {
    return <div className="p-8 text-center">Loading authentication status...</div>
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Authentication Debug</h1>
      
      <div className="space-y-6">
        {/* User Status */}
        <div className="bg-white border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-3">User Status</h2>
          {user ? (
            <div className="space-y-2">
              <p><strong>ID:</strong> {user.id}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Created:</strong> {user.created_at}</p>
              <p><strong>Last Sign In:</strong> {user.last_sign_in_at}</p>
              <div className="text-green-600 font-medium">✅ User is authenticated</div>
            </div>
          ) : (
            <div className="text-red-600 font-medium">❌ No user found</div>
          )}
          {error && (
            <div className="text-red-600 mt-2">Error: {error}</div>
          )}
        </div>

        {/* API Test */}
        <div className="bg-white border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-3">API Test</h2>
          {authTest ? (
            <div className="space-y-2">
              <p><strong>Status:</strong> {authTest.status || 'N/A'}</p>
              <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
                {JSON.stringify(authTest.data || authTest.error, null, 2)}
              </pre>
            </div>
          ) : (
            <div>Loading API test...</div>
          )}
        </div>

        {/* Actions */}
        <div className="bg-white border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-3">Actions</h2>
          <div className="space-x-4">
            <button
              onClick={async () => {
                const { error } = await supabase.auth.signOut()
                if (error) {
                  console.error('Sign out error:', error)
                } else {
                  window.location.reload()
                }
              }}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Sign Out
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
