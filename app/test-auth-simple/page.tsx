'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase-client'

export default function TestAuthSimple() {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [apiResult, setApiResult] = useState<any>(null)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        console.log('Client session:', { session, error })
        setSession(session)
      } catch (error) {
        console.error('Auth check error:', error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const testApi = async () => {
    try {
      const response = await fetch('/api/auth/test')
      const data = await response.json()
      console.log('API result:', data)
      setApiResult(data)
    } catch (error) {
      console.error('API error:', error)
      setApiResult({ error: error.message })
    }
  }

  const login = async () => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: 'liuyilan72@outlook.com',
        password: 'test123'
      })
      
      if (error) {
        alert('Login failed: ' + error.message)
      } else {
        alert('Login successful!')
        window.location.reload()
      }
    } catch (error) {
      alert('Login error: ' + error)
    }
  }

  if (loading) {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Simple Auth Test</h1>
        
        <div className="space-y-6">
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Client Session</h2>
            {session ? (
              <div className="text-green-400">
                <p>✅ Logged In</p>
                <p>User ID: {session.user.id}</p>
                <p>Email: {session.user.email}</p>
              </div>
            ) : (
              <div className="text-red-400">
                <p>❌ Not Logged In</p>
                <button
                  onClick={login}
                  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Login
                </button>
              </div>
            )}
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">API Test</h2>
            <button
              onClick={testApi}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 mb-4"
            >
              Test API
            </button>
            {apiResult && (
              <div className="bg-gray-700 p-4 rounded text-sm text-gray-300">
                <pre>{JSON.stringify(apiResult, null, 2)}</pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
