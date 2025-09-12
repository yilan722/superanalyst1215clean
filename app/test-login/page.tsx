'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase-client'

export default function TestLogin() {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        console.log('Session check:', { session, error })
        setSession(session)
      } catch (error) {
        console.error('Session check error:', error)
      } finally {
        setLoading(false)
      }
    }

    checkSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state change:', event, session)
        setSession(session)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const login = async () => {
    setIsLoggingIn(true)
    try {
      console.log('Attempting login...')
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'liuyilan72@outlook.com',
        password: 'test123'
      })
      
      console.log('Login result:', { data, error })
      
      if (error) {
        alert('Login failed: ' + error.message)
      } else {
        alert('Login successful!')
        setSession(data.session)
      }
    } catch (error) {
      console.error('Login error:', error)
      alert('Login error: ' + error)
    } finally {
      setIsLoggingIn(false)
    }
  }

  const logout = async () => {
    try {
      await supabase.auth.signOut()
      setSession(null)
      alert('Logout successful!')
    } catch (error) {
      alert('Logout error: ' + error)
    }
  }

  if (loading) {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Login Test</h1>
        
        <div className="space-y-6">
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Current Status</h2>
            <div className="space-y-2">
              <p className="text-white">
                <span className="font-semibold">Session:</span> {session ? `✅ ${session.user.email}` : '❌ No session'}
              </p>
              <p className="text-white">
                <span className="font-semibold">User ID:</span> {session?.user?.id || 'None'}
              </p>
              <p className="text-white">
                <span className="font-semibold">Access Token:</span> {session?.access_token ? 'Present' : 'Missing'}
              </p>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Actions</h2>
            <div className="space-x-4">
              {!session ? (
                <button
                  onClick={login}
                  disabled={isLoggingIn}
                  className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {isLoggingIn ? 'Logging in...' : 'Login'}
                </button>
              ) : (
                <button
                  onClick={logout}
                  className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Logout
                </button>
              )}
            </div>
          </div>

          {session && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Test Coupon</h2>
              <p className="text-white mb-4">Now you can test the coupon functionality!</p>
              <a
                href="/en"
                className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Go to Homepage
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
